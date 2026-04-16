import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import db from "./drizzle/db";
import { sql } from "drizzle-orm";

// IMPORT LOGGER
import logger from "./middleware/logger";

// IMPORT BLOCKCHAIN LISTENER
import { startBlockchainListener } from "./blockchain/eventListener";

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

/* ============================================================
   SERVER STARTUP
============================================================ */
async function startServer() {
  try {
    logger.info("Starting Kenyan Land Registry Server...");

    // -----------------------------
    // ENV CHECKS (fail fast)
    // -----------------------------
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not defined");
    }

    if (!process.env.BLOCKCHAIN_RPC_URL) {
      logger.warn(
        "BLOCKCHAIN_RPC_URL not set, using default Ganache"
      );
    }

    if (!process.env.LAND_REGISTRY_ADDRESS) {
      throw new Error("LAND_REGISTRY_ADDRESS is not defined");
    }

    // -----------------------------
    // DATABASE CONNECTION TEST
    // -----------------------------
    logger.info("Connecting to database...");

    await db.execute(sql`SELECT 1`);

    logger.info("Database connected successfully");

    // -----------------------------
    // START BLOCKCHAIN LISTENER
    // -----------------------------
    logger.info("Starting blockchain sync layer...");

    startBlockchainListener();

    logger.info("Blockchain listener active");

    // -----------------------------
    // START EXPRESS SERVER
    // -----------------------------
    app.listen(PORT, () => {
      logger.info(`Server running at http://localhost:${PORT}`);
      logger.info("API ready for requests");
    });

  } catch (error) {
    logger.error(
      {
        err: error,
      },
      "Server failed to start"
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
  logger.info("Shutting down server...");
  process.exit(0);
});