import { Router } from "express";
import { registerController, loginController } from "./auth.controller";
import { verifyEmailController } from "./verification.controller";
// These will be the missing controllers we create next
import { 
  forgotPasswordController, 
  resetPasswordController, 
  resendVerificationController 
} from "./password.controller"; 

export const authRouter: Router = Router();

/* ============================================================
   CORE AUTHENTICATION
   ============================================================ */
authRouter.post("/register", registerController);
authRouter.post("/login", loginController);

/* ============================================================
   EMAIL VERIFICATION
   ============================================================ */
// GET /api/auth/verify-email?token=...
authRouter.get("/verify-email", verifyEmailController);

// POST /api/auth/resend-verification (Requires { email } in body)
authRouter.post("/resend-verification", resendVerificationController);

/* ============================================================
   PASSWORD MANAGEMENT
   ============================================================ */
// POST /api/auth/forgot-password (Sends reset email)
authRouter.post("/forgot-password", forgotPasswordController);

// POST /api/auth/reset-password (Actual update using token)
authRouter.post("/reset-password", resetPasswordController);