import { ethers } from "ethers";
import { officerWallet } from "./provider";
import dotenv from "dotenv";
import LandRegistryArtifact from "./artifacts/LandRegistry.json";
import db from "../drizzle/db";
import { idempotencyKeys } from "../drizzle/schema";
import { eq } from "drizzle-orm";

dotenv.config();

/* ================================
   ENV SAFETY CHECK
================================ */
const CONTRACT_ADDRESS = process.env.LAND_REGISTRY_ADDRESS;

if (!CONTRACT_ADDRESS) {
  throw new Error("LAND_REGISTRY_ADDRESS is missing in .env");
}

/* ================================
   CONTRACT INSTANCE
================================ */
export const landRegistryContract = new ethers.Contract(
  CONTRACT_ADDRESS,
  LandRegistryArtifact.abi,
  officerWallet
);

/* ============================================================
   IDEMPOTENCY HELPERS
============================================================ */
const checkIdempotency = async (key: string) => {
  const existing = await db.query.idempotencyKeys.findFirst({
    where: eq(idempotencyKeys.key, key)
  });

  return existing;
};

const saveIdempotency = async (
  key: string,
  source: string,
  txHash: string
) => {
  await db.insert(idempotencyKeys).values({
    key,
    source,
    requestHash: txHash
  });
};

/* ================================
   REGISTER LAND ON CHAIN
================================ */
export const registerLandOnChain = async (
  ownerWallet: string,
  lrNumber: string,
  ipfsHash: string
) => {
  const idempotencyKey = `register:${lrNumber}`;

  const existing = await checkIdempotency(idempotencyKey);
  if (existing) {
    return {
      hash: existing.requestHash,
      reused: true
    };
  }

  try {
    console.log("Registering land on blockchain");
    console.log({ ownerWallet, lrNumber, ipfsHash });

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
    console.error("Blockchain registration failed:", error?.message || error);
    throw new Error("Blockchain registration failed");
  }
};

/* ================================
   TRANSFER LAND OWNERSHIP ON CHAIN
================================ */
export const transferLandOnChain = async (
  landId: number,
  newOwnerWallet: string,
  mpesaRef: string
) => {
  const idempotencyKey = `transfer:${landId}:${newOwnerWallet}`;

  const existing = await checkIdempotency(idempotencyKey);
  if (existing) {
    return {
      hash: existing.requestHash,
      reused: true
    };
  }

  try {
    console.log("Transferring land on blockchain");
    console.log({ landId, newOwnerWallet, mpesaRef });

    const tx = await landRegistryContract.transferOwnership(
      landId,
      newOwnerWallet,
      mpesaRef
    );

    const receipt = await tx.wait();

    await saveIdempotency(idempotencyKey, "blockchain", receipt.hash);

    return {
      hash: receipt.hash,
      blockNumber: receipt.blockNumber,
      status: receipt.status
    };
  } catch (error: any) {
    console.error("Blockchain transfer failed:", error?.message || error);
    throw new Error("Blockchain transfer failed");
  }
};