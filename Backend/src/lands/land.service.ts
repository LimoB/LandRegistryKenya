import { eq, and, desc, ne } from "drizzle-orm";
import db from "../drizzle/db";
import {
  auditLogs,
  lands,
  landOwnershipHistory
} from "../drizzle/schema";

import {
  registerLandOnChainService
} from "../blockchain/blockchain.service";

export type TLandInsert = typeof lands.$inferInsert;

/* ============================================================
   GET ALL LANDS (ADMIN / OFFICER VIEW)
============================================================ */
export const getAllLandsService = async () => {
  return await db.query.lands.findMany({
    with: {
      owner: {
        columns: {
          fullName: true,
          email: true,
          idNumber: true,
          walletAddress: true
        }
      }
    },
    orderBy: (lands, { desc }) => [desc(lands.createdAt)]
  });
};

/* ============================================================
   CREATE LAND
============================================================ */
export const createLandService = async (landData: TLandInsert) => {
  if (!landData.ownerId) throw new Error("Owner is required");
  if (!landData.lrNumber) throw new Error("LR Number is required");

  const existing = await db.query.lands.findFirst({
    where: eq(lands.lrNumber, landData.lrNumber)
  });

  if (existing) {
    throw new Error("Land already exists");
  }

  const [newLand] = await db.insert(lands).values({
    ...landData,
    verificationStatus: "pending",
    isForSale: false
  }).returning();

  await db.insert(landOwnershipHistory).values({
    landId: newLand.id,
    fromOwnerId: null,
    toOwnerId: newLand.ownerId,
    fromWallet: null,
    toWallet: null
  });

  await db.insert(auditLogs).values({
    actionType: "LAND_CREATED",
    performedBy: newLand.ownerId,
    landId: newLand.id,
    metadata: {
      lrNumber: newLand.lrNumber
    }
  });

  return newLand;
};

/* ============================================================
   GET LAND BY LR
============================================================ */
export const getLandByLRService = async (lrNumber: string) => {
  return await db.query.lands.findFirst({
    where: eq(lands.lrNumber, lrNumber),
    with: {
      owner: true,
      ownershipHistory: true,
      auditLogs: true
    }
  });
};

/* ============================================================
   VERIFY LAND (OFFICER + BLOCKCHAIN)
============================================================ */
export const verifyLandService = async (
  landId: number,
  officerId: number
) => {
  const land = await db.query.lands.findFirst({
    where: eq(lands.id, landId),
    with: { owner: true }
  });

  if (!land) throw new Error("Land not found");

  if (land.verificationStatus === "verified") {
    throw new Error("Land already verified");
  }

  if (!land.owner?.walletAddress) {
    throw new Error("Owner wallet missing");
  }

  if (land.blockchainTxHash) {
    throw new Error("Already minted on blockchain");
  }

  let receipt;
  try {
    receipt = await registerLandOnChainService(
      land.owner.walletAddress,
      land.lrNumber,
      land.ipfsDocHash || "N/A"
    );
  } catch (error: any) {
    throw new Error(`Blockchain mint failed: ${error.message}`);
  }

  return await db.transaction(async (trx) => {
    const [updated] = await trx
      .update(lands)
      .set({
        verificationStatus: "verified",
        blockchainTxHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        verifiedBy: officerId,
        verifiedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(lands.id, landId))
      .returning();

    await trx.insert(auditLogs).values({
      actionType: "LAND_VERIFIED",
      performedBy: officerId,
      landId,
      blockchainTxHash: receipt.hash
    });

    return {
      message: "Land verified",
      land: updated
    };
  });
};

/* ============================================================
   LIST LAND FOR SALE (MARKETPLACE ENTRY)
============================================================ */
export const listLandForSaleService = async (
  userId: number,
  landId: number,
  priceInKsh: number
) => {
  const land = await db.query.lands.findFirst({
    where: eq(lands.id, landId)
  });

  if (!land) throw new Error("Land not found");

  if (land.ownerId !== userId) {
    throw new Error("You do not own this land");
  }

  if (land.verificationStatus !== "verified") {
    throw new Error("Land must be verified before selling");
  }

  if (land.isForSale) {
    throw new Error("Land already listed for sale");
  }

  const [updated] = await db
    .update(lands)
    .set({
      isForSale: true,
      priceInKsh: priceInKsh.toString(),
      updatedAt: new Date()
    })
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

/* ============================================================
   REMOVE FROM SALE
============================================================ */
export const removeLandFromSaleService = async (
  userId: number,
  landId: number
) => {
  const land = await db.query.lands.findFirst({
    where: eq(lands.id, landId)
  });

  if (!land) throw new Error("Land not found");

  if (land.ownerId !== userId) {
    throw new Error("Not authorized");
  }

  const [updated] = await db
    .update(lands)
    .set({
      isForSale: false,
      priceInKsh: null,
      updatedAt: new Date()
    })
    .where(eq(lands.id, landId))
    .returning();

  await db.insert(auditLogs).values({
    actionType: "LAND_REMOVED_FROM_SALE",
    performedBy: userId,
    landId
  });

  return updated;
};

/* ============================================================
   MARKETPLACE VIEW (BUYERS SEE THIS)
============================================================ */
export const getMarketplaceLandsService = async () => {
  return await db.query.lands.findMany({
    where: and(
      eq(lands.isForSale, true),
      eq(lands.verificationStatus, "verified")
    ),
    with: {
      owner: {
        columns: {
          id: true,
          fullName: true,
          walletAddress: true
        }
      }
    },
    orderBy: (l, { desc }) => [desc(l.createdAt)]
  });
};

/* ============================================================
   GET MY LANDS (OWNER DASHBOARD)
============================================================ */
export const getMyLandsService = async (userId: number) => {
  return await db.query.lands.findMany({
    where: eq(lands.ownerId, userId),
    orderBy: (l, { desc }) => [desc(l.createdAt)]
  });
};

