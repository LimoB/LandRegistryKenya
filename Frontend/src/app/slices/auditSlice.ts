import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

/* ================================
   TYPES
================================ */
interface AuditState {
  selectedLandId: number | null;
  selectedUserId: number | null;
  actionFilter: string | null;
}

/* ================================
   INITIAL STATE
================================ */
const initialState: AuditState = {
  selectedLandId: null,
  selectedUserId: null,
  actionFilter: null,
};

/* ================================
   SLICE
================================ */
const auditSlice = createSlice({
  name: "audit",
  initialState,
  reducers: {

    setSelectedLand: (state, action: PayloadAction<number | null>) => {
      state.selectedLandId = action.payload;
    },

    setSelectedUser: (state, action: PayloadAction<number | null>) => {
      state.selectedUserId = action.payload;
    },

    setActionFilter: (state, action: PayloadAction<string | null>) => {
      state.actionFilter = action.payload;
    },

    resetAuditFilters: (state) => {
      state.selectedLandId = null;
      state.selectedUserId = null;
      state.actionFilter = null;
    },
  },
});

/* ================================
   EXPORT ACTIONS
================================ */
export const {
  setSelectedLand,
  setSelectedUser,
  setActionFilter,
  resetAuditFilters,
} = auditSlice.actions;

export default auditSlice.reducer;