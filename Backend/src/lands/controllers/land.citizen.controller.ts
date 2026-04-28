import { Request, Response, NextFunction } from "express";
import { 
  createLandService, 
  listLandForSaleService, 
  removeLandFromSaleService 
} from "../services/index";
import { uploadToIPFS } from "../../utils/ipfs";
import { getUserId } from "../../utils/auth.util";

/**
 * REGISTER LAND (DB + IPFS + BLOCKCHAIN)
 */
export const registerLand = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ownerId = getUserId(req);
    const file = req.file;

    if (!ownerId) {
      const error: any = new Error("Unauthorized: You must be logged in.");
      error.statusCode = 401;
      throw error;
    }

    if (!file) {
      const error: any = new Error("Title deed (PDF) is required.");
      error.statusCode = 400;
      throw error;
    }

    const {
      lrNumber,
      county,
      constituency,
      sizeInAcres,
      landType,
      priceInKsh
    } = req.body;

    /* ============================================================
       1. UPLOAD TO IPFS
    ============================================================ */
    const ipfsHash = await uploadToIPFS(
      file.buffer,
      `TITLE_${lrNumber}.pdf`
    );

    console.log("[IPFS] Uploaded:", ipfsHash);

    /* ============================================================
       2. BUILD USER CONTEXT (IMPORTANT 🔥)
    ============================================================ */
    const user = {
      id: ownerId,
      walletAddress: req.user?.walletAddress // ✅ MUST exist
    };

    if (!user.walletAddress) {
      const error: any = new Error("User wallet address is required for blockchain");
      error.statusCode = 400;
      throw error;
    }

    /* ============================================================
       3. CREATE LAND (DB + BLOCKCHAIN)
    ============================================================ */
    const land = await createLandService(
      {
        ownerId,
        lrNumber,
        county,
        constituency,
        sizeInAcres,
        landType,
        ipfsDocHash: ipfsHash,
        priceInKsh: priceInKsh || null
      },
      user // ✅ FIXED: pass user
    );

    return res.status(201).json({
      success: true,
      message: "Land registered successfully",
      data: land,
      ipfsLink: `https://gateway.pinata.cloud/ipfs/${ipfsHash}`
    });

  } catch (error: any) {
    if (!error.statusCode) error.statusCode = 400;
    next(error);
  }
};

/**
 * LIST LAND FOR SALE
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
      const error: any = new Error("Invalid land ID");
      error.statusCode = 400;
      throw error;
    }

    if (!priceInKsh || Number(priceInKsh) <= 0) {
      const error: any = new Error("Valid price required");
      error.statusCode = 400;
      throw error;
    }

    const result = await listLandForSaleService(
      ownerId,
      landId,
      Number(priceInKsh)
    );

    return res.status(200).json({
      success: true,
      message: "Land listed for sale",
      data: result
    });

  } catch (error: any) {
    next(error);
  }
};

/**
 * REMOVE LAND FROM SALE
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
      message: "Land removed from sale",
      data: result
    });

  } catch (error: any) {
    next(error);
  }
};