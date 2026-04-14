import { Request, Response } from "express";
import { 
  getAllLandsService, 
  createLandService, 
  verifyLandService 
} from "./land.service";
import { uploadToIPFS } from "../utils/ipfs";
import { registerLandOnChain } from "../blockchain/landRegistry";

export const getLands = async (req: Request, res: Response) => {
  try {
    const data = await getAllLandsService();
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};


export const registerLand = async (req: Request, res: Response) => {
  try {
    const ownerId = (req as any).user?.userId;
    const file = req.file;

    if (!ownerId) {
      return res.status(401).json({ error: "Unauthorized: User ID missing" });
    }

    if (!file) {
      return res.status(400).json({ error: "Physical Title Deed (PDF) is required" });
    }

    // 1. Upload Document to IPFS (Still do this now so the Officer can view it)
    console.log(`📡 Uploading deed for ${req.body.lrNumber} to IPFS...`);
    const ipfsHash = await uploadToIPFS(file.buffer, `TITLE_${req.body.lrNumber}.pdf`);

    // 2. Save to Database with "pending" status
    // The blockchain call is SKIPPED here and moved to verifyLand
    const land = await createLandService({ 
      ...req.body, 
      ownerId, 
      ipfsDocHash: ipfsHash,
      verificationStatus: "pending" 
    });

    res.status(201).json({ 
      message: "Application submitted successfully. Awaiting Officer verification.", 
      land,
      ipfsLink: `https://gateway.pinata.cloud/ipfs/${ipfsHash}`
    });

  } catch (error: any) {
    console.error("Registration Error:", error);
    res.status(400).json({ error: error.message });
  }
};

/* ================================
   OFFICER: Verify & Mint to Blockchain
================================ */
export const verifyLand = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const officerId = (req as any).user?.userId;

    if (!officerId) {
      return res.status(401).json({ error: "Unauthorized: Officer ID missing" });
    }

    // This service handles the Blockchain Minting + DB Update
    const result = await verifyLandService(Number(id), officerId);
    
    res.status(200).json(result);
  } catch (error: any) {
    console.error("Verification Error:", error);
    res.status(500).json({ error: error.message });
  }
};