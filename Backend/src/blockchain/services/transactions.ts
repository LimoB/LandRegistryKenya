import { ethers } from "ethers";
import { getAuthorizedContract } from "./utils";
import db from "../../drizzle/db";
import { idempotencyKeys } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

/* ============================================================
   IDEMPOTENCY HELPERS
============================================================ */
const checkIdempotency = async (key: string) => {
  return await db.query.idempotencyKeys.findFirst({
    where: eq(idempotencyKeys.key, key),
  });
};

const createPending = async (key: string) => {
  console.log(`[IDEMPOTENCY] Creating pending: ${key}`);

  await db.insert(idempotencyKeys).values({
    key,
    source: "pending",
    requestHash: "PENDING",
  });
};

const markSuccess = async (key: string, txHash: string) => {
  console.log(`[IDEMPOTENCY] Success: ${key} -> ${txHash}`);

  await db
    .update(idempotencyKeys)
    .set({ source: "blockchain", requestHash: txHash })
    .where(eq(idempotencyKeys.key, key));
};

const markFailed = async (key: string) => {
  console.log(`[IDEMPOTENCY] Failed: ${key}`);

  await db
    .update(idempotencyKeys)
    .set({ source: "failed" })
    .where(eq(idempotencyKeys.key, key));
};

/* ============================================================
   REGISTER LAND
============================================================ */
export const registerLandOnChainService = async (
  ownerWallet: string,
  lrNumber: string,
  ipfsHash: string
) => {
  const key = `register:${lrNumber}`;

  const existing = await checkIdempotency(key);
  if (existing) {
    console.log(`[BC-SERVICE] Reusing existing registration for ${lrNumber}`);
    return { hash: existing.requestHash, reused: true };
  }

  try {
    console.log(`[BC-SERVICE] Preparing Mint for LR: ${lrNumber}`);

    if (!ownerWallet || !ethers.isAddress(ownerWallet)) {
      throw new Error(`INVALID_ADDRESS: ${ownerWallet}`);
    }

    if (!lrNumber || !ipfsHash) {
      throw new Error("INVALID_DATA: Missing LR or IPFS");
    }

    await createPending(key);

    const authContract = getAuthorizedContract();

    const tx = await authContract.registerLand(
      ownerWallet,
      lrNumber,
      ipfsHash
    );

    console.log(`[BC-SERVICE] TX sent: ${tx.hash}`);

    await markSuccess(key, tx.hash);

    const receipt = await tx.wait();

    console.log(`[BC-SERVICE] TX mined: ${receipt.hash}`);

    return {
      hash: receipt.hash,
      blockNumber: receipt.blockNumber,
    };
  } catch (error: any) {
    console.error("[BC-SERVICE ERROR] Register failed:", error.message);

    await markFailed(key);

    throw error;
  }
};

/* ============================================================
   TRANSFER LAND
============================================================ */
export const transferLandOnChainService = async (
  landOnChainId: number,
  toWallet: string,
  reference: string
) => {
  const key = `transfer:${landOnChainId}:${reference}`;

  const existing = await checkIdempotency(key);
  if (existing) {
    console.log(`[BC-SERVICE] Transfer already handled for ${landOnChainId}`);
    return { hash: existing.requestHash, reused: true };
  }

  try {
    console.log(`[BC-SERVICE] Starting transfer for Land ${landOnChainId}`);
    console.log(`[BC-SERVICE] Ref: ${reference}`);

    if (!ethers.isAddress(toWallet)) {
      throw new Error(`Invalid recipient address: ${toWallet}`);
    }

    await createPending(key);

    const authContract = getAuthorizedContract();

    const tx = await authContract.transferOwnership(
      BigInt(landOnChainId),
      toWallet,
      reference
    );

    console.log(`[BC-SERVICE] TX sent: ${tx.hash}`);

    await markSuccess(key, tx.hash);

    const receipt = await tx.wait();

    console.log(`[BC-SERVICE] TX mined: ${receipt.hash}`);

    return {
      hash: receipt.hash,
      blockNumber: receipt.blockNumber,
    };
  } catch (error: any) {
    console.error("[BC-SERVICE ERROR] Transfer failed:", error.message);

    await markFailed(key);

    throw error;
  }
};