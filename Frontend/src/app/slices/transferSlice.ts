import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { TransferRequest } from "../../features/transfers/transferApi";

/* ================================
   STATE INTERFACE
================================ */
interface TransferState {
  transfers: TransferRequest[];
  selectedTransfer: TransferRequest | null;

  showInitiateModal: boolean;
  showApproveModal: boolean;
  showRejectModal: boolean;
  showPaymentModal: boolean;

  isLoading: boolean;
}

const initialState: TransferState = {
  transfers: [],
  selectedTransfer: null,

  showInitiateModal: false,
  showApproveModal: false,
  showRejectModal: false,
  showPaymentModal: false,

  isLoading: false,
};

/* ================================
   SLICE
================================ */
const transferSlice = createSlice({
  name: "transfer",
  initialState,
  reducers: {
    /* ======================
       DATA
    ====================== */
    setSelectedTransfer: (
      state,
      action: PayloadAction<TransferRequest | null>
    ) => {
      state.selectedTransfer = action.payload;
    },

    setTransfers: (
      state,
      action: PayloadAction<TransferRequest[]>
    ) => {
      state.transfers = action.payload;
    },

    setTransferLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    /* ======================
       MODALS
    ====================== */
    openInitiateModal: (state) => {
      state.showInitiateModal = true;
    },
    closeInitiateModal: (state) => {
      state.showInitiateModal = false;
    },

    openApproveModal: (state) => {
      state.showApproveModal = true;
    },
    closeApproveModal: (state) => {
      state.showApproveModal = false;
      state.selectedTransfer = null;
    },

    openRejectModal: (state) => {
      state.showRejectModal = true;
    },
    closeRejectModal: (state) => {
      state.showRejectModal = false;
      state.selectedTransfer = null;
    },

    openPaymentModal: (state) => {
      state.showPaymentModal = true;
    },
    closePaymentModal: (state) => {
      state.showPaymentModal = false;
      state.selectedTransfer = null;
    },

    /* ======================
       RESET
    ====================== */
    resetTransferState: () => initialState,
  },
});

export const {
  setSelectedTransfer,
  setTransfers,
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

export default transferSlice.reducer;