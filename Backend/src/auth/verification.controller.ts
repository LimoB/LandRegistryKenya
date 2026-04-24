import { Request, Response, NextFunction } from "express";
import db from "../drizzle/db";
import { users, verificationTokens } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

/**
 * Verifies email using a token (from URL query or body)
 * Marks user as verified and cleans up the used token.
 */
export const verifyEmailController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1. Read token (Support both URL Query and Request Body)
    let { token } = req.query;

    if (!token) {
      token = req.body?.token;
    }

    if (!token) {
      const error: any = new Error("Verification code is required");
      error.statusCode = 400;
      throw error;
    }

    // Normalize token (handle arrays or whitespace)
    if (Array.isArray(token)) {
      token = token[0];
    }
    const normalizedToken = String(token).trim();

    // 2. Find verification token in DB
    const storedToken = await db.query.verificationTokens.findFirst({
      where: and(
        eq(verificationTokens.token, normalizedToken),
        eq(verificationTokens.type, "email_verification")
      ),
    });

    if (!storedToken) {
      const error: any = new Error("Invalid or expired verification code");
      error.statusCode = 400;
      throw error;
    }

    // 3. Check Expiry
    if (storedToken.expiresAt < new Date()) {
      // Cleanup expired token automatically
      await db.delete(verificationTokens).where(
        eq(verificationTokens.id, storedToken.id)
      );

      const error: any = new Error("Verification code has expired. Please request a new one.");
      error.statusCode = 400;
      throw error;
    }

    // 4. Fetch associated user
    const user = await db.query.users.findFirst({
      where: eq(users.id, storedToken.userId),
    });

    if (!user) {
      const error: any = new Error("User record not found for this token");
      error.statusCode = 404;
      throw error;
    }

    // 5. Check if already verified (Idempotency)
    if (user.isVerified) {
      // Cleanup token anyway since it's no longer needed
      await db.delete(verificationTokens).where(
        eq(verificationTokens.id, storedToken.id)
      );

      res.status(200).json({
        success: true,
        message: "Account is already verified. Please proceed to log in."
      });
      return;
    }

    // 6. Atomically update user status
    await db.update(users)
      .set({
        isVerified: true,
        emailVerifiedAt: new Date()
      })
      .where(eq(users.id, user.id));

    // 7. Delete token (Single-use security)
    await db.delete(verificationTokens).where(
      eq(verificationTokens.id, storedToken.id)
    );

    // 8. Success Response
    res.status(200).json({
      success: true,
      message: "Email verified successfully. Welcome to the Kenyan Land Registry Portal."
    });
    return;

  } catch (error) {
    // Passes to your globalErrorHandler in app.ts
    next(error);
  }
};