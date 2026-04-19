import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Land } from "./landApi";

/* ============================================================
   TYPES
============================================================ */
type VerificationFilter = "all" | "pending" | "verified" | "rejected";

interface LandState {
  selectedLand: Land | null;

  filterByVerification: VerificationFilter;

  isRegisterModalOpen: boolean;
  isVerifyModalOpen: boolean;

  /* ================================
     MARKETPLACE UI STATE
  ================================ */
  isListingModalOpen: boolean;
  isRemovingSaleModalOpen: boolean;

  listingLand: Land | null;
}

/* ============================================================
   INITIAL STATE
============================================================ */
const initialState: LandState = {
  selectedLand: null,

  filterByVerification: "all",

  isRegisterModalOpen: false,
  isVerifyModalOpen: false,

  isListingModalOpen: false,
  isRemovingSaleModalOpen: false,

  listingLand: null,
};

/* ============================================================
   SLICE
============================================================ */
const landSlice = createSlice({
  name: "land",
  initialState,
  reducers: {

    /* ============================================================
       SELECTION
    ============================================================ */
    setSelectedLand: (state, action: PayloadAction<Land | null>) => {
      state.selectedLand = action.payload;
    },

    /* ============================================================
       FILTERING
    ============================================================ */
    setFilterByVerification: (
      state,
      action: PayloadAction<VerificationFilter>
    ) => {
      state.filterByVerification = action.payload;
    },

    /* ============================================================
       REGISTER MODAL
    ============================================================ */
    openRegisterModal: (state) => {
      state.isRegisterModalOpen = true;
    },

    closeRegisterModal: (state) => {
      state.isRegisterModalOpen = false;
    },

    /* ============================================================
       VERIFY MODAL
    ============================================================ */
    openVerifyModal: (state, action: PayloadAction<Land>) => {
      state.isVerifyModalOpen = true;
      state.selectedLand = action.payload;
    },

    closeVerifyModal: (state) => {
      state.isVerifyModalOpen = false;
      state.selectedLand = null;
    },

    /* ============================================================
       LIST FOR SALE MODAL
    ============================================================ */
    openListingModal: (state, action: PayloadAction<Land>) => {
      state.isListingModalOpen = true;
      state.listingLand = action.payload;
    },

    closeListingModal: (state) => {
      state.isListingModalOpen = false;
      state.listingLand = null;
    },

    /* ============================================================
       REMOVE FROM SALE MODAL
    ============================================================ */
    openRemoveSaleModal: (state, action: PayloadAction<Land>) => {
      state.isRemovingSaleModalOpen = true;
      state.listingLand = action.payload;
    },

    closeRemoveSaleModal: (state) => {
      state.isRemovingSaleModalOpen = false;
      state.listingLand = null;
    },

    /* ============================================================
       OPTIMISTIC UI UPDATES (IMPORTANT FOR UX)
    ============================================================ */

    markLandAsForSale: (
      state,
      action: PayloadAction<{ landId: number; price: number }>
    ) => {
      const land = state.selectedLand;

      if (land && land.id === action.payload.landId) {
        land.isForSale = true;
        land.priceInKsh = action.payload.price;
      }
    },

    removeLandFromSaleUI: (
      state,
      action: PayloadAction<number>
    ) => {
      const land = state.selectedLand;

      if (land && land.id === action.payload) {
        land.isForSale = false;
        land.priceInKsh = undefined;
      }
    },

    /* ============================================================
       RESET STATE
    ============================================================ */
    resetLandState: () => initialState,
  },
});

/* ============================================================
   EXPORT ACTIONS
============================================================ */
export const {
  setSelectedLand,
  setFilterByVerification,

  openRegisterModal,
  closeRegisterModal,

  openVerifyModal,
  closeVerifyModal,

  openListingModal,
  closeListingModal,

  openRemoveSaleModal,
  closeRemoveSaleModal,

  markLandAsForSale,
  removeLandFromSaleUI,

  resetLandState,
} = landSlice.actions;

/* ============================================================
   EXPORT REDUCER
============================================================ */
export default landSlice.reducer;