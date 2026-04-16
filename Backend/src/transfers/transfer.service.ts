import { eq, and, desc } from "drizzle-orm";
import db from "../drizzle/db";
import {
  transferRequests,
  lands,
  auditLogs,
  payments,
  landOwnershipHistory
} from "../drizzle/schema";

import { transferLandOnChain } from "@/blockchain/landRegistry";

/* ================================
   CREATE TRANSFER REQUEST
================================ */
export const createTransferRequestService = async (buyerId: number, landId: number) => {
  // 1. Get land
  const land = await db.query.lands.findFirst({
    where: eq(lands.id, landId)
  });

  if (!land) throw new Error("Land not found");

  // 2. Validate
  if (land.ownerId === buyerId) {
    throw new Error("You already own this land");
  }

  if (!land.isForSale) {
    throw new Error("Land is not for sale");
  }

  if (land.verificationStatus !== "verified") {
    throw new Error("Land is not verified");
  }

  // 3. Prevent duplicate pending request
  const existing = await db.query.transferRequests.findFirst({
    where: and(
      eq(transferRequests.landId, landId),
      eq(transferRequests.buyerId, buyerId),
      eq(transferRequests.status, "pending")
    )
  });

  if (existing) {
    throw new Error("You already have a pending request for this land");
  }

  // 4. Create request
  const [request] = await db.insert(transferRequests).values({
    landId,
    buyerId,
    sellerId: land.ownerId,
    status: "pending"
  }).returning();

  return request;
};

/* ================================
   GET TRANSFER BY ID
================================ */
export const getTransferByIdService = async (id: number) => {
  return await db.query.transferRequests.findFirst({
    where: eq(transferRequests.id, id),
    with: {
      land: true,
      buyer: { columns: { id: true, fullName: true, walletAddress: true } },
      seller: { columns: { id: true, fullName: true, walletAddress: true } },
      payment: true
    }
  });
};

/* ================================
   APPROVE TRANSFER (OFFICER)
================================ */
export const approveTransferService = async (transferId: number, officerId: number) => {
  const transfer = await getTransferByIdService(transferId);

  if (!transfer) throw new Error("Transfer not found");
  if (transfer.status !== "pending") throw new Error("Invalid state");

  // Move to payment stage
  await db.update(transferRequests)
    .set({ status: "payment_pending" })
    .where(eq(transferRequests.id, transferId));

  await db.insert(auditLogs).values({
    actionType: "TRANSFER_APPROVED",
    performedBy: officerId,
    landId: transfer.landId,
    metadata: { transferId }
  });

  return { message: "Transfer approved. Awaiting payment." };
};

/* ================================
   RECORD PAYMENT
================================ */
export const recordPaymentService = async (
  transferId: number,
  mpesaCode: string,
  amount: string
) => {
  const transfer = await getTransferByIdService(transferId);

  if (!transfer) throw new Error("Transfer not found");
  if (transfer.status !== "payment_pending") {
    throw new Error("Transfer not ready for payment");
  }

  // Create payment
  const [payment] = await db.insert(payments).values({
    transferRequestId: transferId,
    amount,
    paymentMethod: "mpesa",
    paymentStatus: "completed",
    mpesaReceiptCode: mpesaCode
  }).returning();

  // Update transfer
  await db.update(transferRequests)
    .set({
      status: "paid",
      mpesaReceiptCode: mpesaCode
    })
    .where(eq(transferRequests.id, transferId));

  await db.insert(auditLogs).values({
    actionType: "PAYMENT_COMPLETED",
    landId: transfer.landId,
    metadata: { transferId, amount }
  });

  return payment;
};

/* ================================
   FINALIZE TRANSFER (BLOCKCHAIN)
================================ */
export const finalizeTransferService = async (
  transferId: number,
  officerId: number
) => {
  const transfer = await getTransferByIdService(transferId);

  if (!transfer) throw new Error("Transfer not found");
  if (transfer.status !== "paid") throw new Error("Payment not completed");

  if (!transfer.land.onChainId) {
    throw new Error("Land not on blockchain");
  }

  if (!transfer.buyer.walletAddress) {
    throw new Error("Buyer has no wallet");
  }

  // 🔗 Blockchain first
  let tx;
  try {
    tx = await transferLandOnChain(
      transfer.land.onChainId,
      transfer.buyer.walletAddress,
      transfer.mpesaReceiptCode!
    );
  } catch (err: any) {
    throw new Error(`Blockchain failed: ${err.message}`);
  }

  // 💾 DB transaction
  return await db.transaction(async (trx) => {
    // Close old ownership
    await trx.update(landOwnershipHistory)
      .set({ toDate: new Date() })
      .where(
        and(
          eq(landOwnershipHistory.landId, transfer.landId),
          eq(landOwnershipHistory.toDate, null as any)
        )
      );

    // Add new ownership
    await trx.insert(landOwnershipHistory).values({
      landId: transfer.landId,
      ownerId: transfer.buyerId
    });

    // Update land
    await trx.update(lands)
      .set({
        ownerId: transfer.buyerId,
        isForSale: false,
        updatedAt: new Date()
      })
      .where(eq(lands.id, transfer.landId));

    // Update transfer
    await trx.update(transferRequests)
      .set({
        status: "completed",
        blockchainTxHash: tx.hash
      })
      .where(eq(transferRequests.id, transferId));

    // Audit
    await trx.insert(auditLogs).values({
      actionType: "TRANSFER_COMPLETED",
      performedBy: officerId,
      landId: transfer.landId,
      blockchainTxHash: tx.hash,
      metadata: { transferId }
    });

    return {
      message: "Transfer fully completed",
      txHash: tx.hash
    };
  });
};

/* ================================
   REJECT TRANSFER
================================ */
export const rejectTransferService = async (
  transferId: number,
  officerId: number,
  reason: string
) => {
  return await db.transaction(async (trx) => {
    const [updated] = await trx.update(transferRequests)
      .set({ status: "rejected" })
      .where(eq(transferRequests.id, transferId))
      .returning();

    if (!updated) throw new Error("Transfer not found");

    await trx.insert(auditLogs).values({
      actionType: "TRANSFER_REJECTED",
      performedBy: officerId,
      landId: updated.landId,
      metadata: { reason }
    });

    return { message: "Transfer rejected" };
  });
};

/* ================================
   GET PENDING TRANSFERS
================================ */
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

/* ================================
   GET SELLER TRANSFERS
================================ */
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