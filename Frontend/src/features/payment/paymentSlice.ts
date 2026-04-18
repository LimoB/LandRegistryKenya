import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Payment } from "./paymentApi";

/* ============================================================
   STATE (UI ONLY)
============================================================ */
interface PaymentState {
  selectedPayment: Payment | null;
  lastStripeSessionId: string | null;
  isStripeRedirecting: boolean;
}

const initialState: PaymentState = {
  selectedPayment: null,
  lastStripeSessionId: null,
  isStripeRedirecting: false,
};

/* ============================================================
   SLICE
============================================================ */
const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    /* ======================
       SELECTION
    ====================== */
    setSelectedPayment: (
      state,
      action: PayloadAction<Payment | null>
    ) => {
      state.selectedPayment = action.payload;
    },

    /* ======================
       STRIPE SESSION TRACKING
    ====================== */
    setLastStripeSessionId: (
      state,
      action: PayloadAction<string>
    ) => {
      state.lastStripeSessionId = action.payload;
    },

    /* ======================
       STRIPE REDIRECT STATE
    ====================== */
    setStripeRedirecting: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.isStripeRedirecting = action.payload;
    },

    /* ======================
       RESET
    ====================== */
    resetPaymentState: (state) => {
      state.selectedPayment = null;
      state.lastStripeSessionId = null;
      state.isStripeRedirecting = false;
    },
  },
});

/* ============================================================
   EXPORTS
============================================================ */
export const {
  setSelectedPayment,
  setLastStripeSessionId,
  setStripeRedirecting,
  resetPaymentState,
} = paymentSlice.actions;

export default paymentSlice.reducer;