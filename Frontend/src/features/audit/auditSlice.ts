import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

/* ================================
   TYPES
================================ */
interface AuditFilters {
  landId: number | null;
  userId: number | null;
  actionType: string | null;

  fromDate: string | null;
  toDate: string | null;
}

/* ================================
   STATE
================================ */
interface AuditState {
  filters: AuditFilters;
}

/* ================================
   INITIAL STATE
================================ */
const initialState: AuditState = {
  filters: {
    landId: null,
    userId: null,
    actionType: null,
    fromDate: null,
    toDate: null,
  },
};

/* ================================
   SLICE
================================ */
const auditSlice = createSlice({
  name: "audit",
  initialState,
  reducers: {

    /* ======================
       UPDATE LAND FILTER
    ====================== */
    setSelectedLand: (
      state,
      action: PayloadAction<number | null>
    ) => {
      state.filters.landId = action.payload;
    },

    /* ======================
       UPDATE USER FILTER
    ====================== */
    setSelectedUser: (
      state,
      action: PayloadAction<number | null>
    ) => {
      state.filters.userId = action.payload;
    },

    /* ======================
       ACTION TYPE FILTER
    ====================== */
    setActionFilter: (
      state,
      action: PayloadAction<string | null>
    ) => {
      state.filters.actionType = action.payload;
    },

    /* ======================
       DATE RANGE FILTERS
    ====================== */
    setFromDate: (
      state,
      action: PayloadAction<string | null>
    ) => {
      state.filters.fromDate = action.payload;
    },

    setToDate: (
      state,
      action: PayloadAction<string | null>
    ) => {
      state.filters.toDate = action.payload;
    },

    /* ======================
       RESET ALL FILTERS
    ====================== */
    resetAuditFilters: (state) => {
      state.filters = {
        landId: null,
        userId: null,
        actionType: null,
        fromDate: null,
        toDate: null,
      };
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
  setFromDate,
  setToDate,
  resetAuditFilters,
} = auditSlice.actions;

export default auditSlice.reducer;