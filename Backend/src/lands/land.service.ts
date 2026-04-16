import { eq } from "drizzle-orm";
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
   GET ALL LANDS
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
   CREATE LAND (CITIZEN REGISTRATION)
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
    verificationStatus: "pending"
  }).returning();

  /* ============================================================
     INITIAL OWNERSHIP RECORD
  ============================================================ */
  await db.insert(landOwnershipHistory).values({
    landId: newLand.id,
    fromOwnerId: null,
    toOwnerId: newLand.ownerId,
    fromWallet: null,
    toWallet: null
  });

  /* ============================================================
     AUDIT LOG
  ============================================================ */
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
   GET LAND BY LR NUMBER
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
   VERIFY LAND (OFFICER + BLOCKCHAIN MINT)
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

  /* ============================================================
     IDEMPOTENCY CHECK
  ============================================================ */
  if (land.blockchainTxHash) {
    throw new Error("Land already minted on blockchain");
  }

  /* ============================================================
     BLOCKCHAIN MINT (via service layer)
  ============================================================ */
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

  const txHash = receipt.hash;
  const blockNumber = receipt.blockNumber;

  /* ============================================================
     DB TRANSACTION
  ============================================================ */
  return await db.transaction(async (trx) => {
    const [updatedLand] = await trx
      .update(lands)
      .set({
        verificationStatus: "verified",
        blockchainTxHash: txHash,
        blockNumber,
        verifiedBy: officerId,
        verifiedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(lands.id, landId))
      .returning();

    /* ============================================================
       AUDIT LOG
    ============================================================ */
    await trx.insert(auditLogs).values({
      actionType: "LAND_VERIFIED",
      performedBy: officerId,
      landId,
      blockchainTxHash: txHash,
      metadata: {
        lrNumber: land.lrNumber,
        ownerId: land.ownerId,
        blockNumber
      }
    });

    return {
      message: "Land verified successfully",
      land: updatedLand,
      txHash,
      blockNumber
    };
  });
};