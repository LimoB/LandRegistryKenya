import { Request, Response } from "express";
import {
  approveTransferService,
  rejectTransferService,
  finalizeTransferService,
  getPendingTransfersService
} from "../services/index";
import { getUserId } from "../../utils/auth.util";

export const approveTransfer = async (req: Request, res: Response) => {
  try {
    const officerId = getUserId(req);
    if (!officerId) return res.status(401).json({ error: "Unauthorized" });

    const result = await approveTransferService(Number(req.params.id), officerId);
    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(400).json({ error: error.message || "Failed to approve" });
  }
};

export const rejectTransfer = async (req: Request, res: Response) => {
  try {
    const officerId = getUserId(req);
    if (!officerId) return res.status(401).json({ error: "Unauthorized" });

    const { reason } = req.body;
    if (!reason) return res.status(400).json({ error: "Reason required" });

    const result = await rejectTransferService(Number(req.params.id), officerId, reason);
    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(400).json({ error: error.message || "Failed to reject" });
  }
};

export const finalizeTransfer = async (req: Request, res: Response) => {
  try {
    const officerId = getUserId(req);
    if (!officerId) return res.status(401).json({ error: "Unauthorized" });

    const result = await finalizeTransferService(Number(req.params.id), officerId);
    return res.status(200).json(result);
  } catch (error: any) {
    const message = error.message || "Failed to finalize";
    const statusCode = message.includes("Blockchain") ? 500 : 400;
    return res.status(statusCode).json({ error: message });
  }
};

export const getPending = async (_req: Request, res: Response) => {
  try {
    const data = await getPendingTransfersService();
    return res.status(200).json(data);
  } catch {
    return res.status(500).json({ error: "Failed to fetch pending transfers" });
  }
};