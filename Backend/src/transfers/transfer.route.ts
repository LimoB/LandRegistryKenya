import { Router } from "express";
import { 
    initiateTransfer, 
    approveTransfer, 
    getPending, 
    rejectTransfer, 
    getMySales 
} from "./transfer.controller";
// Using the new specific guards from your updated bearAuth.ts
import { citizenAuth, officerAuth } from "../middleware/bearAuth";

export const transferRouter: Router = Router();

/* ============================================================
   CITIZEN ROUTES
   Requires a valid JWT with role: 'citizen'
   ============================================================ */

// Initiate a new purchase request for a land parcel
transferRouter.post("/initiate", citizenAuth, initiateTransfer);

// View land you are currently selling (Inbound transfer requests)
transferRouter.get("/my-sales", citizenAuth, getMySales);


/* ============================================================
   OFFICER ROUTES
   Requires a valid JWT with role: 'land_officer'
   ============================================================ */

// View all transfers pending official verification
transferRouter.get("/pending", officerAuth, getPending);

// Finalize the transfer and record on the blockchain
transferRouter.patch("/approve/:id", officerAuth, approveTransfer);

// Reject fraudulent, incorrect, or incomplete transfer requests
transferRouter.patch("/reject/:id", officerAuth, rejectTransfer);