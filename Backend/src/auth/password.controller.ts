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
  getCitizenWelcomeEmail // ✅ Now being used below
} from "../emails";

/* ============================================================
   1. FORGOT PASSWORD CONTROLLER
   ============================================================ */
export const forgotPasswordController = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      res.status(404).json({ error: "User with this email not found" });
      return;
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 3600000); // 1 Hour

    await db.insert(verificationTokens).values({
      userId: user.id,
      token,
      type: "password_reset",
      expiresAt,
    });

    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
    const emailContent = getPasswordResetEmail(user.fullName, resetLink);

    await sendLandPortalEmail(user.email, user.fullName, emailContent.subject, emailContent.body, user.role as any);

    res.status(200).json({ message: "Password reset link sent to your email." });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

/* ============================================================
   2. RESET PASSWORD CONTROLLER
   ============================================================ */
export const resetPasswordController = async (req: Request, res: Response): Promise<void> => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    res.status(400).json({ error: "Token and new password are required" });
    return;
  }

  try {
    const [storedToken] = await db
      .select()
      .from(verificationTokens)
      .where(
        and(
          eq(verificationTokens.token, token),
          eq(verificationTokens.type, "password_reset")
        )
      )
      .limit(1);

    if (!storedToken || storedToken.expiresAt < new Date()) {
      res.status(400).json({ error: "Invalid or expired reset token" });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await db.update(users).set({ password: hashedPassword }).where(eq(users.id, storedToken.userId));
    await db.delete(verificationTokens).where(eq(verificationTokens.id, storedToken.id));

    const user = await db.query.users.findFirst({ where: eq(users.id, storedToken.userId) });
    if (user) {
      const successEmail = getPasswordResetSuccessEmail(user.fullName);
      await sendLandPortalEmail(user.email, user.fullName, successEmail.subject, successEmail.body, user.role as any);
    }

    res.status(200).json({ message: "Password updated successfully." });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

/* ============================================================
   3. RESEND VERIFICATION CONTROLLER
   ============================================================ */
export const resendVerificationController = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    if (user.isVerified) {
      res.status(400).json({ error: "Account is already verified" });
      return;
    }

    await db.delete(verificationTokens).where(
      and(eq(verificationTokens.userId, user.id), eq(verificationTokens.type, "email_verification"))
    );

    const token = crypto.randomBytes(32).toString("hex");
    await db.insert(verificationTokens).values({
      userId: user.id,
      token,
      type: "email_verification",
      expiresAt: new Date(Date.now() + 86400000), // 24 Hours
    });

    const verifyLink = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
    
    // ✅ Logic Fix: Use getCitizenWelcomeEmail for Citizens to remind them of their Wallet Address
    // Use getResendVerificationEmail for other roles
    let emailContent;
    if (user.role === 'citizen') {
      emailContent = getCitizenWelcomeEmail(user.fullName, user.walletAddress || "Not Linked");
    } else {
      emailContent = getResendVerificationEmail(user.fullName, verifyLink);
    }

    // Append the link to the chosen template
    const finalHtml = `
      ${emailContent.body}
      <p style="text-align: center; margin-top: 20px;">
        <a href="${verifyLink}" style="background: #1a2a6c; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
           Verify My Account Now
        </a>
      </p>
    `;

    await sendLandPortalEmail(user.email, user.fullName, emailContent.subject, finalHtml, user.role as any);

    res.status(200).json({ message: "Verification email resent successfully." });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};