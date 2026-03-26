import { baseApi } from "../../app/api/baseApi";

/* ================================
   TYPES
================================ */
export interface AuditLog {
  id: number;
  action: string;
  details: string;
  performedBy: number; 
  landId?: number | string;
  blockchainTxHash?: string;
  createdAt: string;
  // Nested data from the Backend Join (Users table)
  actor?: { 
    fullName: string; 
    role: string; 
  }; 
}

/* ================================
   AUDIT API
================================ */
export const auditApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Fetches the global activity feed for Admins
    getAuditLogs: builder.query<AuditLog[], void>({
      query: () => "/admin/audit-logs",
      providesTags: ["Audit"],
    }),
  }),
});

export const { useGetAuditLogsQuery } = auditApi;