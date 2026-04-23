import db from "../../drizzle/db";
import { lands, landOwnershipHistory, blockchainEvents } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { resolveUserIdByWallet, contract } from "./utils";

export const handleLandRegisteredEvent = async (
  landId: bigint,
  lrNumber: string,
  ownerWallet: string,
  ipfsHash: string,
  txHash: string
) => {
  console.log(`[EVENT] Syncing LandRegistered: ${lrNumber}`);
  
  const existing = await db.query.blockchainEvents.findFirst({
    where: eq(blockchainEvents.txHash, txHash),
  });
  if (existing?.processed) return;

  const ownerId = await resolveUserIdByWallet(ownerWallet);

  await db.transaction(async (trx) => {
    await trx.insert(blockchainEvents).values({
      eventName: "LandRegistered",
      txHash,
      payload: { landId: Number(landId), lrNumber, ownerWallet, ipfsHash },
      processed: true
    });

    await trx.update(lands)
      .set({
        onChainId: Number(landId),
        verificationStatus: "verified",
        blockchainTxHash: txHash,
        ownerId: ownerId ?? undefined,
      })
      .where(eq(lands.lrNumber, lrNumber));
  });
};

export const handleOwnershipTransferredEvent = async (
  landId: bigint,
  from: string,
  to: string,
  mpesaRef: string,
  txHash: string
) => {
  console.log(`[EVENT] Syncing Transfer for Land ID: ${landId}`);

  const fromOwnerId = await resolveUserIdByWallet(from);
  const toOwnerId = await resolveUserIdByWallet(to);

  await db.transaction(async (trx) => {
    await trx.insert(blockchainEvents).values({
      eventName: "OwnershipTransferred",
      txHash,
      payload: { landId: Number(landId), from, to, mpesaRef },
      processed: true
    });

    await trx.update(lands)
      .set({ ownerId: toOwnerId ?? undefined })
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
};

/**
 * START LISTENERS
 */
export const startBlockchainService = () => {
  console.log("[BC-SYSTEM] Blockchain event listeners active...");

  contract.on("LandRegistered", async (landId, lrNumber, owner, ipfsHash, event) => {
    try {
      await handleLandRegisteredEvent(landId, lrNumber, owner, ipfsHash, event.log.transactionHash);
    } catch (err) {
      console.error("[LISTENER ERROR] LandRegistered Sync failed:", err);
    }
  });

  contract.on("OwnershipTransferred", async (landId, from, to, mpesaRef, event) => {
    try {
      await handleOwnershipTransferredEvent(landId, from, to, mpesaRef, event.log.transactionHash);
    } catch (err) {
      console.error("[LISTENER ERROR] OwnershipTransferred Sync failed:", err);
    }
  });
};