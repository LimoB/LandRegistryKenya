import { Router } from "express";
import {
  initiateTransfer,
  approveTransfer,
  getPending,
  rejectTransfer,
  getMySales,
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
  officerAuth,
  getPending
);

/**
 * Approve transfer (moves to payment_pending state)
 * Idempotent recommended (prevents double approval issues)
 */
transferRouter.patch(
  "/approve/:id",
  officerAuth,
  idempotencyMiddleware,
  approveTransfer
);

/**
 * Reject transfer
 * Idempotent recommended (prevents double rejection logs)
 */
transferRouter.patch(
  "/reject/:id",
  officerAuth,
  idempotencyMiddleware,
  rejectTransfer
);

/**
 * Finalize transfer (after payment confirmed via webhook)
 * CRITICAL: must be idempotent (blockchain + DB safety)
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
 */
transferRouter.get(
  "/:id",
  anyRoleAuth,
  getTransferById
);