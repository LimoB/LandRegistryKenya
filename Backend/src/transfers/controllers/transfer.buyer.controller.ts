import { Request, Response, NextFunction } from "express";
import { createTransferRequestService } from "../services";
import { getUserId } from "../../utils/auth.util";

/**
 * Initiates a land ownership transfer request
 */
export const initiateTransfer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const traceId = `TX-${Math.random().toString(36).substring(2, 8)}`;

  try {
    const buyerId = getUserId(req);
    const { landId } = req.body;

    console.log(`\n\x1b[35m========== INITIATE TRANSFER ==========\x1b[0m`);
    console.log(`\x1b[36m[Trace]\x1b[0m ${traceId}`);
    console.log(`\x1b[36m[Request]\x1b[0m Buyer ID: ${buyerId}`);
    console.log(`\x1b[36m[Request]\x1b[0m Land ID: ${landId}`);

    /* ============================
       1. AUTH CHECK
    ============================ */
    if (!buyerId) {
      console.warn(`\x1b[33m[Auth Warning]\x1b[0m No buyer found (Trace: ${traceId})`);
      const error: any = new Error("Unauthorized: Buyer identification failed.");
      error.statusCode = 401;
      throw error;
    }

    /* ============================
       2. INPUT VALIDATION
    ============================ */
    if (!landId) {
      console.warn(`\x1b[33m[Validation Warning]\x1b[0m landId missing`);
      const error: any = new Error("landId is required to initiate a transfer.");
      error.statusCode = 400;
      throw error;
    }

    const parsedLandId = Number(landId);

    if (isNaN(parsedLandId)) {
      console.warn(`\x1b[33m[Validation Warning]\x1b[0m Invalid landId format`);
      const error: any = new Error("landId must be a valid number.");
      error.statusCode = 400;
      throw error;
    }

    console.log(`\x1b[34m[Service Call]\x1b[0m Creating transfer request...`);

    /* ============================
       3. SERVICE CALL
    ============================ */
    const request = await createTransferRequestService(
      buyerId,
      parsedLandId
    );

    console.log(`\x1b[32m[Success]\x1b[0m Transfer Request Created`);
    console.log(`\x1b[32m[Data]\x1b[0m Request ID: ${request.id}`);
    console.log(`\x1b[32m[Data]\x1b[0m Status: ${request.status}`);
    console.log(`\x1b[32m=======================================\x1b[0m\n`);

    /* ============================
       4. RESPONSE
    ============================ */
    return res.status(201).json({
      success: true,
      message: "Transfer request initiated successfully",
      data: request,
      traceId // 👈 useful for debugging frontend ↔ backend
    });

  } catch (error: any) {
    console.error(`\n\x1b[31m[ERROR]\x1b[0m Initiate Transfer Failed`);
    console.error(`\x1b[31m[Trace]\x1b[0m ${traceId}`);
    console.error(`\x1b[31m[Message]\x1b[0m ${error.message}`);

    if (error.stack) {
      console.error(`\x1b[31m[Stack]\x1b[0m ${error.stack}`);
    }

    console.error(`\x1b[31m=======================================\x1b[0m\n`);

    // Default to 400 for logical errors
    if (!error.statusCode) error.statusCode = 400;

    next(error);
  }
};