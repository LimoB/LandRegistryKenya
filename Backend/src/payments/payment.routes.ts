import express, { type Router as ExpressRouter } from "express";

import {
  recordMpesaPayment,
  getPaymentByTransfer,
  getPayments,
  createCheckoutSession,
} from "./payment.controller";

import { handleStripeWebhook } from "./webhook.controller";
import { anyRoleAuth, adminAuth } from "../middleware/bearAuth";

/* ================================
   ROUTER
================================ */
export const paymentRouter: ExpressRouter = express.Router();

/* ================================
   M-PESA PAYMENT
================================ */
paymentRouter.post(
  "/mpesa",
  anyRoleAuth,
  recordMpesaPayment
);

/* ================================
   GET PAYMENT BY TRANSFER
================================ */
paymentRouter.get(
  "/transfer/:transferId",
  anyRoleAuth,
  getPaymentByTransfer
);

/* ================================
   GET ALL PAYMENTS (ADMIN ONLY)
================================ */
paymentRouter.get(
  "/",
  adminAuth,
  getPayments
);

/* ================================
   STRIPE CHECKOUT SESSION
================================ */
paymentRouter.post(
  "/stripe/checkout",
  anyRoleAuth,
  createCheckoutSession
);

/* ================================
   STRIPE WEBHOOK (RAW BODY REQUIRED)
    MUST be mounted before express.json() globally
================================ */
paymentRouter.post(
  "/stripe/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);