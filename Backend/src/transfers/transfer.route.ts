import { Router } from "express";
import {
  initiateTransfer,
  approveTransfer,
  getPending,
  rejectTransfer,
  getMySales,
  getMyTransfers,
  finalizeTransfer,
  getTransferById,
  retryBlockchainTransfer //  ADD THIS
} from "./controllers/index";

import {
  citizenAuth,
  officerAuth,
  anyRoleAuth,
  adminAuth
} from "../middleware/bearAuth";

import { idempotencyMiddleware } from "../idempotency/idempotency.middleware";

export const transferRouter: Router = Router();

/* ============================================================
   CITIZEN (BUY / SELL FLOW)
============================================================ */

transferRouter.post(
  "/",
  citizenAuth,
  idempotencyMiddleware,
  initiateTransfer
);

transferRouter.get(
  "/my-requests",
  citizenAuth,
  getMyTransfers
);

transferRouter.get(
  "/my-sales",
  citizenAuth,
  getMySales
);

/* ============================================================
   OFFICER / SYSTEM ACTIONS
============================================================ */

transferRouter.get(
  "/pending",
  anyRoleAuth,
  getPending
);

transferRouter.patch(
  "/:id/approve",
  officerAuth,
  idempotencyMiddleware,
  approveTransfer
);

transferRouter.patch(
  "/:id/reject",
  officerAuth,
  idempotencyMiddleware,
  rejectTransfer
);

/* ============================================================
   🔁 NEW: RETRY BLOCKCHAIN
============================================================ */

transferRouter.post(
  "/:id/retry-blockchain",
  anyRoleAuth, // or restrict to buyer/admin if you want
  idempotencyMiddleware,
  retryBlockchainTransfer
);

/* ============================================================
   ⚠️ ADMIN FALLBACK
============================================================ */

transferRouter.patch(
  "/:id/finalize",
  adminAuth,
  idempotencyMiddleware,
  finalizeTransfer
);

/* ============================================================
   GENERAL ACCESS
============================================================ */

transferRouter.get(
  "/:id",
  anyRoleAuth,
  getTransferById
);