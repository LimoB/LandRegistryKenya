import { Router } from "express";
import {
  getAuditLogs,
  getFilteredAuditLogs,
  getAuditLogsByLand,
  getAuditLogsByUser
} from "./audit.controller";

import {
  adminAuth,
  officerAuth,
  anyRoleAuth
} from "../middleware/bearAuth";

export const auditRouter: Router = Router();

/* ================================
   ADMIN ONLY (FULL LOG ACCESS)
================================ */
auditRouter.get("/", getAuditLogs);// adminAuth,

/* ================================
   FILTERED SEARCH (ADMIN)
================================ */
auditRouter.get("/filter", getFilteredAuditLogs);// adminAuth,

/* ================================
   LAND HISTORY
================================ */
auditRouter.get("/land/:landId", anyRoleAuth, getAuditLogsByLand);

/* ================================
   USER ACTIVITY HISTORY
================================ */
auditRouter.get("/user/:userId", officerAuth, getAuditLogsByUser);