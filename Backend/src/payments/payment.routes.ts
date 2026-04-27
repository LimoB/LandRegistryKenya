import express, { type Router as ExpressRouter } from "express";
import {
  recordMpesaPayment,
  getPaymentByTransfer,
  getPayments,
  createCheckoutSession,
} from "./payment.controller";
import { handleStripeWebhook } from "./payment.controller"; // Assuming it's in the same controller now
import { anyRoleAuth, adminAuth } from "../middleware/bearAuth";

export const paymentRouter: ExpressRouter = express.Router();

/**
 * STRIPE WEBHOOK (CRITICAL)
 * This must receive the RAW body for signature verification.
 * It is placed at the top and uses express.raw.
 */
paymentRouter.post(
  "/stripe/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

/**
 * STRIPE CHECKOUT
 * Creates the session and returns the Stripe URL to the frontend
 */
paymentRouter.post(
  "/stripe/checkout",
  anyRoleAuth,
  createCheckoutSession
);

/**
 * M-PESA PAYMENT
 * Manual recording of M-Pesa transaction codes
 */
paymentRouter.post(
  "/mpesa",
  anyRoleAuth,
  recordMpesaPayment
);

/**
 * GET PAYMENT BY TRANSFER ID
 */
paymentRouter.get(
  "/transfer/:transferId",
  anyRoleAuth,
  getPaymentByTransfer
);

/**
 * GET ALL PAYMENTS
 * Admin-only overview of all transactions
 */
paymentRouter.get(
  "/",
  adminAuth,
  getPayments
);