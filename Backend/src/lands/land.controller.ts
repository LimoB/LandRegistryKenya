import { Request, Response } from "express";
import {
  getAllLandsService,
  createLandService,
  verifyLandService,
  getLandByLRService,
  listLandForSaleService,
  removeLandFromSaleService,
  getMarketplaceLandsService,
  getMyLandsService
} from "./land.service";

import { uploadToIPFS } from "../utils/ipfs";

/* ============================================================
   SAFE USER ID
============================================================ */
const getUserId = (req: Request): number | null => {
  return (req as any)?.user?.userId || null;
};

/* ============================================================
   GET ALL LANDS
============================================================ */
export const getLands = async (_req: Request, res: Response) => {
  try {
    const data = await getAllLandsService();

    res.status(200).json({
      success: true,
      count: data.length,
      data
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "Internal Server Error"
    });
  }
};

/* ============================================================
   GET LAND BY LR NUMBER
============================================================ */
export const getLandByLR = async (req: Request, res: Response) => {
  try {
    const lrParam = req.params.lrNumber;
    const lrNumber = Array.isArray(lrParam) ? lrParam[0] : lrParam;

    if (!lrNumber) {
      return res.status(400).json({
        success: false,
        error: "LR number is required"
      });
    }

    const land = await getLandByLRService(lrNumber);

    if (!land) {
      return res.status(404).json({
        success: false,
        error: "Land not found"
      });
    }

    res.status(200).json({
      success: true,
      data: land
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/* ============================================================
   REGISTER LAND
============================================================ */
export const registerLand = async (req: Request, res: Response) => {
  try {
    const ownerId = getUserId(req);
    const file = req.file;

    if (!ownerId) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized"
      });
    }

    if (!file) {
      return res.status(400).json({
        success: false,
        error: "Title deed PDF is required"
      });
    }

    const {
      lrNumber,
      county,
      constituency,
      sizeInAcres,
      landType,
      priceInKsh
    } = req.body;

    if (!lrNumber || !county || !constituency || !sizeInAcres || !landType) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields"
      });
    }

    if (Number(sizeInAcres) <= 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid land size"
      });
    }

    /* ================= IPFS ================= */
    const ipfsHash = await uploadToIPFS(
      file.buffer,
      `TITLE_${lrNumber}.pdf`
    );

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

    res.status(201).json({
      success: true,
      message: "Land submitted for verification",
      data: land,
      ipfsLink: `https://gateway.pinata.cloud/ipfs/${ipfsHash}`
    });

  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || "Registration failed"
    });
  }
};

/* ============================================================
   VERIFY LAND
============================================================ */
export const verifyLand = async (req: Request, res: Response) => {
  try {
    const officerId = getUserId(req);

    if (!officerId) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized"
      });
    }

    const result = await verifyLandService(
      Number(req.params.id),
      officerId
    );

    res.status(200).json({
      success: true,
      ...result
    });

  } catch (error: any) {
    const status = error.message?.includes("Blockchain") ? 500 : 400;

    res.status(status).json({
      success: false,
      error: error.message
    });
  }
};

/* ============================================================
   LIST LAND FOR SALE
============================================================ */
export const listLandForSale = async (req: Request, res: Response) => {
  try {
    const ownerId = getUserId(req);

    if (!ownerId) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized"
      });
    }

    const landId = Number(req.params.id);
    const { priceInKsh } = req.body;

    if (isNaN(landId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid land ID"
      });
    }

    if (!priceInKsh || Number(priceInKsh) <= 0) {
      return res.status(400).json({
        success: false,
        error: "Valid price required"
      });
    }

    const result = await listLandForSaleService(
      ownerId,
      landId,
      Number(priceInKsh)
    );

    res.status(200).json({
      success: true,
      message: "Land listed for sale",
      data: result
    });

  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/* ============================================================
   REMOVE FROM SALE
============================================================ */
export const removeLandFromSale = async (req: Request, res: Response) => {
  try {
    const ownerId = getUserId(req);

    if (!ownerId) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized"
      });
    }

    const landId = Number(req.params.id);

    if (isNaN(landId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid land ID"
      });
    }

    const result = await removeLandFromSaleService(
      ownerId,
      landId
    );

    res.status(200).json({
      success: true,
      message: "Land removed from sale",
      data: result
    });

  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/* ============================================================
   MARKETPLACE (BUYERS VIEW)
============================================================ */
export const getMarketplaceLands = async (_req: Request, res: Response) => {
  try {
    const data = await getMarketplaceLandsService();

    res.status(200).json({
      success: true,
      count: data.length,
      data
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/* ============================================================
   MY LANDS (CITIZEN DASHBOARD)
============================================================ */
export const getMyLands = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized"
      });
    }

    const data = await getMyLandsService(userId);

    res.status(200).json({
      success: true,
      count: data.length,
      data
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};