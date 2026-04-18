import { baseApi } from "../../services/baseApi";

/* ============================================================
   TYPES
============================================================ */
export type PaymentMethod = "stripe" | "mpesa";
export type PaymentStatus = "pending" | "completed" | "failed";

export interface TransferRequest {
  id: number;
  lrNumber?: string;
  status?: string;
}

export interface Payment {
  id: number;
  transferRequestId: number;
  amount: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;

  mpesaReceiptCode?: string;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;

  createdAt: string;
  updatedAt?: string;

  transferRequest?: TransferRequest;
}

export interface StripeCheckoutResponse {
  url: string;
  sessionId: string;
}

/* ============================================================
   API
============================================================ */
export const paymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    /* ======================
       STRIPE CHECKOUT
    ====================== */
    createStripeCheckout: builder.mutation<
      StripeCheckoutResponse,
      { transferId: number }
    >({
      query: (data) => ({
        url: "/payments/stripe/checkout",
        method: "POST",
        body: data,
      }),

      invalidatesTags: (_result, _error, arg) => [
        { type: "Payment", id: arg.transferId },
      ],
    }),

    /* ======================
       M-PESA PAYMENT RECORD
    ====================== */
    recordMpesaPayment: builder.mutation<
      Payment,
      {
        transferId: number;
        amount: string;
        mpesaCode: string;
      }
    >({
      query: (data) => ({
        url: "/payments/mpesa",
        method: "POST",
        body: data,
      }),

      invalidatesTags: (_result, _error, arg) => [
        { type: "Payment", id: arg.transferId },
      ],
    }),

    /* ======================
       GET PAYMENT BY TRANSFER
    ====================== */
    getPaymentByTransfer: builder.query<Payment, number>({
      query: (transferId) => `/payments/transfer/${transferId}`,

      providesTags: (_result, _error, transferId) => [
        { type: "Payment", id: transferId },
      ],
    }),

    /* ======================
       GET ALL PAYMENTS (ADMIN)
    ====================== */
    getAllPayments: builder.query<Payment[], void>({
      query: () => "/payments",

      providesTags: (result) =>
        result
          ? [
              ...result.map((p) => ({
                type: "Payment" as const,
                id: p.id,
              })),
              { type: "Payment", id: "LIST" },
            ]
          : [{ type: "Payment", id: "LIST" }],
    }),
  }),
});

/* ============================================================
   EXPORT HOOKS
============================================================ */
export const {
  useCreateStripeCheckoutMutation,
  useRecordMpesaPaymentMutation,
  useGetPaymentByTransferQuery,
  useGetAllPaymentsQuery,
} = paymentApi;