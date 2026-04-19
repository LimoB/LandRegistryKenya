import { Request, Response } from "express";
import {
  createTransferRequestService,
  approveTransferService,
  getPendingTransfersService,
  getSellerTransfersService,
  rejectTransferService,
  finalizeTransferService,
  getTransferByIdService
} from "./transfer.service";

/* ============================================================
   SAFE USER EXTRACTOR (REUSABLE)
============================================================ */
const getUserId = (req: Request): number | null => {
  return (req as any)?.user?.userId || null;
};

/* ============================================================
   INITIATE TRANSFER (BUYER)
============================================================ */
export const initiateTransfer = async (req: Request, res: Response) => {
  try {
    const buyerId = getUserId(req);

    if (!buyerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { landId } = req.body;

    if (!landId) {
      return res.status(400).json({ error: "landId is required" });
    }

    // NOTE:
    // ❌ DO NOT check idempotency here
    // ✔ middleware already handles it

    const request = await createTransferRequestService(
      buyerId,
      Number(landId)
    );

    return res.status(201).json({
      message: "Transfer request created",
      request
    });
  } catch (error: any) {
    return res.status(400).json({
      error: error.message || "Failed to create transfer"
    });
  }
};

/* ============================================================
   APPROVE TRANSFER (OFFICER)
============================================================ */
export const approveTransfer = async (req: Request, res: Response) => {
  try {
    const officerId = getUserId(req);

    if (!officerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const result = await approveTransferService(
      Number(req.params.id),
      officerId
    );

    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(400).json({
      error: error.message || "Failed to approve transfer"
    });
  }
};

/* ============================================================
   FINALIZE TRANSFER (BLOCKCHAIN STEP)
============================================================ */
export const finalizeTransfer = async (req: Request, res: Response) => {
  try {
    const officerId = getUserId(req);

    if (!officerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const result = await finalizeTransferService(
      Number(req.params.id),
      officerId
    );

    return res.status(200).json(result);
  } catch (error: any) {
    const message = error.message || "Failed to finalize transfer";

    const statusCode = message.includes("Blockchain") ? 500 : 400;

    return res.status(statusCode).json({
      error: message
    });
  }
};

/* ============================================================
   REJECT TRANSFER
============================================================ */
export const rejectTransfer = async (req: Request, res: Response) => {
  try {
    const officerId = getUserId(req);

    if (!officerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        error: "Rejection reason is required"
      });
    }

    const result = await rejectTransferService(
      Number(req.params.id),
      officerId,
      reason
    );

    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(400).json({
      error: error.message || "Failed to reject transfer"
    });
  }
};

/* ============================================================
   GET PENDING TRANSFERS (OFFICER)
============================================================ */
export const getPending = async (_req: Request, res: Response) => {
  try {
    const data = await getPendingTransfersService();
    return res.status(200).json(data);
  } catch {
    return res.status(500).json({
      error: "Failed to fetch pending transfers"
    });
  }
};

/* ============================================================
   GET MY SALES (SELLER)
============================================================ */
export const getMySales = async (req: Request, res: Response) => {
  try {
    const sellerId = getUserId(req);

    if (!sellerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const sales = await getSellerTransfersService(sellerId);

    return res.status(200).json(sales);
  } catch {
    return res.status(500).json({
      error: "Failed to fetch sales history"
    });
  }
};

/* ============================================================
   GET TRANSFER BY ID (ALL ROLES)
============================================================ */
export const getTransferById = async (req: Request, res: Response) => {
  try {
    const transfer = await getTransferByIdService(Number(req.params.id));

    if (!transfer) {
      return res.status(404).json({
        error: "Transfer not found"
      });
    }

    return res.status(200).json(transfer);
  } catch {
    return res.status(500).json({
      error: "Failed to fetch transfer"
    });
  }
};