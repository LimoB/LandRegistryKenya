import { Request, Response, NextFunction } from "express";
import { stripe } from "../utils/stripe";
import * as PaymentService from "./payment.service";

/* ============================================================
   1. STRIPE CHECKOUT SESSION
============================================================ */
export const createCheckoutSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { transferId } = req.body;

    if (!transferId) {
      return res.status(400).json({ success: false, message: "transferId is required" });
    }

    console.log(`\x1b[36m[Controller] Initiating Stripe Session for Transfer: ${transferId}\x1b[0m`);

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
   2. STRIPE WEBHOOK HANDLER
   Matches the 'express.raw' middleware in your app.ts
============================================================ */
export const handleStripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;
  let event;

  try {
    // CRITICAL: req.body is a Buffer here
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error(`\x1b[31m[Stripe Webhook Error]\x1b[0m Signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle specifically successful payments
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;
    
    console.log(`\x1b[32m[Stripe Webhook] Payment Success:\x1b[0m Session ${session.id}`);
    
    try {
      /**
       * This service call will now trigger:
       * 1. DB update (status: paid)
       * 2. Blockchain minting (transfer ownership)
       * 3. DB update (status: completed)
       */
      await PaymentService.confirmStripePaymentService(
        session.id,
        session.payment_intent as string
      );
    } catch (serviceError) {
      console.error(`\x1b[31m[Webhook Processing Error]\x1b[0m`, serviceError);
      // We still return 200 to Stripe because we received the event, 
      // but we log the internal failure for manual fixing.
    }
  }

  res.status(200).json({ received: true });
};

/* ============================================================
   3. M-PESA PAYMENT (Manual Recording)
============================================================ */
export const recordMpesaPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { transferId, amount, mpesaCode } = req.body;

    if (!transferId || !amount || !mpesaCode) {
      return res.status(400).json({ success: false, message: "Missing transferId, amount, or mpesaCode" });
    }

    console.log(`\x1b[35m[Controller] Recording M-Pesa: ${mpesaCode} for Transfer: ${transferId}\x1b[0m`);

    const payment = await PaymentService.createMpesaPaymentService(
      Number(transferId),
      amount,
      mpesaCode.toUpperCase()
    );

    return res.status(201).json({
      success: true,
      message: "M-Pesa payment recorded and pending verification",
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

/* ============================================================
   4. GET PAYMENT BY TRANSFER (Polling or Status Check)
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
   5. ADMIN: LIST ALL PAYMENTS
============================================================ */
export const getPayments = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const payments = await PaymentService.getAllPaymentsService();
    return res.status(200).json({
      success: true,
      count: payments.length,
      data: payments,
    });
  } catch (error) {
    next(error);
  }
};