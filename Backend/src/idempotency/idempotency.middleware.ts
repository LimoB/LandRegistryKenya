import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import db from "../drizzle/db";
import { idempotencyKeys } from "../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Idempotency Middleware
 * Prevents duplicate execution of POST/PUT requests
 */
export const idempotencyMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const idempotencyKey =
      req.headers["idempotency-key"] ||
      req.headers["x-idempotency-key"];

    if (!idempotencyKey || typeof idempotencyKey !== "string") {
      return res.status(400).json({
        error: "Missing idempotency key"
      });
    }

    // Create stable request hash
    const requestHash = crypto
      .createHash("sha256")
      .update(
        JSON.stringify({
          body: req.body,
          params: req.params,
          query: req.query,
          method: req.method,
          path: req.path
        })
      )
      .digest("hex");

    /* ============================================================
       CHECK EXISTING KEY
    ============================================================ */
    const existing = await db.query.idempotencyKeys.findFirst({
      where: eq(idempotencyKeys.key, idempotencyKey)
    });

    if (existing) {
      // Optional: validate request consistency
      if (existing.requestHash && existing.requestHash !== requestHash) {
        return res.status(409).json({
          error: "Idempotency key reuse with different request"
        });
      }

      return res.status(409).json({
        error: "Duplicate request detected",
        message: "This request was already processed"
      });
    }

    /* ============================================================
       INSERT LOCK (CRITICAL FIX)
    ============================================================ */
    await db.insert(idempotencyKeys).values({
      key: idempotencyKey,
      source: "api",
      requestHash
    });

    /* ============================================================
       ATTACH TO REQUEST
    ============================================================ */
    (req as any).idempotency = {
      key: idempotencyKey,
      requestHash
    };

    next();
  } catch (error) {
    console.error("Idempotency middleware error:", error);
    res.status(500).json({ error: "Idempotency check failed" });
  }
};