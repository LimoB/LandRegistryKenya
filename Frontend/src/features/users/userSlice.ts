import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User } from "./userApi";

/* ============================================================
   STATE TYPES
============================================================ */
interface UserState {
  selectedUser: User | null;
  currentUser: User | null;

  showEditModal: boolean;
  showProfileModal: boolean;
  showViewModal: boolean;

  loading: {
    fetch: boolean;
    save: boolean;
    global: boolean;
  };
}

/* ============================================================
   INITIAL STATE
============================================================ */
const initialState: UserState = {
  selectedUser: null,
  currentUser: null,

  showEditModal: false,
  showProfileModal: false,
  showViewModal: false,

  loading: {
    fetch: false,
    save: false,
    global: false,
  },
};

/* ============================================================
   SLICE
============================================================ */
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {

    /* ======================
       USER SELECTION
    ====================== */
    setSelectedUser: (state, action: PayloadAction<User | null>) => {
      state.selectedUser = action.payload;
    },

    setCurrentUser: (state, action: PayloadAction<User | null>) => {
      state.currentUser = action.payload;
    },

    /* ======================
       LOADING STATES
    ====================== */
    setUserLoading: (
      state,
      action: PayloadAction<{
        type: keyof UserState["loading"];
        value: boolean;
      }>
    ) => {
      const { type, value } = action.payload;
      state.loading[type] = value;
    },

    /* ======================
       MODALS CONTROL
    ====================== */
    openEditModal: (state, action: PayloadAction<User | null>) => {
      state.selectedUser = action.payload;
      state.showEditModal = true;
    },
    closeEditModal: (state) => {
      state.showEditModal = false;
      state.selectedUser = null;
    },

    openProfileModal: (state, action: PayloadAction<User | null>) => {
      state.selectedUser = action.payload;
      state.showProfileModal = true;
    },
    closeProfileModal: (state) => {
      state.showProfileModal = false;
      state.selectedUser = null;
    },

    openViewModal: (state, action: PayloadAction<User | null>) => {
      state.selectedUser = action.payload;
      state.showViewModal = true;
    },
    closeViewModal: (state) => {
      state.showViewModal = false;
      state.selectedUser = null;
    },

    /* ======================
       RESET STATE
    ====================== */
    resetUserState: () => initialState,
  },
});

/* ============================================================
   EXPORTS
============================================================ */
export const {
  setSelectedUser,
  setCurrentUser,

  setUserLoading,

  openEditModal,
  closeEditModal,

  openProfileModal,
  closeProfileModal,

  openViewModal,
  closeViewModal,

  resetUserState,
} = userSlice.actions;

export default userSlice.reducer;