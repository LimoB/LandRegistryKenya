import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Land } from "../../features/lands/landApi";

interface LandState {
  selectedLand: Land | null;
  filterByVerification: "all" | "pending" | "verified" | "rejected";
  isRegisterModalOpen: boolean;
}

const initialState: LandState = {
    selectedLand: null,
    filterByVerification: "all",
    isRegisterModalOpen: false,
    // REMOVED: lands: undefined (RTK Query handles this now)
};

const landSlice = createSlice({
  name: "land",
  initialState,
  reducers: {
    setSelectedLand: (state, action: PayloadAction<Land | null>) => {
      state.selectedLand = action.payload;
    },
    setFilterByVerification: (
      state,
      action: PayloadAction<"all" | "pending" | "verified" | "rejected">
    ) => {
      state.filterByVerification = action.payload;
    },
    openRegisterModal: (state) => {
      state.isRegisterModalOpen = true;
    },
    closeRegisterModal: (state) => {
      state.isRegisterModalOpen = false;
    },
  },
});

export const {
  setSelectedLand,
  setFilterByVerification,
  openRegisterModal,
  closeRegisterModal,
} = landSlice.actions;

export default landSlice.reducer;