import { eq, desc, and, or, inArray } from "drizzle-orm";
import db from "../../drizzle/db";
import { transferRequests } from "../../drizzle/schema";

/* ============================================================
   🔥 USER FULL HISTORY (ALL STATES)
============================================================ */
export const getUserTransfersService = async (userId: number) => {
  return await db.query.transferRequests.findMany({
    where: or(
      eq(transferRequests.buyerId, userId),
      eq(transferRequests.sellerId, userId)
    ),
    with: {
      land: true,
      buyer: { columns: { password: false } },
      seller: { columns: { password: false } },
      payment: true
    },
    orderBy: [desc(transferRequests.createdAt)]
  });
};

/* ============================================================
   🔥 ACTIVE TRANSFERS (SMART VERSION)
   Includes blockchain stages
============================================================ */
export const getPendingTransfersService = async (
  userId: number,
  userRole: string
) => {
  const activeStatuses = [
    "pending",
    "payment_pending",
    "paid"
  ] as const;

  const activeBlockchain = [
    "pending",
    "processing",
    "submitted"
  ] as const;

  let condition;

  if (userRole === "citizen") {
    condition = and(
      or(
        inArray(transferRequests.status, activeStatuses),
        inArray(transferRequests.blockchainStatus, activeBlockchain)
      ),
      or(
        eq(transferRequests.buyerId, userId),
        eq(transferRequests.sellerId, userId)
      )
    );
  } else {
    condition = or(
      inArray(transferRequests.status, activeStatuses),
      inArray(transferRequests.blockchainStatus, activeBlockchain)
    );
  }

  return await db.query.transferRequests.findMany({
    where: condition,
    with: {
      land: true,
      buyer: { columns: { password: false } },
      seller: { columns: { password: false } },
      payment: true
    },
    orderBy: [desc(transferRequests.createdAt)]
  });
};

/* ============================================================
   🔥 COMPLETED TRANSFERS (NEW)
============================================================ */
export const getCompletedTransfersService = async (
  userId: number,
  userRole: string
) => {
  let condition;

  if (userRole === "citizen") {
    condition = and(
      eq(transferRequests.status, "completed"),
      or(
        eq(transferRequests.buyerId, userId),
        eq(transferRequests.sellerId, userId)
      )
    );
  } else {
    condition = eq(transferRequests.status, "completed");
  }

  return await db.query.transferRequests.findMany({
    where: condition,
    with: {
      land: true,
      buyer: { columns: { password: false } },
      seller: { columns: { password: false } },
      payment: true
    },
    orderBy: [desc(transferRequests.createdAt)]
  });
};

/* ============================================================
   🔥 FAILED TRANSFERS (NEW - IMPORTANT)
============================================================ */
export const getFailedTransfersService = async (
  userId: number,
  userRole: string
) => {
  let condition;

  if (userRole === "citizen") {
    condition = and(
      eq(transferRequests.blockchainStatus, "failed"),
      or(
        eq(transferRequests.buyerId, userId),
        eq(transferRequests.sellerId, userId)
      )
    );
  } else {
    condition = eq(transferRequests.blockchainStatus, "failed");
  }

  return await db.query.transferRequests.findMany({
    where: condition,
    with: {
      land: true,
      buyer: { columns: { password: false } },
      seller: { columns: { password: false } },
      payment: true
    },
    orderBy: [desc(transferRequests.createdAt)]
  });
};

/* ============================================================
   🔥 SINGLE TRANSFER DETAIL (TRACKING PAGE)
============================================================ */
export const getTransferByIdService = async (id: number) => {
  return await db.query.transferRequests.findFirst({
    where: eq(transferRequests.id, id),
    with: {
      land: true,
      buyer: {
        columns: {
          id: true,
          fullName: true,
          walletAddress: true,
          email: true,
          phone: true
        }
      },
      seller: {
        columns: {
          id: true,
          fullName: true,
          walletAddress: true,
          email: true,
          phone: true
        }
      },
      payment: true
    }
  });
};

/* ============================================================
    SELLER HISTORY
============================================================ */
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