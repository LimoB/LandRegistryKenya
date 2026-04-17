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

export interface MpesaPaymentPayload {
  amount: string;
  mpesaCode: string;
}

/* ================================
   TRANSFER API
================================ */
export const transferApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    /* ============================================================
       1. CREATE TRANSFER REQUEST
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
      invalidatesTags: ["Transfer"],
    }),

    /* ============================================================
       2. GET PENDING TRANSFERS (OFFICER)
    ============================================================ */
    getPendingTransfers: builder.query<TransferRequest[], void>({
      query: () => "/transfers/pending",
      providesTags: ["Transfer"],
    }),

    /* ============================================================
       3. GET SINGLE TRANSFER
    ============================================================ */
    getTransferById: builder.query<TransferRequest, number>({
      query: (id) => `/transfers/${id}`,
      providesTags: (_res, _err, id) => [{ type: "Transfer", id }],
    }),

    /* ============================================================
       4. APPROVE TRANSFER (OFFICER)
    ============================================================ */
    approveTransfer: builder.mutation<
      { message: string },
      number
    >({
      query: (id) => ({
        url: `/transfers/approve/${id}`,
        method: "PATCH",
      }),
      invalidatesTags: ["Transfer"],
    }),

    /* ============================================================
       5. REJECT TRANSFER (OFFICER)
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
      invalidatesTags: ["Transfer"],
    }),

    /* ============================================================
       6. MARK AS PAID (MPESA / STRIPE)
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
      invalidatesTags: ["Transfer"],
    }),

    /* ============================================================
       7. FINALIZE TRANSFER (BLOCKCHAIN)
    ============================================================ */
    finalizeTransfer: builder.mutation<
      { message: string; txHash: string },
      number
    >({
      query: (id) => ({
        url: `/transfers/finalize/${id}`,
        method: "PATCH",
      }),
      invalidatesTags: ["Transfer", "Land"],
    }),

    /* ============================================================
       8. GET MY SALES (SELLER VIEW)
    ============================================================ */
    getMySales: builder.query<TransferRequest[], number>({
      query: (sellerId) => `/transfers/seller/${sellerId}`,
      providesTags: ["Transfer"],
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