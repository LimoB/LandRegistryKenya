import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { TransferRequest } from "../../features/transfers/transferApi";

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

  // UI STATE ONLY (NOT DATA LOADING)
  actionLoading: boolean;
}

const initialState: TransferState = {
  selectedTransfer: null,

  showInitiateModal: false,
  showApproveModal: false,
  showRejectModal: false,
  showPaymentModal: false,

  actionLoading: false,
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
       ACTION LOADING (for button states only)
    ============================================================ */
    setTransferActionLoading: (state, action: PayloadAction<boolean>) => {
      state.actionLoading = action.payload;
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
    openApproveModal: (state, action: PayloadAction<TransferRequest | null>) => {
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
    openRejectModal: (state, action: PayloadAction<TransferRequest | null>) => {
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
    openPaymentModal: (state, action: PayloadAction<TransferRequest | null>) => {
      state.selectedTransfer = action.payload;
      state.showPaymentModal = true;
    },
    closePaymentModal: (state) => {
      state.showPaymentModal = false;
      state.selectedTransfer = null;
    },

    /* ============================================================
       RESET ALL UI STATE
    ============================================================ */
    resetTransferState: () => initialState,
  },
});

/* ================================
   EXPORT ACTIONS
================================ */
export const {
  setSelectedTransfer,
  setTransferActionLoading,

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
   SELECTORS (OPTIONAL BUT CLEAN)
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

export const selectTransferActionLoading = (state: {
  transfer: TransferState;
}) => state.transfer.actionLoading;

export default transferSlice.reducer;