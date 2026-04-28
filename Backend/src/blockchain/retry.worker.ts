import db from "../drizzle/db";
import { transferRequests } from "../drizzle/schema";
import { eq, and, isNull } from "drizzle-orm";
import { transferLandOnChain } from "./blockchain.adapter";

const RETRY_INTERVAL = 15000; // 15s
const MAX_RETRIES = 5;

export const startBlockchainRetryWorker = () => {
  console.log("[RETRY-WORKER] 🚀 Started...");

  setInterval(async () => {
    try {
      console.log("[RETRY-WORKER] 🔍 Scanning...");

      const transfers = await db.query.transferRequests.findMany({
        where: eq(transferRequests.status, "paid"),
        with: {
          land: true,
          buyer: true,
        },
      });

      for (const t of transfers) {
        try {
          /* ================= SKIP ================= */
          if (
            t.status === "completed" ||
            t.blockchainStatus === "submitted" ||
            t.blockchainStatus === "confirmed"
          ) continue;

          if (!t.land?.onChainId) {
            console.log(`[SKIP ${t.id}] No onChainId`);
            continue;
          }

          if (!t.buyer?.walletAddress) {
            console.log(`[SKIP ${t.id}] No wallet`);
            continue;
          }

          if (!t.mpesaReceiptCode) {
            console.log(`[SKIP ${t.id}] No payment ref`);
            continue;
          }

          if ((t.retryCount || 0) >= MAX_RETRIES) {
            console.log(`[SKIP ${t.id}] Max retries reached`);
            continue;
          }

          console.log(`[RETRY ${t.id}] Attempt #${(t.retryCount || 0) + 1}`);

          /* ================= LOCK ================= */
          const locked = await db.update(transferRequests)
            .set({
              blockchainStatus: "processing",
              retryCount: (t.retryCount || 0) + 1,
              lastRetryAt: new Date(),
            })
            .where(and(
              eq(transferRequests.id, t.id),
              t.blockchainStatus
                ? eq(transferRequests.blockchainStatus, t.blockchainStatus)
                : isNull(transferRequests.blockchainStatus)
            ))
            .returning();

          if (!locked.length) {
            console.log(`[LOCKED ${t.id}] Skipped`);
            continue;
          }

          /* ================= BLOCKCHAIN ================= */
          let tx;

          try {
            tx = await transferLandOnChain(
              t.land.onChainId,
              t.buyer.walletAddress,
              t.mpesaReceiptCode
            );
          } catch (err) {
            console.error(`[FAIL ${t.id}] Blockchain error`, err);

            await db.update(transferRequests)
              .set({ blockchainStatus: "failed" })
              .where(eq(transferRequests.id, t.id));

            continue;
          }

          console.log(`[SUCCESS ${t.id}] TX: ${tx.hash}`);

          /* ================= UPDATE ================= */
          await db.update(transferRequests)
            .set({
              blockchainStatus: "submitted",
              blockchainTxHash: tx.hash,
            })
            .where(eq(transferRequests.id, t.id));

        } catch (innerErr) {
          console.error(`[WORKER ERROR ${t.id}]`, innerErr);
        }
      }

    } catch (err) {
      console.error("[WORKER CRASH]", err);
    }
  }, RETRY_INTERVAL);
};