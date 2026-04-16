import { Router } from "express";
import {
  initiateTransfer,
  approveTransfer,
  getPending,
  rejectTransfer,
  getMySales,
  recordPayment,
  finalizeTransfer,
  getTransferById
} from "./transfer.controller";

import {
  citizenAuth,
  officerAuth,
  adminAuth,
  anyRoleAuth
} from "../middleware/bearAuth";

export const transferRouter: Router = Router();

/* ============================================================
   CITIZEN (BUYER / SELLER)
   ============================================================ */

// Initiate purchase request
transferRouter.post("/initiate", citizenAuth, initiateTransfer);

// View own sales (as seller)
transferRouter.get("/my-sales", citizenAuth, getMySales);

// Record payment (buyer usually)
transferRouter.post("/pay/:id", anyRoleAuth, recordPayment);


/* ============================================================
   OFFICER ACTIONS
   ============================================================ */

// View pending transfers
transferRouter.get("/pending", officerAuth, getPending);

// Approve transfer (moves to payment stage)
transferRouter.patch("/approve/:id", officerAuth, approveTransfer);

// Finalize transfer (blockchain + ownership change)
transferRouter.patch("/finalize/:id", officerAuth, finalizeTransfer);

// Reject transfer
transferRouter.patch("/reject/:id", officerAuth, rejectTransfer);


/* ============================================================
   GENERAL (AUTHENTICATED USERS)
   ============================================================ */

// Get transfer details
transferRouter.get("/:id", anyRoleAuth, getTransferById);