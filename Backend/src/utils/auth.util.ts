import { Request } from "express";

/**
 * Interface to describe the decoded user object attached by middleware
 */
interface AuthUser {
  userId: number;
  role: "citizen" | "officer" | string;
  email?: string;
}

/**
 * Extracts the userId from the request object.
 * Returns null if the user is not authenticated or the ID is missing.
 */
export const getUserId = (req: Request): number | null => {
  const user = (req as any).user as AuthUser | undefined;
  
  if (!user || !user.userId) {
    console.warn("[AuthUtil] getUserId failed: No user object found on request.");
    return null;
  }
  
  return user.userId;
};

/**
 * Extracts the user role from the request object.
 * Crucial for distinguishing between Citizens and Officers in controllers.
 */
export const getUserRole = (req: Request): string | null => {
  const user = (req as any).user as AuthUser | undefined;

  if (!user || !user.role) {
    console.warn("[AuthUtil] getUserRole failed: No role found on request.");
    return null;
  }

  return user.role;
};