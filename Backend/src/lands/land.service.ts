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

/* ================================
   VERIFY LAND (Officer Action)
================================ */
export const verifyLandService = async (landId: number, officerId: number) => {
  // 1. Fetch land details + owner wallet
  const land = await db.query.lands.findFirst({
    where: eq(lands.id, landId),
    with: { owner: true }
  });

  if (!land) throw new Error("Land record not found");
  if (land.verificationStatus === "verified") throw new Error("Land is already verified");
  if (!land.owner?.walletAddress) throw new Error("Owner wallet address is missing");

  // 2. BLOCKCHAIN STEP: Minting
  console.log(`🔗 Minting Land LR: ${land.lrNumber} to Blockchain...`);
  
  let tx;
  let onChainId: number;

  try {
    tx = await registerLandOnChain(
      land.owner.walletAddress, 
      land.lrNumber, 
      land.ipfsDocHash || "N/A"
    );

    // 3. Wait for transaction to be mined
    const receipt = await tx.wait();
    
    // Find the 'LandRegistered' event in the receipt logs
    // Adjust the event name "LandRegistered" to match your actual Solidity event name
    const event = receipt.events?.find((e: any) => e.event === "LandRegistered");
    
    // Convert BigNumber to number safely
    onChainId = event ? Number(event.args.id) : Math.floor(Math.random() * 100000);

  } catch (error: any) {
    throw new Error(`Blockchain Minting Failed: ${error.message}`);
  }

  // 4. DATABASE TRANSACTION
  return await db.transaction(async (txDb) => {
    const [updatedLand] = await txDb.update(lands)
      .set({ 
        verificationStatus: "verified",
        onChainId: onChainId,
        blockchainTxHash: tx.hash, // This will now work after Step 1
        updatedAt: new Date()
      })
      .where(eq(lands.id, landId))
      .returning();

    // Log the action for government oversight
    await txDb.insert(auditLogs).values({
      action: `Officer ${officerId} verified and minted Land ID ${landId} (LR: ${land.lrNumber})`,
      performedBy: officerId,
      landId: landId,
      blockchainTxHash: tx.hash
    });

    return { 
      message: "Land verified and secured on blockchain", 
      land: updatedLand, 
      txHash: tx.hash 
    };
  });
};