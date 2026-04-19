import { baseApi } from "../../services/baseApi";

/* ================================
   TYPES (MATCH BACKEND)
================================ */
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

/* ================================
   PAYLOADS
================================ */
export interface CreateTransferPayload {
  landId: number;
}

export interface RejectTransferPayload {
  id: number;
  reason: string;
}

/* ================================
   API
================================ */
export const transferApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    /* ============================================================
       INITIATE TRANSFER (FIXED ✅)
    ============================================================ */
    createTransfer: builder.mutation<
      { message: string; request: TransferRequest },
      CreateTransferPayload
    >({
      query: (body) => ({
        url: "/transfers/initiate", // ✅ FIXED
        method: "POST",
        body,
      }),

      invalidatesTags: [{ type: "Transfer", id: "LIST" }],
    }),

    /* ============================================================
       GET PENDING TRANSFERS (OFFICER)
    ============================================================ */
    getPendingTransfers: builder.query<TransferRequest[], void>({
      query: () => "/transfers/pending",

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

      providesTags: (_result, _error, id) => [
        { type: "Transfer", id },
      ],
    }),

    /* ============================================================
       APPROVE TRANSFER (OFFICER)
    ============================================================ */
    approveTransfer: builder.mutation<{ message: string }, number>({
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
      { message: string },
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
      { message: string; txHash: string },
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
       GET MY SALES (FIXED ✅)
    ============================================================ */
    getMySales: builder.query<TransferRequest[], void>({
      query: () => "/transfers/my-sales", // ✅ FIXED

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
  useGetPendingTransfersQuery,
  useGetTransferByIdQuery,
  useApproveTransferMutation,
  useRejectTransferMutation,
  useFinalizeTransferMutation,
  useGetMySalesQuery,
} = transferApi;