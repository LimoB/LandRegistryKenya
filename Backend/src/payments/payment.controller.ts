import { Request, Response, NextFunction } from "express";
import {
  createMpesaPaymentService,
  confirmStripePaymentService,
  getPaymentByTransferService,
  getAllPaymentsService,
  createStripeCheckoutService,
} from "./payment.service";

/* ============================================================
   M-PESA PAYMENT
============================================================ */
export const recordMpesaPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { transferId, amount, mpesaCode } = req.body;

    if (!transferId || !amount || !mpesaCode) {
      const error: any = new Error("Missing required fields: transferId, amount, or mpesaCode");
      error.statusCode = 400;
      throw error;
    }

    const payment = await createMpesaPaymentService(
      Number(transferId),
      amount,
      mpesaCode
    );

    return res.status(201).json({
      success: true,
      message: "M-Pesa payment recorded successfully",
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

/* ============================================================
   STRIPE CONFIRM (MANUAL / BACKUP ONLY)
============================================================ */
export const confirmStripePayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sessionId, paymentIntentId } = req.body;

    if (!sessionId || !paymentIntentId) {
      const error: any = new Error("Missing sessionId or paymentIntentId");
      error.statusCode = 400;
      throw error;
    }

    const payment = await confirmStripePaymentService(
      sessionId,
      paymentIntentId
    );

    return res.status(200).json({
      success: true,
      message: "Stripe payment confirmed",
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

/* ============================================================
   GET PAYMENT BY TRANSFER
============================================================ */
export const getPaymentByTransfer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transferId = Number(req.params.transferId);

    if (isNaN(transferId)) {
      const error: any = new Error("Invalid transfer ID format");
      error.statusCode = 400;
      throw error;
    }

    const payment = await getPaymentByTransferService(transferId);

    if (!payment) {
      const error: any = new Error("Payment record not found for this transfer");
      error.statusCode = 404;
      throw error;
    }

    return res.status(200).json({
      success: true,
      data: payment
    });
  } catch (error) {
    next(error);
  }
};

/* ============================================================
   GET ALL PAYMENTS (ADMIN)
============================================================ */
export const getPayments = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const payments = await getAllPaymentsService();

    return res.status(200).json({
      success: true,
      count: payments.length,
      data: payments,
    });
  } catch (error) {
    next(error);
  }
};

/* ============================================================
   STRIPE CHECKOUT SESSION
============================================================ */
export const createCheckoutSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { transferId } = req.body;

    if (!transferId) {
      const error: any = new Error("transferId is required to initiate checkout");
      error.statusCode = 400;
      throw error;
    }

    const result = await createStripeCheckoutService(Number(transferId));

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};