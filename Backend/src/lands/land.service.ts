import { eq } from "drizzle-orm";
import db from "../drizzle/db";
import {
  auditLogs,
  lands,
  landOwnershipHistory
} from "../drizzle/schema";

import { registerLandOnChain } from "@/blockchain/landRegistry";

export type TLandInsert = typeof lands.$inferInsert;

/* ================================
   GET ALL LANDS
================================ */
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

/* ================================
   CREATE LAND (Citizen Submission)
================================ */
export const createLandService = async (landData: TLandInsert) => {
  if (!landData.ownerId) {
    throw new Error("Owner is required");
  }

  if (!landData.lrNumber) {
    throw new Error("LR Number is required");
  }

  const [newLand] = await db.insert(lands).values({
    ...landData,
    verificationStatus: "pending"
  }).returning();

  // ✅ Create initial ownership record
  await db.insert(landOwnershipHistory).values({
    landId: newLand.id,
    ownerId: newLand.ownerId
  });

  return newLand;
};

/* ================================
   GET LAND BY LR NUMBER
================================ */
export const getLandByLRService = async (lrNumber: string) => {
  return await db.query.lands.findFirst({
    where: eq(lands.lrNumber, lrNumber),
    with: {
      owner: true,
      ownershipHistory: true
    }
  });
};

/* ================================
   VERIFY LAND (Officer Action)
================================ */
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
     BLOCKCHAIN MINT
     ============================================================ */
  let receipt;

  try {
    receipt = await registerLandOnChain(
      land.owner.walletAddress,
      land.lrNumber,
      land.ipfsDocHash || "N/A"
    );
  } catch (error: any) {
    throw new Error(`Blockchain mint failed: ${error.message}`);
  }

  // ⚠️ TODO: Replace with real event parsing later
  const onChainId = Number(
    BigInt("0x" + receipt.hash.slice(2, 10))
  );

  const txHash = receipt.hash;

  /* ============================================================
     DB TRANSACTION
     ============================================================ */
  return await db.transaction(async (trx) => {
    // Update land
    const [updatedLand] = await trx.update(lands)
      .set({
        verificationStatus: "verified",
        onChainId,
        blockchainTxHash: txHash,
        verifiedBy: officerId,
        verifiedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(lands.id, landId))
      .returning();

    // Audit log (NEW STRUCTURE)
    await trx.insert(auditLogs).values({
      actionType: "LAND_VERIFIED",
      performedBy: officerId,
      landId: landId,
      blockchainTxHash: txHash,
      metadata: {
        lrNumber: land.lrNumber,
        ownerId: land.ownerId
      }
    });

    return {
      message: "Land verified and minted on blockchain",
      land: updatedLand,
      txHash
    };
  });
};