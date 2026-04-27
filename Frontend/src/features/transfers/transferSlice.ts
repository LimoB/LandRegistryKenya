import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { TransferRequest } from "./transferApi";

/* ================================
   STATE INTERFACE
================================ */
interface TransferState {
  // Currently viewed transfer in the TransferStatus page or Modals
  selectedTransfer: TransferRequest | null;

  // Track the history of requests for filtering or local state management
  requests: TransferRequest[];

  // MODALS
  modals: {
    initiate: boolean;
    approve: boolean;
    reject: boolean;
    payment: boolean;
  };

  // LOADING STATES (For non-RTK Query local UI feedback)
  loading: {
    initiate: boolean;
    approve: boolean;
    reject: boolean;
    payment: boolean;
    finalize: boolean;
  };
}

/* ================================
   INITIAL STATE
================================ */
const initialState: TransferState = {
  selectedTransfer: null,
  requests: [],

  modals: {
    initiate: false,
    approve: false,
    reject: false,
    payment: false,
  },

  loading: {
    initiate: false,
    approve: false,
    reject: false,
    payment: false,
    finalize: false,
  },
};

/* ================================
   SLICE
================================ */
const transferSlice = createSlice({
  name: "transfer",
  initialState,
  reducers: {
    /* ============================================================
       SELECTED TRANSFER
    ============================================================ */
    setSelectedTransfer: (
      state,
      action: PayloadAction<TransferRequest | null>
    ) => {
      state.selectedTransfer = action.payload;
    },

    clearSelectedTransfer: (state) => {
      state.selectedTransfer = null;
    },

    /* ============================================================
       MODALS (GENERIC HANDLING)
    ============================================================ */
    setModal: (
      state,
      action: PayloadAction<{
        modal: keyof TransferState["modals"];
        value: boolean;
      }>
    ) => {
      const { modal, value } = action.payload;
      state.modals[modal] = value;
    },

    /* ============================================================
       LOADING STATES (GENERIC)
    ============================================================ */
    setLoading: (
      state,
      action: PayloadAction<{
        type: keyof TransferState["loading"];
        value: boolean;
      }>
    ) => {
      const { type, value } = action.payload;
      state.loading[type] = value;
    },

    /* ============================================================
       QUICK ACTIONS (UI SHORTCUTS)
    ============================================================ */

    openInitiateModal: (state) => {
      state.modals.initiate = true;
    },
    closeInitiateModal: (state) => {
      state.modals.initiate = false;
    },

    openApproveModal: (state, action: PayloadAction<TransferRequest>) => {
      state.selectedTransfer = action.payload;
      state.modals.approve = true;
    },
    closeApproveModal: (state) => {
      state.modals.approve = false;
      state.selectedTransfer = null;
    },

    openRejectModal: (state, action: PayloadAction<TransferRequest>) => {
      state.selectedTransfer = action.payload;
      state.modals.reject = true;
    },
    closeRejectModal: (state) => {
      state.modals.reject = false;
      state.selectedTransfer = null;
    },

    openPaymentModal: (state, action: PayloadAction<TransferRequest>) => {
      state.selectedTransfer = action.payload;
      state.modals.payment = true;
    },
    closePaymentModal: (state) => {
      state.modals.payment = false;
      state.selectedTransfer = null;
    },

    /* ============================================================
       RESET
    ============================================================ */
    resetTransferState: () => initialState,
  },
});

/* ================================
   EXPORT ACTIONS
================================ */
export const {
  setSelectedTransfer,
  clearSelectedTransfer,
  setModal,
  setLoading,
  openInitiateModal,
  closeInitiateModal,
  openApproveModal,
  closeApproveModal,
  openRejectModal,
  closeRejectModal,
  openPaymentModal,
  closePaymentModal,
  resetTransferState,
} = transferSlice.actions;

/* ================================
   SELECTORS
================================ */
export const selectSelectedTransfer = (state: { transfer: TransferState }) => 
  state.transfer.selectedTransfer;

export const selectTransferModals = (state: { transfer: TransferState }) => 
  state.transfer.modals;

export const selectTransferLoading = (state: { transfer: TransferState }) => 
  state.transfer.loading;

export default transferSlice.reducer;