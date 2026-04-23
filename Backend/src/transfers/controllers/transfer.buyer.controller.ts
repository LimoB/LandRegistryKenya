import { Request, Response } from "express";
import { createTransferRequestService } from "../services/index";
import { getUserId } from "../../utils/auth.util";

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