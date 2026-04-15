import { Request, Response } from "express";
import { registerService, loginService } from "./auth.service";
import { sendLandPortalEmail } from "../middleware/googleMailer"; 
import { getCitizenWelcomeEmail, getOfficerOnboardingEmail, getAdminWelcomeEmail } from "../emails";
import db from "../drizzle/db";
// ✅ Fixed: Using named import for verificationTokens
import { verificationTokens } from "../drizzle/schema"; 
import crypto from "crypto";

const allowedRoles = ["admin", "land_officer", "citizen"] as const;

/* ================================
   REGISTER CONTROLLER
================================ */
export const registerController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fullName, email, idNumber, walletAddress, password, role } = req.body;

    // 1. Validate required fields
    if (!fullName || !email || !idNumber || !walletAddress || !password || !role) {
      res.status(400).json({ 
        error: "Missing required fields (fullName, email, idNumber, walletAddress, password, role)" 
      });
      return;
    }

    // 2. Validate Role
    if (!allowedRoles.includes(role)) {
      res.status(400).json({ error: "Invalid role. Must be admin, land_officer, or citizen" });
      return;
    }

    // 3. Register User in DB via Service
    const user = await registerService(req.body);

    // 4. Generate Verification Token for Nodemailer Flow
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // Token expires in 24 hours

    await db.insert(verificationTokens).values({
      userId: user.id,
      token,
      type: "email_verification",
      expiresAt,
    });

    // 5. Prepare and Send Email based on Role
    // Make sure CLIENT_URL is in your .env (e.g., http://localhost:5173)
    const verificationLink = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
    let emailTemplate;

    if (role === 'citizen') {
      emailTemplate = getCitizenWelcomeEmail(fullName, walletAddress);
    } else if (role === 'land_officer') {
      emailTemplate = getOfficerOnboardingEmail(fullName, "Main Office");
    } else {
      emailTemplate = getAdminWelcomeEmail(fullName);
    }

    // Combine template body with the Action Button
    const finalHtml = `
      ${emailTemplate.body}
      <div style="text-align: center; margin-top: 25px;">
        <a href="${verificationLink}" style="background-color: #1a2a6c; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
          Verify My Account Identity
        </a>
      </div>
    `;

    // Dispatch via Nodemailer
    await sendLandPortalEmail(email, fullName, emailTemplate.subject, finalHtml, role as any);

    res.status(201).json({
      message: "User registered successfully. Please check your email to verify your Kenyan Land Registry account.",
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        walletAddress: user.walletAddress,
        role: user.role
      },
    });

  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

/* ================================
   LOGIN CONTROLLER
================================ */
export const loginController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    // 6. Login via Service
    const result = await loginService(email, password);

    // 7. Security Check: Prevent unverified users from accessing blockchain features
    if (!result.user.isVerified) {
       res.status(403).json({ 
         error: "Account not verified. Please check your email for the verification link." 
       });
       return;
    }

    res.status(200).json({
      message: "Login successful",
      token: result.token,
      user: {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
        walletAddress: result.user.walletAddress
      }
    });
  } catch (error) {
    res.status(401).json({ error: (error as Error).message });
  }
};