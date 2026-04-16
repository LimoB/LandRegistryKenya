import { Request, Response } from "express";
import Stripe from "stripe";
import db from "../drizzle/db";
import { payments, transferRequests } from "../drizzle/schema";
import { eq } from "drizzle-orm";

/* ============================================================
   STRIPE INIT
============================================================ */
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2026-03-25.dahlia",
});

/* ============================================================
   SAFE TYPES (fix Stripe TS issues)
============================================================ */
type CheckoutSession = {
  id: string;
  metadata?: Record<string, string>;
  payment_intent?: string | { id: string };
};

/* ============================================================
   WEBHOOK HANDLER
============================================================ */
export const handleStripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"];

  if (!sig || typeof sig !== "string") {
    res.status(400).send("Missing Stripe signature");
    return;
  }

  // FIX: Stripe v22 typing mismatch → keep as any
  let event: any;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Webhook error";
    res.status(400).send(`Webhook Error: ${message}`);
    return;
  }

  console.log("[Stripe Webhook]", event.type);

  /* ============================================================
     CHECKOUT SUCCESS
  ============================================================ */
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as CheckoutSession;

    const transferId = Number(session.metadata?.transferId);
    const sessionId = session.id;

    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id;

    if (!transferId) {
      res.status(400).json({ error: "Missing transferId" });
      return;
    }

    /* ============================================================
       IDEMPOTENCY CHECK
    ============================================================ */
    const existingPayment = await db.query.payments.findFirst({
      where: eq(payments.stripeSessionId, sessionId),
    });

    if (existingPayment?.paymentStatus === "completed") {
      res.json({ received: true });
      return;
    }

    /* ============================================================
       UPDATE PAYMENT
    ============================================================ */
    await db
      .update(payments)
      .set({
        paymentStatus: "completed",
        stripePaymentIntentId: paymentIntentId,
        stripeEventId: event.id,
        stripeEventType: event.type,
        stripeRaw: event,
        updatedAt: new Date(),
      })
      .where(eq(payments.stripeSessionId, sessionId));

    /* ============================================================
       UPDATE TRANSFER
    ============================================================ */
    await db
      .update(transferRequests)
      .set({
        status: "paid",
      })
      .where(eq(transferRequests.id, transferId));
  }

  res.json({ received: true });
};