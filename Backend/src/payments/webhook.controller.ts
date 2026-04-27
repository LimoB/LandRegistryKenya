import { Request, Response } from "express";
import { stripe } from "../utils/stripe";
import db from "../drizzle/db";
import { 
  payments, 
  transferRequests, 
  lands, 
  landOwnershipHistory, 
  auditLogs 
} from "../drizzle/schema";
import { eq } from "drizzle-orm";

export const handleStripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"];

  if (!sig || typeof sig !== "string") {
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
    console.error(`\x1b[31m[Webhook Error]\x1b[0m Verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const transferId = Number(session.metadata?.transferId);
    const sessionId = session.id;
    const paymentIntentId = typeof session.payment_intent === "string" 
      ? session.payment_intent 
      : session.payment_intent?.id;

    if (!transferId) {
      console.error("[Webhook Error] No transferId in metadata");
      return res.status(400).send("Missing metadata");
    }

    try {
      await db.transaction(async (tx) => {
        // 1. Fetch Transfer details with Land and User info
        const transfer = await tx.query.transferRequests.findFirst({
          where: eq(transferRequests.id, transferId),
          with: { land: true, buyer: true, seller: true }
        });

        if (!transfer) throw new Error("Transfer record not found");

        // 2. Idempotency Check
        const existingPayment = await tx.query.payments.findFirst({
          where: eq(payments.stripeSessionId, sessionId),
        });

        if (existingPayment?.paymentStatus === "completed") {
          console.log(`[Webhook] Session ${sessionId} already processed.`);
          return;
        }

        // 3. Update Payment Record
        await tx.update(payments)
          .set({
            paymentStatus: "completed",
            stripePaymentIntentId: paymentIntentId,
            confirmedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(payments.stripeSessionId, sessionId));

        // 4. Update Land Ownership (The Handover)
        await tx.update(lands)
          .set({
            ownerId: transfer.buyerId,
            currentOwnerWallet: transfer.buyer.walletAddress,
            isForSale: false,
            // In a real blockchain flow, txHash comes from your Minting Service
            // For now, we use the Stripe Payment Intent as a reference if minting is async
            blockchainTxHash: paymentIntentId, 
            updatedAt: new Date(),
          })
          .where(eq(lands.id, transfer.landId));

        // 5. Create Ownership History Entry
        await tx.insert(landOwnershipHistory).values({
          landId: transfer.landId,
          fromOwnerId: transfer.sellerId,
          toOwnerId: transfer.buyerId,
          fromWallet: transfer.seller.walletAddress,
          toWallet: transfer.buyer.walletAddress,
          blockchainTxHash: paymentIntentId,
        });

        // 6. Finalize Transfer Request Status
        await tx.update(transferRequests)
          .set({ 
            status: "completed", // Moves from 'paid' directly to 'completed'
            blockchainTxHash: paymentIntentId 
          })
          .where(eq(transferRequests.id, transferId));

        // 7. Create Audit Log
        await tx.insert(auditLogs).values({
          actionType: "LAND_TRANSFER_SUCCESS",
          performedBy: transfer.buyerId,
          landId: transfer.landId,
          blockchainTxHash: paymentIntentId,
          metadata: {
            sessionId: sessionId,
            amount: transfer.land.priceInKsh,
            seller: transfer.seller.fullName,
            buyer: transfer.buyer.fullName
          }
        });

        console.log(`\x1b[32m[Registry Success]\x1b[0m Land ${transfer.land.lrNumber} transferred to ${transfer.buyer.fullName}`);
      });
    } catch (error) {
      console.error("\x1b[31m[Webhook DB Error]\x1b[0m", error);
      return res.status(500).send("Database Update Failed");
    }
  }

  res.json({ received: true });
};