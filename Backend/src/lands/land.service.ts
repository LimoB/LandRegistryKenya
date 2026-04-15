import { eq } from "drizzle-orm";
import db  from "../drizzle/db";
import { auditLogs, lands } from "../drizzle/schema";
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
  // landData now includes ipfsDocHash from the controller
  const [newLand] = await db.insert(lands).values(landData).returning();
  return newLand;
};

/* ================================
   GET LAND BY LR NUMBER
================================ */
export const getLandByLRService = async (lrNumber: string) => {
  return await db.query.lands.findFirst({
    where: eq(lands.lrNumber, lrNumber),
    with: { owner: true }
  });
};

// * ================================
//    VERIFY LAND (Officer Action)
// ================================ */
export const verifyLandService = async (landId: number, officerId: number) => {
  const land = await db.query.lands.findFirst({
    where: eq(lands.id, landId),
    with: { owner: true }
  });

  if (!land) throw new Error("Land record not found");
  if (land.verificationStatus === "verified") throw new Error("Already verified");
  if (!land.owner?.walletAddress) throw new Error("Owner wallet address missing");

  console.log(`🔗 Minting Land LR: ${land.lrNumber} on Ganache...`);
  
  try {
    // 1. Get Receipt from Blockchain (registerLandOnChain already does .wait())
    const receipt = await registerLandOnChain(
      land.owner.walletAddress, 
      land.lrNumber, 
      land.ipfsDocHash || "N/A"
    );

    // 2. Extract onChainId from Events (assuming 'LandRegistered' is your event)
    // In ethers v6, we look at receipt.logs
    const onChainId = Math.floor(Math.random() * 100000); // Fallback for demo
    const txHash = receipt.hash;

    // 3. Database Update via Transaction
    return await db.transaction(async (txDb) => {
      const [updatedLand] = await txDb.update(lands)
        .set({ 
          verificationStatus: "verified",
          onChainId: onChainId,
          blockchainTxHash: txHash,
          updatedAt: new Date()
        })
        .where(eq(lands.id, landId))
        .returning();

      await txDb.insert(auditLogs).values({
        action: `Verified LR: ${land.lrNumber}`,
        performedBy: officerId,
        landId: landId,
        blockchainTxHash: txHash
      });

      return { 
        message: "Land secured on blockchain", 
        land: updatedLand, 
        txHash: txHash 
      };
    });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Blockchain error";
    throw new Error(`Minting Failed: ${msg}`);
  }
};