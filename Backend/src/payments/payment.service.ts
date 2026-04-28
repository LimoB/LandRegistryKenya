import db from "../drizzle/db";
import { payments, transferRequests } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { stripe } from "../utils/stripe";

/* ============================================================
   1. CREATE STRIPE CHECKOUT SESSION
============================================================ */
export const createStripeCheckoutService = async (transferId: number) => {
  console.log(`[Service] Stripe Session -> Transfer: ${transferId}`);

  const transfer = await db.query.transferRequests.findFirst({
    where: eq(transferRequests.id, transferId),
    with: { land: true },
  });

  if (!transfer || !transfer.land) {
    throw new Error("Transfer or land not found");
  }

  const validStatuses = ["approved", "payment_pending"];
  if (!validStatuses.includes(transfer.status)) {
    throw new Error(`Invalid status '${transfer.status}' for payment`);
  }

  const amountKsh = Number(transfer.land.priceInKsh);

  if (!amountKsh || amountKsh <= 0) {
    throw new Error("Invalid land price");
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "kes",
          product_data: {
            name: `Land Transfer: ${transfer.land.lrNumber}`,
            description: `Transfer Fees for LR ${transfer.land.lrNumber}`,
          },
          unit_amount: Math.round(amountKsh * 100),
        },
        quantity: 1,
      },
    ],
    metadata: { transferId: String(transfer.id) },
    success_url: `${process.env.CLIENT_URL}/citizen/transfer/status/${transfer.id}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_URL}/citizen/transfer/status/${transfer.id}`,
  });

  await db
    .insert(payments)
    .values({
      transferRequestId: transfer.id,
      landId: transfer.land.id, // fixed
      amount: amountKsh.toString(),
      paymentMethod: "stripe",
      paymentStatus: "pending",
      stripeSessionId: session.id,
    })
    .onConflictDoUpdate({
      target: [payments.stripeSessionId],
      set: { updatedAt: new Date() },
    });

  return { url: session.url, sessionId: session.id };
};

/* ============================================================
   2. CONFIRM STRIPE PAYMENT
============================================================ */
export const confirmStripePaymentService = async (
  sessionId: string,
  paymentIntentId: string
) => {
  return await db.transaction(async (tx) => {
    const payment = await tx.query.payments.findFirst({
      where: eq(payments.stripeSessionId, sessionId),
    });

    if (!payment) throw new Error("Payment not found");

    if (payment.paymentStatus === "completed") {
      console.log("[Payment] Already confirmed");
      return payment;
    }

    await tx
      .update(payments)
      .set({
        paymentStatus: "completed",
        stripePaymentIntentId: paymentIntentId,
        confirmedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(payments.id, payment.id));

    await tx
      .update(transferRequests)
      .set({
        status: "paid",
        blockchainStatus: "pending",
      })
      .where(eq(transferRequests.id, payment.transferRequestId));

    console.log(
      `[Payment Success] Transfer ${payment.transferRequestId} -> PAID`
    );

    return payment;
  });
};

/* ============================================================
   3. M-PESA PAYMENT
============================================================ */
export const createMpesaPaymentService = async (
  transferId: number,
  amount: string,
  mpesaCode: string
) => {
  return await db.transaction(async (tx) => {
    const transfer = await tx.query.transferRequests.findFirst({
      where: eq(transferRequests.id, transferId),
    });

    if (!transfer) throw new Error("Transfer not found");

    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      throw new Error("Invalid amount");
    }

    const existing = await tx.query.payments.findFirst({
      where: eq(payments.transferRequestId, transferId),
    });

    if (existing?.paymentStatus === "completed") {
      console.log("[M-Pesa] Already processed");
      return existing;
    }

    const [payment] = await tx
      .insert(payments)
      .values({
        transferRequestId: transferId,
        landId: transfer.landId, // fixed
        amount: numericAmount.toString(),
        paymentMethod: "mpesa",
        paymentStatus: "completed",
        mpesaReceiptCode: mpesaCode,
        confirmedAt: new Date(),
      })
      .returning();

    await tx
      .update(transferRequests)
      .set({
        status: "paid",
        blockchainStatus: "pending",
      })
      .where(eq(transferRequests.id, transferId));

    console.log(`[M-Pesa Success] Transfer ${transferId} -> PAID`);

    return payment;
  });
};

/* ============================================================
   4. HELPER
============================================================ */
export const isTransferReadyForBlockchain = async (transferId: number) => {
  const transfer = await db.query.transferRequests.findFirst({
    where: eq(transferRequests.id, transferId),
  });

  if (!transfer) throw new Error("Transfer not found");

  return (
    transfer.status === "paid" &&
    transfer.blockchainStatus === "pending"
  );
};

/* ============================================================
   5. QUERY SERVICES
============================================================ */

export const getPaymentByTransferService = async (transferId: number) => {
  return await db.query.payments.findFirst({
    where: eq(payments.transferRequestId, transferId),
  });
};

export const getAllPaymentsService = async () => {
  return await db.query.payments.findMany({
    with: {
      transferRequest: {
        with: {
          land: true,
          buyer: true,
          seller: true,
        },
      },
    },
    orderBy: (payments, { desc }) => [desc(payments.createdAt)],
  });
};

export const getPaymentsByUserService = async (userId: number) => {
  console.log(`[Service] Fetching payments for userId: ${userId}`);

  const results = await db.query.payments.findMany({
    with: {
      transferRequest: {
        with: {
          land: true,
          buyer: true,
          seller: true,
        },
      },
    },
    where: (payments, { inArray }) =>
      inArray(
        payments.transferRequestId,
        db.select({ id: transferRequests.id })
          .from(transferRequests)
          .where(eq(transferRequests.buyerId, userId))
      ),
    orderBy: (payments, { desc }) => [desc(payments.createdAt)],
  });

  console.log(`[Service] Payments returned: ${results.length}`);

  return results;
};