import { Request, Response, NextFunction } from "express";
import { verifyLandService, getAllLandsService } from "../services/index";
import { getUserId } from "../../utils/auth.util";

/**
 * Verifies land and mints on-chain
 */
export const verifyLand = async (req: Request, res: Response, next: NextFunction) => {
  const landId = Number(req.params.id);
  
  try {
    const officerId = getUserId(req);
    
    // 1. Validation Checks
    if (!officerId) {
      const error: any = new Error("Unauthorized: Please log in again.");
      error.statusCode = 401;
      throw error;
    }
    
    if (isNaN(landId)) {
      const error: any = new Error("Invalid Land ID provided.");
      error.statusCode = 400;
      throw error;
    }

    // 2. Call Service (Blockchain + DB Update)
    // The service now returns a structured success object { success, message, land }
    const result = await verifyLandService(landId, officerId);

    // 3. Return Success (200 OK)
    // This triggers the success toast on your frontend
    return res.status(200).json(result);
    
  } catch (error: any) {
    console.error(`[CONTROLLER ERROR] Land Verification Failed for ID ${landId}:`, error.message);

    // 4. Enhanced Error Classification
    // Determine if the error is a data conflict (422) or a server crash (500)
    const isDataConflict = 
      error.message.includes("already exists") || 
      error.message.includes("address") || 
      error.message.includes("wallet") ||
      error.message.includes("invalid") ||
      error.message.includes("mint failed");

    if (isDataConflict) {
      error.statusCode = 422; // Unprocessable Entity (Blockchain/Data logic issue)
    } else {
      error.statusCode = error.statusCode || 500;
    }

    // Pass the error to the globalErrorHandler middleware
    next(error);
  }
};

/**
 * Retrieves all land records
 */
export const getLands = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await getAllLandsService();
    return res.status(200).json({ 
      success: true, 
      count: data.length, 
      data 
    });
  } catch (error: any) {
    next(error);
  }
};