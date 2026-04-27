import { Router } from "express";
import {
  initiateTransfer,
  approveTransfer,
  getPending,
  rejectTransfer,
  getMySales,
  getMyTransfers,
  finalizeTransfer,
  getTransferById
} from "./controllers/index";

import {
  citizenAuth,
  officerAuth,
  anyRoleAuth
} from "../middleware/bearAuth";

import { idempotencyMiddleware } from "../idempotency/idempotency.middleware";

export const transferRouter: Router = Router();

/* ============================================================
   CITIZEN (BUY / SELL FLOW)
============================================================ */

/**
 * Create transfer request (BUY request)
 * Idempotent: prevents duplicate buy requests
 */
transferRouter.post(
  "/initiate",
  citizenAuth,
  idempotencyMiddleware,
  initiateTransfer
);

/**
 * View full transaction history (Purchases & Sales)
 * MUST be defined before /:id to avoid "my-requests" being treated as an ID
 */
transferRouter.get(
  "/my-requests",
  citizenAuth,
  getMyTransfers
);

/**
 * View seller's transfers (sales history)
 */
transferRouter.get(
  "/my-sales",
  citizenAuth,
  getMySales
);

/* ============================================================
   OFFICER ACTIONS (APPROVAL FLOW)
============================================================ */

/**
 * View pending transfers
 */
transferRouter.get(
  "/pending",
  anyRoleAuth,
  getPending
);

/**
 * Approve transfer (moves to payment_pending state)
 */
transferRouter.patch(
  "/approve/:id",
  officerAuth,
  idempotencyMiddleware,
  approveTransfer
);

/**
 * Reject transfer
 */
transferRouter.patch(
  "/reject/:id",
  officerAuth,
  idempotencyMiddleware,
  rejectTransfer
);

/**
 * Finalize transfer (after payment confirmed via webhook)
 */
transferRouter.patch(
  "/finalize/:id",
  officerAuth,
  idempotencyMiddleware,
  finalizeTransfer
);

/* ============================================================
   GENERAL AUTH USERS
============================================================ */

/**
 * Get transfer by ID (buyer/seller/officer)
 * THIS MUST REMAIN AT THE BOTTOM OF THE FILE
 */
transferRouter.get(
  "/:id",
  anyRoleAuth,
  getTransferById
);