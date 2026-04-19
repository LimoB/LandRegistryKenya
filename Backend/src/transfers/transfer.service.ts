import { eq, and, desc, isNull } from "drizzle-orm";
import db from "../drizzle/db";
import {
  transferRequests,
  lands,
  auditLogs,
  landOwnershipHistory
} from "../drizzle/schema";

import { transferLandOnChain } from "@/blockchain/blockchain.adapter";

/* ============================================================
   CREATE TRANSFER REQUEST (FIXED + SAFE)
============================================================ */
export const createTransferRequestService = async (
  buyerId: number,
  landId: number
) => {
  const land = await db.query.lands.findFirst({
    where: eq(lands.id, landId)
  });

  if (!land) throw new Error("Land not found");

  /* ============================
     OWNERSHIP CHECK (FIXED)
  ============================ */
  if (land.ownerId === buyerId) {
    throw new Error("You already own this land");
  }

  /* ============================
     MARKET RULES
  ============================ */
  if (!land.isForSale) {
    throw new Error("Land is not for sale");
  }

  if (land.verificationStatus !== "verified") {
    throw new Error("Land is not verified");
  }

  /* ============================
     GLOBAL DUPLICATE LOCK (IMPORTANT FIX)
  ============================ */
  const existingAny = await db.query.transferRequests.findFirst({
    where: and(
      eq(transferRequests.landId, landId),
      eq(transferRequests.status, "pending")
    )
  });

  if (existingAny) {
    throw new Error("This land already has a pending transfer request");
  }

  /* ============================
     BUYER DUPLICATE CHECK
  ============================ */
  const existingBuyer = await db.query.transferRequests.findFirst({
    where: and(
      eq(transferRequests.landId, landId),
      eq(transferRequests.buyerId, buyerId),
      eq(transferRequests.status, "pending")
    )
  });

  if (existingBuyer) {
    throw new Error("You already have a pending request for this land");
  }

  /* ============================
     CREATE REQUEST
  ============================ */
  const [request] = await db
    .insert(transferRequests)
    .values({
      landId,
      buyerId,
      sellerId: land.ownerId,
      status: "pending"
    })
    .returning();

  /* ============================
     AUDIT LOG
  ============================ */
  await db.insert(auditLogs).values({
    actionType: "TRANSFER_REQUEST_CREATED",
    performedBy: buyerId,
    landId,
    metadata: { transferId: request.id }
  });

  return request;
};

/* ============================================================
   GET TRANSFER BY ID
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

/* ============================================================
   APPROVE TRANSFER
============================================================ */
export const approveTransferService = async (
  transferId: number,
  officerId: number
) => {
  const transfer = await getTransferByIdService(transferId);

  if (!transfer) throw new Error("Transfer not found");

  if (transfer.status !== "pending") {
    throw new Error("Invalid state transition");
  }

  await db
    .update(transferRequests)
    .set({ status: "payment_pending" })
    .where(eq(transferRequests.id, transferId));

  await db.insert(auditLogs).values({
    actionType: "TRANSFER_APPROVED",
    performedBy: officerId,
    landId: transfer.landId,
    metadata: { transferId }
  });

  return { message: "Transfer approved" };
};

/* ============================================================
   MARK AS PAID
============================================================ */
export const markTransferAsPaidService = async (
  transferId: number,
  paymentMethod: "stripe" | "mpesa",
  reference?: string
) => {
  const transfer = await getTransferByIdService(transferId);

  if (!transfer) throw new Error("Transfer not found");

  if (transfer.status !== "payment_pending") {
    throw new Error("Invalid payment state");
  }

  await db
    .update(transferRequests)
    .set({
      status: "paid",
      mpesaReceiptCode:
        paymentMethod === "mpesa" ? reference : undefined
    })
    .where(eq(transferRequests.id, transferId));

  await db.insert(auditLogs).values({
    actionType: "PAYMENT_CONFIRMED",
    performedBy: transfer.buyerId,
    landId: transfer.landId,
    metadata: { transferId, paymentMethod, reference }
  });

  return { message: "Payment confirmed" };
};

/* ============================================================
   FINALIZE TRANSFER (BLOCKCHAIN SAFE)
============================================================ */
export const finalizeTransferService = async (
  transferId: number,
  officerId: number
) => {
  const transfer = await getTransferByIdService(transferId);

  if (!transfer) throw new Error("Transfer not found");

  if (transfer.status !== "paid") {
    throw new Error("Transfer not paid yet");
  }

  if (!transfer.land.onChainId) {
    throw new Error("Land does not have a valid on-chain ID");
  }

  const tx = await transferLandOnChain(
    transfer.land.onChainId,
    transfer.buyer.walletAddress,
    transfer.mpesaReceiptCode || "payment"
  );

  return await db.transaction(async (trx) => {
    /* CLOSE OLD OWNERSHIP */
    await trx
      .update(landOwnershipHistory)
      .set({ toDate: new Date() })
      .where(
        and(
          eq(landOwnershipHistory.landId, transfer.landId),
          isNull(landOwnershipHistory.toDate)
        )
      );

    /* NEW OWNERSHIP */
    await trx.insert(landOwnershipHistory).values({
      landId: transfer.landId,
      fromOwnerId: transfer.sellerId,
      toOwnerId: transfer.buyerId
    });

    /* UPDATE LAND */
    await trx
      .update(lands)
      .set({
        ownerId: transfer.buyerId,
        isForSale: false,
        updatedAt: new Date()
      })
      .where(eq(lands.id, transfer.landId));

    /* COMPLETE TRANSFER */
    await trx
      .update(transferRequests)
      .set({
        status: "completed",
        blockchainTxHash: tx.hash
      })
      .where(eq(transferRequests.id, transferId));

    await trx.insert(auditLogs).values({
      actionType: "TRANSFER_COMPLETED",
      performedBy: officerId,
      landId: transfer.landId,
      blockchainTxHash: tx.hash,
      metadata: { transferId }
    });

    return {
      message: "Transfer completed",
      txHash: tx.hash
    };
  });
};

/* ============================================================
   REJECT TRANSFER
============================================================ */
export const rejectTransferService = async (
  transferId: number,
  officerId: number,
  reason: string
) => {
  const [updated] = await db
    .update(transferRequests)
    .set({ status: "rejected" })
    .where(eq(transferRequests.id, transferId))
    .returning();

  if (!updated) throw new Error("Transfer not found");

  await db.insert(auditLogs).values({
    actionType: "TRANSFER_REJECTED",
    performedBy: officerId,
    landId: updated.landId,
    metadata: { reason }
  });

  return { message: "Transfer rejected" };
};

/* ============================================================
   LISTING
============================================================ */
export const getPendingTransfersService = async () => {
  return await db.query.transferRequests.findMany({
    where: eq(transferRequests.status, "pending"),
    with: {
      land: true,
      buyer: true,
      seller: true
    },
    orderBy: (tr, { desc }) => [desc(tr.createdAt)]
  });
};

export const getSellerTransfersService = async (sellerId: number) => {
  return await db.query.transferRequests.findMany({
    where: eq(transferRequests.sellerId, sellerId),
    with: {
      land: true,
      buyer: true
    },
    orderBy: (tr, { desc }) => [desc(tr.createdAt)]
  });
};