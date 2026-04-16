import { Router } from "express";
import {
  getLands,
  registerLand,
  verifyLand,
  getLandByLR
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
   CITIZEN ACTIONS
   ============================================================ */

// Register land (with PDF upload)
landRouter.post(
  "/register",
  citizenAuth, // ✅ restricted properly
  upload.single("document"),
  registerLand
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