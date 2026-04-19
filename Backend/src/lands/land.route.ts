import { Router } from "express";
import {
  getLands,
  registerLand,
  verifyLand,
  getLandByLR,
  listLandForSale,
  removeLandFromSale,
  getMarketplaceLands,
  getMyLands
} from "./land.controller";

import {
  officerAuth,
  anyRoleAuth,
  citizenAuth
} from "../middleware/bearAuth";

import { upload } from "../middleware/upload";

export const landRouter: Router = Router();

/* ============================================================
   GENERAL (ALL AUTHENTICATED USERS)
============================================================ */

// Get all lands
landRouter.get("/", anyRoleAuth, getLands);

// Get land by LR Number
landRouter.get("/lr/:lrNumber", anyRoleAuth, getLandByLR);


/* ============================================================
   MARKETPLACE (BUYERS / PUBLIC AUTH USERS)
============================================================ */

// Get marketplace lands (FOR SALE + VERIFIED)
landRouter.get("/marketplace", anyRoleAuth, getMarketplaceLands);


/* ============================================================
   CITIZEN ACTIONS
============================================================ */

// Register land (with PDF upload)
landRouter.post(
  "/register",
  citizenAuth,
  upload.single("document"),
  registerLand
);

// Get my lands (citizen dashboard)
landRouter.get("/my-lands", citizenAuth, getMyLands);

// List land for sale
landRouter.patch(
  "/:id/list-for-sale",
  citizenAuth,
  listLandForSale
);

// Remove land from sale
landRouter.patch(
  "/:id/remove-from-sale",
  citizenAuth,
  removeLandFromSale
);


/* ============================================================
   OFFICER ACTIONS
============================================================ */

// Verify land (mint to blockchain)
landRouter.patch(
  "/verify/:id",
  officerAuth,
  verifyLand
);


/* ============================================================
   FUTURE EXTENSIONS (READY HOOKS)
============================================================ */

// Transfer ownership (BLOCKCHAIN + DB sync)
// landRouter.post("/transfer/:id", citizenAuth, transferLandOwnership);

// Audit logs for land lifecycle tracking
// landRouter.get("/audit/:id", officerAuth, getLandAuditLogs);