import { Request, Response, NextFunction } from "express";
import { stripe } from "../utils/stripe";
import * as PaymentService from "./payment.service";
import db from "../drizzle/db";
import { transferRequests, lands } from "../drizzle/schema";
import { eq } from "drizzle-orm";

import { transferLandOnChain } from "../blockchain/blockchain.adapter";
import { DecodedToken } from "@/middleware/bearAuth";

/* ============================================================
   1. STRIPE CHECKOUT SESSION
============================================================ */
export const createCheckoutSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { transferId } = req.body;

    if (!transferId) {
      return res.status(400).json({ success: false, message: "transferId is required" });
    }

    console.log(`[Controller] Creating Stripe session for Transfer: ${transferId}`);

    const result = await PaymentService.createStripeCheckoutService(Number(transferId));

    return res.status(200).json({
      success: true,
      url: result.url,
      sessionId: result.sessionId
    });
  } catch (error) {
    next(error);
  }
};

/* ============================================================
   2. STRIPE WEBHOOK (FULL FLOW)
============================================================ */
export const handleStripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("[Stripe Webhook Error]", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;
    const transferId = Number(session.metadata.transferId);

    console.log(`[Webhook] Payment success for session: ${session.id}`);

    try {
      /* ============================
         STEP 1: CONFIRM PAYMENT
      ============================ */
      await PaymentService.confirmStripePaymentService(
        session.id,
        session.payment_intent as string
      );

      /* ============================
         STEP 2: FETCH TRANSFER
      ============================ */
      const transfer = await db.query.transferRequests.findFirst({
        where: eq(transferRequests.id, transferId),
        with: { land: true, buyer: true, seller: true }
      });

      if (!transfer) throw new Error("Transfer not found");

      /* ============================
         🛑 IDEMPOTENCY GUARD
      ============================ */
      if (
        transfer.status === "completed" ||
        transfer.blockchainStatus === "submitted" ||
        transfer.blockchainStatus === "confirmed"
      ) {
        console.log("[Webhook] Already processed");
        return res.json({ received: true });
      }

      /* ============================
         STEP 3: BLOCKCHAIN
      ============================ */
      console.log("[Blockchain] Triggering transfer...");

      const tx = await transferLandOnChain(
        transfer.land.onChainId!,
        transfer.buyer.walletAddress,
        session.payment_intent || `STRIPE_${transfer.id}`
      );

      console.log("[Blockchain] TX HASH:", tx.hash);

      /* ============================
         STEP 4: FINALIZE (ATOMIC)
      ============================ */
      await db.transaction(async (txDb) => {

        // mark blockchain submitted
        await txDb.update(transferRequests)
          .set({
            blockchainStatus: "submitted",
            blockchainTxHash: tx.hash
          })
          .where(eq(transferRequests.id, transfer.id));

        // update ownership
        await txDb.update(lands)
          .set({
            ownerId: transfer.buyer.id,
            currentOwnerWallet: transfer.buyer.walletAddress,
            updatedAt: new Date()
          })
          .where(eq(lands.id, transfer.land.id));

        // mark completed
        await txDb.update(transferRequests)
          .set({
            status: "completed",
            blockchainStatus: "confirmed"
          })
          .where(eq(transferRequests.id, transfer.id));
      });

      console.log("[Success] Transfer completed ✅");

    } catch (err) {
      console.error("[Webhook Processing Error]", err);

      await db.update(transferRequests)
        .set({ blockchainStatus: "failed" })
        .where(eq(transferRequests.id, transferId));
    }
  }

  res.status(200).json({ received: true });
};

/* ============================================================
   3. M-PESA PAYMENT (MATCHES STRIPE FLOW)
============================================================ */
export const recordMpesaPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { transferId, amount, mpesaCode } = req.body;

    if (!transferId || !amount || !mpesaCode) {
      return res.status(400).json({
        success: false,
        message: "Missing transferId, amount, or mpesaCode"
      });
    }

    console.log(`[Controller] Recording M-Pesa ${mpesaCode}`);

    const payment = await PaymentService.createMpesaPaymentService(
      Number(transferId),
      amount,
      mpesaCode.toUpperCase()
    );

    const transfer = await db.query.transferRequests.findFirst({
      where: eq(transferRequests.id, Number(transferId)),
      with: { land: true, buyer: true }
    });

    if (!transfer) throw new Error("Transfer not found");

    /* 🛑 IDEMPOTENCY */
    if (
      transfer.status === "completed" ||
      transfer.blockchainStatus === "submitted" ||
      transfer.blockchainStatus === "confirmed"
    ) {
      return res.status(200).json({ success: true, data: payment });
    }

    /* BLOCKCHAIN */
    const tx = await transferLandOnChain(
      transfer.land.onChainId!,
      transfer.buyer.walletAddress,
      mpesaCode
    );

    /* FINALIZE */
    await db.transaction(async (txDb) => {

      await txDb.update(transferRequests)
        .set({
          blockchainStatus: "submitted",
          blockchainTxHash: tx.hash
        })
        .where(eq(transferRequests.id, transfer.id));

      await txDb.update(lands)
        .set({
          ownerId: transfer.buyer.id,
          currentOwnerWallet: transfer.buyer.walletAddress,
          updatedAt: new Date()
        })
        .where(eq(lands.id, transfer.land.id));

      await txDb.update(transferRequests)
        .set({
          status: "completed",
          blockchainStatus: "confirmed"
        })
        .where(eq(transferRequests.id, transfer.id));
    });

    console.log("[Success] M-Pesa transfer completed ✅");

    return res.status(201).json({
      success: true,
      message: "M-Pesa payment processed & transfer completed",
      data: payment,
    });

  } catch (error) {
    next(error);
  }
};

/* ============================================================
   4. GET PAYMENT
============================================================ */
export const getPaymentByTransfer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transferId = Number(req.params.transferId);

    if (isNaN(transferId)) {
      return res.status(400).json({ success: false, message: "Invalid transfer ID" });
    }

    const payment = await PaymentService.getPaymentByTransferService(transferId);

    return res.status(200).json({
      success: !!payment,
      data: payment || null
    });
  } catch (error) {
    next(error);
  }
};

/* ============================================================
   5. PAYMENTS (ROLE-BASED)
============================================================ */
export const getPayments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as DecodedToken | undefined;

    console.log("\n========== [GET PAYMENTS DEBUG] ==========");
    console.log("User from token:", user);

    if (!user) {
      console.warn("[AUTH] No user found on request");
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    console.log("[AUTH] User Role:", user.role);
    console.log("[AUTH] User ID:", user.userId);

    let payments;

    /* ================= ROLE LOGIC ================= */

    if (user.role === "admin" || user.role === "land_officer") {
      console.log("[ACCESS] FULL ACCESS granted");

      payments = await PaymentService.getAllPaymentsService();

      console.log(`[RESULT] Admin/Officer fetched ${payments.length} payments`);

    } else if (user.role === "citizen") {
      console.log("[ACCESS] CITIZEN access → filtering own payments");

      payments = await PaymentService.getPaymentsByUserService(user.userId);

      console.log(`[RESULT] Citizen fetched ${payments.length} payments`);

    } else {
      console.error("[ACCESS DENIED] Unknown role:", user.role);

      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    console.log("[SUCCESS] Returning payments response\n");

    return res.status(200).json({
      success: true,
      count: payments.length,
      data: payments,
    });

  } catch (error) {
    console.error("[ERROR] getPayments failed:", error);
    next(error);
  }
};