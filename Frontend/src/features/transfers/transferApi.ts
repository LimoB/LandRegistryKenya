import { baseApi } from "../../app/api/baseApi";

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
    lrNumber: string;
    county?: string;
    onChainId: number;
  };

  buyer: {
    fullName: string;
    walletAddress: string;
  };

  seller: {
    fullName: string;
  };
}

/* ================================
   PAYLOADS
================================ */
export interface InitiateTransferPayload {
  landId: number;
}

export interface RejectTransferPayload {
  id: number;
  reason: string;
}

export interface PaymentPayload {
  id: number;
  mpesaCode: string;
  amount: string;
}

/* ================================
   TRANSFER API
================================ */
export const transferApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    /* ======================
       1. INITIATE TRANSFER
    ====================== */
    initiateTransfer: builder.mutation<
      { message: string; request: TransferRequest },
      InitiateTransferPayload
    >({
      query: (body) => ({
        url: "/transfers/initiate",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Transfer"],
    }),

    /* ======================
       2. PENDING (OFFICER)
    ====================== */
    getPendingTransfers: builder.query<TransferRequest[], void>({
      query: () => "/transfers/pending",
      providesTags: ["Transfer"],
    }),

    /* ======================
       3. MY SALES (SELLER)
    ====================== */
    getMySales: builder.query<TransferRequest[], void>({
      query: () => "/transfers/my-sales",
      providesTags: ["Transfer"],
    }),

    /* ======================
       4. GET SINGLE TRANSFER
    ====================== */
    getTransferById: builder.query<TransferRequest, number>({
      query: (id) => `/transfers/${id}`,
      providesTags: (_res, _err, id) => [{ type: "Transfer", id }],
    }),

    /* ======================
       5. APPROVE (OFFICER)
    ====================== */
    approveTransfer: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/transfers/approve/${id}`,
        method: "PATCH",
      }),
      invalidatesTags: ["Transfer", "Land"],
    }),

    /* ======================
       6. REJECT (OFFICER)
    ====================== */
    rejectTransfer: builder.mutation<
      { message: string },
      RejectTransferPayload
    >({
      query: ({ id, reason }) => ({
        url: `/transfers/reject/${id}`,
        method: "PATCH",
        body: { reason },
      }),
      invalidatesTags: ["Transfer"],
    }),

    /* ======================
       7. RECORD PAYMENT
    ====================== */
    recordPayment: builder.mutation<
      { message: string },
      PaymentPayload
    >({
      query: ({ id, mpesaCode, amount }) => ({
        url: `/transfers/pay/${id}`,
        method: "POST",
        body: {
          mpesaCode,
          amount,
        },
      }),
      invalidatesTags: ["Transfer"],
    }),

    /* ======================
       8. FINALIZE (BLOCKCHAIN)
    ====================== */
    finalizeTransfer: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/transfers/finalize/${id}`,
        method: "PATCH",
      }),
      invalidatesTags: ["Transfer", "Land"],
    }),
  }),
});

/* ================================
   HOOKS
================================ */
export const {
  useInitiateTransferMutation,
  useGetPendingTransfersQuery,
  useGetMySalesQuery,
  useGetTransferByIdQuery,

  useApproveTransferMutation,
  useRejectTransferMutation,
  useRecordPaymentMutation,
  useFinalizeTransferMutation,
} = transferApi;