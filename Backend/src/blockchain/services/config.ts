import { ethers } from "ethers";

export const CONTRACT_ADDRESS = process.env.LAND_REGISTRY_ADDRESS;
export const RPC_URL = process.env.BLOCKCHAIN_RPC_URL || "http://127.0.0.1:7545";
export const PRIVATE_KEY = process.env.OFFICER_PRIVATE_KEY;

if (!CONTRACT_ADDRESS) {
  console.error("[CRITICAL] LAND_REGISTRY_ADDRESS missing in .env");
  throw new Error("LAND_REGISTRY_ADDRESS missing in .env");
}

export const provider = new ethers.JsonRpcProvider(RPC_URL);