import { eq, desc, and, or } from "drizzle-orm";
import db from "../../drizzle/db";
import { transferRequests } from "../../drizzle/schema";

/**
 * NEW: Fetches ALL transfers for a user (History + Active)
 * Updated to include 'payment' relation so the UI can show receipt details.
 */
export const getUserTransfersService = async (userId: number) => {
  console.log(`\x1b[36m[Service] Fetching full transaction history for User ID: ${userId}\x1b[0m`);

  return await db.query.transferRequests.findMany({
    where: or(
      eq(transferRequests.buyerId, userId),
      eq(transferRequests.sellerId, userId)
    ),
    with: {
      land: true,
      buyer: {
        columns: { password: false } // Security: Don't send hashes to frontend
      },
      seller: {
        columns: { password: false }
      },
      payment: true // NEW: Includes payment status and receipt codes
    },
    orderBy: [desc(transferRequests.createdAt)]
  });
};

/**
 * Lists pending transfers with Role-Based Filtering
 * Note: 'pending' here usually means awaiting Officer Approval.
 */
export const getPendingTransfersService = async (userId: number, userRole: string) => {
  console.log(`\x1b[33m[Service] Fetching pending records for Role: ${userRole}\x1b[0m`);

  // We filter by "pending" status, but "payment_pending" records 
  // might also be needed depending on your UI tabs.
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
    // Admin/Officer sees all pending requests
    finalCondition = statusCondition;
  }

  return await db.query.transferRequests.findMany({
    where: finalCondition,
    with: {
      land: true,
      buyer: { columns: { password: false } },
      seller: { columns: { password: false } }
    },
    orderBy: [desc(transferRequests.createdAt)]
  });
};

/**
 * Fetches a single transfer with full relations
 * Used for the Status/Details page after payment.
 */
export const getTransferByIdService = async (id: number) => {
  console.log(`\x1b[35m[Service] Fetching Transfer Detail: ${id}\x1b[0m`);

  return await db.query.transferRequests.findFirst({
    where: eq(transferRequests.id, id),
    with: {
      land: true,
      buyer: {
        columns: { id: true, fullName: true, walletAddress: true, email: true, phone: true }
      },
      seller: {
        columns: { id: true, fullName: true, walletAddress: true, email: true, phone: true }
      },
      payment: true // CRITICAL: Shows the buyer if the payment was successful
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
      buyer: { columns: { password: false } },
      payment: true
    },
    orderBy: [desc(transferRequests.createdAt)]
  });
};