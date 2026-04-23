import { Request } from "express";

/**
 * Reusable helper to extract userId from the request object
 * safely after it has passed through authentication middleware.
 */
export const getUserId = (req: Request): number | null => {
  return (req as any)?.user?.userId || null;
};