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
  const id = (req as any)?.user?.userId || null;
  console.log(`[CONTROLLER] Auth Context: Resolving User ID -> ${id}`);
  return id;
};

/* ============================================================
   GET ALL LANDS
============================================================ */
export const getLands = async (_req: Request, res: Response) => {
  console.log("[CONTROLLER] Incoming Request: GET /all-lands");
  try {
    const data = await getAllLandsService();
    console.log(`[CONTROLLER] Success: Retrieved ${data.length} records.`);
    res.status(200).json({
      success: true,
      count: data.length,
      data
    });
  } catch (error: any) {
    console.error(`[CONTROLLER ERROR] getLands failed: ${error.message}`);
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
  const lrParam = req.params.lrNumber;
  const lrNumber = Array.isArray(lrParam) ? lrParam[0] : lrParam;
  
  console.log(`[CONTROLLER] Incoming Request: GET /land/${lrNumber}`);

  try {
    if (!lrNumber) {
      console.warn("[CONTROLLER] Validation Failed: LR number is missing in params.");
      return res.status(400).json({ success: false, error: "LR number is required" });
    }

    const land = await getLandByLRService(lrNumber);

    if (!land) {
      console.log(`[CONTROLLER] Resource Not Found: No land matches LR ${lrNumber}`);
      return res.status(404).json({ success: false, error: "Land not found" });
    }

    res.status(200).json({ success: true, data: land });
  } catch (error: any) {
    console.error(`[CONTROLLER ERROR] getLandByLR (${lrNumber}): ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
};

/* ============================================================
   REGISTER LAND
============================================================ */
export const registerLand = async (req: Request, res: Response) => {
  console.log("[CONTROLLER] Incoming Request: POST /register-land");
  try {
    const ownerId = getUserId(req);
    const file = req.file;

    if (!ownerId) {
      console.warn("[CONTROLLER] Unauthorized access attempt to register land.");
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }
    
    if (!file) {
      console.warn("[CONTROLLER] Upload Failed: No title deed PDF file provided.");
      return res.status(400).json({ success: false, error: "Title deed PDF is required" });
    }

    const { lrNumber, county, constituency, sizeInAcres, landType, priceInKsh } = req.body;

    console.log(`[CONTROLLER] Processing files for LR: ${lrNumber}. Size: ${file.size} bytes.`);

    /* ================= IPFS UPLOAD ================= */
    console.log("[CONTROLLER] Pushing document to IPFS...");
    const ipfsHash = await uploadToIPFS(file.buffer, `TITLE_${lrNumber}.pdf`);
    console.log(`[CONTROLLER] IPFS successful. CID: ${ipfsHash}`);

    /* ================= DB RECORD ================= */
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

    console.log(`[CONTROLLER] Registration flow complete for LR: ${lrNumber}`);
    res.status(201).json({
      success: true,
      message: "Land submitted for verification",
      data: land,
      ipfsLink: `https://gateway.pinata.cloud/ipfs/${ipfsHash}`
    });

  } catch (error: any) {
    console.error(`[CONTROLLER ERROR] registerLand: ${error.message}`);
    res.status(400).json({ success: false, error: error.message || "Registration failed" });
  }
};

