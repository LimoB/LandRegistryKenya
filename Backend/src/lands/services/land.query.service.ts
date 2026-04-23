import { eq, and, desc } from "drizzle-orm";
import db from "../../drizzle/db";
import { lands } from "../../drizzle/schema";

/**
 * Fetches all land records for Admin/Officer views
 */
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
    orderBy: [desc(lands.createdAt)]
  });
};

/**
 * Searches for a specific land by LR Number
 */
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

/**
 * Public marketplace view for verified and for-sale lands
 */
export const getMarketplaceLandsService = async () => {
  return await db.query.lands.findMany({
    where: and(
      eq(lands.isForSale, true),
      eq(lands.verificationStatus, "verified")
    ),
    with: { owner: true },
    orderBy: [desc(lands.createdAt)]
  });
};

/**
 * User-specific land portfolio
 */
export const getMyLandsService = async (userId: number) => {
  return await db.query.lands.findMany({
    where: eq(lands.ownerId, userId),
    orderBy: [desc(lands.createdAt)]
  });
};