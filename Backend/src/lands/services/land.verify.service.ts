import { eq } from "drizzle-orm";
import db from "../../drizzle/db";
import { lands, auditLogs } from "../../drizzle/schema";
import { registerLandOnChainService } from "../../blockchain/services";
import { ethers } from "ethers";

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
  let finalBlockNumber: number; // Changed to number to match your Drizzle schema

  try {
    // We cast this to 'any' or 'ethers.ContractTransactionResponse' 
    // to ensure the 'wait' method is recognized by TypeScript
    const txResponse = await registerLandOnChainService(
      land.owner.walletAddress,
      land.lrNumber,
      land.ipfsDocHash || "N/A"
    ) as any; 

    txHash = txResponse.hash;

    // Wait for the transaction to be mined
    const receipt = await txResponse.wait();
    
    if (!receipt) throw new Error("Transaction failed: No receipt received");
    
    // Convert to Number because your Drizzle schema expects a number, not a string
    finalBlockNumber = Number(receipt.blockNumber);
  } catch (error: any) {
    console.error("Blockchain Error:", error);
    throw new Error(`Blockchain mint failed: ${error.message}`);
  }

  // 3. Database Finalization (Atomic Transaction)
  try {
    return await db.transaction(async (trx) => {
      // Update land status
      const [updated] = await trx
        .update(lands)
        .set({
          verificationStatus: "verified",
          blockchainTxHash: txHash,
          blockNumber: finalBlockNumber, // Now passes as a number
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
        blockchainTxHash: txHash
      });

      return {
        success: true,
        message: "Land verified successfully and minted on-chain",
        land: updated
      };
    });
  } catch (dbError: any) {
    console.error("Database Transaction Error:", dbError);
    throw new Error(`On-chain success, but local DB update failed: ${dbError.message}`);
  }
};