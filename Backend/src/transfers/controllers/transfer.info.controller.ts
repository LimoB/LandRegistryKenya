import { Request, Response, NextFunction } from "express";
import {
  getSellerTransfersService,
  getTransferByIdService,
  getUserTransfersService
} from "../services/index";
import { getUserId } from "../../utils/auth.util";

/* ============================================================
   1. GET ALL USER TRANSFERS (BUY + SELL)
============================================================ */
export const getMyTransfers = async (req: Request, res: Response, next: NextFunction) => {
  const traceId = Math.random().toString(36).substring(7);

  try {
    console.log(`\x1b[36m[Controller]\x1b[0m Fetching ALL transfers (Trace: ${traceId})`);

    const userId = getUserId(req);

    if (!userId) {
      console.warn(`\x1b[33m[Auth]\x1b[0m Missing userId (Trace: ${traceId})`);
      const error: any = new Error("Unauthorized: User ID not found.");
      error.statusCode = 401;
      throw error;
    }

    console.log(`[Data] User ID: ${userId}`);

    const transfers = await getUserTransfersService(userId);

    console.log(`\x1b[32m[Success]\x1b[0m Found ${transfers.length} transfers`);

    return res.status(200).json({
      success: true,
      count: transfers.length,
      data: transfers
    });

  } catch (error: any) {
    console.error(`\x1b[31m[Error]\x1b[0m getMyTransfers failed (Trace: ${traceId}):`, error.message);
    next(error);
  }
};

/* ============================================================
   2. GET MY SALES (SELLER SIDE)
============================================================ */
export const getMySales = async (req: Request, res: Response, next: NextFunction) => {
  const traceId = Math.random().toString(36).substring(7);

  try {
    console.log(`\x1b[35m[Controller]\x1b[0m Fetching SALES (Trace: ${traceId})`);

    const sellerId = getUserId(req);

    if (!sellerId) {
      console.warn(`\x1b[33m[Auth]\x1b[0m Missing sellerId (Trace: ${traceId})`);
      const error: any = new Error("Unauthorized: Seller ID not found.");
      error.statusCode = 401;
      throw error;
    }

    console.log(`[Data] Seller ID: ${sellerId}`);

    const sales = await getSellerTransfersService(sellerId);

    console.log(`\x1b[32m[Success]\x1b[0m Found ${sales.length} sales`);

    return res.status(200).json({
      success: true,
      count: sales.length,
      data: sales
    });

  } catch (error: any) {
    console.error(`\x1b[31m[Error]\x1b[0m getMySales failed (Trace: ${traceId}):`, error.message);
    next(error);
  }
};

/* ============================================================
   3. GET TRANSFER BY ID (DETAIL VIEW)
============================================================ */
export const getTransferById = async (req: Request, res: Response, next: NextFunction) => {
  const traceId = Math.random().toString(36).substring(7);

  try {
    const transferIdStr = req.params.id;

    console.log(`\x1b[34m[Controller]\x1b[0m Fetching Transfer Detail (Trace: ${traceId})`);
    console.log(`[Data] Transfer ID (raw): ${transferIdStr}`);

    const transferId = Number(transferIdStr);

    if (isNaN(transferId)) {
      console.warn(`\x1b[33m[Validation]\x1b[0m Invalid transferId format`);
      const error: any = new Error("Invalid Transfer ID format.");
      error.statusCode = 400;
      throw error;
    }

    const transfer = await getTransferByIdService(transferId);

    if (!transfer) {
      console.warn(`\x1b[33m[Not Found]\x1b[0m Transfer ${transferId} not found`);
      const error: any = new Error("Transfer record not found.");
      error.statusCode = 404;
      throw error;
    }

    console.log(`\x1b[32m[Success]\x1b[0m Transfer ${transferId} retrieved`);

    return res.status(200).json({
      success: true,
      data: transfer
    });

  } catch (error: any) {
    console.error(`\x1b[31m[Error]\x1b[0m getTransferById failed (Trace: ${traceId}):`, error.message);
    next(error);
  }
};