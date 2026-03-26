import { Request, Response } from "express";
import { registerService, loginService } from "./auth.service";

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

    // 3. Register via Service
    const user = await registerService(req.body);

    res.status(201).json({
      message: "User registered successfully in the Kenyan Land Registry",
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

    // 4. Login via Service
    // This result MUST contain { user, token } where token has the walletAddress
    const result = await loginService(email, password);

    res.status(200).json({
      message: "Login successful",
      token: result.token,
      user: {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
        walletAddress: result.user.walletAddress // Vital for blockchain actions
      }
    });
  } catch (error) {
    res.status(401).json({ error: (error as Error).message });
  }
};