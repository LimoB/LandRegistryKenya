import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { TransferRequest } from "./transferApi";

/* ================================
   STATE INTERFACE
================================ */
interface TransferState {
  selectedTransfer: TransferRequest | null;

  // MODALS
  showInitiateModal: boolean;
  showApproveModal: boolean;
  showRejectModal: boolean;
  showPaymentModal: boolean;

  // ACTION STATES (granular instead of one boolean)
  loading: {
    initiate: boolean;
    approve: boolean;
    reject: boolean;
    payment: boolean;
  };
}

/* ================================
   INITIAL STATE
================================ */
const initialState: TransferState = {
  selectedTransfer: null,

  showInitiateModal: false,
  showApproveModal: false,
  showRejectModal: false,
  showPaymentModal: false,

  loading: {
    initiate: false,
    approve: false,
    reject: false,
    payment: false,
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

    /* ============================================================
       LOADING STATES (GRANULAR)
    ============================================================ */
    setTransferLoading: (
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
       INITIATE MODAL
    ============================================================ */
    openInitiateModal: (state) => {
      state.showInitiateModal = true;
    },
    closeInitiateModal: (state) => {
      state.showInitiateModal = false;
    },

    /* ============================================================
       APPROVE MODAL
    ============================================================ */
    openApproveModal: (
      state,
      action: PayloadAction<TransferRequest>
    ) => {
      state.selectedTransfer = action.payload;
      state.showApproveModal = true;
    },
    closeApproveModal: (state) => {
      state.showApproveModal = false;
      state.selectedTransfer = null;
    },

    /* ============================================================
       REJECT MODAL
    ============================================================ */
    openRejectModal: (
      state,
      action: PayloadAction<TransferRequest>
    ) => {
      state.selectedTransfer = action.payload;
      state.showRejectModal = true;
    },
    closeRejectModal: (state) => {
      state.showRejectModal = false;
      state.selectedTransfer = null;
    },

    /* ============================================================
       PAYMENT MODAL
    ============================================================ */
    openPaymentModal: (
      state,
      action: PayloadAction<TransferRequest>
    ) => {
      state.selectedTransfer = action.payload;
      state.showPaymentModal = true;
    },
    closePaymentModal: (state) => {
      state.showPaymentModal = false;
      state.selectedTransfer = null;
    },

    /* ============================================================
       RESET ALL STATE
    ============================================================ */
    resetTransferState: () => initialState,
  },
});

/* ================================
   EXPORT ACTIONS
================================ */
export const {
  setSelectedTransfer,
  setTransferLoading,

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
export const selectSelectedTransfer = (state: {
  transfer: TransferState;
}) => state.transfer.selectedTransfer;

export const selectTransferModals = (state: {
  transfer: TransferState;
}) => ({
  initiate: state.transfer.showInitiateModal,
  approve: state.transfer.showApproveModal,
  reject: state.transfer.showRejectModal,
  payment: state.transfer.showPaymentModal,
});

export const selectTransferLoading = (state: {
  transfer: TransferState;
}) => state.transfer.loading;

export default transferSlice.reducer;