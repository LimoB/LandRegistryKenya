import { eq, and, isNull } from "drizzle-orm";
import db from "../../drizzle/db";
import { transferRequests, lands, auditLogs, landOwnershipHistory } from "../../drizzle/schema";
import { transferLandOnChain } from "@/blockchain/blockchain.adapter";
import { getTransferByIdService } from "./transfer.query.service";

export const approveTransferService = async (transferId: number, officerId: number) => {
  const transfer = await getTransferByIdService(transferId);
  if (!transfer || transfer.status !== "pending") throw new Error("Invalid state transition");

  await db.update(transferRequests)
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

export const markTransferAsPaidService = async (
  transferId: number, 
  paymentMethod: "stripe" | "mpesa", 
  reference?: string
) => {
  const transfer = await getTransferByIdService(transferId);
  if (!transfer || transfer.status !== "payment_pending") throw new Error("Invalid payment state");

  await db.update(transferRequests)
    .set({
      status: "paid",
      mpesaReceiptCode: paymentMethod === "mpesa" ? reference : undefined
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

export const finalizeTransferService = async (transferId: number, officerId: number) => {
  const transfer = await getTransferByIdService(transferId);
  if (!transfer || transfer.status !== "paid") throw new Error("Transfer not paid yet");
  if (!transfer.land.onChainId) throw new Error("Land does not have a valid on-chain ID");

  const tx = await transferLandOnChain(
    transfer.land.onChainId,
    transfer.buyer.walletAddress,
    transfer.mpesaReceiptCode || "payment"
  );

  return await db.transaction(async (trx) => {
    // Close old ownership
    await trx.update(landOwnershipHistory).set({ toDate: new Date() })
      .where(and(eq(landOwnershipHistory.landId, transfer.landId), isNull(landOwnershipHistory.toDate)));

    // New ownership record
    await trx.insert(landOwnershipHistory).values({
      landId: transfer.landId,
      fromOwnerId: transfer.sellerId,
      toOwnerId: transfer.buyerId
    });

    // Update Land Table
    await trx.update(lands).set({ ownerId: transfer.buyerId, isForSale: false, updatedAt: new Date() })
      .where(eq(lands.id, transfer.landId));

    // Complete Request
    await trx.update(transferRequests).set({ status: "completed", blockchainTxHash: tx.hash })
      .where(eq(transferRequests.id, transferId));

    await trx.insert(auditLogs).values({
      actionType: "TRANSFER_COMPLETED",
      performedBy: officerId,
      landId: transfer.landId,
      blockchainTxHash: tx.hash,
      metadata: { transferId }
    });

    return { message: "Transfer completed", txHash: tx.hash };
  });
};

export const rejectTransferService = async (transferId: number, officerId: number, reason: string) => {
  const [updated] = await db.update(transferRequests).set({ status: "rejected" })
    .where(eq(transferRequests.id, transferId)).returning();

  if (!updated) throw new Error("Transfer not found");

  await db.insert(auditLogs).values({
    actionType: "TRANSFER_REJECTED",
    performedBy: officerId,
    landId: updated.landId,
    metadata: { reason }
  });

  return { message: "Transfer rejected" };
};