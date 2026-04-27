import { eq, and, isNull, or, desc } from "drizzle-orm";
import db from "../../drizzle/db";
import { transferRequests, lands, auditLogs, landOwnershipHistory } from "../../drizzle/schema";
import { transferLandOnChain } from "@/blockchain/blockchain.adapter";
import { getTransferByIdService } from "./transfer.query.service";

/**
 * Lists pending transfers with Role-Based filtering.
 * Fixes 403 by allowing Citizens to see their involved deals.
 */
export const getPendingTransfersService = async (userId: number, userRole: string) => {
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
 * LAND OFFICER: Approves the documentation.
 * Moves state from 'pending' to 'payment_pending'.
 */
export const approveTransferService = async (transferId: number, officerId: number) => {
  const transfer = await getTransferByIdService(transferId);
  if (!transfer || transfer.status !== "pending") throw new Error("Invalid state transition");

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

    return { message: "Transfer approved and moved to payment stage" };
  });
};

/**
 * SYSTEM/WEBHOOK: Marks the transfer as paid.
 * Can be called by Stripe Webhook or M-Pesa Service.
 */
export const markTransferAsPaidService = async (
  transferId: number, 
  paymentMethod: "stripe" | "mpesa", 
  reference?: string
) => {
  const transfer = await getTransferByIdService(transferId);
  // Allow transitions from both 'payment_pending' and 'approved' just in case
  const validStatus = transfer?.status === "payment_pending" || transfer?.status === "approved";
  
  if (!transfer || !validStatus) throw new Error("Invalid payment state");

  return await db.transaction(async (tx) => {
    await tx.update(transferRequests)
      .set({
        status: "paid",
        mpesaReceiptCode: paymentMethod === "mpesa" ? reference : undefined,
        blockchainStatus: "Awaiting Minting"
      })
      .where(eq(transferRequests.id, transferId));

    await tx.insert(auditLogs).values({
      actionType: "PAYMENT_CONFIRMED",
      performedBy: transfer.buyerId,
      landId: transfer.landId,
      metadata: { transferId, paymentMethod, reference }
    });

    return { success: true };
  });
};

/**
 * FINAL STEP: Blockchain Minting and Registry Update.
 * Triggered by Officer (or automatically) after payment.
 */
export const finalizeTransferService = async (transferId: number, officerId: number) => {
  const transfer = await getTransferByIdService(transferId);
  
  if (!transfer || transfer.status !== "paid") throw new Error("Transfer must be paid before finalization");
  if (!transfer.land.onChainId) throw new Error("Land not found on blockchain");

  // 1. Blockchain Interaction
  console.log(`\x1b[35m[Blockchain] Minting transfer for LR: ${transfer.land.lrNumber}...\x1b[0m`);
  const bcTx = await transferLandOnChain(
    transfer.land.onChainId,
    transfer.buyer.walletAddress,
    transfer.mpesaReceiptCode || "STRIPE_PAYMENT"
  );

  // 2. Atomic Database Update
  return await db.transaction(async (trx) => {
    // Close previous ownership duration
    await trx.update(landOwnershipHistory)
      .set({ toDate: new Date() })
      .where(and(
        eq(landOwnershipHistory.landId, transfer.landId), 
        isNull(landOwnershipHistory.toDate)
      ));

    // Create New Ownership Record
    await trx.insert(landOwnershipHistory).values({
      landId: transfer.landId,
      fromOwnerId: transfer.sellerId,
      toOwnerId: transfer.buyerId,
      fromWallet: transfer.seller.walletAddress,
      toWallet: transfer.buyer.walletAddress,
      blockchainTxHash: bcTx.hash,
    });

    // Update Land Table (Owner + Wallet sync)
    await trx.update(lands)
      .set({ 
        ownerId: transfer.buyerId, 
        currentOwnerWallet: transfer.buyer.walletAddress,
        isForSale: false,
        blockchainTxHash: bcTx.hash,
        updatedAt: new Date() 
      })
      .where(eq(lands.id, transfer.landId));

    // Complete the Request
    await trx.update(transferRequests)
      .set({ 
        status: "completed", 
        blockchainTxHash: bcTx.hash,
        blockchainStatus: "Confirmed" 
      })
      .where(eq(transferRequests.id, transferId));

    // Final Audit
    await trx.insert(auditLogs).values({
      actionType: "TRANSFER_COMPLETED",
      performedBy: officerId,
      landId: transfer.landId,
      blockchainTxHash: bcTx.hash,
      metadata: { transferId, method: "Blockchain_Minting" }
    });

    return { message: "Transfer completed successfully", txHash: bcTx.hash };
  });
};

/**
 * REJECT: Officer rejects the request.
 */
export const rejectTransferService = async (transferId: number, officerId: number, reason: string) => {
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