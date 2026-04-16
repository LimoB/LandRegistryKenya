import db from "../drizzle/db";
import { idempotencyKeys } from "../drizzle/schema";
import { eq } from "drizzle-orm";

export type IdempotencySource = "stripe" | "blockchain" | "mpesa" | "api";

interface IdempotencyInput {
  key: string;
  requestHash: string;
}

/* ============================================================
   CHECK EXISTING REQUEST (READ-ONLY)
============================================================ */
export const checkIdempotency = async ({
  key,
  requestHash
}: IdempotencyInput) => {
  const existing = await db.query.idempotencyKeys.findFirst({
    where: eq(idempotencyKeys.key, key)
  });

  if (!existing) {
    return { exists: false };
  }

  // Same request → safe retry
  if (existing.requestHash === requestHash) {
    return {
      exists: true,
      isSameRequest: true,
      requestHash: existing.requestHash
    };
  }

  // Same key, different request → reject hard
  throw new Error(
    "Idempotency key reuse with different request detected"
  );
};

/* ============================================================
   OPTIONAL: MARK COMPLETE (future-ready)
============================================================ */
export const markIdempotencyComplete = async (
  key: string,
  metadata?: Record<string, any>
) => {
  await db
    .update(idempotencyKeys)
    .set({
      // You can later extend schema with:
      // status: "completed",
      // response: metadata
    })
    .where(eq(idempotencyKeys.key, key));
};