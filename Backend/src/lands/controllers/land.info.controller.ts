import { Request, Response, NextFunction } from "express";
import { 
  getLandByLRService, 
  getMarketplaceLandsService, 
  getMyLandsService 
} from "../services/index";
import { getUserId } from "../../utils/auth.util";

/**
 * Fetch a specific land parcel by its LR Number
 */
export const getLandByLR = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lrNumber = Array.isArray(req.params.lrNumber) 
      ? req.params.lrNumber[0] 
      : req.params.lrNumber;

    if (!lrNumber) {
      const error: any = new Error("LR number is required");
      error.statusCode = 400;
      throw error;
    }

    const land = await getLandByLRService(lrNumber);
    
    if (!land) {
      const error: any = new Error("Land record not found");
      error.statusCode = 404;
      throw error;
    }

    return res.status(200).json({ success: true, data: land });
  } catch (error: any) {
    next(error);
  }
};

/**
 * Fetch all lands currently listed on the marketplace
 */
export const getMarketplaceLands = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await getMarketplaceLandsService();
    return res.status(200).json({ 
      success: true, 
      count: data.length, 
      data 
    });
  } catch (error: any) {
    next(error);
  }
};

/**
 * Fetch all lands owned by the currently authenticated user
 */
export const getMyLands = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    
    if (!userId) {
      const error: any = new Error("Unauthorized: User ID not found in token");
      error.statusCode = 401;
      throw error;
    }

    const data = await getMyLandsService(userId);
    return res.status(200).json({ 
      success: true, 
      count: data.length, 
      data 
    });
  } catch (error: any) {
    next(error);
  }
};