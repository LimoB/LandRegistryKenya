import db from "../drizzle/db";
import {
  lands,
  landOwnershipHistory,
  blockchainEvents,
  users,
} from "../drizzle/schema";
import { eq } from "drizzle-orm";
import LandRegistry from "./artifacts/LandRegistry.json";

/* ============================================================
   ENV SETUP
============================================================ */
const CONTRACT_ADDRESS = process.env.LAND_REGISTRY_ADDRESS;
const RPC_URL = process.env.RPC_URL || "http://127.0.0.1:7545";

if (!CONTRACT_ADDRESS) {
  throw new Error("LAND_REGISTRY_ADDRESS missing in .env");
}

/* ============================================================
   PROVIDER + CONTRACT
============================================================ */
import { ethers } from "ethers";

export const provider = new ethers.JsonRpcProvider(RPC_URL);

export const contract = new ethers.Contract(
  CONTRACT_ADDRESS,
  LandRegistry.abi,
  provider
);

/* ============================================================
   WALLET CACHE
============================================================ */
const walletCache = new Map<string, number>();

export const resolveUserIdByWallet = async (
  wallet: string
): Promise<number | null> => {
  if (walletCache.has(wallet)) return walletCache.get(wallet)!;

  const user = await db.query.users.findFirst({
    where: eq(users.walletAddress, wallet),
  });

  if (user?.id) {
    walletCache.set(wallet, user.id);
    return user.id;
  }

  return null;
};

/* ============================================================
   BLOCKCHAIN EVENT CHECK
============================================================ */
const isProcessed = async (txHash: string) => {
  const event = await db.query.blockchainEvents.findFirst({
    where: eq(blockchainEvents.txHash, txHash),
  });

  return !!event?.processed;
};

/* ============================================================
   SAVE OR UPDATE EVENT (IDEMPOTENT + RETRY SAFE)
============================================================ */
export const saveBlockchainEvent = async (params: {
  eventName: string;
  txHash: string;
  blockNumber?: number;
  payload: any;
}) => {
  const existing = await db.query.blockchainEvents.findFirst({
    where: eq(blockchainEvents.txHash, params.txHash),
  });

  // already processed → fully skip
  if (existing?.processed) return;

  // exists but not processed → retry scenario
  if (existing && !existing.processed) return;

  await db.insert(blockchainEvents).values({
    eventName: params.eventName,
    txHash: params.txHash,
    blockNumber: params.blockNumber,
    payload: params.payload,
    processed: false,
  });
};

/* ============================================================
   REGISTER LAND ON CHAIN
============================================================ */
export const registerLandOnChainService = async (
  ownerWallet: string,
  lrNumber: string,
  ipfsHash: string
) => {
  const tx = await contract.registerLand(
    ownerWallet,
    lrNumber,
    ipfsHash
  );

  const receipt = await tx.wait();

  return {
    hash: receipt.hash,
    blockNumber: receipt.blockNumber,
  };
};

/* ============================================================
   TRANSFER LAND ON CHAIN
============================================================ */
export const transferLandOnChainService = async (
  landOnChainId: number,
  toWallet: string,
  reference: string
) => {
  const tx = await contract.transferOwnership(
    landOnChainId,
    toWallet,
    reference
  );

  const receipt = await tx.wait();

  return {
    hash: receipt.hash,
    blockNumber: receipt.blockNumber,
  };
};

/* ============================================================
   LAND REGISTERED EVENT
============================================================ */
export const handleLandRegisteredEvent = async (
  landId: bigint,
  lrNumber: string,
  ownerWallet: string,
  ipfsHash: string,
  txHash: string
) => {
  if (await isProcessed(txHash)) return;

  const ownerId = await resolveUserIdByWallet(ownerWallet);

  await db.transaction(async (trx) => {
    await saveBlockchainEvent({
      eventName: "LandRegistered",
      txHash,
      payload: {
        landId: Number(landId),
        lrNumber,
        ownerWallet,
        ipfsHash,
      },
    });

    await trx
      .update(lands)
      .set({
        onChainId: Number(landId),
        verificationStatus: "verified",
        ipfsDocHash: ipfsHash,
        ownerId: ownerId ?? undefined,
      })
      .where(eq(lands.lrNumber, lrNumber));

    await trx
      .update(blockchainEvents)
      .set({ processed: true })
      .where(eq(blockchainEvents.txHash, txHash));
  });
};

/* ============================================================
   OWNERSHIP TRANSFER EVENT
============================================================ */
export const handleOwnershipTransferredEvent = async (
  landId: bigint,
  fromWallet: string,
  toWallet: string,
  mpesaRef: string,
  txHash: string
) => {
  if (await isProcessed(txHash)) return;

  const fromOwnerId = await resolveUserIdByWallet(fromWallet);
  const toOwnerId = await resolveUserIdByWallet(toWallet);

  await db.transaction(async (trx) => {
    await saveBlockchainEvent({
      eventName: "OwnershipTransferred",
      txHash,
      payload: {
        landId: Number(landId),
        fromWallet,
        toWallet,
        mpesaRef,
      },
    });

    await trx
      .update(lands)
      .set({
        ownerId: toOwnerId ?? undefined,
        updatedAt: new Date(),
      })
      .where(eq(lands.onChainId, Number(landId)));

    await trx
      .update(landOwnershipHistory)
      .set({ toDate: new Date() })
      .where(eq(landOwnershipHistory.landId, Number(landId)));

    await trx.insert(landOwnershipHistory).values({
      landId: Number(landId),
      fromOwnerId: fromOwnerId ?? null,
      toOwnerId: toOwnerId ?? null,
      fromWallet,
      toWallet,
      mpesaRef,
      blockchainTxHash: txHash,
    });

    await trx
      .update(blockchainEvents)
      .set({ processed: true })
      .where(eq(blockchainEvents.txHash, txHash));
  });
};

/* ============================================================
   START LISTENERS
============================================================ */
export const startBlockchainService = () => {
  console.log("Blockchain service started");

  contract.on(
    "LandRegistered",
    async (landId, lrNumber, owner, ipfsHash, event) => {
      try {
        await handleLandRegisteredEvent(
          landId,
          lrNumber,
          owner,
          ipfsHash,
          event.log.transactionHash
        );
      } catch (err) {
        console.error("LandRegistered handler failed:", err);
      }
    }
  );

  contract.on(
    "OwnershipTransferred",
    async (landId, from, to, mpesaRef, event) => {
      try {
        await handleOwnershipTransferredEvent(
          landId,
          from,
          to,
          mpesaRef,
          event.log.transactionHash
        );
      } catch (err) {
        console.error("OwnershipTransferred handler failed:", err);
      }
    }
  );
};