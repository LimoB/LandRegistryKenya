import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import db from "./drizzle/db";
import { sql } from "drizzle-orm";

// 🔥 IMPORT BLOCKCHAIN LISTENER
import { startBlockchainListener } from "./blockchain/eventListener";

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

/* ============================================================
   SERVER STARTUP
============================================================ */
async function startServer() {
  try {
    console.log("🚀 Starting Kenyan Land Registry Server...");

    // -----------------------------
    // ENV CHECKS (fail fast)
    // -----------------------------
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not defined");
    }

    if (!process.env.BLOCKCHAIN_RPC_URL) {
      console.warn("⚠️ BLOCKCHAIN_RPC_URL not set, using default Ganache");
    }

    if (!process.env.LAND_REGISTRY_ADDRESS) {
      throw new Error("LAND_REGISTRY_ADDRESS is not defined");
    }

    // -----------------------------
    // DATABASE CONNECTION TEST
    // -----------------------------
    console.log("🔌 Connecting to database...");
    await db.execute(sql`SELECT 1`);
    console.log("Database connected successfully");

    // -----------------------------
    // START BLOCKCHAIN LISTENER
    // -----------------------------
    console.log("⛓️ Starting blockchain sync layer...");
    startBlockchainListener();
    console.log("Blockchain listener active");

    // -----------------------------
    // START EXPRESS SERVER
    // -----------------------------
    app.listen(PORT, () => {
      console.log(`🌍 Server running at http://localhost:${PORT}`);
      console.log("API ready for requests");
    });

  } catch (error) {
    console.error("Server failed to start:");
    console.error(error);
    process.exit(1);
  }
}

/* ============================================================
   START APPLICATION
============================================================ */
startServer();

/* ============================================================
   GRACEFUL SHUTDOWN (IMPORTANT FOR BLOCKCHAIN LISTENERS)
============================================================ */
process.on("SIGINT", () => {
  console.log("\n Shutting down server...");
  process.exit(0);
});