import { Request, Response, NextFunction } from "express";
import { createTransferRequestService } from "../services/index";
import { getUserId } from "../../utils/auth.util";

/**
 * Initiates a land ownership transfer request
 */
export const initiateTransfer = async (req: Request, res: Response, next: NextFunction) => {
  const traceId = Math.random().toString(36).substring(7);
  try {
    const buyerId = getUserId(req);
    const { landId } = req.body;

    console.log(`%c[Request] %cInitiate Transfer (Trace: ${traceId})`, "color: #a855f7; font-weight: bold;", "color: #94a3b8;");
    console.log(`[Data] Buyer ID: ${buyerId} | Land ID: ${landId}`);

    // 1. Authorization Check
    if (!buyerId) {
      console.warn(`%c[Auth] %cFailed to identify buyer for trace: ${traceId}`, "color: #f59e0b; font-weight: bold;", "color: #fca5a5;");
      const error: any = new Error("Unauthorized: Buyer identification failed.");
      error.statusCode = 401;
      throw error;
    }

    // 2. Input Validation
    if (!landId) {
      console.warn(`%c[Validation] %cMissing landId in request body.`, "color: #f59e0b; font-weight: bold;", "color: #fca5a5;");
      const error: any = new Error("landId is required to initiate a transfer.");
      error.statusCode = 400;
      throw error;
    }

    // 3. Service Call
    const request = await createTransferRequestService(
      buyerId,
      Number(landId)
    );

    console.log(`%c[Success] %cTransfer Request ${request.id} created successfully.`, "color: #10b981; font-weight: bold;", "color: #34d399;");

    // 4. Success Response
    return res.status(201).json({
      success: true,
      message: "Transfer request initiated successfully",
      data: request
    });

  } catch (error: any) {
    console.error(`%c[Error] %cinitiateTransfer failed (Trace: ${traceId}):`, "color: #ef4444; font-weight: bold;", "color: #f87171;", error.message);
    
    // Ensure we don't send a 500 for logic errors (like "land already sold")
    if (!error.statusCode) error.statusCode = 400;
    
    next(error);
  }
};