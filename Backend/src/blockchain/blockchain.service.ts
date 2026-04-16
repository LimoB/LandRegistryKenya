import { ethers } from "ethers";
import db from "../drizzle/db";
import {
  lands,
  landOwnershipHistory,
  blockchainEvents,
  idempotencyKeys,
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
export const provider = new ethers.JsonRpcProvider(RPC_URL);

export const contract = new ethers.Contract(
  CONTRACT_ADDRESS,
  LandRegistry.abi,
  provider
);

/* ============================================================
   WALLET RESOLVER (cached)
============================================================ */
const walletCache = new Map<string, number>();

export const resolveUserIdByWallet = async (
  wallet: string
): Promise<number | null> => {
  if (walletCache.has(wallet)) {
    return walletCache.get(wallet)!;
  }

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
   IDEMPOTENCY CHECK
============================================================ */
export const isDuplicateEvent = async (txHash: string) => {
  const existing = await db.query.blockchainEvents.findFirst({
    where: eq(blockchainEvents.txHash, txHash),
  });

  return !!existing;
};

/* ============================================================
   SAVE BLOCKCHAIN EVENT (GENERIC)
============================================================ */
export const saveBlockchainEvent = async (params: {
  eventName: string;
  txHash: string;
  blockNumber?: number;
  payload: any;
}) => {
  const duplicate = await isDuplicateEvent(params.txHash);
  if (duplicate) return;

  await db.insert(blockchainEvents).values({
    eventName: params.eventName,
    txHash: params.txHash,
    blockNumber: params.blockNumber,
    payload: params.payload,
    processed: false,
  });
};

/* ============================================================
   REGISTER LAND ON CHAIN (CALLED FROM LAND SERVICE)
============================================================ */
export const registerLandOnChainService = async (
  ownerWallet: string,
  lrNumber: string,
  ipfsHash: string
) => {
  const signer = provider.getSigner();

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
   TRANSFER LAND ON CHAIN (CALLED FROM TRANSFER SERVICE)
============================================================ */
export const transferLandOnChainService = async (
  landOnChainId: number,
  toWallet: string,
  reference: string
) => {
  const signer = provider.getSigner();

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
   HANDLE LAND REGISTERED EVENT
============================================================ */
export const handleLandRegisteredEvent = async (
  landId: bigint,
  lrNumber: string,
  ownerWallet: string,
  ipfsHash: string,
  txHash: string
) => {
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

  const ownerId = await resolveUserIdByWallet(ownerWallet);

  await db
    .update(lands)
    .set({
      onChainId: Number(landId),
      verificationStatus: "verified",
      ipfsDocHash: ipfsHash,
      ownerId: ownerId ?? undefined,
    })
    .where(eq(lands.lrNumber, lrNumber));
};

/* ============================================================
   HANDLE OWNERSHIP TRANSFER EVENT
============================================================ */
export const handleOwnershipTransferredEvent = async (
  landId: bigint,
  fromWallet: string,
  toWallet: string,
  mpesaRef: string,
  txHash: string
) => {
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

  const fromOwnerId = await resolveUserIdByWallet(fromWallet);
  const toOwnerId = await resolveUserIdByWallet(toWallet);

  await db.transaction(async (trx) => {
    /* ============================
       UPDATE LAND OWNER
    ============================ */
    await trx
      .update(lands)
      .set({
        ownerId: toOwnerId ?? undefined,
        updatedAt: new Date(),
      })
      .where(eq(lands.onChainId, Number(landId)));

    /* ============================
       CLOSE PREVIOUS OWNERSHIP
    ============================ */
    await trx
      .update(landOwnershipHistory)
      .set({
        toDate: new Date(),
      })
      .where(eq(landOwnershipHistory.landId, Number(landId)));

    /* ============================
       INSERT NEW OWNERSHIP RECORD
    ============================ */
    await trx.insert(landOwnershipHistory).values({
      landId: Number(landId),
      fromOwnerId: fromOwnerId ?? null,
      toOwnerId: toOwnerId ?? null,
      fromWallet,
      toWallet,
      mpesaRef,
      blockchainTxHash: txHash,
    });
  });
};

/* ============================================================
   START EVENT LISTENERS
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