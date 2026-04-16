import db from "../drizzle/db";
import { payments, transferRequests } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { stripe } from "../utils/stripe";

/* ============================================================
   TYPES (local safety instead of any)
============================================================ */
type PaymentMethod = "stripe" | "mpesa";
type PaymentStatus = "pending" | "completed" | "failed";

/* ============================================================
   CREATE STRIPE PAYMENT RECORD (internal helper)
============================================================ */
export const createStripePaymentRecord = async (
  transferId: number,
  amount: string,
  sessionId: string
) => {
  const transfer = await db.query.transferRequests.findFirst({
    where: eq(transferRequests.id, transferId),
  });

  if (!transfer) throw new Error("Transfer not found");

  const [payment] = await db
    .insert(payments)
    .values({
      transferRequestId: transferId,
      amount,
      paymentMethod: "stripe",
      paymentStatus: "pending",
      stripeSessionId: sessionId,
    })
    .returning();

  return payment;
};

/* ============================================================
   CONFIRM STRIPE PAYMENT (Webhook-safe)
============================================================ */
export const confirmStripePaymentService = async (
  sessionId: string,
  paymentIntentId: string
) => {
  const payment = await db.query.payments.findFirst({
    where: eq(payments.stripeSessionId, sessionId),
  });

  if (!payment) throw new Error("Payment not found");

  const [updated] = await db
    .update(payments)
    .set({
      paymentStatus: "completed",
      stripePaymentIntentId: paymentIntentId,
      updatedAt: new Date(),
    })
    .where(eq(payments.id, payment.id))
    .returning();

  await db
    .update(transferRequests)
    .set({
      status: "paid",
    })
    .where(eq(transferRequests.id, payment.transferRequestId));

  return updated;
};

/* ============================================================
   M-PESA PAYMENT (CLEAN VERSION)
============================================================ */
export const createMpesaPaymentService = async (
  transferId: number,
  amount: string,
  mpesaCode: string
) => {
  const transfer = await db.query.transferRequests.findFirst({
    where: eq(transferRequests.id, transferId),
  });

  if (!transfer) throw new Error("Transfer not found");

  const [payment] = await db
    .insert(payments)
    .values({
      transferRequestId: transferId,
      amount,
      paymentMethod: "mpesa",
      paymentStatus: "completed",
      mpesaReceiptCode: mpesaCode,
    })
    .returning();

  await db
    .update(transferRequests)
    .set({
      status: "paid",
      mpesaReceiptCode: mpesaCode,
    })
    .where(eq(transferRequests.id, transferId));

  return payment;
};

/* ============================================================
   GET PAYMENT BY TRANSFER
============================================================ */
export const getPaymentByTransferService = async (transferId: number) => {
  return await db.query.payments.findFirst({
    where: eq(payments.transferRequestId, transferId),
  });
};

/* ============================================================
   GET ALL PAYMENTS
============================================================ */
export const getAllPaymentsService = async () => {
  return await db.query.payments.findMany({
    with: {
      transferRequest: true,
    },
  });
};

/* ============================================================
   CREATE STRIPE CHECKOUT SESSION (MAIN FLOW)
============================================================ */
export const createStripeCheckoutService = async (transferId: number) => {
  const transfer = await db.query.transferRequests.findFirst({
    where: eq(transferRequests.id, transferId),
    with: {
      land: true,
      buyer: true,
    },
  });

  if (!transfer) throw new Error("Transfer not found");

  if (transfer.status !== "approved") {
    throw new Error("Transfer not ready for payment");
  }

  const amount = Number(transfer.land.priceInKsh);

  if (Number.isNaN(amount) || amount <= 0) {
    throw new Error("Land has invalid price");
  }

  /* ================================
     CREATE STRIPE SESSION
  ================================= */
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",

    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `Land Transfer - ${transfer.land.lrNumber}`,
          },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      },
    ],

    metadata: {
      transferId: String(transfer.id),
      buyerId: String(transfer.buyerId),
      landId: String(transfer.landId),
    },

    success_url: `${process.env.FRONTEND_URL}/payment/success`,
    cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
  });

  /* ================================
     CREATE PAYMENT RECORD
  ================================= */
  await db.insert(payments).values({
    transferRequestId: transfer.id,
    amount: amount.toString(),
    paymentMethod: "stripe",
    paymentStatus: "pending",
    stripeSessionId: session.id,
  });

  /* ================================
     UPDATE TRANSFER STATUS
  ================================= */
  await db
    .update(transferRequests)
    .set({
      status: "payment_pending",
    })
    .where(eq(transferRequests.id, transfer.id));

  return {
    url: session.url,
    sessionId: session.id,
  };
};