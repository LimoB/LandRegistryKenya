import { ethers } from "ethers";
import { officerWallet } from "./provider";
import dotenv from "dotenv";
import LandRegistryArtifact from "./artifacts/LandRegistry.json";
import db from "../drizzle/db";
import { idempotencyKeys } from "../drizzle/schema";
import { eq } from "drizzle-orm";

dotenv.config();

const CONTRACT_ADDRESS = process.env.LAND_REGISTRY_ADDRESS;

if (!CONTRACT_ADDRESS) {
  throw new Error("LAND_REGISTRY_ADDRESS is missing in .env");
}

/* ============================================================
   CONTRACT INSTANCE
============================================================ */
export const landRegistryContract = new ethers.Contract(
  CONTRACT_ADDRESS,
  LandRegistryArtifact.abi,
  officerWallet
);

/* ============================================================
   IDEMPOTENCY HELPERS
============================================================ */
const checkIdempotency = async (key: string) => {
  return await db.query.idempotencyKeys.findFirst({
    where: eq(idempotencyKeys.key, key)
  });
};

const saveIdempotency = async (key: string, source: string, txHash: string) => {
  await db.insert(idempotencyKeys).values({
    key,
    source,
    requestHash: txHash
  });
};

/* ============================================================
   1. REGISTER LAND ON CHAIN
============================================================ */
export const registerLandOnChain = async (
  ownerWallet: string,
  lrNumber: string,
  ipfsHash: string
) => {
  const idempotencyKey = `register:${lrNumber}`;
  const existing = await checkIdempotency(idempotencyKey);
  
  if (existing) {
    console.log(`[Blockchain] Returning existing TX for LR: ${lrNumber}`);
    return { hash: existing.requestHash, reused: true };
  }

  try {
    console.log(`\x1b[34m[Blockchain] Registering Land: ${lrNumber}\x1b[0m`);

    // Call smart contract: function registerInitialLand(address, string, string)
    const tx = await landRegistryContract.registerInitialLand(
      ownerWallet,
      lrNumber,
      ipfsHash
    );

    const receipt = await tx.wait();
    await saveIdempotency(idempotencyKey, "blockchain", receipt.hash);

    return {
      hash: receipt.hash,
      blockNumber: receipt.blockNumber,
      status: receipt.status
    };
  } catch (error: any) {
    console.error(`\x1b[31m[Blockchain Error]\x1b[0m`, error.reason || error.message);
    throw new Error(`On-chain registration failed: ${error.reason || "Unknown Error"}`);
  }
};

/* ============================================================
   2. TRANSFER LAND OWNERSHIP ON CHAIN
============================================================ */
export const transferLandOnChain = async (
  onChainId: number,
  newOwnerWallet: string,
  paymentRef: string
) => {
  // Key incorporates onChainId and newOwner to prevent duplicate transfer attempts
  const idempotencyKey = `transfer:${onChainId}:${newOwnerWallet}`;
  const existing = await checkIdempotency(idempotencyKey);

  if (existing) {
    console.log(`[Blockchain] Transfer already exists for Land ID: ${onChainId}`);
    return { hash: existing.requestHash, reused: true };
  }

  try {
    console.log(`\x1b[35m[Blockchain] Executing Transfer for Land ID: ${onChainId}\x1b[0m`);

    /**
     * Call smart contract: function transferOwnership(uint256, address, string)
     * We convert onChainId to BigInt to satisfy Solidity uint256 requirements
     */
    const tx = await landRegistryContract.transferOwnership(
      BigInt(onChainId),
      newOwnerWallet,
      paymentRef // This is either the Stripe PI or M-Pesa Code
    );

    const receipt = await tx.wait();
    
    if (receipt.status === 0) throw new Error("Transaction reverted on-chain");

    await saveIdempotency(idempotencyKey, "blockchain", receipt.hash);

    return {
      hash: receipt.hash,
      blockNumber: receipt.blockNumber,
      status: receipt.status
    };
  } catch (error: any) {
    console.error(`\x1b[31m[Blockchain Transfer Error]\x1b[0m`, error.reason || error.message);
    throw new Error(`On-chain transfer failed: ${error.reason || "Check wallet balance/permissions"}`);
  }
};