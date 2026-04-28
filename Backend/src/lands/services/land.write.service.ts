import { eq } from "drizzle-orm";
import db from "../../drizzle/db";
import { lands, landOwnershipHistory, auditLogs } from "../../drizzle/schema";
import { registerLandOnChain } from "../../blockchain/blockchain.adapter";

export type TLandInsert = typeof lands.$inferInsert;

export const createLandService = async (landData: TLandInsert, user: any) => {
  console.log("\n================ LAND REGISTRATION START ================\n");

  if (!landData.ownerId) throw new Error("Owner is required");
  if (!landData.lrNumber) throw new Error("LR Number is required");

  /* ============================================================
     CHECK DUPLICATE
  ============================================================ */
  const existing = await db.query.lands.findFirst({
    where: eq(lands.lrNumber, landData.lrNumber)
  });

  if (existing) {
    throw new Error("Land already exists");
  }

  return await db.transaction(async (trx) => {

    /* ---------------- DB INSERT ---------------- */
    const [newLand] = await trx.insert(lands).values({
      ...landData,
      verificationStatus: "pending",
      isForSale: false
    }).returning();

    console.log("[DB] Land created:", newLand.id);

    /* ============================================================
       BLOCKCHAIN CALL
    ============================================================ */
    let txResult;

    try {
      txResult = await registerLandOnChain(
        user.walletAddress,          // ✅ correct order
        newLand.lrNumber,
        newLand.ipfsDocHash || ""    // ✅ required param
      );

      console.log("[Blockchain] TX:", txResult);

    } catch (err: any) {
      console.error("[Blockchain ERROR]:", err.message);
      throw new Error("Blockchain registration failed");
    }

    /* ============================================================
       VALIDATE RESPONSE
    ============================================================ */
    if (!txResult?.hash) {
      throw new Error("Invalid blockchain response (no tx hash)");
    }

    /* ============================================================
       UPDATE DB WITH BLOCKCHAIN DATA
    ============================================================ */
    await trx.update(lands)
      .set({
        blockchainTxHash: txResult.hash,
        blockNumber: txResult.blockNumber ?? null,
        network: "ganache",
        updatedAt: new Date()
      })
      .where(eq(lands.id, newLand.id));

    console.log("[DB] Blockchain data saved");

    /* ============================================================
       OWNERSHIP HISTORY
    ============================================================ */
    await trx.insert(landOwnershipHistory).values({
      landId: newLand.id,
      toOwnerId: newLand.ownerId,
      toWallet: user.walletAddress,
      fromOwnerId: null,
      fromWallet: null,
      mpesaRef: "INITIAL_REGISTRATION"
    });

    /* ============================================================
       AUDIT LOG
    ============================================================ */
    await trx.insert(auditLogs).values({
      actionType: "LAND_CREATED_ON_CHAIN",
      performedBy: newLand.ownerId,
      landId: newLand.id,
      metadata: {
        lrNumber: newLand.lrNumber,
        txHash: txResult.hash
      }
    });

    console.log("\n================ LAND REGISTRATION COMPLETE ================\n");

    return {
      ...newLand,
      blockchainTxHash: txResult.hash
    };
  });
};

/**
 * Lists a verified land on the marketplace
 */
export const listLandForSaleService = async (userId: number, landId: number, priceInKsh: number) => {
  const land = await db.query.lands.findFirst({ where: eq(lands.id, landId) });

  if (!land) throw new Error("Land not found");
  if (land.ownerId !== userId) throw new Error("Unauthorized");
  if (land.verificationStatus !== "verified") throw new Error("Only verified lands can be listed");

  const [updated] = await db.update(lands)
    .set({ isForSale: true, priceInKsh: priceInKsh.toString(), updatedAt: new Date() })
    .where(eq(lands.id, landId))
    .returning();

  await db.insert(auditLogs).values({
    actionType: "LAND_LISTED_FOR_SALE",
    performedBy: userId,
    landId,
    metadata: { priceInKsh }
  });

  return updated;
};

/**
 * Removes a land from the marketplace
 */
export const removeLandFromSaleService = async (userId: number, landId: number) => {
  const land = await db.query.lands.findFirst({ where: eq(lands.id, landId) });
  if (!land || land.ownerId !== userId) throw new Error("Unauthorized or not found");

  const [updated] = await db.update(lands)
    .set({ isForSale: false, priceInKsh: null, updatedAt: new Date() })
    .where(eq(lands.id, landId))
    .returning();

  await db.insert(auditLogs).values({ actionType: "LAND_REMOVED_FROM_SALE", performedBy: userId, landId });
  return updated;
};