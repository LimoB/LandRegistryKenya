import { Request, Response } from "express";
import { 
    createTransferRequestService, 
    approveTransferService, 
    getPendingTransfersService, 
    getSellerTransfersService,
    rejectTransferService
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
    const officerId = (req as any).user?.userId;

    // 1. Verify Authentication
    if (!officerId) {
      return res.status(401).json({ error: "Only authorized officers can sign transfers" });
    }

    // 2. Call Service (Service now handles the Blockchain call internally)
    const result = await approveTransferService(Number(id), officerId);
    
    res.status(200).json(result);
  } catch (error: any) {
    // 400 for business logic errors, 500 for blockchain/network failures
    const statusCode = error.message.includes("Blockchain") ? 500 : 400;
    res.status(statusCode).json({ error: error.message });
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


/* ================================
   REJECT TRANSFER (Officer)
================================ */
export const rejectTransfer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body; // Good practice to ask why it was rejected
    const officerId = (req as any).user?.userId;

    const result = await rejectTransferService(Number(id), officerId, reason);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

/* ================================
   GET SELLER SALES (Seller)
================================ */
export const getMySales = async (req: Request, res: Response) => {
  try {
    const sellerId = (req as any).user?.userId;
    const sales = await getSellerTransfersService(sellerId);
    res.status(200).json(sales);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch sales history" });
  }
};