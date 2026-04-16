import jwt, { type SignOptions } from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

/* ============================================================
   Express Type Augmentation
============================================================ */
declare global {
  namespace Express {
    interface Request {
      user?: DecodedToken;
    }
  }
}

/* ============================================================
   Roles
============================================================ */
export type UserRole = "admin" | "land_officer" | "citizen";

/* ============================================================
   JWT Payload
============================================================ */
export type DecodedToken = {
  userId: number;
  email: string;
  role: UserRole;
  walletAddress: string;
  exp?: number;
};

/* ============================================================
   Generate OTP
============================================================ */
export const generateVerificationCode = (): string =>
  Math.floor(100000 + Math.random() * 900000).toString();

/* ============================================================
   SIGN TOKEN (SIMPLIFIED)
============================================================ */
export const signToken = (
  payload: DecodedToken,
  secret: string,
  expiresIn: SignOptions["expiresIn"] = "1h"
): string => {
  return jwt.sign(payload, secret, { expiresIn });
};

/* ============================================================
   VERIFY TOKEN
============================================================ */
export const verifyToken = (
  token: string,
  secret: string
): DecodedToken | null => {
  try {
    const decoded = jwt.verify(token, secret);

    if (typeof decoded === "string") return null;

    const { userId, email, role, walletAddress, exp } = decoded as any;

    if (
      typeof userId !== "number" ||
      typeof email !== "string" ||
      typeof walletAddress !== "string" ||
      !["admin", "land_officer", "citizen"].includes(role)
    ) {
      return null;
    }

    return { userId, email, role, walletAddress, exp };
  } catch {
    return null;
  }
};

/* ============================================================
   AUTH FACTORY
============================================================ */
const authMiddlewareFactory = (allowedRoles: UserRole | UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({ error: "Missing token" });
      return;
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader;

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      res.status(500).json({ error: "Server config error" });
      return;
    }

    const decoded = verifyToken(token, secret);

    if (!decoded) {
      res.status(401).json({ error: "Invalid or expired token" });
      return;
    }

    const roles = Array.isArray(allowedRoles)
      ? allowedRoles
      : [allowedRoles];

    if (!roles.includes(decoded.role)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    req.user = decoded;
    next();
  };
};

/* ============================================================
   EXPORT MIDDLEWARES
============================================================ */
export const adminAuth = authMiddlewareFactory("admin");
export const officerAuth = authMiddlewareFactory("land_officer");
export const citizenAuth = authMiddlewareFactory("citizen");
export const officialAuth = authMiddlewareFactory(["admin", "land_officer"]);
export const anyRoleAuth = authMiddlewareFactory([
  "admin",
  "land_officer",
  "citizen"
]);