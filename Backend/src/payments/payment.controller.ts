import { Request, Response } from "express";
import {
  createMpesaPaymentService,
  confirmStripePaymentService,
  getPaymentByTransferService,
  getAllPaymentsService,
  createStripeCheckoutService,
} from "./payment.service";

/* ============================================================
   TYPES (NO ANY)
============================================================ */
type ControllerError = {
  message?: string;
};

/* ============================================================
   M-PESA PAYMENT
============================================================ */
export const recordMpesaPayment = async (req: Request, res: Response) => {
  try {
    const { transferId, amount, mpesaCode } = req.body;

    if (!transferId || !amount || !mpesaCode) {
      res.status(400).json({ error: "Missing fields" });
      return;
    }

    const payment = await createMpesaPaymentService(
      Number(transferId),
      amount,
      mpesaCode
    );

    res.status(201).json({
      message: "M-Pesa payment recorded",
      payment,
    });
  } catch (error: unknown) {
    const err = error as ControllerError;
    res.status(400).json({ error: err.message ?? "Payment failed" });
  }
};

/* ============================================================
   STRIPE CONFIRM (MANUAL / BACKUP ONLY)
   ⚠️ REAL CONFIRMATION SHOULD BE WEBHOOK
============================================================ */
export const confirmStripePayment = async (req: Request, res: Response) => {
  try {
    const { sessionId, paymentIntentId } = req.body;

    if (!sessionId || !paymentIntentId) {
      res.status(400).json({ error: "Missing sessionId or paymentIntentId" });
      return;
    }

    const payment = await confirmStripePaymentService(
      sessionId,
      paymentIntentId
    );

    res.status(200).json({
      message: "Stripe payment confirmed",
      payment,
    });
  } catch (error: unknown) {
    const err = error as ControllerError;
    res.status(400).json({ error: err.message ?? "Confirmation failed" });
  }
};

/* ============================================================
   GET PAYMENT BY TRANSFER
============================================================ */
export const getPaymentByTransfer = async (req: Request, res: Response) => {
  try {
    const transferId = Number(req.params.transferId);

    if (isNaN(transferId)) {
      res.status(400).json({ error: "Invalid transfer ID" });
      return;
    }

    const payment = await getPaymentByTransferService(transferId);

    if (!payment) {
      res.status(404).json({ error: "Payment not found" });
      return;
    }

    res.status(200).json(payment);
  } catch (error: unknown) {
    const err = error as ControllerError;
    res.status(500).json({ error: err.message ?? "Server error" });
  }
};

/* ============================================================
   GET ALL PAYMENTS (ADMIN)
============================================================ */
export const getPayments = async (_req: Request, res: Response) => {
  try {
    const payments = await getAllPaymentsService();

    res.status(200).json({
      count: payments.length,
      data: payments,
    });
  } catch (error: unknown) {
    const err = error as ControllerError;
    res.status(500).json({ error: err.message ?? "Failed to fetch payments" });
  }
};

/* ============================================================
   STRIPE CHECKOUT SESSION
============================================================ */
export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const { transferId } = req.body;

    if (!transferId) {
      res.status(400).json({ error: "transferId is required" });
      return;
    }

    const result = await createStripeCheckoutService(Number(transferId));

    res.status(200).json(result);
  } catch (error: unknown) {
    const err = error as ControllerError;
    res.status(400).json({
      error: err.message ?? "Checkout failed",
    });
  }
};