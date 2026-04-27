import { baseApi } from "../../services/baseApi";

/* ============================================================
   TYPES (MATCHING BACKEND WRAPPER)
=========================================================== */
export interface TransferRequest {
  id: number;
  landId: number;
  buyerId: number;
  sellerId: number;
  status:
    | "pending"
    | "payment_pending"
    | "paid"
    | "completed"
    | "rejected";
  mpesaReceiptCode?: string;
  blockchainTxHash?: string;
  createdAt: string;
  land: {
    id: number;
    lrNumber: string;
    county?: string;
    onChainId: number;
    priceInKsh: string;
  };
  buyer: {
    id: number;
    fullName: string;
    walletAddress: string;
  };
  seller: {
    id: number;
    fullName: string;
    walletAddress?: string;
  };
}

interface WrappedResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/* ============================================================
   PAYLOADS
============================================================ */
export interface CreateTransferPayload {
  landId: number;
}

export interface RejectTransferPayload {
  id: number;
  reason: string;
}

/* ============================================================
   API
============================================================ */
export const transferApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    /* ============================================================
       INITIATE TRANSFER
    ============================================================ */
    createTransfer: builder.mutation<
      WrappedResponse<TransferRequest>,
      CreateTransferPayload
    >({
      query: (body) => ({
        url: "/transfers/initiate",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Transfer", id: "LIST" }],
    }),

    /* ============================================================
       GET ALL MY TRANSFERS (HISTORY)
       Use this for the "My Transactions" dashboard
    ============================================================ */
    getMyTransfers: builder.query<TransferRequest[], void>({
      query: () => "/transfers/my-requests",
      transformResponse: (response: WrappedResponse<TransferRequest[]>) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map((t) => ({
                type: "Transfer" as const,
                id: t.id,
              })),
              { type: "Transfer", id: "LIST" },
            ]
          : [{ type: "Transfer", id: "LIST" }],
    }),

    /* ============================================================
       GET PENDING TRANSFERS (OFFICER)
    ============================================================ */
    getPendingTransfers: builder.query<TransferRequest[], void>({
      query: () => "/transfers/pending",
      transformResponse: (response: WrappedResponse<TransferRequest[]>) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map((t) => ({
                type: "Transfer" as const,
                id: t.id,
              })),
              { type: "Transfer", id: "LIST" },
            ]
          : [{ type: "Transfer", id: "LIST" }],
    }),

    /* ============================================================
       GET SINGLE TRANSFER
    ============================================================ */
    getTransferById: builder.query<TransferRequest, number>({
      query: (id) => `/transfers/${id}`,
      transformResponse: (response: WrappedResponse<TransferRequest>) => response.data,
      providesTags: (_result, _error, id) => [
        { type: "Transfer", id },
      ],
    }),

    /* ============================================================
       APPROVE TRANSFER (OFFICER)
    ============================================================ */
    approveTransfer: builder.mutation<WrappedResponse<null>, number>({
      query: (id) => ({
        url: `/transfers/approve/${id}`,
        method: "PATCH",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Transfer", id },
        { type: "Transfer", id: "LIST" },
        { type: "Land", id: "LIST" },
      ],
    }),

    /* ============================================================
       REJECT TRANSFER (OFFICER)
    ============================================================ */
    rejectTransfer: builder.mutation<
      WrappedResponse<null>,
      RejectTransferPayload
    >({
      query: ({ id, reason }) => ({
        url: `/transfers/reject/${id}`,
        method: "PATCH",
        body: { reason },
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "Transfer", id: arg.id },
        { type: "Transfer", id: "LIST" },
      ],
    }),

    /* ============================================================
       FINALIZE TRANSFER (BLOCKCHAIN)
    ============================================================ */
    finalizeTransfer: builder.mutation<
      WrappedResponse<{ txHash: string }>,
      number
    >({
      query: (id) => ({
        url: `/transfers/finalize/${id}`,
        method: "PATCH",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Transfer", id },
        { type: "Transfer", id: "LIST" },
        { type: "Land", id: "LIST" },
      ],
    }),

    /* ============================================================
       GET MY SALES
    ============================================================ */
    getMySales: builder.query<TransferRequest[], void>({
      query: () => "/transfers/my-sales",
      transformResponse: (response: WrappedResponse<TransferRequest[]>) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map((t) => ({
                type: "Transfer" as const,
                id: t.id,
              })),
              { type: "Transfer", id: "LIST" },
            ]
          : [{ type: "Transfer", id: "LIST" }],
    }),

  }),
});

/* ================================
   HOOKS
================================ */
export const {
  useCreateTransferMutation,
  useGetMyTransfersQuery, // New hook to use in MyRequests.tsx
  useGetPendingTransfersQuery,
  useGetTransferByIdQuery,
  useApproveTransferMutation,
  useRejectTransferMutation,
  useFinalizeTransferMutation,
  useGetMySalesQuery,
} = transferApi;