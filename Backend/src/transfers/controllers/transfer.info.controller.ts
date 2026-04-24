import { Request, Response, NextFunction } from "express";
import {
  getSellerTransfersService,
  getTransferByIdService
} from "../services/index";
import { getUserId } from "../../utils/auth.util";

/**
 * Fetches all sales/transfer requests for the logged-in seller
 */
export const getMySales = async (req: Request, res: Response, next: NextFunction) => {
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
    // Passes to your globalErrorHandler middleware
    next(error);
  }
};

/**
 * Fetches details for a specific transfer record by ID
 */
export const getTransferById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transferId = Number(req.params.id);

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