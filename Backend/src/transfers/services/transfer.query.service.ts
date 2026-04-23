import { eq, desc } from "drizzle-orm";
import db from "../../drizzle/db";
import { transferRequests } from "../../drizzle/schema";

/**
 * Fetches a single transfer with full relations
 */
export const getTransferByIdService = async (id: number) => {
  return await db.query.transferRequests.findFirst({
    where: eq(transferRequests.id, id),
    with: {
      land: true,
      buyer: {
        columns: {
          id: true,
          fullName: true,
          walletAddress: true
        }
      },
      seller: {
        columns: {
          id: true,
          fullName: true,
          walletAddress: true
        }
      }
    }
  });
};

/**
 * Lists all pending transfers for officers
 */
export const getPendingTransfersService = async () => {
  return await db.query.transferRequests.findMany({
    where: eq(transferRequests.status, "pending"),
    with: {
      land: true,
      buyer: true,
      seller: true
    },
    orderBy: [desc(transferRequests.createdAt)]
  });
};

/**
 * Lists history for a specific seller
 */
export const getSellerTransfersService = async (sellerId: number) => {
  return await db.query.transferRequests.findMany({
    where: eq(transferRequests.sellerId, sellerId),
    with: {
      land: true,
      buyer: true
    },
    orderBy: [desc(transferRequests.createdAt)]
  });
};