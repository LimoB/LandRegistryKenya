import { Request, Response } from "express";
import {
  getAllAuditLogsService,
  getFilteredAuditLogsService,
  getLandAuditLogsService,
  getUserAuditLogsService
} from "./audit.service";

/* ================================
   GET ALL LOGS (ADMIN)
================================ */
export const getAuditLogs = async (_req: Request, res: Response) => {
  try {
    const logs = await getAllAuditLogsService();

    return res.status(200).json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Failed to fetch audit logs"
    });
  }
};

/* ================================
   FILTERED LOGS
================================ */
export const getFilteredAuditLogs = async (req: Request, res: Response) => {
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

    return res.status(200).json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Failed to filter audit logs"
    });
  }
};

/* ================================
   GET BY LAND
================================ */
export const getAuditLogsByLand = async (req: Request, res: Response) => {
  try {
    const landId = Number(req.params.landId);

    if (isNaN(landId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid landId"
      });
    }

    const logs = await getLandAuditLogsService(landId);

    return res.status(200).json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Failed to fetch land audit logs"
    });
  }
};

/* ================================
   GET BY USER
================================ */
export const getAuditLogsByUser = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.userId);

    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid userId"
      });
    }

    const logs = await getUserAuditLogsService(userId);

    return res.status(200).json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Failed to fetch user audit logs"
    });
  }
};