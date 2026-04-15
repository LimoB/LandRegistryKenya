import jwt, { type SignOptions } from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import ms, { type StringValue } from 'ms';

// === Extend Express Request to include user ===
declare global {
  namespace Express {
    interface Request {
      user?: DecodedToken;
    }
  }
}

/* ============================================================
   User Roles (Matches Drizzle Schema)
   ============================================================ */
export type UserRole = "admin" | "land_officer" | "citizen";

/* ============================================================
   Decoded JWT Payload Type
   ============================================================ */
export type DecodedToken = {
  userId: number;
  email: string;
  role: UserRole;
  walletAddress: string; // ✅ Critical for Blockchain actions
  exp?: number;
};

// === Generate a random 6-digit verification code (OTP) ===
export const generateVerificationCode = (): string =>
  Math.floor(100000 + Math.random() * 900000).toString();

// === Sign Access Token ===
export const signToken = (
  payload: DecodedToken,
  secret: string,
  expiresIn: StringValue = '1h'
): string => {
  // ✅ Using 'ms' here to calculate numeric seconds for JWT
  // This resolves the "ms is never read" error
  const expiresInSeconds = Math.floor(ms(expiresIn) / 1000);
  const options: SignOptions = { expiresIn: expiresInSeconds };
  
  return jwt.sign(payload, secret, options);
};

// === Normalize a decoded JWT payload ===
const normalizeDecodedToken = (raw: any): DecodedToken | null => {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const userId = typeof raw.userId === 'number' ? raw.userId : null;
  const email = typeof raw.email === 'string' ? raw.email : null;
  const role = raw.role;
  const walletAddress = typeof raw.walletAddress === 'string' ? raw.walletAddress : null;

  if (
    typeof userId !== 'number' ||
    !email ||
    !walletAddress ||
    !['admin', 'land_officer', 'citizen'].includes(role)
  ) {
    console.error('[normalizeDecodedToken] Missing/invalid fields in Land Token');
    return null;
  }

  return {
    userId,
    email,
    role,
    walletAddress,
    exp: typeof raw.exp === 'number' ? raw.exp : undefined,
  };
};

// === Verify Access Token ===
export const verifyToken = (
  token: string,
  secret: string
): DecodedToken | null => {
  try {
    const raw = jwt.verify(token, secret);
    return normalizeDecodedToken(raw);
  } catch (err) {
    return null;
  }
};

/* ============================================================
   Role-Based Middleware Factory
   ============================================================ */
const authMiddlewareFactory = (allowedRoles: UserRole | UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.header('Authorization');

    if (!authHeader) {
      res.status(401).json({ error: 'Missing authorization token' });
      return;
    }

    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader;

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      res.status(500).json({ error: 'Server misconfiguration: JWT_SECRET missing' });
      return;
    }

    const decoded = verifyToken(token, secret);

    if (!decoded) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    const allowed = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (!allowed.includes(decoded.role)) {
      res.status(403).json({ 
        error: `Access Denied. Role '${decoded.role}' not authorized for this land operation.` 
      });
      return;
    }

    req.user = decoded;
    next();
  };
};

/* ============================================================
   Export Specific Role-Based Middleware
   ============================================================ */
export const adminAuth = authMiddlewareFactory('admin');
export const officerAuth = authMiddlewareFactory('land_officer');
export const citizenAuth = authMiddlewareFactory('citizen');
export const officialAuth = authMiddlewareFactory(['admin', 'land_officer']);
export const anyRoleAuth = authMiddlewareFactory(['admin', 'land_officer', 'citizen']);