import db from "../drizzle/db";
import { payments, transferRequests } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { stripe } from "../utils/stripe";
import { finalizeTransferService } from "../transfers/services/transfer.manage.service";

/* ============================================================
   1. CREATE STRIPE CHECKOUT SESSION
============================================================ */
export const createStripeCheckoutService = async (transferId: number) => {
  console.log(`\x1b[36m[Service] Initiating Stripe Session for Transfer: ${transferId}\x1b[0m`);

  const transfer = await db.query.transferRequests.findFirst({
    where: eq(transferRequests.id, transferId),
    with: { land: true },
  });

  if (!transfer || !transfer.land) throw new Error("Transfer record or land details not found");

  const validStatuses = ["approved", "payment_pending"];
  if (!validStatuses.includes(transfer.status)) {
    throw new Error(`Transfer status is '${transfer.status}'. Only approved transfers can be paid.`);
  }

  const amountKsh = Number(transfer.land.priceInKsh);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [{
      price_data: {
        currency: "kes",
        product_data: {
          name: `Land Transfer: ${transfer.land.lrNumber}`,
          description: `Statutory Fees for Title Transfer of LR No. ${transfer.land.lrNumber}`,
        },
        unit_amount: Math.round(amountKsh * 100), 
      },
      quantity: 1,
    }],
    metadata: { transferId: String(transfer.id) },
    success_url: `${process.env.CLIENT_URL}/citizen/transfer/status/${transfer.id}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_URL}/citizen/transfer/status/${transfer.id}`,
  });

  await db.insert(payments).values({
    transferRequestId: transfer.id,
    landId: transfer.landId,
    amount: amountKsh.toString(),
    paymentMethod: "stripe",
    paymentStatus: "pending",
    stripeSessionId: session.id,
  }).onConflictDoUpdate({
    target: [payments.stripeSessionId],
    set: { updatedAt: new Date() }
  });

  return { url: session.url, sessionId: session.id };
};

/* ============================================================
   2. CONFIRM STRIPE PAYMENT (The "Auto-Mint" Trigger)
============================================================ */
export const confirmStripePaymentService = async (sessionId: string, paymentIntentId: string) => {
  return await db.transaction(async (tx) => {
    const payment = await tx.query.payments.findFirst({
      where: eq(payments.stripeSessionId, sessionId),
    });

    if (!payment) throw new Error("Payment record not found");
    if (payment.paymentStatus === "completed") return payment;

    await tx.update(payments)
      .set({
        paymentStatus: "completed",
        stripePaymentIntentId: paymentIntentId,
        updatedAt: new Date(),
      })
      .where(eq(payments.id, payment.id));

    await tx.update(transferRequests)
      .set({ status: "paid" })
      .where(eq(transferRequests.id, payment.transferRequestId));

    console.log(`\x1b[32m[Payment Success]\x1b[0m Transfer ${payment.transferRequestId} marked as PAID.`);

    try {
      // Automating the final registry update and blockchain minting
      await finalizeTransferService(payment.transferRequestId, 1); 
      console.log(`\x1b[35m[Automation]\x1b[0m Ownership handed over successfully via Blockchain.`);
    } catch (err) {
      console.error(`\x1b[31m[Automation Error]\x1b[0m Payment succeeded but Blockchain minting failed:`, err);
    }
  });
};

/* ============================================================
   3. M-PESA RECORDING
============================================================ */
export const createMpesaPaymentService = async (transferId: number, amount: string, mpesaCode: string) => {
  return await db.transaction(async (tx) => {
    const [payment] = await tx.insert(payments).values({
      transferRequestId: transferId,
      amount,
      paymentMethod: "mpesa",
      paymentStatus: "completed",
      mpesaReceiptCode: mpesaCode,
    }).returning();

    await tx.update(transferRequests)
      .set({ status: "paid" })
      .where(eq(transferRequests.id, transferId));
    
    return payment;
  });
};

/* ============================================================
   4. QUERY SERVICES (Fixes TS2304)
============================================================ */

/**
 * Fetches the payment status for a specific transfer request
 */
export const getPaymentByTransferService = async (transferId: number) => {
  return await db.query.payments.findFirst({
    where: eq(payments.transferRequestId, transferId),
  });
};

/**
 * Fetches all payments for the admin audit dashboard
 */
export const getAllPaymentsService = async () => {
  return await db.query.payments.findMany({
    with: {
      transferRequest: {
        with: {
          land: true,
          buyer: true,
          seller: true
        }
      }
    },
    orderBy: (payments, { desc }) => [desc(payments.createdAt)]
  });
};