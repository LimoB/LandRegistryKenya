import { eq } from "drizzle-orm";
import db from "../../drizzle/db";
import { lands, auditLogs } from "../../drizzle/schema";
import { registerLandOnChainService } from "../../blockchain/services";

/**
 * Verifies land locally and mints the record on the blockchain
 */
export const verifyLandService = async (landId: number, officerId: number) => {
  // 1. Fetch land details with owner information
  const land = await db.query.lands.findFirst({
    where: eq(lands.id, landId),
    with: { owner: true }
  });

  if (!land) throw new Error("Land not found");
  if (land.verificationStatus === "verified") throw new Error("Land already verified");
  if (!land.owner?.walletAddress) throw new Error("Owner wallet missing. Cannot mint on-chain.");

  // 2. Blockchain Minting
  let txHash: string;
  let finalBlockNumber: number;

  try {
    // Your blockchain service already handles tx.wait() and returns { hash, blockNumber }
    const receipt = await registerLandOnChainService(
      land.owner.walletAddress,
      land.lrNumber,
      land.ipfsDocHash || "N/A"
    );

    // No need for as any or .wait() here because we are receiving plain data
    txHash = receipt.hash;
    finalBlockNumber = Number(receipt.blockNumber);

    console.log(`[SERVICE] Blockchain record finalized in block: ${finalBlockNumber}`);
  } catch (error: any) {
    console.error("Blockchain Error Context:", error);
    // Standardizing error message for the frontend
    throw new Error(`Blockchain mint failed: ${error.message}`);
  }

  // 3. Database Finalization (Atomic Transaction)
  try {
    return await db.transaction(async (trx) => {
      // Update land status in PostgreSQL
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

      // Log the action in Audit Logs
      await trx.insert(auditLogs).values({
        actionType: "LAND_VERIFIED",
        performedBy: officerId,
        landId,
        blockchainTxHash: txHash,
        createdAt: new Date()
      });

      return {
        success: true,
        message: "Land verified successfully and minted on-chain",
        land: updated
      };
    });
  } catch (dbError: any) {
    console.error("Database Transaction Error:", dbError);
    // If we reach here, the land is minted on-chain but the DB failed to update.
    throw new Error(`On-chain success, but local DB update failed: ${dbError.message}`);
  }
};