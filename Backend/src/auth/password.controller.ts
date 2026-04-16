import { Request, Response } from "express";
import db from "../drizzle/db";
import { users, verificationTokens } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcrypt";
import { sendLandPortalEmail } from "../middleware/googleMailer";

import {
  getPasswordResetEmail,
  getPasswordResetSuccessEmail,
  getResendVerificationEmail,
  getCitizenWelcomeEmail
} from "../emails";

/* ============================================================
   HELPER: GENERATE 6-DIGIT OTP
============================================================ */
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/* ============================================================
   1. FORGOT PASSWORD (OTP VERSION)
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

    // prevent email enumeration
    if (!user) {
      res.status(200).json({
        message: "If the email exists, a reset code has been sent."
      });
      return;
    }

    // delete old OTPs
    await db.delete(verificationTokens).where(
      and(
        eq(verificationTokens.userId, user.id),
        eq(verificationTokens.type, "password_reset")
      )
    );

    const token = generateOTP();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.insert(verificationTokens).values({
      userId: user.id,
      token,
      type: "password_reset",
      expiresAt,
    });

    const emailContent = {
      subject: "Password Reset Code",
      body: `
        <h2>Password Reset Request</h2>
        <p>Use the following 6-digit code to reset your password:</p>

        <h1 style="letter-spacing:8px; font-size:32px;">${token}</h1>

        <p>This code expires in 1 hour.</p>
        <p>If you did not request this, ignore this email.</p>
      `
    };

    await sendLandPortalEmail(
      user.email,
      user.fullName,
      emailContent.subject,
      emailContent.body,
      user.role as any
    );

    res.status(200).json({
      message: "Reset code sent to your email"
    });

  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

/* ============================================================
   2. RESET PASSWORD (OTP VERIFY)
============================================================ */
export const resetPasswordController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      res.status(400).json({ error: "Code and new password are required" });
      return;
    }

    const storedToken = await db.query.verificationTokens.findFirst({
      where: and(
        eq(verificationTokens.token, token),
        eq(verificationTokens.type, "password_reset")
      ),
    });

    if (!storedToken) {
      res.status(400).json({ error: "Invalid code" });
      return;
    }

    if (storedToken.expiresAt < new Date()) {
      res.status(400).json({ error: "Code expired" });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, storedToken.userId));

    // delete used OTP
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
   3. RESEND VERIFICATION EMAIL (UNCHANGED LOGIC)
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

    await db.delete(verificationTokens).where(
      and(
        eq(verificationTokens.userId, user.id),
        eq(verificationTokens.type, "email_verification")
      )
    );

    const token = Math.floor(100000 + Math.random() * 900000).toString();

    await db.insert(verificationTokens).values({
      userId: user.id,
      token,
      type: "email_verification",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    const emailContent = getResendVerificationEmail(user.fullName, token);

    const finalHtml = `
      ${emailContent.body}

      <div style="text-align:center;margin-top:20px;">
        <h2>Your Verification Code</h2>
        <h1 style="letter-spacing:6px;">${token}</h1>
      </div>

      <p style="font-size:12px;color:gray;">
        This code expires in 24 hours
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
      message: "Verification code sent successfully"
    });

  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};