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

    // Normalize email
    email = email?.toLowerCase().trim();

    // 1. Validate required fields
    if (!fullName || !email || !idNumber || !walletAddress || !password || !role) {
      const error: any = new Error("Missing required registration fields");
      error.statusCode = 400;
      throw error;
    }

    // 2. Validate role
    if (!allowedRoles.includes(role)) {
      const error: any = new Error("Invalid role selection");
      error.statusCode = 400;
      throw error;
    }

    // 3. Register user via service
    const user = await registerService({
      fullName,
      email,
      idNumber,
      walletAddress,
      password,
      role,
    });

    // 4. TOKEN GENERATION
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await db.insert(verificationTokens).values({
      userId: user.id,
      token,
      type: "email_verification",
      expiresAt,
    });

    const verificationLink = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

    // 5. EMAIL TEMPLATE SELECTION
    let emailTemplate;
    if (role === "citizen") {
      emailTemplate = getCitizenWelcomeEmail(fullName, walletAddress);
    } else if (role === "land_officer") {
      emailTemplate = getOfficerOnboardingEmail(fullName, "Main Office");
    } else {
      emailTemplate = getAdminWelcomeEmail(fullName);
    }

    // 6. EMAIL SENDING
    const finalHtml = `
      ${emailTemplate.body}
      <hr style="margin:20px 0;" />
      <p><b>Your Verification Token:</b></p>
      <code style="font-size:16px; background:#f4f4f4; padding:10px;">${token}</code>
      <p style="margin-top:15px;">Verify your account by clicking below or using the token in-app:</p>
      <div style="text-align:center; margin-top:20px;">
        <a href="${verificationLink}" style="background:#1a2a6c;color:#fff;padding:12px 20px;text-decoration:none;border-radius:6px;">
          Verify Account
        </a>
      </div>
    `;

    await sendLandPortalEmail(email, fullName, emailTemplate.subject, finalHtml, role as any);

    // FIXED: Call res without returning the result of res.json()
    res.status(201).json({
      success: true,
      message: "User registered successfully. Please check your email for the verification token.",
      data: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    });
    return;

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

    // 1. Authenticate
    const result = await loginService(email, password);
    const user = result.user;

    // 2. Account Verification Check
    if (!user.isVerified) {
      const error: any = new Error("Account not verified. Check your email for a verification token.");
      error.statusCode = 403;
      error.code = "EMAIL_NOT_VERIFIED"; 
      throw error;
    }

    // FIXED: Call res without returning the result of res.json()
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
    return;

  } catch (error: any) {
    if (error.message.includes("Invalid")) {
      error.statusCode = 401;
      error.message = "Invalid email or password";
    }
    next(error);
  }
};