/* ============================================================
   VERIFY LAND (OFFICER ACTION - BLOCKCHAIN MINT)
============================================================ */
export const verifyLand = async (req: Request, res: Response) => {
  const landId = Number(req.params.id);
  console.log(`[CONTROLLER] Incoming Request: PATCH /verify/${landId}`);

  try {
    const officerId = getUserId(req);
    if (!officerId) {
      console.warn(`[CONTROLLER] Unauthorized: User is not logged in for verification.`);
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    if (isNaN(landId)) {
        return res.status(400).json({ success: false, error: "Invalid Land ID" });
    }

    console.log(`[CONTROLLER] Passing Land ID ${landId} to Service for Blockchain Minting...`);
    
    // IMPORTANT: verifyLandService MUST fetch the wallet from the DB. 
    // If the DB field 'current_owner_wallet' is null, this service call will 
    // now throw an error before hitting the blockchain (preventing the ENS error).
    const result = await verifyLandService(landId, officerId);

    console.log(`[CONTROLLER] Verification and Minting successful for Land ID: ${landId}`);
    res.status(200).json({
      success: true,
      ...result
    });

  } catch (error: any) {
    console.error(`[CONTROLLER ERROR] verifyLand ID ${landId} failed: ${error.message}`);
    
    // Check if the error is specifically the ENS / Invalid Address issue
    const isBlockchainDataError = error.message.includes("ENS") || error.message.includes("address");
    
    res.status(isBlockchainDataError ? 422 : 500).json({
      success: false,
      error: isBlockchainDataError 
        ? `Blockchain Minting Failed: The owner's wallet address is invalid or missing in the database. Please update the record for Land ID ${landId}.`
        : error.message || "Internal Server Error during verification"
    });
  }
};

/* ============================================================
   MARKETPLACE & CITIZEN VIEWS
============================================================ */
export const getMarketplaceLands = async (_req: Request, res: Response) => {
  console.log("[CONTROLLER] Fetching marketplace listings...");
  try {
    const data = await getMarketplaceLandsService();
    res.status(200).json({ success: true, count: data.length, data });
  } catch (error: any) {
    console.error(`[CONTROLLER ERROR] getMarketplaceLands: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getMyLands = async (req: Request, res: Response) => {
  const userId = getUserId(req);
  console.log(`[CONTROLLER] Fetching portfolio for User: ${userId}`);
  try {
    if (!userId) return res.status(401).json({ success: false, error: "Unauthorized" });
    const data = await getMyLandsService(userId);
    res.status(200).json({ success: true, count: data.length, data });
  } catch (error: any) {
    console.error(`[CONTROLLER ERROR] getMyLands (User ${userId}): ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
};

/* ============================================================
   LIST LAND FOR SALE
============================================================ */
export const listLandForSale = async (req: Request, res: Response) => {
  const landId = Number(req.params.id);
  console.log(`[CONTROLLER] Incoming Request: PUT /sell/${landId}`);

  try {
    const ownerId = getUserId(req);
    const { priceInKsh } = req.body;

    if (!ownerId) return res.status(401).json({ success: false, error: "Unauthorized" });

    if (isNaN(landId)) {
      console.warn(`[CONTROLLER] Invalid Land ID passed: ${req.params.id}`);
      return res.status(400).json({ success: false, error: "Invalid land ID" });
    }

    if (!priceInKsh || Number(priceInKsh) <= 0) {
      console.warn(`[CONTROLLER] Invalid price provided: ${priceInKsh}`);
      return res.status(400).json({ success: false, error: "Valid price required" });
    }

    const result = await listLandForSaleService(ownerId, landId, Number(priceInKsh));

    console.log(`[CONTROLLER] Land ${landId} listed successfully.`);
    res.status(200).json({
      success: true,
      message: "Land listed for sale",
      data: result
    });

  } catch (error: any) {
    console.error(`[CONTROLLER ERROR] listLandForSale: ${error.message}`);
    res.status(400).json({ success: false, error: error.message });
  }
};

/* ============================================================
   REMOVE FROM SALE
============================================================ */
export const removeLandFromSale = async (req: Request, res: Response) => {
  const landId = Number(req.params.id);
  console.log(`[CONTROLLER] Incoming Request: DELETE /sell/${landId}`);

  try {
    const ownerId = getUserId(req);
    if (!ownerId) return res.status(401).json({ success: false, error: "Unauthorized" });

    if (isNaN(landId)) return res.status(400).json({ success: false, error: "Invalid land ID" });

    const result = await removeLandFromSaleService(ownerId, landId);

    console.log(`[CONTROLLER] Land ${landId} removed from sale.`);
    res.status(200).json({
      success: true,
      message: "Land removed from sale",
      data: result
    });

  } catch (error: any) {
    console.error(`[CONTROLLER ERROR] removeLandFromSale: ${error.message}`);
    res.status(400).json({ success: false, error: error.message });
  }
};