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
    const ownerId = req.user?.userId;
    const walletAddress = req.user?.walletAddress; // Ensure your auth middleware extracts this
    const file = req.file;

    if (!ownerId || !walletAddress) {
      return res.status(401).json({ error: "Unauthorized: Missing user profile or wallet" });
    }

    if (!file) {
      return res.status(400).json({ error: "Physical Title Deed (PDF) is required" });
    }

    // 1. Upload Document to IPFS
    console.log(`📡 Uploading deed for ${req.body.lrNumber} to IPFS...`);
    const ipfsHash = await uploadToIPFS(file.buffer, `TITLE_${req.body.lrNumber}.pdf`);

    // 2. Register on Blockchain
    // We do this BEFORE the DB save to ensure we have the transaction hash
    console.log(`🔗 Registering on Blockchain for wallet: ${walletAddress}`);
    const tx = await registerLandOnChain(walletAddress, req.body.lrNumber, ipfsHash);

    // 3. Save to Database (Postgres)
    // We add the ipfsDocHash and the initial status to the DB record
    const land = await createLandService({ 
      ...req.body, 
      ownerId, 
      ipfsDocHash: ipfsHash,
      verificationStatus: "pending" 
    });

    res.status(201).json({ 
      message: "Land parcel registered and anchored to blockchain", 
      land,
      blockchainTx: tx.hash,
      ipfsLink: `https://gateway.pinata.cloud/ipfs/${ipfsHash}`
    });

  } catch (error: any) {
    console.error("Registration Error:", error);
    res.status(400).json({ error: error.message });
  }
};

export const verifyLand = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { onChainId } = req.body; 

    // This service should update the status in Postgres to 'verified'
    const updatedLand = await verifyLandService(Number(id), onChainId);
    
    res.status(200).json({ 
      message: "Land verified successfully in registry", 
      updatedLand 
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};