import { Router } from "express";
import { registerController, loginController } from "./auth.controller";
import { verifyEmailController } from "./verification.controller";
import {
  forgotPasswordController,
  resetPasswordController,
  resendVerificationController
} from "./password.controller";

export const authRouter: Router = Router();

/* ============================================================
   CORE AUTH
============================================================ */
authRouter.post("/register", registerController);
authRouter.post("/login", loginController);

/* ============================================================
   EMAIL VERIFICATION
============================================================ */

// Verify email (token from query param)
authRouter.get("/verify-email", verifyEmailController);

// Resend verification email
authRouter.post("/resend-verification", resendVerificationController);

/* ============================================================
   PASSWORD RESET FLOW
============================================================ */

// Step 1: Request reset link/token
authRouter.post("/forgot-password", forgotPasswordController);

// Step 2: Reset password using token
authRouter.post("/reset-password", resetPasswordController);