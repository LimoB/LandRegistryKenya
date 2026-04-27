import { Request, Response, NextFunction } from "express";
import {
  getSellerTransfersService,
  getTransferByIdService,
  getUserTransfersService // You'll need to add this to your services
} from "../services/index";
import { getUserId } from "../../utils/auth.util";

/**
 * NEW: Fetches ALL transfers (Purchases & Sales) for the logged-in user
 * This fixes the issue where previous/other requests don't appear.
 */
export const getMyTransfers = async (req: Request, res: Response, next: NextFunction) => {
  const requestId = Math.random().toString(36).substring(7);
  try {
    const userId = getUserId(req);
    
    if (!userId) {
      const error: any = new Error("Unauthorized: User ID not found.");
      error.statusCode = 401;
      throw error;
    }

    // This service should query: WHERE buyerId = userId OR sellerId = userId
    const transfers = await getUserTransfersService(userId);

    return res.status(200).json({
      success: true,
      count: transfers.length,
      data: transfers
    });
  } catch (error: any) {
    console.error(`[Error] getMyTransfers failed:`, error.message);
    next(error);
  }
};

/**
 * Existing: Fetches only sales requests
 */
export const getMySales = async (req: Request, res: Response, next: NextFunction) => {
  const requestId = Math.random().toString(36).substring(7);
  try {
    const sellerId = getUserId(req);
    
    if (!sellerId) {
      const error: any = new Error("Unauthorized: Seller ID not found.");
      error.statusCode = 401;
      throw error;
    }

    const sales = await getSellerTransfersService(sellerId);

    return res.status(200).json({
      success: true,
      count: sales.length,
      data: sales
    });
  } catch (error: any) {
    next(error);
  }
};

/**
 * Fetches details for a specific transfer record by ID
 */
export const getTransferById = async (req: Request, res: Response, next: NextFunction) => {
  const transferIdStr = req.params.id;
  try {
    const transferId = Number(transferIdStr);

    if (isNaN(transferId)) {
      const error: any = new Error("Invalid Transfer ID format.");
      error.statusCode = 400;
      throw error;
    }

    const transfer = await getTransferByIdService(transferId);
    
    if (!transfer) {
      const error: any = new Error("Transfer record not found.");
      error.statusCode = 404;
      throw error;
    }

    return res.status(200).json({
      success: true,
      data: transfer
    });
  } catch (error: any) {
    next(error);
  }
};