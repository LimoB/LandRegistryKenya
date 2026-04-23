import { Request, Response } from "express";
import {
  getSellerTransfersService,
  getTransferByIdService
} from "../services/index";
import { getUserId } from "../../utils/auth.util";

export const getMySales = async (req: Request, res: Response) => {
  try {
    const sellerId = getUserId(req);
    if (!sellerId) return res.status(401).json({ error: "Unauthorized" });

    const sales = await getSellerTransfersService(sellerId);
    return res.status(200).json(sales);
  } catch {
    return res.status(500).json({ error: "Failed to fetch sales history" });
  }
};

export const getTransferById = async (req: Request, res: Response) => {
  try {
    const transfer = await getTransferByIdService(Number(req.params.id));
    if (!transfer) return res.status(404).json({ error: "Transfer not found" });

    return res.status(200).json(transfer);
  } catch {
    return res.status(500).json({ error: "Failed to fetch transfer" });
  }
};