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
  const requestId = Math.random().toString(36).substring(7); // Unique trace ID
  try {
    const sellerId = getUserId(req);
    
    console.log(`%c[Query] %cgetMySales initiated. Trace: ${requestId}`, "color: #0ea5e9; font-weight: bold;", "color: #94a3b8;");

    if (!sellerId) {
      console.warn(`%c[Auth] %cUnauthorized access attempt to getMySales.`, "color: #f59e0b; font-weight: bold;", "color: #fca5a5;");
      const error: any = new Error("Unauthorized: Seller ID not found.");
      error.statusCode = 401;
      throw error;
    }

    const sales = await getSellerTransfersService(sellerId);

    console.log(`%c[Success] %cFound ${sales.length} sales for Seller ID: ${sellerId}`, "color: #10b981; font-weight: bold;", "color: #34d399;");

    return res.status(200).json({
      success: true,
      count: sales.length,
      data: sales
    });
  } catch (error: any) {
    console.error(`%c[Error] %cgetMySales failed (Trace: ${requestId}):`, "color: #ef4444; font-weight: bold;", "color: #f87171;", error.message);
    next(error);
  }
};

/**
 * Fetches details for a specific transfer record by ID
 */
export const getTransferById = async (req: Request, res: Response, next: NextFunction) => {
  const transferIdStr = req.params.id;
  try {
    console.log(`%c[Query] %cFetching transfer details for ID: ${transferIdStr}`, "color: #6366f1; font-weight: bold;", "color: #94a3b8;");

    const transferId = Number(transferIdStr);

    if (isNaN(transferId)) {
      console.warn(`%c[Validation] %cInvalid ID format received: ${transferIdStr}`, "color: #f59e0b; font-weight: bold;", "color: #fca5a5;");
      const error: any = new Error("Invalid Transfer ID format.");
      error.statusCode = 400;
      throw error;
    }

    const transfer = await getTransferByIdService(transferId);
    
    if (!transfer) {
      console.warn(`%c[Database] %cRecord ${transferId} not found in registry.`, "color: #f59e0b; font-weight: bold;", "color: #fca5a5;");
      const error: any = new Error("Transfer record not found.");
      error.statusCode = 404;
      throw error;
    }

    console.log(`%c[Success] %cData retrieved for Transfer ID: ${transferId}`, "color: #10b981; font-weight: bold;", "color: #34d399;");

    return res.status(200).json({
      success: true,
      data: transfer
    });
  } catch (error: any) {
    console.error(`%c[Error] %cgetTransferById failed for ID ${transferIdStr}:`, "color: #ef4444; font-weight: bold;", "color: #f87171;", error.message);
    next(error);
  }
};