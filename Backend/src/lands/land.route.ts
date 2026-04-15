import { Router } from "express";
import { getLands, registerLand, verifyLand } from "./land.controller";
// Using the new specific guards from your updated bearAuth.ts
import { officerAuth, anyRoleAuth } from "../middleware/bearAuth";
import { upload } from "../middleware/upload"; 

export const landRouter: Router = Router();

/**
 * @route   GET /api/lands
 * @desc    View all land parcels (Accessible by all verified users)
 * @access  Private (Citizen/Officer/Admin)
 */
landRouter.get("/", anyRoleAuth, getLands);

/**
 * @route   POST /api/lands/register
 * @desc    Citizens register land claims with PDF Title Deed (Uploaded to IPFS/Storage)
 * @access  Private (Any verified user, typically Citizens)
 */
landRouter.post(
  "/register", 
  anyRoleAuth, 
  upload.single("document"), // Multer processes the file upload
  registerLand
);

/**
 * @route   PATCH /api/lands/verify/:id
 * @desc    Government Officers review and verify land claims
 * @access  Private (Land Officer Only)
 */
landRouter.patch("/verify/:id", officerAuth, verifyLand);