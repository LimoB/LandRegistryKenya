import { eq, and, isNull, or, desc } from "drizzle-orm";
import db from "../../drizzle/db";
import { 
  transferRequests, 
  lands, 
  auditLogs, 
  landOwnershipHistory 
} from "../../drizzle/schema";

import { transferLandOnChain } from "@/blockchain/blockchain.adapter";
import { getTransferByIdService } from "./transfer.query.service";

/* ============================================================
   LIST PENDING TRANSFERS
============================================================ */
export const getPendingTransfersService = async (userId: number, userRole: string) => {
  const statusCondition = eq(transferRequests.status, "pending");

  const finalCondition =
    userRole === "citizen"
      ? and(
          statusCondition,
          or(
            eq(transferRequests.buyerId, userId),
            eq(transferRequests.sellerId, userId)
          )
        )
      : statusCondition;

  return await db.query.transferRequests.findMany({
    where: finalCondition,
    with: { land: true, buyer: true, seller: true },
    orderBy: [desc(transferRequests.createdAt)]
  });
};

/* ============================================================
   APPROVE TRANSFER
============================================================ */
export const approveTransferService = async (transferId: number, officerId: number) => {
  const transfer = await getTransferByIdService(transferId);
  if (!transfer || transfer.status !== "pending") throw new Error("Invalid state");

  return await db.transaction(async (tx) => {
    await tx.update(transferRequests)
      .set({ status: "payment_pending" })
      .where(eq(transferRequests.id, transferId));

    await tx.insert(auditLogs).values({
      actionType: "TRANSFER_APPROVED",
      performedBy: officerId,
      landId: transfer.landId,
      metadata: { transferId }
    });

    return { message: "Approved. Awaiting payment." };
  });
};

/* ============================================================
   MARK AS PAID → TRIGGER FINALIZATION
============================================================ */
export const markTransferAsPaidService = async (
  transferId: number,
  paymentMethod: "stripe" | "mpesa",
  reference?: string
) => {
  const transfer = await getTransferByIdService(transferId);

  const valid =
    transfer?.status === "payment_pending" ||
    transfer?.status === "approved";

  if (!transfer || !valid) throw new Error("Invalid payment state");

  await db.transaction(async (tx) => {
    await tx.update(transferRequests)
      .set({
        status: "paid",
        mpesaReceiptCode: paymentMethod === "mpesa" ? reference : undefined,
        blockchainStatus: "pending"
      })
      .where(eq(transferRequests.id, transferId));

    await tx.insert(auditLogs).values({
      actionType: "PAYMENT_CONFIRMED",
      performedBy: transfer.buyerId,
      landId: transfer.landId,
      metadata: { transferId, paymentMethod, reference }
    });
  });

  return await finalizeTransferService(transferId);
};

/* ============================================================
   🔥 FINALIZE TRANSFER (SAFE ENGINE)
============================================================ */
export const finalizeTransferService = async (transferId: number) => {
  const transfer = await getTransferByIdService(transferId);
  if (!transfer) throw new Error("Transfer not found");

  /* 🛑 IDEMPOTENCY GUARD */
  if (transfer.status === "completed") {
    console.log("[Finalize] Already completed");
    return { success: true, txHash: transfer.blockchainTxHash };
  }

  if (transfer.blockchainStatus === "processing") {
    throw new Error("Transfer already in progress");
  }

  if (transfer.status !== "paid") {
    throw new Error("Transfer must be PAID");
  }

  if (!transfer.land.onChainId) {
    throw new Error("Land not on blockchain");
  }

  /* 🔒 LOCK ROW (PREVENT DOUBLE EXECUTION) */
  await db.update(transferRequests)
    .set({ blockchainStatus: "processing" })
    .where(eq(transferRequests.id, transferId));

  try {
    console.log(`[Blockchain] Executing transfer for LR: ${transfer.land.lrNumber}`);

    const bcTx = await transferLandOnChain(
      transfer.land.onChainId,
      transfer.buyer.walletAddress,
      transfer.mpesaReceiptCode || "STRIPE_PAYMENT"
    );

    /* 🔒 ATOMIC FINALIZATION */
    return await db.transaction(async (trx) => {

      // Close previous ownership
      await trx.update(landOwnershipHistory)
        .set({ toDate: new Date() })
        .where(and(
          eq(landOwnershipHistory.landId, transfer.landId),
          isNull(landOwnershipHistory.toDate)
        ));

      // Insert new ownership
      await trx.insert(landOwnershipHistory).values({
        landId: transfer.landId,
        fromOwnerId: transfer.sellerId,
        toOwnerId: transfer.buyerId,
        fromWallet: transfer.seller.walletAddress,
        toWallet: transfer.buyer.walletAddress,
        blockchainTxHash: bcTx.hash,
      });

      // Update land
      await trx.update(lands)
        .set({
          ownerId: transfer.buyerId,
          currentOwnerWallet: transfer.buyer.walletAddress,
          isForSale: false,
          blockchainTxHash: bcTx.hash,
          updatedAt: new Date()
        })
        .where(eq(lands.id, transfer.landId));

      // Complete transfer
      await trx.update(transferRequests)
        .set({
          status: "completed",
          blockchainTxHash: bcTx.hash,
          blockchainStatus: "confirmed"
        })
        .where(eq(transferRequests.id, transferId));

      // Audit log
      await trx.insert(auditLogs).values({
        actionType: "TRANSFER_COMPLETED",
        performedBy: transfer.buyerId,
        landId: transfer.landId,
        blockchainTxHash: bcTx.hash,
        metadata: {
          transferId,
          seller: transfer.seller.fullName,
          buyer: transfer.buyer.fullName
        }
      });

      console.log("[Success] Transfer completed ✅");

      return {
        success: true,
        txHash: bcTx.hash
      };
    });

  } catch (error) {
    console.error("[Blockchain Failed]", error);

    await db.update(transferRequests)
      .set({ blockchainStatus: "failed" })
      .where(eq(transferRequests.id, transferId));

    throw error;
  }
};

/* ============================================================
   REJECT TRANSFER
============================================================ */
export const rejectTransferService = async (
  transferId: number,
  officerId: number,
  reason: string
) => {
  return await db.transaction(async (tx) => {
    const [updated] = await tx.update(transferRequests)
      .set({ status: "rejected" })
      .where(eq(transferRequests.id, transferId))
      .returning();

    if (!updated) throw new Error("Transfer not found");

    await tx.insert(auditLogs).values({
      actionType: "TRANSFER_REJECTED",
      performedBy: officerId,
      landId: updated.landId,
      metadata: { reason, transferId }
    });

    return { message: "Transfer rejected" };
  });
};