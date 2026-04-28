import { ethers } from "ethers";
import db from "../drizzle/db";
import {
  lands,
  landOwnershipHistory,
  users,
  blockchainEvents,
  transferRequests
} from "../drizzle/schema";
import { eq, and, isNull } from "drizzle-orm";
import LandRegistry from "./artifacts/LandRegistry.json";

/* ============================
   ENV
============================ */
const CONTRACT_ADDRESS = process.env.LAND_REGISTRY_ADDRESS!;
const RPC_URL = process.env.RPC_URL || "http://127.0.0.1:7545";

/* ============================
   CONNECTION
============================ */
let provider = new ethers.JsonRpcProvider(RPC_URL);

const contract = new ethers.Contract(
  CONTRACT_ADDRESS,
  LandRegistry.abi,
  provider
);

/* ============================
   CACHE
============================ */
const walletCache = new Map<string, number>();

const normalize = (addr: string) => addr.toLowerCase();

const getUserIdByWallet = async (wallet: string) => {
  const key = normalize(wallet);

  if (walletCache.has(key)) return walletCache.get(key)!;

  const user = await db.query.users.findFirst({
    where: eq(users.walletAddress, key),
  });

  if (user?.id) {
    walletCache.set(key, user.id);
    return user.id;
  }

  return null;
};

/* ============================
   EVENT SAFETY
============================ */
const isProcessed = async (txHash: string, logIndex: number) => {
  const e = await db.query.blockchainEvents.findFirst({
    where: and(
      eq(blockchainEvents.txHash, txHash),
      eq(blockchainEvents.logIndex, logIndex)
    ),
  });
  return !!e?.processed;
};

const saveEvent = async (data: {
  eventName: string;
  txHash: string;
  logIndex: number;
  blockNumber?: number;
  payload: any;
}) => {
  const exists = await db.query.blockchainEvents.findFirst({
    where: and(
      eq(blockchainEvents.txHash, data.txHash),
      eq(blockchainEvents.logIndex, data.logIndex)
    ),
  });

  if (exists) return;

  await db.insert(blockchainEvents).values({
    eventName: data.eventName,
    txHash: data.txHash,
    logIndex: data.logIndex,
    blockNumber: data.blockNumber,
    payload: data.payload,
    processed: false,
  });
};

/* ============================
   OWNERSHIP EVENT
============================ */
const handleOwnershipTransferred = async (
  landId: bigint,
  from: string,
  to: string,
  mpesaRef: string,
  event: any
) => {
  try {
    const txHash = event.log.transactionHash;
    const logIndex = event.log.index;

    if (await isProcessed(txHash, logIndex)) return;

    const onChainId = Number(landId);

    const land = await db.query.lands.findFirst({
      where: eq(lands.onChainId, onChainId),
    });

    if (!land) {
      console.error("Land not found:", onChainId);
      return;
    }

    await saveEvent({
      eventName: "OwnershipTransferred",
      txHash,
      logIndex,
      blockNumber: event.log.blockNumber,
      payload: { landId: onChainId, from, to, mpesaRef },
    });

    const fromOwnerId = await getUserIdByWallet(from);
    const toOwnerId = await getUserIdByWallet(to);

    const transfer = await db.query.transferRequests.findFirst({
      where: eq(transferRequests.mpesaReceiptCode, mpesaRef),
    });

    await db.transaction(async (tx) => {

      await tx.update(lands)
        .set({
          ownerId: toOwnerId ?? undefined,
          currentOwnerWallet: normalize(to),
          blockchainTxHash: txHash,
          isForSale: false,
          updatedAt: new Date(),
        })
        .where(eq(lands.id, land.id));

      await tx.update(landOwnershipHistory)
        .set({ toDate: new Date() })
        .where(and(
          eq(landOwnershipHistory.landId, land.id),
          isNull(landOwnershipHistory.toDate)
        ));

      await tx.insert(landOwnershipHistory).values({
        landId: land.id,
        fromOwnerId: fromOwnerId ?? null,
        toOwnerId: toOwnerId ?? null,
        fromWallet: normalize(from),
        toWallet: normalize(to),
        mpesaRef,
        blockchainTxHash: txHash,
        fromDate: new Date(),
      });

      if (transfer) {
        await tx.update(transferRequests)
          .set({
            status: "completed",
            blockchainTxHash: txHash,
            blockchainStatus: "confirmed",
          })
          .where(eq(transferRequests.id, transfer.id));
      }

      await tx.update(blockchainEvents)
        .set({ processed: true })
        .where(and(
          eq(blockchainEvents.txHash, txHash),
          eq(blockchainEvents.logIndex, logIndex)
        ));
    });

    console.log(`Ownership synced (Land ${onChainId})`);
  } catch (err) {
    console.error("Ownership sync failed:", err);
  }
};

/* ============================
   LAND REGISTER EVENT
============================ */
const handleLandRegistered = async (
  landId: bigint,
  lrNumber: string,
  owner: string,
  ipfsHash: string,
  event: any
) => {
  try {
    const txHash = event.log.transactionHash;
    const logIndex = event.log.index;

    if (await isProcessed(txHash, logIndex)) return;

    await saveEvent({
      eventName: "LandRegistered",
      txHash,
      logIndex,
      blockNumber: event.log.blockNumber,
      payload: { landId: Number(landId), lrNumber, owner, ipfsHash },
    });

    const ownerId = await getUserIdByWallet(owner);

    await db.transaction(async (tx) => {
      await tx.update(lands)
        .set({
          onChainId: Number(landId),
          verificationStatus: "verified",
          ipfsDocHash: ipfsHash,
          ownerId: ownerId ?? undefined,
        })
        .where(eq(lands.lrNumber, lrNumber));

      await tx.update(blockchainEvents)
        .set({ processed: true })
        .where(and(
          eq(blockchainEvents.txHash, txHash),
          eq(blockchainEvents.logIndex, logIndex)
        ));
    });

    console.log("Land registered synced");
  } catch (err) {
    console.error("Land sync failed:", err);
  }
};

/* ============================
   RECONNECT LOGIC
============================ */
const reconnect = () => {
  console.log("Reconnecting provider...");

  provider = new ethers.JsonRpcProvider(RPC_URL);

  contract.removeAllListeners();

  contract.connect(provider);

  attachListeners();
};

/* ============================
   ATTACH LISTENERS
============================ */
const attachListeners = () => {
  contract.on("OwnershipTransferred", handleOwnershipTransferred);
  contract.on("LandRegistered", handleLandRegistered);

  provider.on("error", reconnect);
};

/* ============================
   START LISTENER
============================ */
export const startBlockchainListener = () => {
  contract.removeAllListeners();
  attachListeners();

  console.log("Blockchain listener started");
};

/* ============================
   GRACEFUL SHUTDOWN
============================ */
process.on("SIGINT", () => {
  console.log("Shutting down listener...");
  contract.removeAllListeners();
  process.exit(0);
});