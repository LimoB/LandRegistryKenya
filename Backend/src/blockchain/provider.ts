import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

const RPC_URL = process.env.BLOCKCHAIN_RPC_URL || "http://127.0.0.1:8545"; // Ganache/Hardhat default
const PRIVATE_KEY = process.env.OFFICER_PRIVATE_KEY || ""; // The Land Officer's wallet key

if (!PRIVATE_KEY) {
  console.warn("⚠️ Warning: OFFICER_PRIVATE_KEY is not set in .env");
}

// 1. Connection to the Network
export const provider = new ethers.JsonRpcProvider(RPC_URL);

// 2. The "Signer" (The Land Officer's identity on-chain)
export const officerWallet = new ethers.Wallet(PRIVATE_KEY, provider);

console.log("🔗 Blockchain Provider Initialized");