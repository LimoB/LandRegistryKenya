import { baseApi } from "../../services/baseApi";

/* ============================================================
   TYPES
=========================================================== */
export interface TransferRequest {
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
  message: string;
  data: T;
}

export interface PaymentResponse {
  checkoutUrl?: string;
  customerMessage?: string;
}

/* ============================================================
   API DEFINITION
============================================================ */
export const transferApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    
    // 1. INITIATE
    createTransfer: builder.mutation<WrappedResponse<TransferRequest>, { landId: number }>({
      query: (body) => ({
        url: "/transfers/initiate",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Transfer", id: "LIST" }],
    }),

    // 2. HISTORY
    getMyTransfers: builder.query<TransferRequest[], void>({
      query: () => "/transfers/my-requests",
      transformResponse: (res: WrappedResponse<TransferRequest[]>) => res.data,
      providesTags: (result) =>
        result 
          ? [...result.map((t) => ({ type: "Transfer" as const, id: t.id })), { type: "Transfer", id: "LIST" }]
          : [{ type: "Transfer", id: "LIST" }],
    }),

    // 3. OFFICER QUEUE
    getPendingTransfers: builder.query<TransferRequest[], void>({
      query: () => "/transfers/pending",
      transformResponse: (res: WrappedResponse<TransferRequest[]>) => res.data,
      providesTags: (result) =>
        result 
          ? [...result.map((t) => ({ type: "Transfer" as const, id: t.id })), { type: "Transfer", id: "LIST" }]
          : [{ type: "Transfer", id: "LIST" }],
    }),

    // 4. SINGLE RECORD
    getTransferById: builder.query<TransferRequest, number>({
      query: (id) => `/transfers/${id}`,
      transformResponse: (res: WrappedResponse<TransferRequest>) => res.data,
      providesTags: (_result, _error, id) => [{ type: "Transfer", id }],
    }),

    // 5. OFFICER APPROVAL
    approveTransfer: builder.mutation<WrappedResponse<null>, number>({
      query: (id) => ({
        url: `/transfers/approve/${id}`,
        method: "PATCH",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Transfer", id },
        { type: "Transfer", id: "LIST" },
      ],
    }),

    // 6. OFFICER REJECTION
    rejectTransfer: builder.mutation<WrappedResponse<null>, { id: number; reason: string }>({
      query: ({ id, reason }) => ({
        url: `/transfers/reject/${id}`,
        method: "PATCH",
        body: { reason },
      }),
      invalidatesTags: (_result, _error, arg) => [{ type: "Transfer", id: arg.id }, { type: "Transfer", id: "LIST" }],
    }),

    // 7. PAYMENT (CITIZEN)
    payTransfer: builder.mutation<WrappedResponse<PaymentResponse>, number>({
      query: (id) => ({
        url: `/transfers/pay/${id}`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, id) => [{ type: "Transfer", id }],
    }),

    // 8. BLOCKCHAIN FINALIZE
    finalizeTransfer: builder.mutation<WrappedResponse<{ txHash: string }>, number>({
      query: (id) => ({
        url: `/transfers/finalize/${id}`,
        method: "PATCH",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Transfer", id },
        { type: "Land", id: "LIST" },
      ],
    }),

    // 9. SALES DASHBOARD
    getMySales: builder.query<TransferRequest[], void>({
      query: () => "/transfers/my-sales",
      transformResponse: (res: WrappedResponse<TransferRequest[]>) => res.data,
      providesTags: (result) =>
        result 
          ? [...result.map((t) => ({ type: "Transfer" as const, id: t.id })), { type: "Transfer", id: "LIST" }]
          : [{ type: "Transfer", id: "LIST" }],
    }),
  }),
});

/* ============================================================
   EXPORT HOOKS
============================================================ */
export const {
  useCreateTransferMutation,
  useGetMyTransfersQuery,
  useGetPendingTransfersQuery,
  useGetTransferByIdQuery,
  useApproveTransferMutation,
  useRejectTransferMutation,
  usePayTransferMutation,
  useFinalizeTransferMutation,
  useGetMySalesQuery,
} = transferApi;