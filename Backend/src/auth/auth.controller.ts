import { Request, Response, NextFunction } from "express";
import { registerService, loginService } from "./auth.service";
import { sendLandPortalEmail } from "../middleware/googleMailer";
import {
  getCitizenWelcomeEmail,
  getOfficerOnboardingEmail,
  getAdminWelcomeEmail
} from "../emails";
import db from "../drizzle/db";
import { verificationTokens } from "../drizzle/schema";
import crypto from "crypto";

const allowedRoles = ["admin", "land_officer", "citizen"] as const;

/* ============================================================
   REGISTER CONTROLLER
============================================================ */
export const registerController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let { fullName, email, idNumber, walletAddress, password, role } = req.body;

    email = email?.toLowerCase().trim();

    if (!fullName || !email || !idNumber || !walletAddress || !password || !role) {
      const error: any = new Error("Missing required registration fields");
      error.statusCode = 400;
      throw error;
    }

    if (!allowedRoles.includes(role)) {
      const error: any = new Error("Invalid role selection");
      error.statusCode = 400;
      throw error;
    }

    const user = await registerService({
      fullName,
      email,
      idNumber,
      walletAddress,
      password,
      role,
    });

    // TOKEN GENERATION (Updated to match your schema's 10-character limit)
    // Using randomBytes(5) converted to hex gives exactly 10 characters
    const token = crypto.randomBytes(5).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await db.insert(verificationTokens).values({
      userId: user.id,
      token,
      type: "email_verification",
      expiresAt,
    });

    const verificationLink = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

    let emailTemplate;
    if (role === "citizen") {
      emailTemplate = getCitizenWelcomeEmail(fullName, walletAddress);
    } else if (role === "land_officer") {
      emailTemplate = getOfficerOnboardingEmail(fullName, "Main Office");
    } else {
      emailTemplate = getAdminWelcomeEmail(fullName);
    }

    const finalHtml = `
      ${emailTemplate.body}
      <hr style="margin:20px 0;" />
      <p><b>Your Verification Token:</b></p>
      <code style="font-size:20px; letter-spacing:2px; background:#f4f4f4; padding:10px; border-radius:4px;">${token}</code>
      <p style="margin-top:15px;">Verify your account by clicking below or using the token in-app:</p>
      <div style="text-align:center; margin-top:20px;">
        <a href="${verificationLink}" style="background:#1a2a6c;color:#fff;padding:12px 20px;text-decoration:none;border-radius:6px;font-weight:bold;">
          Verify Account
        </a>
      </div>
    `;

    // Wrapped in try/catch so registration doesn't fail if SMTP is down during dev
    try {
      await sendLandPortalEmail(email, fullName, emailTemplate.subject, finalHtml, role as any);
    } catch (mailError) {
      console.error("Mailer Error (User still created):", mailError);
    }

    res.status(201).json({
      success: true,
      message: "User registered. Please check your email for your 10-character code.",
      data: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    next(error);
  }
};

/* ============================================================
   LOGIN CONTROLLER
============================================================ */
export const loginController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      const error: any = new Error("Email and password are required");
      error.statusCode = 400;
      throw error;
    }

    email = email.toLowerCase().trim();

    const result = await loginService(email, password);
    const user = result.user;

    // Check verification status from DB
    if (!user.isVerified) {
      console.warn(`Login blocked: User ${email} is not verified.`);
      const error: any = new Error("Account not verified. Please check your email.");
      error.statusCode = 403;
      error.code = "EMAIL_NOT_VERIFIED"; 
      throw error;
    }

    res.status(200).json({
      success: true,
      message: "Login successful",
      token: result.token,
      data: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        walletAddress: user.walletAddress
      }
    });

  } catch (error: any) {
    // Better debugging for your terminal
    console.error("Login Error:", error.message);
    
    if (error.message.includes("Invalid")) {
      error.statusCode = 401;
      error.message = "Invalid email or password";
    }
    next(error);
  }
};