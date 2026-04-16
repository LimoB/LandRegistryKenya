import { Request, Response } from "express";
import db from "../drizzle/db";
import { users, verificationTokens } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

/* ============================================================
   VERIFY EMAIL CONTROLLER (TOKEN SAFE + PRODUCTION READY)
============================================================ */
export const verifyEmailController = async (req: Request, res: Response): Promise<void> => {
  try {
    // ============================================================
    // 1. TOKEN NORMALIZATION (IMPORTANT FIX)
    // ============================================================
    let { token } = req.query;

    if (!token) {
      res.status(400).json({ error: "Verification token is required" });
      return;
    }

    // Handle string | string[]
    if (Array.isArray(token)) {
      token = token[0];
    }

    token = String(token).trim();

    // ============================================================
    // 2. FIND TOKEN
    // ============================================================
    const storedToken = await db.query.verificationTokens.findFirst({
      where: and(
        eq(verificationTokens.token, token),
        eq(verificationTokens.type, "email_verification")
      ),
    });

    if (!storedToken) {
      res.status(400).json({
        error: "Invalid or already used verification token"
      });
      return;
    }

    // ============================================================
    // 3. EXPIRY CHECK
    // ============================================================
    if (storedToken.expiresAt < new Date()) {
      // Clean expired token immediately
      await db.delete(verificationTokens)
        .where(eq(verificationTokens.id, storedToken.id));

      res.status(400).json({
        error: "Verification token expired. Please request a new one."
      });
      return;
    }

    // ============================================================
    // 4. FETCH USER
    // ============================================================
    const user = await db.query.users.findFirst({
      where: eq(users.id, storedToken.userId),
    });

    if (!user) {
      res.status(404).json({
        error: "User not found for this token"
      });
      return;
    }

    // ============================================================
    // 5. IDENTITY CHECK (IDEMPOTENT SAFETY)
    // ============================================================
    if (user.isVerified) {
      // Clean token anyway
      await db.delete(verificationTokens)
        .where(eq(verificationTokens.id, storedToken.id));

      res.status(200).json({
        message: "Account already verified. You can log in."
      });
      return;
    }

    // ============================================================
    // 6. VERIFY USER
    // ============================================================
    await db.update(users)
      .set({
        isVerified: true,
        emailVerifiedAt: new Date()
      })
      .where(eq(users.id, storedToken.userId));

    // ============================================================
    // 7. CLEANUP TOKEN (ONE-TIME USE)
    // ============================================================
    await db.delete(verificationTokens)
      .where(eq(verificationTokens.id, storedToken.id));

    // ============================================================
    // 8. SUCCESS RESPONSE
    // ============================================================
    res.status(200).json({
      message: "Email verified successfully. You can now access the Land Registry system."
    });

  } catch (error) {
    console.error("[verifyEmailController]", error);

    res.status(500).json({
      error: "Internal server error during verification"
    });
  }
};