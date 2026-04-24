import { Request, Response, NextFunction } from "express";
import { createTransferRequestService } from "../services/index";
import { getUserId } from "../../utils/auth.util";

/**
 * Initiates a land ownership transfer request
 */
export const initiateTransfer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const buyerId = getUserId(req);

    // 1. Authorization Check
    if (!buyerId) {
      const error: any = new Error("Unauthorized: Buyer identification failed.");
      error.statusCode = 401;
      throw error;
    }

    const { landId } = req.body;

    // 2. Validation Check
    if (!landId) {
      const error: any = new Error("landId is required to initiate a transfer.");
      error.statusCode = 400;
      throw error;
    }

    // 3. Service Call
    const request = await createTransferRequestService(
      buyerId,
      Number(landId)
    );

    // 4. Success Response
    return res.status(201).json({
      success: true,
      message: "Transfer request initiated successfully",
      data: request // Wrapping in 'data' for consistency with your other routes
    });

  } catch (error: any) {
    // If the service throws a specific error (e.g., land already sold),
    // ensure it has a 400 status if no other status is set.
    if (!error.statusCode) error.statusCode = 400;
    
    // Pass to globalErrorHandler middleware
    next(error);
  }
};