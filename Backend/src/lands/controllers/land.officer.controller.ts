import { Request, Response } from "express";
import { verifyLandService, getAllLandsService } from "../services/index";
import { getUserId } from "../../utils/auth.util";

export const verifyLand = async (req: Request, res: Response) => {
  const landId = Number(req.params.id);
  try {
    const officerId = getUserId(req);
    if (!officerId) return res.status(401).json({ success: false, error: "Unauthorized" });
    if (isNaN(landId)) return res.status(400).json({ success: false, error: "Invalid Land ID" });

    const result = await verifyLandService(landId, officerId);
    res.status(200).json({ success: true, ...result });
  } catch (error: any) {
    const isBlockchainDataError = error.message.includes("ENS") || error.message.includes("address");
    res.status(isBlockchainDataError ? 422 : 500).json({
      success: false,
      error: isBlockchainDataError 
        ? `Blockchain Minting Failed: Owner's wallet is invalid or missing.`
        : error.message || "Internal Server Error"
    });
  }
};

export const getLands = async (_req: Request, res: Response) => {
  try {
    const data = await getAllLandsService();
    res.status(200).json({ success: true, count: data.length, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};