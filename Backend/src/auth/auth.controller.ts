import { Request, Response } from "express";
import { registerService, loginService } from "./auth.service";
import { sendLandPortalEmail } from "../middleware/googleMailer";
import {
  getCitizenWelcomeEmail,
  getOfficerOnboardingEmail,
  getAdminWelcomeEmail
} from "../emails";
import db from "../drizzle/db";
import { verificationTokens, users } from "../drizzle/schema";
import crypto from "crypto";
import { eq } from "drizzle-orm";

const allowedRoles = ["admin", "land_officer", "citizen"] as const;

/* ============================================================
   REGISTER CONTROLLER (TOKEN + LINK VERIFICATION)
============================================================ */
export const registerController = async (req: Request, res: Response): Promise<void> => {
  try {
    let { fullName, email, idNumber, walletAddress, password, role } = req.body;

    // Normalize email (IMPORTANT)
    email = email?.toLowerCase().trim();

    // 1. Validate required fields
    if (!fullName || !email || !idNumber || !walletAddress || !password || !role) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    // 2. Validate role
    if (!allowedRoles.includes(role)) {
      res.status(400).json({ error: "Invalid role" });
      return;
    }

    // 3. Register user
    const user = await registerService({
      fullName,
      email,
      idNumber,
      walletAddress,
      password,
      role,
    });

    // ============================================================
    // 4. TOKEN GENERATION (PRIMARY METHOD)
    // ============================================================
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await db.insert(verificationTokens).values({
      userId: user.id,
      token,
      type: "email_verification",
      expiresAt,
    });

    // ============================================================
    // 5. OPTIONAL LINK (FRONTEND SUPPORT)
    // ============================================================
    const verificationLink =
      `${process.env.CLIENT_URL}/verify-email?token=${token}`;

    // ============================================================
    // 6. EMAIL TEMPLATE SELECTION
    // ============================================================
    let emailTemplate;

    if (role === "citizen") {
      emailTemplate = getCitizenWelcomeEmail(fullName, walletAddress);
    } else if (role === "land_officer") {
      emailTemplate = getOfficerOnboardingEmail(fullName, "Main Office");
    } else {
      emailTemplate = getAdminWelcomeEmail(fullName);
    }

    // ============================================================
    // 7. EMAIL CONTENT (TOKEN + LINK BOTH INCLUDED)
    // ============================================================
    const finalHtml = `
      ${emailTemplate.body}

      <hr style="margin:20px 0;" />

      <p><b>Your Verification Token:</b></p>
      <code style="font-size:16px; background:#f4f4f4; padding:10px;">
        ${token}
      </code>

      <p style="margin-top:15px;">
        You can either:
      </p>

      <ul>
        <li>Click the button below (web users)</li>
        <li>Or copy-paste the token into the app (mobile/API users)</li>
      </ul>

      <div style="text-align:center; margin-top:20px;">
        <a href="${verificationLink}"
           style="background:#1a2a6c;color:#fff;padding:12px 20px;
                  text-decoration:none;border-radius:6px;">
          Verify Account
        </a>
      </div>
    `;

    await sendLandPortalEmail(
      email,
      fullName,
      emailTemplate.subject,
      finalHtml,
      role as any
    );

    res.status(201).json({
      message: "User registered successfully. Verify your account using email token or link.",
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        walletAddress: user.walletAddress,
        role: user.role
      }
    });

  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

/* ================================
   LOGIN CONTROLLER (IMPROVED)
================================ */
export const loginController = async (req: Request, res: Response): Promise<void> => {
  try {
    let { email, password } = req.body;

    // ============================================================
    // 1. VALIDATION
    // ============================================================
    if (!email || !password) {
      res.status(400).json({
        error: "Email and password are required"
      });
      return;
    }

    // Normalize email (IMPORTANT)
    email = email.toLowerCase().trim();

    // ============================================================
    // 2. AUTHENTICATION
    // ============================================================
    const result = await loginService(email, password);

    const user = result.user;

    // ============================================================
    // 3. EMAIL VERIFICATION CHECK (BLOCKCHAIN SAFETY)
    // ============================================================
    if (!user.isVerified) {
      res.status(403).json({
        error: "Account not verified. Please verify your email using the token sent to your inbox.",
        code: "EMAIL_NOT_VERIFIED"
      });
      return;
    }

    // ============================================================
    // 4. SUCCESS RESPONSE
    // ============================================================
    res.status(200).json({
      message: "Login successful",
      token: result.token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        walletAddress: user.walletAddress,
        isVerified: user.isVerified
      }
    });

  } catch (error) {
    const message = (error as Error).message;

    // Better error classification
    if (message.includes("Invalid")) {
      res.status(401).json({
        error: "Invalid email or password"
      });
      return;
    }

    res.status(500).json({
      error: "Login failed. Please try again later."
    });
  }
};