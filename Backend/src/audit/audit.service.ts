import db from "../drizzle/db";
import { auditLogs } from "../drizzle/schema";
import { eq, desc, and, gte, lte } from "drizzle-orm";

/* ================================
   GET ALL AUDIT LOGS (ADMIN)
================================ */
export const getAllAuditLogsService = async () => {
  return await db.query.auditLogs.findMany({
    orderBy: [desc(auditLogs.createdAt)]
  });
};

/* ================================
   GET AUDIT LOGS WITH FILTERS
================================ */
export const getFilteredAuditLogsService = async (filters: {
  landId?: number;
  performedBy?: number;
  actionType?: string;
  fromDate?: Date;
  toDate?: Date;
}) => {
  const conditions = [];

  if (filters.landId) {
    conditions.push(eq(auditLogs.landId, filters.landId));
  }

  if (filters.performedBy) {
    conditions.push(eq(auditLogs.performedBy, filters.performedBy));
  }

  if (filters.actionType) {
    conditions.push(eq(auditLogs.actionType, filters.actionType));
  }

  if (filters.fromDate) {
    conditions.push(gte(auditLogs.createdAt, filters.fromDate));
  }

  if (filters.toDate) {
    conditions.push(lte(auditLogs.createdAt, filters.toDate));
  }

  return await db.query.auditLogs.findMany({
    where: conditions.length ? and(...conditions) : undefined,
    orderBy: [desc(auditLogs.createdAt)]
  });
};

/* ================================
   GET LOGS BY LAND
================================ */
export const getLandAuditLogsService = async (landId: number) => {
  return await db.query.auditLogs.findMany({
    where: eq(auditLogs.landId, landId),
    orderBy: [desc(auditLogs.createdAt)]
  });
};

/* ================================
   GET LOGS BY USER
================================ */
export const getUserAuditLogsService = async (userId: number) => {
  return await db.query.auditLogs.findMany({
    where: eq(auditLogs.performedBy, userId),
    orderBy: [desc(auditLogs.createdAt)]
  });
};