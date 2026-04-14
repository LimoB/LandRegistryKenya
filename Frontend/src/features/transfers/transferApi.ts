import { baseApi } from "../../app/api/baseApi";

/* ================================
   TYPES
================================ */
export interface TransferRequest {
  id: number;
  landId: number;
  buyerId: number;
  sellerId: number;
  status: "pending" | "approved" | "rejected" | "transferred" | "verified";
  mpesaReceiptCode: string;
  blockchainTxHash?: string;
  createdAt: string;
  land: {
    lrNumber: string;
    county?: string;
    onChainId: number;
  };
  buyer: {
    fullName: string;
    idNumber?: string;
    walletAddress: string;
  };
  seller: {
    fullName: string;
  };
}

export interface InitiateTransferPayload {
  landId: number;
  sellerId: number;
  mpesaReceiptCode: string;
}

/* ================================
   TRANSFER API
================================ */
export const transferApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 1️⃣ Initiate Transfer (Buyer)
    initiateTransfer: builder.mutation<{ message: string; request: TransferRequest }, InitiateTransferPayload>({
      query: (body) => ({
        url: "/transfers/initiate",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Transfer"],
    }),

    // 2️⃣ Get Pending Transfers (Officer)
    getPendingTransfers: builder.query<TransferRequest[], void>({
      query: () => "/transfers/pending",
      providesTags: ["Transfer"],
    }),

    // 3️⃣ Get My Sales (Seller)
    getMySales: builder.query<TransferRequest[], void>({
      query: () => "/transfers/my-sales",
      providesTags: ["Transfer"],
    }),

    // 4️⃣ Approve Transfer (Officer)
    approveTransfer: builder.mutation<{ message: string; txHash: string }, number>({
      query: (id) => ({
        url: `/transfers/approve/${id}`,
        method: "PATCH",
      }),
      invalidatesTags: ["Transfer", "Land"], // Invalidate Land to show new owner
    }),

    // 5️⃣ Reject Transfer (Officer)
    rejectTransfer: builder.mutation<{ message: string }, { id: number; reason: string }>({
      query: ({ id, reason }) => ({
        url: `/transfers/reject/${id}`,
        method: "PATCH",
        body: { reason },
      }),
      invalidatesTags: ["Transfer"],
    }),
  }),
});

export const {
  useInitiateTransferMutation,
  useGetPendingTransfersQuery,
  useGetMySalesQuery,
  useApproveTransferMutation,
  useRejectTransferMutation,
} = transferApi;