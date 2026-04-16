import { ethers } from "ethers";
import * as dotenv from "dotenv";
import path from "path";

/* ============================
   ENV LOAD (SAFE + CONSISTENT)
============================ */
dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
  override: true,
});

/* ============================
   CONFIG
============================ */
const RPC_URL = process.env.BLOCKCHAIN_RPC_URL || "http://127.0.0.1:7545";
const PRIVATE_KEY = process.env.OFFICER_PRIVATE_KEY;

/* ============================
   SAFETY CHECKS
============================ */
if (!RPC_URL) {
  throw new Error("❌ BLOCKCHAIN_RPC_URL is missing");
}

if (!PRIVATE_KEY) {
  throw new Error("❌ OFFICER_PRIVATE_KEY is missing from .env");
}

/* ============================
   PROVIDER
============================ */
export const provider = new ethers.JsonRpcProvider(RPC_URL);

/* ============================
   WALLET (SIGNER)
============================ */
export const officerWallet = new ethers.Wallet(
  PRIVATE_KEY.trim(),
  provider
);

/* ============================
   DEBUG LOGS (SAFE VERSION)
============================ */
console.log("\n--- 🏛️ Land Registry Blockchain Initialized ---");
console.log(`Network: ${RPC_URL}`);
console.log(`Officer Address: ${officerWallet.address}`);
console.log(`Private Key Loaded: ${PRIVATE_KEY.slice(0, 6)}...${PRIVATE_KEY.slice(-4)}`);
console.log("------------------------------------------------------\n");