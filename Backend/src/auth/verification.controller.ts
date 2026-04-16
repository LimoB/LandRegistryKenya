import { Request, Response } from "express";
import db from "../drizzle/db";
import { users, verificationTokens } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

/* ============================================================
   VERIFY EMAIL CONTROLLER (OTP + TOKEN SAFE)
============================================================ */
export const verifyEmailController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // ============================================================
    // 1. READ TOKEN (QUERY OR BODY SUPPORT)
    // ============================================================
    let { token } = req.query;

    if (!token) {
      token = req.body?.token;
    }

    if (!token) {
      res.status(400).json({ error: "Verification code is required" });
      return;
    }

    // normalize token
    if (Array.isArray(token)) {
      token = token[0];
    }

    token = String(token).trim();

    // ============================================================
    // 2. FIND VERIFICATION TOKEN
    // ============================================================
    const storedToken = await db.query.verificationTokens.findFirst({
      where: and(
        eq(verificationTokens.token, token),
        eq(verificationTokens.type, "email_verification")
      ),
    });

    if (!storedToken) {
      res.status(400).json({
        error: "Invalid or expired verification code"
      });
      return;
    }

    // ============================================================
    // 3. CHECK EXPIRY
    // ============================================================
    if (storedToken.expiresAt < new Date()) {
      // cleanup expired token
      await db.delete(verificationTokens).where(
        eq(verificationTokens.id, storedToken.id)
      );

      res.status(400).json({
        error: "Verification code expired. Request a new one."
      });
      return;
    }

    // ============================================================
    // 4. GET USER
    // ============================================================
    const user = await db.query.users.findFirst({
      where: eq(users.id, storedToken.userId),
    });

    if (!user) {
      res.status(404).json({
        error: "User not found for this verification code"
      });
      return;
    }

    // ============================================================
    // 5. ALREADY VERIFIED CHECK (IDEMPOTENT)
    // ============================================================
    if (user.isVerified) {
      await db.delete(verificationTokens).where(
        eq(verificationTokens.id, storedToken.id)
      );

      res.status(200).json({
        message: "Account already verified. Please log in."
      });
      return;
    }

    // ============================================================
    // 6. UPDATE USER STATUS
    // ============================================================
    await db.update(users)
      .set({
        isVerified: true,
        emailVerifiedAt: new Date()
      })
      .where(eq(users.id, user.id));

    // ============================================================
    // 7. DELETE TOKEN (ONE-TIME USE)
    // ============================================================
    await db.delete(verificationTokens).where(
      eq(verificationTokens.id, storedToken.id)
    );

    // ============================================================
    // 8. RESPONSE
    // ============================================================
    res.status(200).json({
      message: "Email verified successfully. Welcome to Land Registry."
    });

  } catch (error) {
    console.error("[verifyEmailController]", error);

    res.status(500).json({
      error: "Internal server error during verification"
    });
  }
};