import { eq } from "drizzle-orm";
import db  from "../drizzle/db";
import { lands } from "../drizzle/schema";

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
export const verifyLandService = async (id: number, onChainId: number) => {
  const result = await db
    .update(lands)
    .set({ 
      verificationStatus: "verified",
      onChainId: onChainId, // The ID returned from the Smart Contract
      updatedAt: new Date()
    })
    .where(eq(lands.id, id))
    .returning();
    
  if (!result.length) throw new Error("Land record not found for verification");
  return result[0];
};