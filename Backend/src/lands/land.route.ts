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
   SPECIFIC COLLECTIONS (Move these up to avoid param collision)
============================================================ */

// Get marketplace lands (FOR SALE + VERIFIED)
landRouter.get("/marketplace", anyRoleAuth, getMarketplaceLands);

// Get my lands (citizen dashboard)
landRouter.get("/my-lands", citizenAuth, getMyLands);


/* ============================================================
   GENERAL READ ACTIONS
============================================================ */

// Get all lands (Admin/Officer overview)
landRouter.get("/", anyRoleAuth, getLands);

// Get land by LR Number (Dynamic param at bottom of GETs)
landRouter.get("/lr/:lrNumber", anyRoleAuth, getLandByLR);


/* ============================================================
   CITIZEN ACTIONS
============================================================ */

// Register land (with PDF upload)
// NOTE: Ensure the frontend 'name' attribute in the form is "document"
landRouter.post(
  "/register",
  citizenAuth,
  upload.single("document"), 
  registerLand
);

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

// Verify land (Mints to blockchain)
landRouter.patch(
  "/verify/:id",
  officerAuth,
  verifyLand
);

export default landRouter;