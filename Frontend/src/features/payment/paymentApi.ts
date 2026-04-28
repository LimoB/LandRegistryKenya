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
  success: boolean;
  url: string;
  sessionId: string;
}

/* ============================================================
   API
============================================================ */
export const paymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    /* ======================
       1. STRIPE CHECKOUT
       → Redirect user to Stripe
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
        { type: "Transfer", id: arg.transferId }
      ],
    }),

    /* ======================
       2. M-PESA PAYMENT RECORD
       → Manual entry → triggers backend → blockchain auto
    ====================== */
    recordMpesaPayment: builder.mutation<
      { success: boolean; data: Payment },
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
        { type: "Transfer", id: arg.transferId }
      ],
    }),

    /* ======================
       3. GET PAYMENT STATUS
       → used for polling UI
    ====================== */
    getPaymentByTransfer: builder.query<Payment | null, number>({
      query: (transferId) => `/payments/transfer/${transferId}`,

      transformResponse: (res: {
        success: boolean;
        data: Payment | null;
      }) => res.data,

      providesTags: (_result, _error, transferId) => [
        { type: "Payment", id: transferId },
      ],
    }),

    /* ======================
       4. ADMIN: ALL PAYMENTS
    ====================== */
    getAllPayments: builder.query<Payment[], void>({
      query: () => "/payments",

      transformResponse: (res: {
        success: boolean;
        data: Payment[];
      }) => res.data,

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