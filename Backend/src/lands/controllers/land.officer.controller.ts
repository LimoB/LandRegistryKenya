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

    // 2. Call Service (Blockchain + DB)
    const result = await verifyLandService(landId, officerId);

    // 3. Return Success
    return res.status(200).json(result);
    
  } catch (error: any) {
    // Determine if it's a blockchain-specific data issue
    const isBlockchainDataError = 
      error.message.includes("ENS") || 
      error.message.includes("address") || 
      error.message.includes("wallet") ||
      error.message.includes("mint failed");

    if (isBlockchainDataError) {
      error.statusCode = 422; // Unprocessable Entity
      error.message = `Blockchain Minting Failed: Check owner's wallet address. Details: ${error.message}`;
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
    // Pass the error to the globalErrorHandler middleware
    next(error);
  }
};