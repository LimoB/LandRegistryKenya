import { Request, Response } from "express";
import {
  getAllLandsService,
  createLandService,
  verifyLandService,
  getLandByLRService
} from "./land.service";

import { uploadToIPFS } from "../utils/ipfs";

/* ================================
   GET ALL LANDS
================================ */
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

/* ================================
   GET LAND BY LR NUMBER
================================ */
export const getLandByLR = async (req: Request, res: Response) => {
  try {
    const lrParam = req.params.lrNumber;

    // ✅ Normalize to string
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

/* ================================
   REGISTER LAND (Citizen)
================================ */
export const registerLand = async (req: Request, res: Response) => {
  try {
    const ownerId = (req as any).user?.userId;
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

    /* ================= VALIDATION ================= */
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
    console.log("📡 Uploading deed to IPFS...");
    const ipfsHash = await uploadToIPFS(
      file.buffer,
      `TITLE_${lrNumber}.pdf`
    );

    /* ================= CREATE LAND ================= */
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

/* ================================
   VERIFY LAND (Officer)
================================ */
export const verifyLand = async (req: Request, res: Response) => {
  try {
    const officerId = (req as any).user?.userId;

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