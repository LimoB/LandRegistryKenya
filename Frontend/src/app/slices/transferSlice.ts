import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { TransferRequest } from "../../features/transfers/transferApi";

/* ================================
   STATE INTERFACE
================================ */
interface TransferState {
  transfers: any;
  selectedTransfer: TransferRequest | null;
  showInitiateModal: boolean;
  showApproveModal: boolean;
}

const initialState: TransferState = {
    selectedTransfer: null,
    showInitiateModal: false,
    showApproveModal: false,
    transfers: undefined
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
    },
  },
});

export const {
  setSelectedTransfer,
  openInitiateModal,
  closeInitiateModal,
  openApproveModal,
  closeApproveModal,
} = transferSlice.actions;

export default transferSlice.reducer;