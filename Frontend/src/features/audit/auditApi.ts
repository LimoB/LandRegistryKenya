import { baseApi } from "../../services/baseApi";

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

      providesTags: (result) =>
        result
          ? [
              { type: "Audit" as const, id: "LIST" },
              ...result.data.map((log) => ({
                type: "Audit" as const,
                id: log.id,
              })),
            ]
          : [{ type: "Audit" as const, id: "LIST" }],
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

      providesTags: (result) =>
        result
          ? [
              { type: "Audit" as const, id: "FILTERED" },
              ...result.data.map((log) => ({
                type: "Audit" as const,
                id: log.id,
              })),
            ]
          : [{ type: "Audit" as const, id: "FILTERED" }],
    }),

    /* ======================
       LAND HISTORY
    ====================== */
    getAuditLogsByLand: builder.query<AuditResponse, number>({
      query: (landId) => `/audit/land/${landId}`,

      providesTags: (_result, _error, landId) => [
        { type: "Audit" as const, id: `LAND-${landId}` },
      ],
    }),

    /* ======================
       USER ACTIVITY
    ====================== */
    getAuditLogsByUser: builder.query<AuditResponse, number>({
      query: (userId) => `/audit/user/${userId}`,

      providesTags: (_result, _error, userId) => [
        { type: "Audit" as const, id: `USER-${userId}` },
      ],
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