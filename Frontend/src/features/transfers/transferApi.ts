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

  // Added these nested objects to match the Backend 'with' query
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

export interface ApproveTransferPayload {
  blockchainTxHash: string;
  status: string; 
}

/* ================================
   TRANSFER API
================================ */
export const transferApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 1️⃣ Initiate Transfer (Buyer)
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

    // 2️⃣ Get Pending Transfers (Officer)
    getPendingTransfers: builder.query<TransferRequest[], void>({
      query: () => "/transfers/pending",
      providesTags: ["Transfer"],
    }),

    // 3️⃣ Approve Transfer (Officer)
    approveTransfer: builder.mutation<
      TransferRequest,
      { id: number; payload: ApproveTransferPayload }
    >({
      query: ({ id, payload }) => ({
        url: `/transfers/approve/${id}`,
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: ["Transfer"],
    }),
  }),
});

export const {
  useInitiateTransferMutation,
  useGetPendingTransfersQuery,
  useApproveTransferMutation,
} = transferApi;