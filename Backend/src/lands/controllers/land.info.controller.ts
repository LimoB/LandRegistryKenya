import { Request, Response } from "express";
import { 
  getLandByLRService, 
  getMarketplaceLandsService, 
  getMyLandsService 
} from "../services/index";
import { getUserId } from "../../utils/auth.util";

export const getLandByLR = async (req: Request, res: Response) => {
  try {
    const lrNumber = Array.isArray(req.params.lrNumber) ? req.params.lrNumber[0] : req.params.lrNumber;
    if (!lrNumber) return res.status(400).json({ success: false, error: "LR number is required" });

    const land = await getLandByLRService(lrNumber);
    if (!land) return res.status(404).json({ success: false, error: "Land not found" });

    res.status(200).json({ success: true, data: land });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getMarketplaceLands = async (_req: Request, res: Response) => {
  try {
    const data = await getMarketplaceLandsService();
    res.status(200).json({ success: true, count: data.length, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getMyLands = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ success: false, error: "Unauthorized" });

    const data = await getMyLandsService(userId);
    res.status(200).json({ success: true, count: data.length, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};