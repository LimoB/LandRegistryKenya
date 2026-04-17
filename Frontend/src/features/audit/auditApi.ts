import { baseApi } from "../../app/api/baseApi";

/* ================================
   TYPES
================================ */
export interface AuditLog {
  id: number;
  actionType: string;
  description?: string;
  landId?: number;
  performedBy: number;
  createdAt: string;
}

export interface AuditResponse {
  success: boolean;
  count: number;
  data: AuditLog[];
}

/* ================================
   FILTER PARAMS
================================ */
export interface AuditFilterParams {
  landId?: number;
  performedBy?: number;
  actionType?: string;
  fromDate?: string;
  toDate?: string;
}

/* ================================
   API
================================ */
export const auditApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    /* ======================
       ALL LOGS (ADMIN)
    ====================== */
    getAuditLogs: builder.query<AuditResponse, void>({
      query: () => "/audit",
      providesTags: ["Audit"],
    }),

    /* ======================
       FILTERED LOGS
    ====================== */
    getFilteredAuditLogs: builder.query<
      AuditResponse,
      AuditFilterParams
    >({
      query: (params) => ({
        url: "/audit/filter",
        method: "GET",
        params,
      }),
      providesTags: ["Audit"],
    }),

    /* ======================
       LAND HISTORY
    ====================== */
    getAuditLogsByLand: builder.query<AuditResponse, number>({
      query: (landId) => `/audit/land/${landId}`,
      providesTags: ["Audit"],
    }),

    /* ======================
       USER ACTIVITY
    ====================== */
    getAuditLogsByUser: builder.query<AuditResponse, number>({
      query: (userId) => `/audit/user/${userId}`,
      providesTags: ["Audit"],
    }),
  }),
});

/* ================================
   EXPORT HOOKS
================================ */
export const {
  useGetAuditLogsQuery,
  useGetFilteredAuditLogsQuery,
  useGetAuditLogsByLandQuery,
  useGetAuditLogsByUserQuery,
} = auditApi;