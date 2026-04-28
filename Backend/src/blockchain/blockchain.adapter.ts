import { ethers } from "ethers";
import { systemWallet } from "./provider";
import dotenv from "dotenv";
import LandRegistryArtifact from "./artifacts/LandRegistry.json";
import db from "../drizzle/db";
import { idempotencyKeys } from "../drizzle/schema";
import { eq } from "drizzle-orm";

dotenv.config();

const CONTRACT_ADDRESS = process.env.LAND_REGISTRY_ADDRESS;

if (!CONTRACT_ADDRESS) {
  throw new Error("LAND_REGISTRY_ADDRESS missing in .env");
}

/* ============================================================
   CONTRACT INSTANCE (SYSTEM SIGNER)
============================================================ */
export const landRegistryContract = new ethers.Contract(
  CONTRACT_ADDRESS,
  LandRegistryArtifact.abi,
  systemWallet
);

/* ============================================================
   IDEMPOTENCY HELPERS
============================================================ */
const checkIdempotency = async (key: string) => {
  return await db.query.idempotencyKeys.findFirst({
    where: eq(idempotencyKeys.key, key),
  });
};

const createPendingIdempotency = async (key: string) => {
  console.log(`[Idempotency] Creating pending record: ${key}`);

  await db.insert(idempotencyKeys).values({
    key,
    source: "pending",
    requestHash: "PENDING",
  });
};

const updateIdempotencySuccess = async (key: string, txHash: string) => {
  console.log(`[Idempotency] Marking success: ${key} -> ${txHash}`);

  await db
    .update(idempotencyKeys)
    .set({
      source: "blockchain",
      requestHash: txHash,
    })
    .where(eq(idempotencyKeys.key, key));
};

const updateIdempotencyFailed = async (key: string) => {
  console.log(`[Idempotency] Marking failed: ${key}`);

  await db
    .update(idempotencyKeys)
    .set({
      source: "failed",
    })
    .where(eq(idempotencyKeys.key, key));
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
    console.log(`[Blockchain] Reusing existing registration for ${lrNumber}`);
    return { hash: existing.requestHash, reused: true };
  }

  try {
    console.log(`[Blockchain] Starting registration for ${lrNumber}`);

    // Step 1: Reserve idempotency
    await createPendingIdempotency(idempotencyKey);

    // Step 2: Send transaction
    const tx = await landRegistryContract.registerLand(
      ownerWallet,
      lrNumber,
      ipfsHash
    );

    console.log(`[Blockchain] TX sent: ${tx.hash}`);

    // Save tx hash immediately (crash-safe)
    await updateIdempotencySuccess(idempotencyKey, tx.hash);

    // Step 3: Wait for confirmation
    const receipt = await tx.wait();

    console.log(`[Blockchain] TX mined: ${receipt.hash}`);

    if (receipt.status === 0) {
      throw new Error("Transaction reverted");
    }

    return {
      hash: receipt.hash,
      blockNumber: receipt.blockNumber,
      status: receipt.status,
    };
  } catch (error: any) {
    console.error("[Blockchain Register Error]", error.reason || error.message);

    await updateIdempotencyFailed(idempotencyKey);

    throw new Error(error.reason || "On-chain registration failed");
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
  const idempotencyKey = `transfer:${onChainId}:${paymentRef}`;

  const existing = await checkIdempotency(idempotencyKey);

  if (existing) {
    console.log(`[Blockchain] Transfer already handled for ${onChainId}`);
    return { hash: existing.requestHash, reused: true };
  }

  try {
    console.log(`[Blockchain] Starting transfer for Land ID ${onChainId}`);
    console.log(`[Blockchain] Payment Ref: ${paymentRef}`);

    // Step 1: Reserve idempotency BEFORE execution
    await createPendingIdempotency(idempotencyKey);

    // Step 2: Send transaction
    const tx = await landRegistryContract.transferOwnership(
      BigInt(onChainId),
      newOwnerWallet,
      paymentRef
    );

    console.log(`[Blockchain] TX sent: ${tx.hash}`);

    // Step 3: Save tx hash immediately (critical)
    await updateIdempotencySuccess(idempotencyKey, tx.hash);

    // Step 4: Wait for confirmation
    const receipt = await tx.wait();

    console.log(`[Blockchain] TX mined: ${receipt.hash}`);

    if (receipt.status === 0) {
      throw new Error("Transaction reverted on-chain");
    }

    console.log(`[Blockchain] Transfer confirmed for Land ID ${onChainId}`);

    return {
      hash: receipt.hash,
      blockNumber: receipt.blockNumber,
      status: receipt.status,
    };
  } catch (error: any) {
    console.error("[Blockchain Transfer Error]", error.reason || error.message);

    await updateIdempotencyFailed(idempotencyKey);

    throw new Error(
      error.reason ||
      "On-chain transfer failed (check system wallet, gas, permissions)"
    );
  }
};