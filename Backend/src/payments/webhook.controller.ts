import { Request, Response } from "express";
import { stripe } from "../utils/stripe";
import db from "../drizzle/db";
import { payments, transferRequests } from "../drizzle/schema";
import { eq } from "drizzle-orm";

export const handleStripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"];

  if (!sig || typeof sig !== "string") {
    console.error("[Webhook] Missing Stripe signature");
    return res.status(400).send("Missing Stripe signature");
  }

  let event: any;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (err: any) {
    console.error("[Webhook Error]", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log(`[Webhook] Event received: ${event.type}`);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const transferId = Number(session.metadata?.transferId);
    const sessionId = session.id;

    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id;

    if (!transferId) {
      console.error("[Webhook] Missing transferId in metadata");
      return res.status(400).send("Missing transferId");
    }

    try {
      console.log(`[Webhook] Processing transfer: ${transferId}`);

      const transfer = await db.query.transferRequests.findFirst({
        where: eq(transferRequests.id, transferId),
      });

      if (!transfer) {
        console.error(`[Webhook] Transfer not found: ${transferId}`);
        return res.status(404).send("Transfer not found");
      }

      /* ================= IDEMPOTENCY ================= */
      if (transfer.status === "paid" || transfer.status === "completed") {
        console.log(`[Webhook] Transfer ${transferId} already processed`);
        return res.json({ received: true });
      }

      await db.transaction(async (tx) => {
        console.log("[Webhook] Updating payment record");

        const updatedPayment = await tx
          .update(payments)
          .set({
            paymentStatus: "completed",
            stripePaymentIntentId: paymentIntentId || null,
            confirmedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(payments.stripeSessionId, sessionId))
          .returning();

        if (!updatedPayment.length) {
          console.error(
            `[Webhook] No payment found for session: ${sessionId}`
          );
          throw new Error("Payment record not found");
        }

        console.log("[Webhook] Payment updated successfully");

        console.log("[Webhook] Marking transfer as paid");

        const updatedTransfer = await tx
          .update(transferRequests)
          .set({
            status: "paid",
            blockchainStatus: "pending",
          })
          .where(eq(transferRequests.id, transferId))
          .returning();

        if (!updatedTransfer.length) {
          console.error(
            `[Webhook] Failed to update transfer: ${transferId}`
          );
          throw new Error("Transfer update failed");
        }
      });

      console.log(
        `[Webhook] Payment confirmed. Transfer ${transferId} is ready for blockchain processing`
      );
    } catch (error: any) {
      console.error("[Webhook Fatal Error]", error.message);
      return res.status(500).send("Processing failed");
    }
  }

  return res.json({ received: true });
};