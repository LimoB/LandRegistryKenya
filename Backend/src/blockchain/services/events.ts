import db from "../../drizzle/db";
import {
  lands,
  landOwnershipHistory,
  blockchainEvents,
} from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { resolveUserIdByWallet, contract } from "./utils";

/* ============================================================
   LAND REGISTERED EVENT
============================================================ */
export const handleLandRegisteredEvent = async (
  landId: bigint,
  lrNumber: string,
  ownerWallet: string,
  ipfsHash: string,
  txHash: string,
  logIndex: number
) => {
  console.log(`[EVENT] LandRegistered received: ${lrNumber} | TX: ${txHash} | LOG: ${logIndex}`);

  try {
    const existing = await db.query.blockchainEvents.findFirst({
      where: and(
        eq(blockchainEvents.txHash, txHash),
        eq(blockchainEvents.logIndex, logIndex)
      ),
    });

    if (existing?.processed) {
      console.log("[EVENT] LandRegistered already processed, skipping");
      return;
    }

    const ownerId = await resolveUserIdByWallet(ownerWallet);

    await db.transaction(async (trx) => {
      await trx.insert(blockchainEvents).values({
        eventName: "LandRegistered",
        txHash,
        logIndex,
        payload: {
          landId: Number(landId),
          lrNumber,
          ownerWallet,
          ipfsHash,
        },
        processed: true,
      });

      await trx
        .update(lands)
        .set({
          onChainId: Number(landId),
          verificationStatus: "verified",
          blockchainTxHash: txHash,
          ownerId: ownerId ?? undefined,
        })
        .where(eq(lands.lrNumber, lrNumber));
    });

    console.log("[EVENT] LandRegistered processed successfully");
  } catch (err) {
    console.error("[EVENT ERROR] LandRegistered failed:", err);

    await db.insert(blockchainEvents).values({
      eventName: "LandRegistered",
      txHash,
      logIndex,
      payload: { landId: Number(landId), lrNumber },
      processed: false,
    });
  }
};

/* ============================================================
   OWNERSHIP TRANSFERRED EVENT
============================================================ */
export const handleOwnershipTransferredEvent = async (
  landId: bigint,
  from: string,
  to: string,
  mpesaRef: string,
  txHash: string,
  logIndex: number
) => {
  console.log(`[EVENT] OwnershipTransferred received: Land ${landId} | TX: ${txHash} | LOG: ${logIndex}`);

  try {
    const existing = await db.query.blockchainEvents.findFirst({
      where: and(
        eq(blockchainEvents.txHash, txHash),
        eq(blockchainEvents.logIndex, logIndex)
      ),
    });

    if (existing?.processed) {
      console.log("[EVENT] OwnershipTransferred already processed, skipping");
      return;
    }

    const fromOwnerId = await resolveUserIdByWallet(from);
    const toOwnerId = await resolveUserIdByWallet(to);

    await db.transaction(async (trx) => {
      await trx.insert(blockchainEvents).values({
        eventName: "OwnershipTransferred",
        txHash,
        logIndex,
        payload: {
          landId: Number(landId),
          from,
          to,
          mpesaRef,
        },
        processed: true,
      });

      await trx
        .update(lands)
        .set({
          ownerId: toOwnerId ?? undefined,
          blockchainTxHash: txHash,
        })
        .where(eq(lands.onChainId, Number(landId)));

      await trx.insert(landOwnershipHistory).values({
        landId: Number(landId),
        fromWallet: from,
        toWallet: to,
        fromOwnerId: fromOwnerId ?? undefined,
        toOwnerId: toOwnerId ?? undefined,
        mpesaRef,
        blockchainTxHash: txHash,
      });
    });

    console.log("[EVENT] OwnershipTransferred processed successfully");
  } catch (err) {
    console.error("[EVENT ERROR] OwnershipTransferred failed:", err);

    await db.insert(blockchainEvents).values({
      eventName: "OwnershipTransferred",
      txHash,
      logIndex,
      payload: { landId: Number(landId), from, to, mpesaRef },
      processed: false,
    });
  }
};

/* ============================================================
   LISTENER (SAFE SINGLETON)
============================================================ */
let started = false;

export const startBlockchainService = () => {
  if (started) {
    console.log("[BC-SYSTEM] Listener already started, skipping...");
    return;
  }

  started = true;

  console.log("[BC-SYSTEM] Starting blockchain listeners...");

  contract.removeAllListeners();

  contract.on(
    "LandRegistered",
    async (landId, lrNumber, owner, ipfsHash, event) => {
      try {
        await handleLandRegisteredEvent(
          landId,
          lrNumber,
          owner,
          ipfsHash,
          event.log.transactionHash,
          event.log.index
        );
      } catch (err) {
        console.error("[LISTENER ERROR] LandRegistered handler failed:", err);
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
          event.log.transactionHash,
          event.log.index
        );
      } catch (err) {
        console.error("[LISTENER ERROR] OwnershipTransferred handler failed:", err);
      }
    }
  );

  console.log("[BC-SYSTEM] Blockchain event listeners active");
};