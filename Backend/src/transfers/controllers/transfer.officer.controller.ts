import { Request, Response, NextFunction } from "express";
import {
  approveTransferService,
  rejectTransferService,
  finalizeTransferService,
  getPendingTransfersService
} from "../services/index";
import { getUserId, getUserRole } from "../../utils/auth.util";

/**
 * Fetch pending transfers with Contextual Filtering
 */
export const getPending = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const userRole = getUserRole(req); 

    // 1. Validation Check: Ensure we have both ID and Role
    if (!userId || !userRole) {
      console.error(`[Auth Error] Missing credentials - ID: ${userId}, Role: ${userRole}`);
      const error: any = new Error("Unauthorized: Invalid session or missing permissions");
      error.statusCode = 401;
      throw error;
    }

    console.log(`%c[API] getPending hit by ${userRole} (ID: ${userId})`, "color: #4f46e5; font-weight: bold;");

    // 2. Service Call: TypeScript is now happy because userRole is guaranteed to be a string here
    const data = await getPendingTransfersService(userId, userRole);
    
    console.log(`[API] successfully retrieved ${data.length} records for ${userRole}`);

    return res.status(200).json({
      success: true,
      roleScope: userRole,
      count: data.length,
      data: data
    });
  } catch (error: any) {
    console.error("[API Error] getPending:", error.message);
    next(error);
  }
};

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
 * Officer rejects a transfer request
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
    if (error.message.includes("Blockchain") || error.message.includes("contract")) {
      error.statusCode = 500;
    }
    next(error);
  }
};