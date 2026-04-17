import { baseApi } from "../../app/api/baseApi";

/* ============================================================
   TYPES
============================================================ */
export type PaymentMethod = "stripe" | "mpesa";
export type PaymentStatus = "pending" | "completed" | "failed";

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

  transferRequest?: Record<string, unknown>; // backend includes relation
}

export interface StripeCheckoutResponse {
  url: string;
  sessionId: string;
}

/* ============================================================
   PAYMENT API
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
    }),

    /* ======================
       GET PAYMENT BY TRANSFER
    ====================== */
    getPaymentByTransfer: builder.query<Payment, number>({
      query: (transferId) => `/payments/transfer/${transferId}`,
    }),

    /* ======================
       GET ALL PAYMENTS (ADMIN)
    ====================== */
    getAllPayments: builder.query<Payment[], void>({
      query: () => "/payments",
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