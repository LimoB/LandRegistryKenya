import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Payment } from "../../features/payment/paymentApi";

/* ============================================================
   STATE
============================================================ */
interface PaymentState {
  selectedPayment: Payment | null;
  lastStripeSessionId: string | null;
  loading: boolean;
}

const initialState: PaymentState = {
  selectedPayment: null,
  lastStripeSessionId: null,
  loading: false,
};

/* ============================================================
   SLICE
============================================================ */
const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    
    setSelectedPayment: (state, action: PayloadAction<Payment | null>) => {
      state.selectedPayment = action.payload;
    },

    setLastStripeSessionId: (state, action: PayloadAction<string>) => {
      state.lastStripeSessionId = action.payload;
    },

    setPaymentLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    resetPaymentState: (state) => {
      state.selectedPayment = null;
      state.lastStripeSessionId = null;
      state.loading = false;
    },
  },
});

/* ============================================================
   EXPORTS
============================================================ */
export const {
  setSelectedPayment,
  setLastStripeSessionId,
  setPaymentLoading,
  resetPaymentState,
} = paymentSlice.actions;

export default paymentSlice.reducer;