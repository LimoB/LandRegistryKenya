import { ethers } from "ethers";

export const CONTRACT_ADDRESS = process.env.LAND_REGISTRY_ADDRESS;
export const RPC_URL =
  process.env.BLOCKCHAIN_RPC_URL || "http://127.0.0.1:7545";

export const PRIVATE_KEY = process.env.SYSTEM_PRIVATE_KEY;

if (!CONTRACT_ADDRESS) {
  console.error("[CRITICAL] LAND_REGISTRY_ADDRESS missing in .env");
  throw new Error("LAND_REGISTRY_ADDRESS missing in .env");
}

if (!PRIVATE_KEY) {
  console.error("[CRITICAL] SYSTEM_PRIVATE_KEY missing in .env");
  throw new Error("SYSTEM_PRIVATE_KEY missing in .env");
}

export const provider = new ethers.JsonRpcProvider(RPC_URL);

/* ============================================================
   SYSTEM WALLET (SIGNER)
============================================================ */
export const systemWallet = new ethers.Wallet(PRIVATE_KEY, provider);

console.log("[CONFIG] Blockchain connected");
console.log("[CONFIG] Contract:", CONTRACT_ADDRESS);
console.log("[CONFIG] RPC:", RPC_URL);
console.log("[CONFIG] System wallet:", systemWallet.address);