import { Request, Response } from "express";
import db from "../drizzle/db";
import { users, verificationTokens } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

/* ============================================================
   VERIFY EMAIL CONTROLLER
   Handles the logic when a user clicks the link from the email
   ============================================================ */
export const verifyEmailController = async (req: Request, res: Response): Promise<void> => {
  // Use query parameter: ?token=xyz
  const { token } = req.query;

  if (!token) {
    res.status(400).json({ error: "Verification token is required" });
    return;
  }

  try {
    // 1. Find the token in the database
    const [storedToken] = await db
      .select()
      .from(verificationTokens)
      .where(
        and(
          eq(verificationTokens.token, token as string),
          eq(verificationTokens.type, "email_verification")
        )
      )
      .limit(1);

    // Check if token exists and hasn't expired
    if (!storedToken) {
      res.status(400).json({ error: "Invalid token" });
      return;
    }

    if (storedToken.expiresAt < new Date()) {
       // Optional: You could delete the expired token here
       await db.delete(verificationTokens).where(eq(verificationTokens.id, storedToken.id));
       res.status(400).json({ error: "Token has expired. Please request a new verification email." });
       return;
    }

    // 2. Update the user (transactional update)
    // We set isVerified to true and record the timestamp
    await db
      .update(users)
      .set({ 
        isVerified: true, 
        emailVerifiedAt: new Date() 
      })
      .where(eq(users.id, storedToken.userId));

    // 3. Cleanup: Delete the used token so it can't be reused
    await db
      .delete(verificationTokens)
      .where(eq(verificationTokens.id, storedToken.id));

    res.status(200).json({ 
      message: "Identity verified successfully! You can now log in to the Kenyan Land Registry Portal." 
    });
    
  } catch (error) {
    console.error("[verifyEmailController] Error:", error);
    res.status(500).json({ error: "Internal server error during email verification" });
  }
};