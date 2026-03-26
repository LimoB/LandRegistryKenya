import { Request, Response } from "express";
import { 
    createTransferRequestService, 
    approveTransferService, 
    getPendingTransfersService 
} from "./transfer.service";

/* ================================
   INITIATE TRANSFER (Buyer)
================================ */
export const initiateTransfer = async (req: Request, res: Response) => {
  try {
    const { landId, sellerId, mpesaReceiptCode } = req.body;
    const buyerId = (req as any).user?.userId;

    if (!buyerId) {
      return res.status(401).json({ error: "Unauthorized: Buyer ID missing" });
    }

    const [request] = await createTransferRequestService({
      landId,
      sellerId,
      buyerId,
      mpesaReceiptCode,
      status: "pending"
    });

    res.status(201).json({ 
      message: "Transfer initiated. Awaiting Officer verification.", 
      request 
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

/* ================================
   APPROVE TRANSFER (Officer)
================================ */
export const approveTransfer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { blockchainTxHash } = req.body;
    const officerId = (req as any).user?.userId;

    if (!officerId) {
      return res.status(401).json({ error: "Only authorized officers can sign transfers" });
    }

    if (!blockchainTxHash) {
      return res.status(400).json({ error: "Blockchain receipt hash is required" });
    }

    const result = await approveTransferService(Number(id), blockchainTxHash, officerId);
    
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

/* ================================
   GET ALL PENDING (Officer)
================================ */
export const getPending = async (_req: Request, res: Response) => {
    try {
        const data = await getPendingTransfersService();
        res.status(200).json(data);
    } catch (error: any) {
        res.status(500).json({ error: "Failed to fetch pending requests" });
    }
};