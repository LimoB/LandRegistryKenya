import express, { type Router as ExpressRouter } from "express";
import {
  recordMpesaPayment,
  getPaymentByTransfer,
  getPayments,
  createCheckoutSession,
  handleStripeWebhook
} from "./payment.controller";

import { anyRoleAuth } from "../middleware/bearAuth";

export const paymentRouter: ExpressRouter = express.Router();

/* ============================================================
   1. STRIPE WEBHOOK (PUBLIC)
   - Uses raw body for Stripe signature verification
   - MUST NOT pass through express.json()
============================================================ */
paymentRouter.post(
  "/stripe/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

/* ============================================================
   2. STRIPE CHECKOUT SESSION
   - Authenticated users (citizen, officer, admin)
============================================================ */
paymentRouter.post(
  "/stripe/checkout",
  anyRoleAuth,
  createCheckoutSession
);

/* ============================================================
   3. M-PESA PAYMENT
   - Authenticated users
============================================================ */
paymentRouter.post(
  "/mpesa",
  anyRoleAuth,
  recordMpesaPayment
);

/* ============================================================
   4. GET PAYMENT BY TRANSFER
   - Authenticated users
============================================================ */
paymentRouter.get(
  "/transfer/:transferId",
  anyRoleAuth,
  getPaymentByTransfer
);

/* ============================================================
   5. GET PAYMENTS (ROLE-BASED ACCESS)
   - Admin → all payments
   - Land Officer → all payments
   - Citizen → only their payments
   - Filtering handled in controller
============================================================ */
paymentRouter.get(
  "/",
  anyRoleAuth,
  getPayments
);