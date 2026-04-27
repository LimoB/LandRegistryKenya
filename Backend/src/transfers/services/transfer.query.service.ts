import { eq, desc, and, or, ne } from "drizzle-orm";
import db from "../../drizzle/db";
import { transferRequests } from "../../drizzle/schema";

/**
 * NEW: Fetches ALL transfers for a user (History + Active)
 * This ensures "Completed", "Paid", and "Rejected" items still show up.
 */
export const getUserTransfersService = async (userId: number) => {
  console.log(`[Service] Fetching all transaction history for User ID: ${userId}`);

  return await db.query.transferRequests.findMany({
    where: or(
      eq(transferRequests.buyerId, userId),
      eq(transferRequests.sellerId, userId)
    ),
    with: {
      land: true,
      buyer: true,
      seller: true
    },
    orderBy: [desc(transferRequests.createdAt)]
  });
};

/**
 * Lists pending transfers with Role-Based Filtering
 */
export const getPendingTransfersService = async (userId: number, userRole: string) => {
  console.log(`[Service] Fetching pending records for Role: ${userRole}`);

  const statusCondition = eq(transferRequests.status, "pending");
  let finalCondition;

  if (userRole === "citizen") {
    finalCondition = and(
      statusCondition,
      or(
        eq(transferRequests.buyerId, userId),
        eq(transferRequests.sellerId, userId)
      )
    );
  } else {
    finalCondition = statusCondition;
  }

  return await db.query.transferRequests.findMany({
    where: finalCondition,
    with: {
      land: true,
      buyer: true,
      seller: true
    },
    orderBy: [desc(transferRequests.createdAt)]
  });
};

/**
 * Fetches a single transfer with full relations
 */
export const getTransferByIdService = async (id: number) => {
  return await db.query.transferRequests.findFirst({
    where: eq(transferRequests.id, id),
    with: {
      land: true,
      buyer: {
        columns: { id: true, fullName: true, walletAddress: true }
      },
      seller: {
        columns: { id: true, fullName: true, walletAddress: true }
      }
    }
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