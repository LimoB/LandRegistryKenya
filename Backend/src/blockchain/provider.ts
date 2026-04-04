import { ethers } from "ethers";
import * as dotenv from "dotenv";
import path from "path";

// 1. Force override to ensure we use the NEW key immediately
dotenv.config({ 
  path: path.resolve(__dirname, "../../.env"),
  override: true 
});

const RPC_URL = process.env.BLOCKCHAIN_RPC_URL || "http://127.0.0.1:7545";
const PRIVATE_KEY = process.env.OFFICER_PRIVATE_KEY;

if (!PRIVATE_KEY) {
  throw new Error("❌ CRITICAL: OFFICER_PRIVATE_KEY is missing from .env");
}

// 2. Initialize Provider
export const provider = new ethers.JsonRpcProvider(RPC_URL);

// 3. Initialize Officer Wallet (Signer)
export const officerWallet = new ethers.Wallet(PRIVATE_KEY.trim(), provider);

console.log("\n--- 🛡️  Land Ledger Registry: Blockchain Initialized ---");
console.log(`📡 Network: ${RPC_URL}`);
console.log(`👤 Officer Address: ${officerWallet.address}`);
console.log(`🔑 Key Loaded: ${PRIVATE_KEY.substring(0, 6)}...${PRIVATE_KEY.substring(PRIVATE_KEY.length - 4)}`);
console.log("------------------------------------------------------\n");