import { baseApi } from "../../services/baseApi";

/* ============================================================
   TYPES
=========================================================== */
export interface TransferRequest {
  blockchainStatus: string;
  id: number;
  landId: number;
  buyerId: number;
  sellerId: number;
  status: "pending" | "payment_pending" | "paid" | "completed" | "rejected";
  mpesaReceiptCode?: string;
  blockchainTxHash?: string;
  createdAt: string;

  land: {
    id: number;
    lrNumber: string;
    county?: string;
    onChainId: number;
    priceInKsh: string | number;
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
  message?: string;
  data: T;
}

/* ============================================================
   API DEFINITION
============================================================ */
export const transferApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    /* ========================================================
       1. CREATE TRANSFER (BUYER)
    ======================================================== */
    createTransfer: builder.mutation<
      WrappedResponse<TransferRequest>,
      { landId: number }
    >({
      query: (body) => ({
        url: "/transfers",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Transfer", id: "LIST" }],
    }),

    /* ========================================================
       2. GET MY TRANSFERS
    ======================================================== */
    getMyTransfers: builder.query<TransferRequest[], void>({
      query: () => "/transfers/my-requests",
      transformResponse: (res: WrappedResponse<TransferRequest[]>) => res.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map((t) => ({ type: "Transfer" as const, id: t.id })),
              { type: "Transfer", id: "LIST" },
            ]
          : [{ type: "Transfer", id: "LIST" }],
    }),

    /* ========================================================
       3. GET MY SALES
    ======================================================== */
    getMySales: builder.query<TransferRequest[], void>({
      query: () => "/transfers/my-sales",
      transformResponse: (res: WrappedResponse<TransferRequest[]>) => res.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map((t) => ({ type: "Transfer" as const, id: t.id })),
              { type: "Transfer", id: "LIST" },
            ]
          : [{ type: "Transfer", id: "LIST" }],
    }),

    /* ========================================================
       4. GET PENDING (OFFICER)
    ======================================================== */
    getPendingTransfers: builder.query<TransferRequest[], void>({
      query: () => "/transfers/pending",
      transformResponse: (res: WrappedResponse<TransferRequest[]>) => res.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map((t) => ({ type: "Transfer" as const, id: t.id })),
              { type: "Transfer", id: "LIST" },
            ]
          : [{ type: "Transfer", id: "LIST" }],
    }),

    /* ========================================================
       5. GET SINGLE TRANSFER
    ======================================================== */
    getTransferById: builder.query<TransferRequest, number>({
      query: (id) => `/transfers/${id}`,
      transformResponse: (res: WrappedResponse<TransferRequest>) => res.data,
      providesTags: (_result, _error, id) => [
        { type: "Transfer", id },
      ],
    }),

    /* ========================================================
       6. APPROVE TRANSFER
    ======================================================== */
    approveTransfer: builder.mutation<WrappedResponse<TransferRequest>, number>({
      query: (id) => ({
        url: `/transfers/${id}/approve`,
        method: "PATCH",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Transfer", id },
        { type: "Transfer", id: "LIST" },
      ],
    }),

    /* ========================================================
       7. REJECT TRANSFER
    ======================================================== */
    rejectTransfer: builder.mutation<
      WrappedResponse<TransferRequest>,
      { id: number; reason: string }
    >({
      query: ({ id, reason }) => ({
        url: `/transfers/${id}/reject`,
        method: "PATCH",
        body: { reason },
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "Transfer", id: arg.id },
        { type: "Transfer", id: "LIST" },
      ],
    }),

    /* ========================================================
       8. 🔥 RETRY BLOCKCHAIN (NEW)
       POST /transfers/:id/retry-blockchain
    ======================================================== */
    retryBlockchain: builder.mutation<
      { success: boolean },
      number
    >({
      query: (transferId) => ({
        url: `/transfers/${transferId}/retry-blockchain`,
        method: "POST",
      }),

      // 🔥 THIS IS IMPORTANT → forces UI refresh
      invalidatesTags: (_result, _error, transferId) => [
        { type: "Transfer", id: transferId },
        { type: "Transfer", id: "LIST" },
      ],
    }),

  }),
});

/* ============================================================
   EXPORT HOOKS
============================================================ */
export const {
  useCreateTransferMutation,
  useGetMyTransfersQuery,
  useGetMySalesQuery,
  useGetPendingTransfersQuery,
  useGetTransferByIdQuery,
  useApproveTransferMutation,
  useRejectTransferMutation,
  useRetryBlockchainMutation, // ✅ NEW
} = transferApi;