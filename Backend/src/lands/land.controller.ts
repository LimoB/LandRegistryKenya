import { Request, Response } from "express";
import { 
  getAllLandsService, 
  createLandService, 
  verifyLandService 
} from "./land.service";
import { uploadToIPFS } from "../utils/ipfs";

export const getLands = async (_req: Request, res: Response) => {
  try {
    const data = await getAllLandsService();
    res.status(200).json(data);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    res.status(500).json({ error: msg });
  }
};

export const registerLand = async (req: Request, res: Response) => {
  try {
    const ownerId = req.user?.userId; // Using the extended Express.Request
    const file = req.file;

    if (!ownerId) return res.status(401).json({ error: "Unauthorized" });
    if (!file) return res.status(400).json({ error: "Physical Title Deed (PDF) is required" });

    console.log(`📡 Uploading deed to IPFS...`);
    const ipfsHash = await uploadToIPFS(file.buffer, `TITLE_${req.body.lrNumber}.pdf`);

    const land = await createLandService({ 
      ...req.body, 
      ownerId, 
      ipfsDocHash: ipfsHash,
      verificationStatus: "pending" 
    });

    res.status(201).json({ 
      message: "Application submitted. Awaiting verification.", 
      land,
      ipfsLink: `https://gateway.pinata.cloud/ipfs/${ipfsHash}`
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Registration Error";
    res.status(400).json({ error: msg });
  }
};

export const verifyLand = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const officerId = req.user?.userId;

    if (!officerId) return res.status(401).json({ error: "Unauthorized" });

    const result = await verifyLandService(Number(id), officerId);
    res.status(200).json(result);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Verification Error";
    res.status(500).json({ error: msg });
  }
};