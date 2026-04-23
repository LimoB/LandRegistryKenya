import { eq } from "drizzle-orm";
import db from "../../drizzle/db";
import { lands, landOwnershipHistory, auditLogs } from "../../drizzle/schema";

export type TLandInsert = typeof lands.$inferInsert;

/**
 * Local DB registration for new land
 */
export const createLandService = async (landData: TLandInsert) => {
  if (!landData.ownerId) throw new Error("Owner is required");
  if (!landData.lrNumber) throw new Error("LR Number is required");

  const existing = await db.query.lands.findFirst({
    where: eq(lands.lrNumber, landData.lrNumber)
  });
  if (existing) throw new Error("Land already exists");

  return await db.transaction(async (trx) => {
    const [newLand] = await trx.insert(lands).values({
      ...landData,
      verificationStatus: "pending",
      isForSale: false
    }).returning();

    await trx.insert(landOwnershipHistory).values({
      landId: newLand.id,
      toOwnerId: newLand.ownerId,
      toWallet: null,
      fromOwnerId: null,
      fromWallet: null,
      mpesaRef: "INITIAL_REGISTRATION"
    });

    await trx.insert(auditLogs).values({
      actionType: "LAND_CREATED",
      performedBy: newLand.ownerId,
      landId: newLand.id,
      metadata: { lrNumber: newLand.lrNumber }
    });

    return newLand;
  });
};

/**
 * Lists a verified land on the marketplace
 */
export const listLandForSaleService = async (userId: number, landId: number, priceInKsh: number) => {
  const land = await db.query.lands.findFirst({ where: eq(lands.id, landId) });

  if (!land) throw new Error("Land not found");
  if (land.ownerId !== userId) throw new Error("Unauthorized");
  if (land.verificationStatus !== "verified") throw new Error("Only verified lands can be listed");

  const [updated] = await db.update(lands)
    .set({ isForSale: true, priceInKsh: priceInKsh.toString(), updatedAt: new Date() })
    .where(eq(lands.id, landId))
    .returning();

  await db.insert(auditLogs).values({
    actionType: "LAND_LISTED_FOR_SALE",
    performedBy: userId,
    landId,
    metadata: { priceInKsh }
  });

  return updated;
};

/**
 * Removes a land from the marketplace
 */
export const removeLandFromSaleService = async (userId: number, landId: number) => {
  const land = await db.query.lands.findFirst({ where: eq(lands.id, landId) });
  if (!land || land.ownerId !== userId) throw new Error("Unauthorized or not found");

  const [updated] = await db.update(lands)
    .set({ isForSale: false, priceInKsh: null, updatedAt: new Date() })
    .where(eq(lands.id, landId))
    .returning();

  await db.insert(auditLogs).values({ actionType: "LAND_REMOVED_FROM_SALE", performedBy: userId, landId });
  return updated;
};