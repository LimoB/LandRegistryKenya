import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import db from "../drizzle/db";
import { idempotencyKeys } from "../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Idempotency Middleware (PRODUCTION SAFE)
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
      //  SAME REQUEST → allow safe replay behavior
      if (existing.requestHash === requestHash) {
        return res.status(200).json({
          message: "Request already processed (idempotent)",
          idempotent: true
        });
      }

      //  DIFFERENT REQUEST USING SAME KEY
      return res.status(409).json({
        error: "Idempotency key conflict",
        message: "Same key used for different request"
      });
    }

    /* ============================================================
       STORE NEW IDEMPOTENCY ENTRY
    ============================================================ */
    await db.insert(idempotencyKeys).values({
      key: idempotencyKey,
      source: "api",
      requestHash
    });

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