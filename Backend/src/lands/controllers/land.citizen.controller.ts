import { Request, Response, NextFunction } from "express";
import { 
  createLandService, 
  listLandForSaleService, 
  removeLandFromSaleService 
} from "../services/index";
import { uploadToIPFS } from "../../utils/ipfs";
import { getUserId } from "../../utils/auth.util";

/**
 * Handles the initial submission of land by a citizen
 */
export const registerLand = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ownerId = getUserId(req);
    const file = req.file;

    if (!ownerId) {
      const error: any = new Error("Unauthorized: You must be logged in to register land.");
      error.statusCode = 401;
      throw error;
    }

    if (!file) {
      const error: any = new Error("Title deed document (PDF) is required for submission.");
      error.statusCode = 400;
      throw error;
    }

    const { lrNumber, county, constituency, sizeInAcres, landType, priceInKsh } = req.body;

    // 1. IPFS Upload (External call)
    // If this fails, the error will naturally bubble up to globalErrorHandler
    const ipfsHash = await uploadToIPFS(file.buffer, `TITLE_${lrNumber}.pdf`);

    // 2. Local Database Record Creation
    const land = await createLandService({
      ownerId,
      lrNumber,
      county,
      constituency,
      sizeInAcres,
      landType,
      ipfsDocHash: ipfsHash,
      priceInKsh: priceInKsh || null
    });

    return res.status(201).json({
      success: true,
      message: "Land submitted for verification successfully",
      data: land,
      ipfsLink: `https://gateway.pinata.cloud/ipfs/${ipfsHash}`
    });
  } catch (error: any) {
    // If it's a validation error from createLandService, we mark it as 400
    if (!error.statusCode) error.statusCode = 400;
    next(error);
  }
};

/**
 * Allows a verified owner to list their land on the marketplace
 */
export const listLandForSale = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ownerId = getUserId(req);
    const landId = Number(req.params.id);
    const { priceInKsh } = req.body;

    if (!ownerId) {
      const error: any = new Error("Unauthorized");
      error.statusCode = 401;
      throw error;
    }

    if (isNaN(landId)) {
      const error: any = new Error("Invalid land ID format");
      error.statusCode = 400;
      throw error;
    }

    if (!priceInKsh || Number(priceInKsh) <= 0) {
      const error: any = new Error("A valid price greater than 0 is required to list land.");
      error.statusCode = 400;
      throw error;
    }

    const result = await listLandForSaleService(ownerId, landId, Number(priceInKsh));
    
    return res.status(200).json({ 
      success: true, 
      message: "Land listed for sale successfully", 
      data: result 
    });
  } catch (error: any) {
    next(error);
  }
};

/**
 * Removes a listing from the marketplace
 */
export const removeLandFromSale = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ownerId = getUserId(req);
    const landId = Number(req.params.id);

    if (!ownerId) {
      const error: any = new Error("Unauthorized");
      error.statusCode = 401;
      throw error;
    }

    if (isNaN(landId)) {
      const error: any = new Error("Invalid land ID");
      error.statusCode = 400;
      throw error;
    }

    const result = await removeLandFromSaleService(ownerId, landId);
    
    return res.status(200).json({ 
      success: true, 
      message: "Land removed from sale successfully", 
      data: result 
    });
  } catch (error: any) {
    next(error);
  }
};