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
  showRejectModal: boolean; // New: For rejection reasons
}

const initialState: TransferState = {
    transfers: [],
    selectedTransfer: null,
    showInitiateModal: false,
    showApproveModal: false,
    showRejectModal: false,
};

/* ================================
   SLICE
================================ */
const transferSlice = createSlice({
  name: "transfer",
  initialState,
  reducers: {
    setSelectedTransfer: (state, action: PayloadAction<TransferRequest | null>) => {
      state.selectedTransfer = action.payload;
    },
    // Modal Toggles
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
    // General setter for local state if needed
    setTransfers: (state, action: PayloadAction<TransferRequest[]>) => {
      state.transfers = action.payload;
    }
  },
});

export const {
  setSelectedTransfer,
  openInitiateModal,
  closeInitiateModal,
  openApproveModal,
  closeApproveModal,
  openRejectModal,
  closeRejectModal,
  setTransfers
} = transferSlice.actions;

export default transferSlice.reducer;