import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

/* ============================================================
   STATE (UI ONLY - MINIMAL)
============================================================ */
interface PaymentState {
  isStripeRedirecting: boolean;
}

const initialState: PaymentState = {
  isStripeRedirecting: false,
};

/* ============================================================
   SLICE
============================================================ */
const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    setStripeRedirecting: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.isStripeRedirecting = action.payload;
    },

    resetPaymentState: (state) => {
      state.isStripeRedirecting = false;
    },
  },
});

/* ============================================================
   EXPORTS
============================================================ */
export const {
  setStripeRedirecting,
  resetPaymentState,
} = paymentSlice.actions;

export default paymentSlice.reducer;