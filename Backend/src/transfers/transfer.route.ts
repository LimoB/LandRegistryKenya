import { Router } from "express";
import { initiateTransfer, approveTransfer, getPending } from "./transfer.controller";
import { authMiddleware, officerOnly, citizenOnly } from "../middleware/bearAuth";

export const transferRouter: Router = Router();

// Citizens (Buyers) initiate the transfer by providing M-Pesa proof
transferRouter.post("/initiate", authMiddleware, citizenOnly, initiateTransfer);

// Land Officers view all pending requests to verify M-Pesa codes
transferRouter.get("/pending", authMiddleware, officerOnly, getPending);

// Land Officers approve and link the Blockchain Hash
transferRouter.patch("/approve/:id", authMiddleware, officerOnly, approveTransfer);