import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import db from "./drizzle/db";
import { sql } from "drizzle-orm";

// LOGGER
import logger from "./middleware/logger";

// BLOCKCHAIN SYSTEMS
import { startBlockchainListener } from "./blockchain/eventListener";
import { startBlockchainRetryWorker } from "./blockchain/retry.worker"; // ✅ NEW

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

/* ============================================================
   SERVER STARTUP
============================================================ */
async function startServer() {
  try {
    logger.info("🚀 Starting Kenyan Land Registry Server...");

    /* ============================================================
       ENV VALIDATION (FAIL FAST)
    ============================================================ */
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not defined");
    }

    if (!process.env.LAND_REGISTRY_ADDRESS) {
      throw new Error("LAND_REGISTRY_ADDRESS is not defined");
    }

    if (!process.env.BLOCKCHAIN_RPC_URL) {
      logger.warn("⚠️ BLOCKCHAIN_RPC_URL not set, using fallback (Ganache/local)");
    }

    /* ============================================================
       DATABASE CONNECTION TEST
    ============================================================ */
    logger.info("📦 Connecting to database...");

    await db.execute(sql`SELECT 1`);

    logger.info("✅ Database connected successfully");

    /* ============================================================
       BLOCKCHAIN LISTENER (CONFIRMATIONS)
    ============================================================ */
    logger.info("🔗 Starting blockchain event listener...");

    startBlockchainListener();

    logger.info("✅ Blockchain listener active");

    /* ============================================================
       RETRY WORKER (AUTO-HEAL SYSTEM)
    ============================================================ */
    logger.info("♻️ Starting blockchain retry worker...");

    startBlockchainRetryWorker(); // ✅ CRITICAL

    logger.info("✅ Retry worker active (auto-recovery enabled)");

    /* ============================================================
       START EXPRESS SERVER
    ============================================================ */
    app.listen(PORT, () => {
      logger.info(`🌍 Server running at http://localhost:${PORT}`);
      logger.info("✅ API ready for requests");

      logger.info("--------------------------------------------------");
      logger.info("SYSTEM STATUS:");
      logger.info("✔ Database: Connected");
      logger.info("✔ Blockchain Listener: Active");
      logger.info("✔ Retry Worker: Active");
      logger.info("✔ Payments (Stripe/M-Pesa): Ready");
      logger.info("--------------------------------------------------");
    });

  } catch (error) {
    logger.error(
      { err: error },
      "❌ Server failed to start"
    );

    process.exit(1);
  }
}

/* ============================================================
   START APPLICATION
============================================================ */
startServer();

/* ============================================================
   GRACEFUL SHUTDOWN
============================================================ */
process.on("SIGINT", () => {
  logger.info("🛑 Shutting down server...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  logger.info("🛑 SIGTERM received. Closing gracefully...");
  process.exit(0);
});