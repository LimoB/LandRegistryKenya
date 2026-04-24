import { Request, Response, NextFunction } from "express";
import {
  getAllAuditLogsService,
  getFilteredAuditLogsService,
  getLandAuditLogsService,
  getUserAuditLogsService
} from "./audit.service";

/* ============================================================
   GET ALL LOGS (ADMIN ONLY)
============================================================ */
export const getAuditLogs = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const logs = await getAllAuditLogsService();

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs
    });
    return;
  } catch (error) {
    next(error);
  }
};

/* ============================================================
   FILTERED LOGS (BY DATE, ACTION, OR ENTITY)
============================================================ */
export const getFilteredAuditLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      landId,
      performedBy,
      actionType,
      fromDate,
      toDate
    } = req.query;

    const logs = await getFilteredAuditLogsService({
      landId: landId ? Number(landId) : undefined,
      performedBy: performedBy ? Number(performedBy) : undefined,
      actionType: actionType ? String(actionType) : undefined,
      fromDate: fromDate ? new Date(String(fromDate)) : undefined,
      toDate: toDate ? new Date(String(toDate)) : undefined
    });

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs
    });
    return;
  } catch (error) {
    next(error);
  }
};

/* ============================================================
   GET LOGS FOR A SPECIFIC LAND PARCEL
============================================================ */
export const getAuditLogsByLand = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const landId = Number(req.params.landId);

    if (isNaN(landId)) {
      const error: any = new Error("Invalid Land ID provided");
      error.statusCode = 400;
      throw error;
    }

    const logs = await getLandAuditLogsService(landId);

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs
    });
    return;
  } catch (error) {
    next(error);
  }
};

/* ============================================================
   GET LOGS FOR A SPECIFIC USER ACTION HISTORY
============================================================ */
export const getAuditLogsByUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = Number(req.params.userId);

    if (isNaN(userId)) {
      const error: any = new Error("Invalid User ID provided");
      error.statusCode = 400;
      throw error;
    }

    const logs = await getUserAuditLogsService(userId);

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs
    });
    return;
  } catch (error) {
    next(error);
  }
};