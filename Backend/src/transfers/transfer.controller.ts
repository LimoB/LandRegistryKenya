import { Request, Response } from "express";
import {
  createTransferRequestService,
  approveTransferService,
  getPendingTransfersService,
  getSellerTransfersService,
  rejectTransferService,
  recordPaymentService,
  finalizeTransferService,
  getTransferByIdService
} from "./transfer.service";

/* ================================
   INITIATE TRANSFER (Buyer)
================================ */
export const initiateTransfer = async (req: Request, res: Response) => {
  try {
    const { landId } = req.body;
    const buyerId = (req as any).user?.userId;

    if (!buyerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const request = await createTransferRequestService(buyerId, landId);

    res.status(201).json({
      message: "Transfer request created",
      request
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

/* ================================
   APPROVE TRANSFER (Officer)
================================ */
export const approveTransfer = async (req: Request, res: Response) => {
  try {
    const officerId = (req as any).user?.userId;

    if (!officerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const result = await approveTransferService(
      Number(req.params.id),
      officerId
    );

    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

/* ================================
   RECORD PAYMENT (Buyer/Admin)
================================ */
export const recordPayment = async (req: Request, res: Response) => {
  try {
    const { mpesaCode, amount } = req.body;

    const result = await recordPaymentService(
      Number(req.params.id),
      mpesaCode,
      amount
    );

    res.status(200).json({
      message: "Payment recorded successfully",
      payment: result
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

/* ================================
   FINALIZE TRANSFER (Officer)
================================ */
export const finalizeTransfer = async (req: Request, res: Response) => {
  try {
    const officerId = (req as any).user?.userId;

    if (!officerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const result = await finalizeTransferService(
      Number(req.params.id),
      officerId
    );

    res.status(200).json(result);
  } catch (error: any) {
    const statusCode = error.message.includes("Blockchain") ? 500 : 400;
    res.status(statusCode).json({ error: error.message });
  }
};

/* ================================
   REJECT TRANSFER (Officer)
================================ */
export const rejectTransfer = async (req: Request, res: Response) => {
  try {
    const officerId = (req as any).user?.userId;

    if (!officerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { reason } = req.body;

    const result = await rejectTransferService(
      Number(req.params.id),
      officerId,
      reason
    );

    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

/* ================================
   GET PENDING TRANSFERS (Officer)
================================ */
export const getPending = async (_req: Request, res: Response) => {
  try {
    const data = await getPendingTransfersService();
    res.status(200).json(data);
  } catch {
    res.status(500).json({ error: "Failed to fetch pending transfers" });
  }
};

/* ================================
   GET MY SALES (Seller)
================================ */
export const getMySales = async (req: Request, res: Response) => {
  try {
    const sellerId = (req as any).user?.userId;

    if (!sellerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const sales = await getSellerTransfersService(sellerId);

    res.status(200).json(sales);
  } catch {
    res.status(500).json({ error: "Failed to fetch sales history" });
  }
};

/* ================================
   GET TRANSFER BY ID
================================ */
export const getTransferById = async (req: Request, res: Response) => {
  try {
    const transfer = await getTransferByIdService(Number(req.params.id));

    if (!transfer) {
      return res.status(404).json({ error: "Transfer not found" });
    }

    res.status(200).json(transfer);
  } catch {
    res.status(500).json({ error: "Failed to fetch transfer" });
  }
};