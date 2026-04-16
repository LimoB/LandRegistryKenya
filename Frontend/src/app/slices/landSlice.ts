import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Land } from "../../features/lands/landApi";

interface LandState {
  lands: Land[];
  selectedLand: Land | null;

  filterByVerification: "all" | "pending" | "verified" | "rejected";

  isRegisterModalOpen: boolean;
  isVerifyModalOpen: boolean;
  isLoading: boolean;
}

const initialState: LandState = {
  lands: [],
  selectedLand: null,

  filterByVerification: "all",

  isRegisterModalOpen: false,
  isVerifyModalOpen: false,

  isLoading: false,
};

const landSlice = createSlice({
  name: "land",
  initialState,
  reducers: {
    /* ======================
       DATA
    ====================== */
    setLands: (state, action: PayloadAction<Land[]>) => {
      state.lands = action.payload;
    },

    setSelectedLand: (state, action: PayloadAction<Land | null>) => {
      state.selectedLand = action.payload;
    },

    setFilterByVerification: (
      state,
      action: PayloadAction<"all" | "pending" | "verified" | "rejected">
    ) => {
      state.filterByVerification = action.payload;
    },

    setLandLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    /* ======================
       MODALS
    ====================== */
    openRegisterModal: (state) => {
      state.isRegisterModalOpen = true;
    },
    closeRegisterModal: (state) => {
      state.isRegisterModalOpen = false;
    },

    openVerifyModal: (state) => {
      state.isVerifyModalOpen = true;
    },
    closeVerifyModal: (state) => {
      state.isVerifyModalOpen = false;
      state.selectedLand = null;
    },
  },
});

export const {
  setLands,
  setSelectedLand,
  setFilterByVerification,
  setLandLoading,

  openRegisterModal,
  closeRegisterModal,

  openVerifyModal,
  closeVerifyModal,
} = landSlice.actions;

export default landSlice.reducer;