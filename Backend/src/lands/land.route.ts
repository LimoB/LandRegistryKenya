import { Router } from "express";
import { getLands, registerLand, verifyLand } from "./land.controller";
import { authMiddleware, officerOnly } from "../middleware/bearAuth";
import { upload } from "../middleware/upload"; // Import the multer config we discussed

export const landRouter: Router = Router();

// Publicly viewable (but still requires login)
landRouter.get("/", authMiddleware, getLands);

/**
 * @route   POST /api/lands/register
 * @desc    Citizens register land claims with PDF Title Deed
 * @access  Private (Citizen/Admin)
 */
landRouter.post(
  "/register", 
  authMiddleware, 
  upload.single("document"), // Intercepts the file named 'document'
  registerLand
);

// ONLY Government Officers can verify land
landRouter.patch("/verify/:id", authMiddleware, officerOnly, verifyLand);