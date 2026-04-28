import { Request, Response } from "express";
import db from "../../drizzle/db";
import { transferRequests } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

import { transferLandOnChain } from "../../blockchain/blockchain.adapter";

export const retryBlockchainTransfer = async (req: Request, res: Response) => {
  const transferId = Number(req.params.id);

  if (!transferId || isNaN(transferId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid transfer ID",
    });
  }

  try {
    console.log(`[Retry] Requested for transfer ${transferId}`);

    /* ============================
       FETCH TRANSFER
    ============================ */
    const transfer = await db.query.transferRequests.findFirst({
      where: eq(transferRequests.id, transferId),
      with: {
        land: true,
        buyer: true,
      },
    });

    if (!transfer) {
      return res.status(404).json({
        success: false,
        message: "Transfer not found",
      });
    }

    /* ============================
       STRICT VALIDATIONS
    ============================ */

    if (transfer.blockchainStatus !== "failed") {
      return res.status(400).json({
        success: false,
        message: "Only failed transfers can be retried",
      });
    }

    if (transfer.blockchainTxHash) {
      return res.status(400).json({
        success: false,
        message: "Transaction already submitted. Wait for confirmation.",
      });
    }

    if (!transfer.land?.onChainId) {
      return res.status(400).json({
        success: false,
        message: "Land not on blockchain",
      });
    }

    if (!transfer.buyer?.walletAddress) {
      return res.status(400).json({
        success: false,
        message: "Buyer wallet missing",
      });
    }

    if (!transfer.mpesaReceiptCode) {
      return res.status(400).json({
        success: false,
        message: "Missing payment reference (mpesaReceiptCode)",
      });
    }

    console.log("[Retry] Using reference:", transfer.mpesaReceiptCode);

    /* ============================
       ATOMIC STATE LOCK
    ============================ */
    const updated = await db.update(transferRequests)
      .set({ blockchainStatus: "processing" })
      .where(and(
        eq(transferRequests.id, transferId),
        eq(transferRequests.blockchainStatus, "failed")
      ))
      .returning();

    if (!updated.length) {
      return res.status(409).json({
        success: false,
        message: "Transfer is already being processed by another request",
      });
    }

    /* ============================
       CALL BLOCKCHAIN
    ============================ */
    let txResult;

    try {
      console.log("[Retry] Sending transaction...");

      txResult = await transferLandOnChain(
        transfer.land.onChainId,
        transfer.buyer.walletAddress,
        transfer.mpesaReceiptCode // CRITICAL FIX
      );

    } catch (blockchainError: any) {
      console.error("[Blockchain Error]", blockchainError);

      await db.update(transferRequests)
        .set({ blockchainStatus: "failed" })
        .where(eq(transferRequests.id, transferId));

      return res.status(500).json({
        success: false,
        message: "Blockchain transaction failed",
        error: blockchainError?.message,
      });
    }

    console.log("[Retry] TX HASH:", txResult.hash);

    /* ============================
       MARK AS SUBMITTED
    ============================ */
    await db.update(transferRequests)
      .set({
        blockchainStatus: "submitted",
        blockchainTxHash: txResult.hash,
      })
      .where(eq(transferRequests.id, transferId));

    return res.json({
      success: true,
      message: "Blockchain retry submitted successfully",
      txHash: txResult.hash,
    });

  } catch (error: any) {
    console.error("[Retry Fatal Error]", error);

    await db.update(transferRequests)
      .set({ blockchainStatus: "failed" })
      .where(eq(transferRequests.id, transferId));

    return res.status(500).json({
      success: false,
      message: "Retry failed",
      error: error?.message || "Unknown error",
    });
  }
};