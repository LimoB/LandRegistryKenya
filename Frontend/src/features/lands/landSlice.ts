import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Land } from "./landApi";

/* ================================
   TYPES
================================ */
type VerificationFilter =
  | "all"
  | "pending"
  | "verified"
  | "rejected";

/* ================================
   STATE (UI ONLY)
================================ */
interface LandState {
  selectedLand: Land | null;

  filterByVerification: VerificationFilter;

  isRegisterModalOpen: boolean;
  isVerifyModalOpen: boolean;
}

/* ================================
   INITIAL STATE
================================ */
const initialState: LandState = {
  selectedLand: null,

  filterByVerification: "all",

  isRegisterModalOpen: false,
  isVerifyModalOpen: false,
};

/* ================================
   SLICE
================================ */
const landSlice = createSlice({
  name: "land",
  initialState,
  reducers: {
    /* ======================
       SELECTION
    ====================== */
    setSelectedLand: (state, action: PayloadAction<Land | null>) => {
      state.selectedLand = action.payload;
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

    openVerifyModal: (state, action: PayloadAction<Land>) => {
      state.isVerifyModalOpen = true;
      state.selectedLand = action.payload;
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

/* ================================
   EXPORTS
================================ */
export const {
  setSelectedLand,
  setFilterByVerification,

  openRegisterModal,
  closeRegisterModal,

  openVerifyModal,
  closeVerifyModal,

  resetLandState,
} = landSlice.actions;

export default landSlice.reducer;