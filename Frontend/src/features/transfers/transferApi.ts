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
  reason: string;
}

/* ================================
   API
================================ */
export const transferApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    /* ============================================================
       CREATE TRANSFER
    ============================================================ */
    createTransfer: builder.mutation<
      { message: string; request: TransferRequest },
      CreateTransferPayload
    >({
      query: (body) => ({
        url: "/transfers",
        method: "POST",
        body,
      }),

      invalidatesTags: [{ type: "Transfer", id: "LIST" }],
    }),

    /* ============================================================
       GET PENDING TRANSFERS
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
       APPROVE TRANSFER
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
       REJECT TRANSFER
    ============================================================ */
    rejectTransfer: builder.mutation<
      { message: string },
      { id: number; reason: string }
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
       MARK AS PAID
    ============================================================ */
    markAsPaid: builder.mutation<
      { message: string },
      { id: number; paymentMethod: "stripe" | "mpesa"; reference?: string }
    >({
      query: ({ id, paymentMethod, reference }) => ({
        url: `/transfers/pay/${id}`,
        method: "POST",
        body: {
          paymentMethod,
          reference,
        },
      }),

      invalidatesTags: (_result, _error, arg) => [
        { type: "Transfer", id: arg.id },
        { type: "Transfer", id: "LIST" },
      ],
    }),

    /* ============================================================
       FINALIZE (BLOCKCHAIN)
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
       SELLER SALES
    ============================================================ */
    getMySales: builder.query<TransferRequest[], number>({
      query: (sellerId) => `/transfers/seller/${sellerId}`,

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
  useMarkAsPaidMutation,
  useFinalizeTransferMutation,
  useGetMySalesQuery,
} = transferApi;