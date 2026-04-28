import { Request, Response, NextFunction } from "express";
import {
  approveTransferService,
  rejectTransferService,
  finalizeTransferService,
  getPendingTransfersService
} from "../services/index";
import { getUserId, getUserRole } from "../../utils/auth.util";

/* ============================================================
   1. GET PENDING TRANSFERS (ROLE-AWARE)
============================================================ */
export const getPending = async (req: Request, res: Response, next: NextFunction) => {
  const traceId = Math.random().toString(36).substring(7);

  try {
    const userId = getUserId(req);
    const userRole = getUserRole(req);

    console.log(`\x1b[36m[Controller]\x1b[0m getPending (Trace: ${traceId})`);
    console.log(`[Auth] userId=${userId}, role=${userRole}`);

    if (!userId || !userRole) {
      console.error(`\x1b[31m[Auth Error]\x1b[0m Missing credentials`);
      const error: any = new Error("Unauthorized: Invalid session or missing permissions");
      error.statusCode = 401;
      throw error;
    }

    const data = await getPendingTransfersService(userId, userRole);

    console.log(`\x1b[32m[Success]\x1b[0m Retrieved ${data.length} pending transfers`);

    return res.status(200).json({
      success: true,
      roleScope: userRole,
      count: data.length,
      data
    });

  } catch (error: any) {
    console.error(`\x1b[31m[Error]\x1b[0m getPending failed (Trace: ${traceId}):`, error.message);
    next(error);
  }
};

/* ============================================================
   2. APPROVE TRANSFER (OFFICER)
   pending → payment_pending
============================================================ */
export const approveTransfer = async (req: Request, res: Response, next: NextFunction) => {
  const traceId = Math.random().toString(36).substring(7);

  try {
    const officerId = getUserId(req);
    const transferId = Number(req.params.id);

    console.log(`\x1b[35m[Controller]\x1b[0m approveTransfer (Trace: ${traceId})`);
    console.log(`[Data] officerId=${officerId}, transferId=${transferId}`);

    if (!officerId) {
      const error: any = new Error("Unauthorized: Officer ID required");
      error.statusCode = 401;
      throw error;
    }

    if (isNaN(transferId)) {
      const error: any = new Error("Invalid transfer ID");
      error.statusCode = 400;
      throw error;
    }

    const result = await approveTransferService(transferId, officerId);

    console.log(`\x1b[32m[Success]\x1b[0m Transfer ${transferId} approved`);

    return res.status(200).json({
      success: true,
      message: "Transfer approved. Awaiting payment.",
      data: result
    });

  } catch (error: any) {
    console.error(`\x1b[31m[Error]\x1b[0m approveTransfer failed (Trace: ${traceId}):`, error.message);
    next(error);
  }
};

/* ============================================================
   3. REJECT TRANSFER (OFFICER)
============================================================ */
export const rejectTransfer = async (req: Request, res: Response, next: NextFunction) => {
  const traceId = Math.random().toString(36).substring(7);

  try {
    const officerId = getUserId(req);
    const transferId = Number(req.params.id);
    const { reason } = req.body;

    console.log(`\x1b[33m[Controller]\x1b[0m rejectTransfer (Trace: ${traceId})`);
    console.log(`[Data] officerId=${officerId}, transferId=${transferId}, reason=${reason}`);

    if (!officerId) {
      const error: any = new Error("Unauthorized");
      error.statusCode = 401;
      throw error;
    }

    if (isNaN(transferId)) {
      const error: any = new Error("Invalid transfer ID");
      error.statusCode = 400;
      throw error;
    }

    if (!reason) {
      const error: any = new Error("A reason for rejection must be provided.");
      error.statusCode = 400;
      throw error;
    }

    const result = await rejectTransferService(transferId, officerId, reason);

    console.log(`\x1b[32m[Success]\x1b[0m Transfer ${transferId} rejected`);

    return res.status(200).json({
      success: true,
      message: "Transfer request rejected",
      data: result
    });

  } catch (error: any) {
    console.error(`\x1b[31m[Error]\x1b[0m rejectTransfer failed (Trace: ${traceId}):`, error.message);
    next(error);
  }
};

/* ============================================================
   4. FINALIZE TRANSFER (MANUAL RETRY ONLY)
   ⚠️ SYSTEM FLOW NOW AUTO-CALLS THIS
============================================================ */
export const finalizeTransfer = async (req: Request, res: Response, next: NextFunction) => {
  const traceId = Math.random().toString(36).substring(7);

  try {
    const transferId = Number(req.params.id);

    console.log(`\x1b[31m[Controller]\x1b[0m MANUAL finalizeTransfer (Trace: ${traceId})`);
    console.log(`[Data] transferId=${transferId}`);

    if (isNaN(transferId)) {
      const error: any = new Error("Invalid transfer ID");
      error.statusCode = 400;
      throw error;
    }

    // ✅ FIX: ONLY ONE ARGUMENT
    const result = await finalizeTransferService(transferId);

    console.log(`\x1b[32m[Success]\x1b[0m Transfer ${transferId} manually finalized`);

    return res.status(200).json({
      success: true,
      message: "Transfer finalized successfully on blockchain",
      data: result
    });

  } catch (error: any) {
    console.error(`\x1b[31m[Error]\x1b[0m finalizeTransfer failed (Trace: ${traceId}):`, error.message);

    if (error.message?.toLowerCase().includes("blockchain")) {
      error.statusCode = 500;
    }

    next(error);
  }
};