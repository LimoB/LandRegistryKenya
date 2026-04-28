import { eq } from "drizzle-orm";
import db from "../../drizzle/db";
import { lands, auditLogs } from "../../drizzle/schema";
import { registerLandOnChainService } from "../../blockchain/services";

/**
 * Verifies land locally and mints the record on the blockchain
 */
export const verifyLandService = async (landId: number, officerId: number) => {
  console.log(`[SERVICE] Starting verification for land ID: ${landId}`);

  // 1. Fetch land details with owner information
  const land = await db.query.lands.findFirst({
    where: eq(lands.id, landId),
    with: { owner: true }
  });

  if (!land) {
    console.error("[SERVICE] Land not found");
    throw new Error("Land not found");
  }

  // Prevent duplicate execution (critical)
  if (land.blockchainTxHash) {
    console.log("[SERVICE] Land already minted on-chain, skipping");

    return {
      success: true,
      message: "Land already verified",
      land
    };
  }

  if (!land.owner?.walletAddress) {
    console.error("[SERVICE] Missing owner wallet");
    throw new Error("Owner wallet missing. Cannot mint on-chain.");
  }

  let txHash: string;
  let finalBlockNumber: number;

  // 2. Blockchain Minting
  try {
    console.log("[SERVICE] Sending transaction to blockchain...");

    const receipt = await registerLandOnChainService(
      land.owner.walletAddress,
      land.lrNumber,
      land.ipfsDocHash || "N/A"
    );

    txHash = receipt.hash;
    finalBlockNumber = Number(receipt.blockNumber);

    console.log(`[SERVICE] Blockchain confirmed. TX: ${txHash}`);
    console.log(`[SERVICE] Included in block: ${finalBlockNumber}`);
  } catch (error: any) {
    console.error("[SERVICE] Blockchain mint failed:", error);
    throw new Error(`Blockchain mint failed: ${error.message}`);
  }

  // 3. Database Finalization (Atomic Transaction)
  try {
    console.log("[SERVICE] Updating local database...");

    return await db.transaction(async (trx) => {
      const [updated] = await trx
        .update(lands)
        .set({
          verificationStatus: "verified",
          blockchainTxHash: txHash,
          blockNumber: finalBlockNumber,
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
        blockchainTxHash: txHash,
        createdAt: new Date()
      });

      console.log("[SERVICE] Database updated successfully");

      return {
        success: true,
        message: "Land verified successfully and minted on-chain",
        land: updated
      };
    });
  } catch (dbError: any) {
    console.error("[SERVICE] CRITICAL: DB failed AFTER blockchain success", dbError);

    // Do NOT throw fatal error → prevents retry loops
    return {
      success: false,
      message: "Blockchain succeeded but DB update failed. Manual reconciliation required.",
      txHash
    };
  }
};