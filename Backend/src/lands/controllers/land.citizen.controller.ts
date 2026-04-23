import { Request, Response } from "express";
import { 
  createLandService, 
  listLandForSaleService, 
  removeLandFromSaleService 
} from "../services/index";
import { uploadToIPFS } from "../../utils/ipfs";
import { getUserId } from "../../utils/auth.util";

export const registerLand = async (req: Request, res: Response) => {
  try {
    const ownerId = getUserId(req);
    const file = req.file;

    if (!ownerId) return res.status(401).json({ success: false, error: "Unauthorized" });
    if (!file) return res.status(400).json({ success: false, error: "Title deed PDF is required" });

    const { lrNumber, county, constituency, sizeInAcres, landType, priceInKsh } = req.body;

    // IPFS Upload
    const ipfsHash = await uploadToIPFS(file.buffer, `TITLE_${lrNumber}.pdf`);

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
    res.status(400).json({ success: false, error: error.message || "Registration failed" });
  }
};

export const listLandForSale = async (req: Request, res: Response) => {
  try {
    const ownerId = getUserId(req);
    const landId = Number(req.params.id);
    const { priceInKsh } = req.body;

    if (!ownerId) return res.status(401).json({ success: false, error: "Unauthorized" });
    if (isNaN(landId)) return res.status(400).json({ success: false, error: "Invalid land ID" });
    if (!priceInKsh || Number(priceInKsh) <= 0) return res.status(400).json({ success: false, error: "Valid price required" });

    const result = await listLandForSaleService(ownerId, landId, Number(priceInKsh));
    res.status(200).json({ success: true, message: "Land listed for sale", data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const removeLandFromSale = async (req: Request, res: Response) => {
  try {
    const ownerId = getUserId(req);
    const landId = Number(req.params.id);

    if (!ownerId) return res.status(401).json({ success: false, error: "Unauthorized" });
    if (isNaN(landId)) return res.status(400).json({ success: false, error: "Invalid land ID" });

    const result = await removeLandFromSaleService(ownerId, landId);
    res.status(200).json({ success: true, message: "Land removed from sale", data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};