import { Request, Response, NextFunction } from "express";
import {
  approveTransferService,
  rejectTransferService,
  finalizeTransferService,
  getPendingTransfersService
} from "../services/index";
import { getUserId } from "../../utils/auth.util";

/**
 * Step 1: Officer approves the initial transfer request
 */
export const approveTransfer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const officerId = getUserId(req);
    if (!officerId) {
      const error: any = new Error("Unauthorized: Officer ID required");
      error.statusCode = 401;
      throw error;
    }

    const result = await approveTransferService(Number(req.params.id), officerId);
    
    return res.status(200).json({
      success: true,
      message: "Transfer approved and moved to pending finalization",
      data: result
    });
  } catch (error: any) {
    next(error);
  }
};

/**
 * Officer rejects a transfer request (e.g., due to document issues)
 */
export const rejectTransfer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const officerId = getUserId(req);
    const { reason } = req.body;

    if (!officerId) {
      const error: any = new Error("Unauthorized");
      error.statusCode = 401;
      throw error;
    }

    if (!reason) {
      const error: any = new Error("A reason for rejection must be provided.");
      error.statusCode = 400;
      throw error;
    }

    const result = await rejectTransferService(Number(req.params.id), officerId, reason);
    
    return res.status(200).json({
      success: true,
      message: "Transfer request rejected",
      data: result
    });
  } catch (error: any) {
    next(error);
  }
};

/**
 * Step 2: Finalize the transfer (The Blockchain Step)
 * This triggers the actual ownership change on the smart contract.
 */
export const finalizeTransfer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const officerId = getUserId(req);
    if (!officerId) {
      const error: any = new Error("Unauthorized");
      error.statusCode = 401;
      throw error;
    }

    const result = await finalizeTransferService(Number(req.params.id), officerId);
    
    return res.status(200).json({
      success: true,
      message: "Transfer finalized successfully on the blockchain",
      data: result
    });
  } catch (error: any) {
    // If it's a blockchain error, we flag it as 500 or 422 for the handler
    if (error.message.includes("Blockchain") || error.message.includes("contract")) {
      error.statusCode = 500;
    }
    next(error);
  }
};

/**
 * Fetch all transfers currently awaiting officer action
 */
export const getPending = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await getPendingTransfersService();
    
    return res.status(200).json({
      success: true,
      count: data.length,
      data: data
    });
  } catch (error: any) {
    next(error);
  }
};