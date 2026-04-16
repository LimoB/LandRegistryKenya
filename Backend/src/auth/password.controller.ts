import { Request, Response } from "express";
import db from "../drizzle/db";
import { users, verificationTokens } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { sendLandPortalEmail } from "../middleware/googleMailer";

import {
  getPasswordResetEmail,
  getPasswordResetSuccessEmail,
  getResendVerificationEmail,
  getCitizenWelcomeEmail
} from "../emails";

/* ============================================================
   1. FORGOT PASSWORD
============================================================ */
export const forgotPasswordController = async (req: Request, res: Response): Promise<void> => {
  try {
    let { email } = req.body;

    if (!email) {
      res.status(400).json({ error: "Email is required" });
      return;
    }

    email = email.toLowerCase().trim();

    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    // Avoid email enumeration attack
    if (!user) {
      res.status(200).json({
        message: "If the email exists, a reset link has been sent."
      });
      return;
    }

    // Delete old reset tokens
    await db.delete(verificationTokens).where(
      and(
        eq(verificationTokens.userId, user.id),
        eq(verificationTokens.type, "password_reset")
      )
    );

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.insert(verificationTokens).values({
      userId: user.id,
      token,
      type: "password_reset",
      expiresAt,
    });

    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

    const emailContent = getPasswordResetEmail(user.fullName, resetLink);

    await sendLandPortalEmail(
      user.email,
      user.fullName,
      emailContent.subject,
      emailContent.body,
      user.role as any
    );

    res.status(200).json({
      message: "Password reset instructions sent if account exists."
    });

  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

/* ============================================================
   2. RESET PASSWORD
============================================================ */
export const resetPasswordController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      res.status(400).json({ error: "Token and new password are required" });
      return;
    }

    const storedToken = await db.query.verificationTokens.findFirst({
      where: and(
        eq(verificationTokens.token, token),
        eq(verificationTokens.type, "password_reset")
      ),
    });

    if (!storedToken) {
      res.status(400).json({ error: "Invalid or expired token" });
      return;
    }

    if (storedToken.expiresAt < new Date()) {
      res.status(400).json({ error: "Token has expired" });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, storedToken.userId));

    // Delete token after use
    await db.delete(verificationTokens)
      .where(eq(verificationTokens.id, storedToken.id));

    const user = await db.query.users.findFirst({
      where: eq(users.id, storedToken.userId),
    });

    if (user) {
      const successEmail = getPasswordResetSuccessEmail(user.fullName);

      await sendLandPortalEmail(
        user.email,
        user.fullName,
        successEmail.subject,
        successEmail.body,
        user.role as any
      );
    }

    res.status(200).json({
      message: "Password updated successfully"
    });

  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

/* ============================================================
   3. RESEND VERIFICATION EMAIL
============================================================ */
export const resendVerificationController = async (req: Request, res: Response): Promise<void> => {
  try {
    let { email } = req.body;

    if (!email) {
      res.status(400).json({ error: "Email is required" });
      return;
    }

    email = email.toLowerCase().trim();

    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    if (user.isVerified) {
      res.status(400).json({ error: "Account already verified" });
      return;
    }

    // Remove old verification tokens
    await db.delete(verificationTokens).where(
      and(
        eq(verificationTokens.userId, user.id),
        eq(verificationTokens.type, "email_verification")
      )
    );

    const token = crypto.randomBytes(32).toString("hex");

    await db.insert(verificationTokens).values({
      userId: user.id,
      token,
      type: "email_verification",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    const verifyLink = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

    let emailContent;

    if (user.role === "citizen") {
      emailContent = getCitizenWelcomeEmail(
        user.fullName,
        user.walletAddress || "Not Linked"
      );
    } else {
      emailContent = getResendVerificationEmail(user.fullName, verifyLink);
    }

    const finalHtml = `
      ${emailContent.body}

      <div style="text-align:center;margin-top:20px;">
        <a href="${verifyLink}"
           style="background:#1a2a6c;color:#fff;padding:10px 20px;
                  text-decoration:none;border-radius:5px;">
          Verify My Account
        </a>
      </div>

      <p style="margin-top:10px;font-size:12px;color:gray;">
        Or use token: <b>${token}</b>
      </p>
    `;

    await sendLandPortalEmail(
      user.email,
      user.fullName,
      emailContent.subject,
      finalHtml,
      user.role as any
    );

    res.status(200).json({
      message: "Verification email sent successfully"
    });

  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};