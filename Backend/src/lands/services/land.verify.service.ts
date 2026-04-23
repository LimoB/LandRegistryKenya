import { eq } from "drizzle-orm";
import db from "../../drizzle/db";
import { lands, auditLogs } from "../../drizzle/schema";
import { registerLandOnChainService } from "../../blockchain/services";

/**
 * Verifies land locally and mints the record on the blockchain
 */
export const verifyLandService = async (landId: number, officerId: number) => {
  const land = await db.query.lands.findFirst({
    where: eq(lands.id, landId),
    with: { owner: true }
  });

  if (!land) throw new Error("Land not found");
  if (land.verificationStatus === "verified") throw new Error("Land already verified");
  if (!land.owner?.walletAddress) throw new Error("Owner wallet missing. Cannot mint on-chain.");

  // Blockchain Minting
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

  // Database Finalization
  return await db.transaction(async (trx) => {
    const [updated] = await trx
      .update(lands)
      .set({
        verificationStatus: "verified",
        blockchainTxHash: receipt.hash,
        blockNumber: receipt.blockNumber.toString(),
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
      message: "Land verified successfully",
      land: updated
    };
  });
};