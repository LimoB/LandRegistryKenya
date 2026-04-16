import { Router } from "express";
import {
  initiateTransfer,
  approveTransfer,
  getPending,
  rejectTransfer,
  getMySales,
  finalizeTransfer,
  getTransferById
} from "./transfer.controller";

import {
  citizenAuth,
  officerAuth,
  anyRoleAuth
} from "../middleware/bearAuth";

export const transferRouter: Router = Router();

/* ============================================================
   CITIZEN (BUY / SELL FLOW)
============================================================ */

// Create transfer request (BUY request)
transferRouter.post("/initiate", citizenAuth, initiateTransfer);

// View seller's transfers (sales history)
transferRouter.get("/my-sales", citizenAuth, getMySales);


/* ============================================================
   OFFICER ACTIONS (APPROVAL FLOW)
============================================================ */

// View pending transfers
transferRouter.get("/pending", officerAuth, getPending);

// Approve transfer (moves to payment_pending state)
transferRouter.patch("/approve/:id", officerAuth, approveTransfer);

// Reject transfer
transferRouter.patch("/reject/:id", officerAuth, rejectTransfer);

// Finalize transfer (after payment confirmed via webhook)
transferRouter.patch("/finalize/:id", officerAuth, finalizeTransfer);


/* ============================================================
   GENERAL AUTH USERS
============================================================ */

// Get transfer by ID (buyer/seller/officer)
transferRouter.get("/:id", anyRoleAuth, getTransferById);