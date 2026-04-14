import { Router } from "express";
import { 
    initiateTransfer, 
    approveTransfer, 
    getPending, 
    rejectTransfer, 
    getMySales 
} from "./transfer.controller";
import { authMiddleware, officerOnly, citizenOnly } from "../middleware/bearAuth";

export const transferRouter: Router = Router();

// --- CITIZEN ROUTES ---
// Initiate a new purchase
transferRouter.post("/initiate", authMiddleware, citizenOnly, initiateTransfer);
// See land you are selling (Inbound requests)
transferRouter.get("/my-sales", authMiddleware, citizenOnly, getMySales);

// --- OFFICER ROUTES ---
// View all pending for verification
transferRouter.get("/pending", authMiddleware, officerOnly, getPending);
// Finalize on blockchain
transferRouter.patch("/approve/:id", authMiddleware, officerOnly, approveTransfer);
// Reject fraudulent/incorrect requests
transferRouter.patch("/reject/:id", authMiddleware, officerOnly, rejectTransfer);