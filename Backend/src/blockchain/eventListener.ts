import { ethers } from "ethers";
import db from "../drizzle/db";
import {
  lands,
  landOwnershipHistory,
  users,
  blockchainEvents,
} from "../drizzle/schema";
import { eq } from "drizzle-orm";
import LandRegistry from "./artifacts/LandRegistry.json";

/* ============================
   ENV SAFETY
============================ */
const CONTRACT_ADDRESS = process.env.LAND_REGISTRY_ADDRESS;
const RPC_URL = process.env.RPC_URL || "http://127.0.0.1:7545";

if (!CONTRACT_ADDRESS) {
  throw new Error("LAND_REGISTRY_ADDRESS missing in .env");
}

/* ============================
   BLOCKCHAIN CONNECTION
============================ */
const provider = new ethers.JsonRpcProvider(RPC_URL);

const contract = new ethers.Contract(
  CONTRACT_ADDRESS,
  LandRegistry.abi,
  provider
);

/* ============================
   WALLET CACHE
============================ */
const walletCache = new Map<string, number>();

const getUserIdByWallet = async (wallet: string) => {
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

/* ============================
   EVENT DUPLICATE CHECK
============================ */
const isProcessed = async (txHash: string) => {
  const event = await db.query.blockchainEvents.findFirst({
    where: eq(blockchainEvents.txHash, txHash),
  });

  return !!event?.processed;
};

/* ============================
   SAVE EVENT SAFELY
============================ */
const saveEvent = async (data: {
  eventName: string;
  txHash: string;
  blockNumber?: number;
  payload: any;
}) => {
  const existing = await db.query.blockchainEvents.findFirst({
    where: eq(blockchainEvents.txHash, data.txHash),
  });

  if (existing) return;

  await db.insert(blockchainEvents).values({
    eventName: data.eventName,
    txHash: data.txHash,
    blockNumber: data.blockNumber,
    payload: data.payload,
    processed: false,
  });
};

/* ============================
   LAND REGISTERED EVENT
============================ */
contract.on(
  "LandRegistered",
  async (landId: bigint, lrNumber: string, owner: string, ipfsHash: string, event) => {
    try {
      const txHash = event.log.transactionHash;

      if (await isProcessed(txHash)) return;

      await saveEvent({
        eventName: "LandRegistered",
        txHash,
        blockNumber: event.log.blockNumber,
        payload: {
          landId: Number(landId),
          lrNumber,
          owner,
          ipfsHash,
        },
      });

      const ownerId = await getUserIdByWallet(owner);

      await db
        .update(lands)
        .set({
          onChainId: Number(landId),
          verificationStatus: "verified",
          ipfsDocHash: ipfsHash,
          ownerId: ownerId ?? undefined,
        })
        .where(eq(lands.lrNumber, lrNumber));

      await db
        .update(blockchainEvents)
        .set({ processed: true })
        .where(eq(blockchainEvents.txHash, txHash));

      console.log("Land event processed");
    } catch (err) {
      console.error("LandRegistered sync failed:", err);
    }
  }
);

/* ============================
   OWNERSHIP TRANSFERRED EVENT
============================ */
contract.on(
  "OwnershipTransferred",
  async (landId: bigint, from: string, to: string, mpesaRef: string, event) => {
    try {
      const txHash = event.log.transactionHash;

      if (await isProcessed(txHash)) return;

      const onChainId = Number(landId);

      const land = await db.query.lands.findFirst({
        where: eq(lands.onChainId, onChainId),
      });

      if (!land) {
        console.error("Land not found for onChainId:", onChainId);
        return;
      }

      await saveEvent({
        eventName: "OwnershipTransferred",
        txHash,
        blockNumber: event.log.blockNumber,
        payload: {
          landId: onChainId,
          from,
          to,
          mpesaRef,
        },
      });

      const fromOwnerId = await getUserIdByWallet(from);
      const toOwnerId = await getUserIdByWallet(to);

      /* ============================
         UPDATE LAND OWNER
      ============================ */
      await db
        .update(lands)
        .set({
          ownerId: toOwnerId ?? undefined,
          updatedAt: new Date(),
        })
        .where(eq(lands.id, land.id));

      /* ============================
         CLOSE PREVIOUS OWNERSHIP
      ============================ */
      await db
        .update(landOwnershipHistory)
        .set({
          toDate: new Date(),
        })
        .where(eq(landOwnershipHistory.landId, land.id));

      /* ============================
         INSERT NEW OWNERSHIP RECORD
      ============================ */
      await db.insert(landOwnershipHistory).values({
        landId: land.id,
        fromOwnerId: fromOwnerId ?? null,
        toOwnerId: toOwnerId ?? null,
        fromWallet: from,
        toWallet: to,
        mpesaRef,
        blockchainTxHash: txHash,
        fromDate: new Date(),
      });

      await db
        .update(blockchainEvents)
        .set({ processed: true })
        .where(eq(blockchainEvents.txHash, txHash));

      console.log("Ownership event processed");
    } catch (err) {
      console.error("Ownership sync failed:", err);
    }
  }
);

/* ============================
   START LISTENER
============================ */
export const startBlockchainListener = () => {
  console.log("Blockchain listener initialized");

  contract.removeAllListeners(); // prevents duplicate listeners on restart
};