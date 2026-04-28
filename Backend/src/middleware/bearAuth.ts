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

const VALID_ROLES: UserRole[] = ["admin", "land_officer", "citizen"];

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
   SIGN TOKEN (✅ FIXED: role normalization)
============================================================ */
export const signToken = (
  payload: DecodedToken,
  secret: string,
  expiresIn: SignOptions["expiresIn"] = "1h"
): string => {
  const normalizedPayload = {
    ...payload,
    role: payload.role.trim().toLowerCase() as UserRole, // ✅ FIX
  };

  console.log("\n========== [SIGN TOKEN] ==========");
  console.log("Payload being signed:", normalizedPayload);
  console.log("=================================\n");

  return jwt.sign(normalizedPayload, secret, { expiresIn });
};

/* ============================================================
   VERIFY TOKEN (✅ FIXED: role normalization + better logs)
============================================================ */
export const verifyToken = (
  token: string,
  secret: string
): DecodedToken | null => {
  try {
    const decoded = jwt.verify(token, secret);

    if (typeof decoded === "string") {
      console.warn("[VERIFY] Token decoded as string → invalid");
      return null;
    }

    const {
      userId,
      email,
      role: rawRole,
      walletAddress,
      exp
    } = decoded as any;

    // ✅ normalize role (CRITICAL FIX)
    const role = typeof rawRole === "string"
      ? rawRole.trim().toLowerCase()
      : rawRole;

    console.log("\n========== [VERIFY TOKEN] ==========");
    console.log("Raw decoded:", decoded);
    console.log("Normalized role:", role);

    if (typeof userId !== "number") {
      console.error("[VERIFY] Invalid userId:", userId);
      return null;
    }

    if (typeof email !== "string") {
      console.error("[VERIFY] Invalid email:", email);
      return null;
    }

    if (typeof walletAddress !== "string") {
      console.error("[VERIFY] Invalid walletAddress:", walletAddress);
      return null;
    }

    if (!VALID_ROLES.includes(role)) {
      console.error(`[VERIFY] Invalid role: "${role}"`);
      console.error("Expected one of:", VALID_ROLES);
      return null;
    }

    console.log("[VERIFY] Token valid. Role:", role);
    console.log("===================================\n");

    return { userId, email, role, walletAddress, exp };

  } catch (err: any) {
    console.error("[VERIFY ERROR]", err.message);
    return null;
  }
};

/* ============================================================
   AUTH FACTORY (unchanged logic, improved clarity)
============================================================ */
const authMiddlewareFactory = (allowedRoles: UserRole | UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    console.log("\n========== [AUTH MIDDLEWARE] ==========");

    const authHeader = req.headers.authorization;
    console.log("Authorization Header:", authHeader);

    if (!authHeader) {
      console.warn("[AUTH] Missing Authorization header");
      res.status(401).json({ error: "Missing token" });
      return;
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader;

    console.log("Extracted Token:", token);

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      console.error("[AUTH] Missing JWT_SECRET");
      res.status(500).json({ error: "Server config error" });
      return;
    }

    const decoded = verifyToken(token, secret);

    if (!decoded) {
      console.error("[AUTH] Token verification failed");
      res.status(401).json({ error: "Invalid or expired token" });
      return;
    }

    const roles = Array.isArray(allowedRoles)
      ? allowedRoles
      : [allowedRoles];

    console.log("Allowed Roles:", roles);
    console.log("User Role:", decoded.role);

    if (!roles.includes(decoded.role)) {
      console.error("[AUTH] Role not permitted:", decoded.role);
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    req.user = decoded;

    console.log("[AUTH] Access granted");
    console.log("=====================================\n");

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