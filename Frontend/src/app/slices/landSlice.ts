import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Land } from "../../features/lands/landApi";

/* ================================
   STATE TYPES
================================ */
type VerificationFilter =
  | "all"
  | "pending"
  | "verified"
  | "rejected";

interface LandState {
  lands: Land[];
  selectedLand: Land | null;

  filterByVerification: VerificationFilter;

  isRegisterModalOpen: boolean;
  isVerifyModalOpen: boolean;

  isLoading: boolean;
}

/* ================================
   INITIAL STATE
================================ */
const initialState: LandState = {
  lands: [],
  selectedLand: null,

  filterByVerification: "all",

  isRegisterModalOpen: false,
  isVerifyModalOpen: false,

  isLoading: false,
};

/* ================================
   SLICE
================================ */
const landSlice = createSlice({
  name: "land",
  initialState,
  reducers: {
    /* ======================
       DATA HANDLING
    ====================== */
    setLands: (state, action: PayloadAction<Land[]>) => {
      state.lands = action.payload;
    },

    setSelectedLand: (state, action: PayloadAction<Land | null>) => {
      state.selectedLand = action.payload;
    },

    setLandLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    /* ======================
       FILTERING
    ====================== */
    setFilterByVerification: (
      state,
      action: PayloadAction<VerificationFilter>
    ) => {
      state.filterByVerification = action.payload;
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

    /* ======================
       RESET
    ====================== */
    resetLandState: () => initialState,
  },
});

export const {
  setLands,
  setSelectedLand,
  setLandLoading,
  setFilterByVerification,

  openRegisterModal,
  closeRegisterModal,

  openVerifyModal,
  closeVerifyModal,

  resetLandState,
} = landSlice.actions;

export default landSlice.reducer;