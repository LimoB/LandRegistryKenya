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
  console.log("[SERVICE] Fetching all land records from database...");
  try {
    const results = await db.query.lands.findMany({
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
    console.log(`[SERVICE] Successfully fetched ${results.length} land records.`);
    return results;
  } catch (error: any) {
    console.error(`[SERVICE ERROR] getAllLandsService failed: ${error.message}`);
    throw error;
  }
};

/* ============================================================
   CREATE LAND (LOCAL DB REGISTRATION)
============================================================ */
export const createLandService = async (landData: TLandInsert) => {
  console.log(`[SERVICE] Initializing local database record for LR: ${landData.lrNumber}`);
  
  if (!landData.ownerId) throw new Error("Owner is required");
  if (!landData.lrNumber) throw new Error("LR Number is required");

  const existing = await db.query.lands.findFirst({
    where: eq(lands.lrNumber, landData.lrNumber)
  });

  if (existing) {
    console.warn(`[SERVICE] Conflict: Land ${landData.lrNumber} already exists in DB.`);
    throw new Error("Land already exists");
  }

  return await db.transaction(async (trx) => {
    // 1. Insert the land record
    const [newLand] = await trx.insert(lands).values({
      ...landData,
      verificationStatus: "pending",
      isForSale: false
    }).returning();

    console.log(`[SERVICE] Created land record with ID: ${newLand.id}`);

    // 2. Initial History Entry
    // Fixed: Matching the schema names (blockchainTxHash instead of txHash)
    await trx.insert(landOwnershipHistory).values({
      landId: newLand.id,
      toOwnerId: newLand.ownerId,
      toWallet: null, // Initial entry might not have wallet yet if created by admin
      fromOwnerId: null,
      fromWallet: null,
      mpesaRef: "INITIAL_REGISTRATION"
    });

    // 3. Audit Log
    await trx.insert(auditLogs).values({
      actionType: "LAND_CREATED",
      performedBy: newLand.ownerId,
      landId: newLand.id,
      metadata: { lrNumber: newLand.lrNumber }
    });

    console.log(`[SERVICE] Audit log and history recorded for LR: ${newLand.lrNumber}`);
    return newLand;
  });
};

/* ============================================================
   GET LAND BY LR
============================================================ */
export const getLandByLRService = async (lrNumber: string) => {
  console.log(`[SERVICE] Searching for LR Number: ${lrNumber}`);
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
   VERIFY LAND (OFFICER + BLOCKCHAIN MINT)
============================================================ */
export const verifyLandService = async (
  landId: number,
  officerId: number
) => {
  console.log(`[SERVICE] Starting On-Chain Verification for Land ID: ${landId}`);
  
  const land = await db.query.lands.findFirst({
    where: eq(lands.id, landId),
    with: { owner: true }
  });

  if (!land) {
    console.error(`[SERVICE] Land ID ${landId} not found.`);
    throw new Error("Land not found");
  }

  if (land.verificationStatus === "verified") {
    console.warn(`[SERVICE] Land ID ${landId} is already verified.`);
    throw new Error("Land already verified");
  }

  if (!land.owner?.walletAddress) {
    console.error(`[SERVICE] Owner ${land.ownerId} is missing a wallet address.`);
    throw new Error("Owner wallet missing. Cannot mint on-chain.");
  }

  let receipt;
  try {
    console.log(`[SERVICE] Executing blockchain mint for LR: ${land.lrNumber}...`);
    
    // Calling the service we updated to use "registerInitialLand"
    receipt = await registerLandOnChainService(
      land.owner.walletAddress,
      land.lrNumber,
      land.ipfsDocHash || "N/A"
    );

    console.log(`[SERVICE] Blockchain Transaction Confirmed. Hash: ${receipt.hash}`);
  } catch (error: any) {
    console.error(`[SERVICE BLOCKCHAIN ERROR] Minting failed: ${error.message}`);
    throw new Error(`Blockchain mint failed: ${error.message}`);
  }

  console.log(`[SERVICE] Finalizing verification in database...`);
  return await db.transaction(async (trx) => {
    const [updated] = await trx
      .update(lands)
      .set({
        verificationStatus: "verified",
        blockchainTxHash: receipt.hash,
        blockNumber: receipt.blockNumber.toString(), // Store as string if your schema is VARCHAR
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

    console.log(`[SERVICE] Land ID ${landId} officially verified on-chain and locally.`);
    return {
      message: "Land verified successfully",
      land: updated
    };
  });
};

/* ============================================================
   MARKETPLACE SERVICES
============================================================ */
export const getMarketplaceLandsService = async () => {
  console.log("[SERVICE] Fetching lands listed for sale...");
  return await db.query.lands.findMany({
    where: and(
      eq(lands.isForSale, true),
      eq(lands.verificationStatus, "verified")
    ),
    with: { owner: true },
    orderBy: (l, { desc }) => [desc(l.createdAt)]
  });
};

export const getMyLandsService = async (userId: number) => {
  console.log(`[SERVICE] Fetching land portfolio for User ID: ${userId}`);
  return await db.query.lands.findMany({
    where: eq(lands.ownerId, userId),
    orderBy: (l, { desc }) => [desc(l.createdAt)]
  });
};

/* ============================================================
   LIST LAND FOR SALE
============================================================ */
export const listLandForSaleService = async (
  userId: number,
  landId: number,
  priceInKsh: number
) => {
  console.log(`[SERVICE] Listing Land ID ${landId} for ${priceInKsh} KSh`);
  
  const land = await db.query.lands.findFirst({
    where: eq(lands.id, landId)
  });

  if (!land) throw new Error("Land not found");
  if (land.ownerId !== userId) throw new Error("Unauthorized: You do not own this land");
  if (land.verificationStatus !== "verified") throw new Error("Only verified lands can be listed");

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

  console.log(`[SERVICE] Land ID ${landId} successfully listed on marketplace.`);
  return updated;
};

/* ============================================================
   REMOVE FROM SALE
============================================================ */
export const removeLandFromSaleService = async (
  userId: number,
  landId: number
) => {
  console.log(`[SERVICE] Removing Land ID ${landId} from sale...`);
  
  const land = await db.query.lands.findFirst({
    where: eq(lands.id, landId)
  });

  if (!land) throw new Error("Land not found");
  if (land.ownerId !== userId) throw new Error("Not authorized");

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

  console.log(`[SERVICE] Land ID ${landId} removed from marketplace.`);
  return updated;
};