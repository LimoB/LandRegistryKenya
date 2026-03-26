import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

/* ================================
   User Roles (Matches Drizzle Schema)
================================ */
export type UserRole = "admin" | "land_officer" | "citizen";

/* ================================
   JWT Payload
================================ */
export type DecodedToken = {
  userId: number;
  email: string;
  role: UserRole;
  walletAddress: string; // ✅ Added this to resolve the TS error
  exp?: number;
};

/* ================================
   Extend Express Request
================================ */
declare global {
  namespace Express {
    interface Request {
      user?: DecodedToken;
    }
  }
}

/* ================================
   Verify Token
================================ */
export const verifyToken = (
  token: string,
  secret: string
): DecodedToken | null => {
  try {
    return jwt.verify(token, secret) as DecodedToken;
  } catch (error) {
    return null;
  }
};

/* ================================
   Authentication Middleware (Bearer)
================================ */
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    res.status(401).json({ message: "Authorization header missing" });
    return;
  }

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;

  const decoded = verifyToken(token, process.env.JWT_SECRET as string);

  if (!decoded) {
    res.status(401).json({ message: "Invalid or expired token" });
    return;
  }

  req.user = decoded;
  next();
};

/* ================================
   Role Guard
================================ */
export const roleGuard = (allowedRoles: UserRole | UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ message: "Forbidden: Insufficient permissions" });
      return;
    }

    next();
  };
};

/* ================================
   Predefined Role Guards
================================ */
export const officerOnly = roleGuard("land_officer");
export const adminOnly = roleGuard("admin");
export const citizenOnly = roleGuard("citizen");
export const officialAccess = roleGuard(["admin", "land_officer"]);