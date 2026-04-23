import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Land } from "./landApi";

/* ============================================================
   TYPES
============================================================ */
type VerificationFilter = "all" | "pending" | "verified" | "rejected";

interface LandState {
  // Currently selected land for details view or verification
  selectedLand: Land | null;
  
  // Land currently being targeted for listing/removing from sale
  listingLand: Land | null;

  // Filter and Search UI state
  filterByVerification: VerificationFilter;
  searchQuery: string;

  // Modal visibility states
  isRegisterModalOpen: boolean;
  isVerifyModalOpen: boolean;
  isListingModalOpen: boolean;
  isRemovingSaleModalOpen: boolean;
}

/* ============================================================
   INITIAL STATE
============================================================ */
const initialState: LandState = {
  selectedLand: null,
  listingLand: null,

  filterByVerification: "all",
  searchQuery: "",

  isRegisterModalOpen: false,
  isVerifyModalOpen: false,
  isListingModalOpen: false,
  isRemovingSaleModalOpen: false,
};

/* ============================================================
   SLICE
============================================================ */
const landSlice = createSlice({
  name: "land",
  initialState,
  reducers: {

    /* --- SELECTION & SEARCH --- */
    setSelectedLand: (state, action: PayloadAction<Land | null>) => {
      state.selectedLand = action.payload;
    },

    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },

    /* --- FILTERING --- */
    setFilterByVerification: (
      state,
      action: PayloadAction<VerificationFilter>
    ) => {
      state.filterByVerification = action.payload;
    },

    /* --- REGISTER MODAL --- */
    openRegisterModal: (state) => {
      state.isRegisterModalOpen = true;
    },
    closeRegisterModal: (state) => {
      state.isRegisterModalOpen = false;
    },

    /* --- VERIFY MODAL --- */
    openVerifyModal: (state, action: PayloadAction<Land>) => {
      state.isVerifyModalOpen = true;
      state.selectedLand = action.payload;
    },
    closeVerifyModal: (state) => {
      state.isVerifyModalOpen = false;
      state.selectedLand = null;
    },

    /* --- LIST FOR SALE MODAL --- */
    openListingModal: (state, action: PayloadAction<Land>) => {
      state.isListingModalOpen = true;
      state.listingLand = action.payload;
    },
    closeListingModal: (state) => {
      state.isListingModalOpen = false;
      state.listingLand = null;
    },

    /* --- REMOVE FROM SALE MODAL --- */
    openRemoveSaleModal: (state, action: PayloadAction<Land>) => {
      state.isRemovingSaleModalOpen = true;
      state.listingLand = action.payload;
    },
    closeRemoveSaleModal: (state) => {
      state.isRemovingSaleModalOpen = false;
      state.listingLand = null;
    },

    /* --- OPTIMISTIC UI UPDATES --- */
    // Note: These help the UI feel snappy while waiting for blockchain events
    markLandAsForSaleUI: (
      state,
      action: PayloadAction<{ landId: number; price: string }>
    ) => {
      if (state.selectedLand?.id === action.payload.landId) {
        state.selectedLand.isForSale = true;
        state.selectedLand.priceInKsh = action.payload.price;
      }
      if (state.listingLand?.id === action.payload.landId) {
        state.listingLand.isForSale = true;
        state.listingLand.priceInKsh = action.payload.price;
      }
    },

    removeLandFromSaleUI: (state, action: PayloadAction<number>) => {
      if (state.selectedLand?.id === action.payload) {
        state.selectedLand.isForSale = false;
        state.selectedLand.priceInKsh = undefined;
      }
      if (state.listingLand?.id === action.payload) {
        state.listingLand.isForSale = false;
        state.listingLand.priceInKsh = undefined;
      }
    },

    /* --- RESET STATE --- */
    resetLandState: () => initialState,
  },
});

/* ============================================================
   EXPORT ACTIONS & REDUCER
============================================================ */
export const {
  setSelectedLand,
  setSearchQuery,
  setFilterByVerification,
  openRegisterModal,
  closeRegisterModal,
  openVerifyModal,
  closeVerifyModal,
  openListingModal,
  closeListingModal,
  openRemoveSaleModal,
  closeRemoveSaleModal,
  markLandAsForSaleUI,
  removeLandFromSaleUI,
  resetLandState,
} = landSlice.actions;

export default landSlice.reducer;