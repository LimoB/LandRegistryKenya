import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User } from "../../features/users/userApi";

/* ============================================================
   STATE TYPES
============================================================ */
interface UserState {
  selectedUser: User | null;
  currentUser: User | null;

  showEditModal: boolean;
  showProfileModal: boolean;
  showViewModal: boolean;

  isLoading: boolean;
  isFetching: boolean;
  isSaving: boolean;
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

  isLoading: false,
  isFetching: false,
  isSaving: false,
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
       LOADING STATES (MORE GRANULAR)
    ====================== */
    setUserLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setUserFetching: (state, action: PayloadAction<boolean>) => {
      state.isFetching = action.payload;
    },

    setUserSaving: (state, action: PayloadAction<boolean>) => {
      state.isSaving = action.payload;
    },

    /* ======================
       MODALS CONTROL
    ====================== */
    openEditModal: (state) => {
      state.showEditModal = true;
    },
    closeEditModal: (state) => {
      state.showEditModal = false;
    },

    openProfileModal: (state) => {
      state.showProfileModal = true;
    },
    closeProfileModal: (state) => {
      state.showProfileModal = false;
    },

    openViewModal: (state) => {
      state.showViewModal = true;
    },
    closeViewModal: (state) => {
      state.showViewModal = false;
    },

    /* ======================
       SAFE STATE RESET
    ====================== */
    resetUserState: (state) => {
      state.selectedUser = null;

      state.showEditModal = false;
      state.showProfileModal = false;
      state.showViewModal = false;

      state.isLoading = false;
      state.isFetching = false;
      state.isSaving = false;
    },
  },
});

/* ============================================================
   EXPORTS
============================================================ */
export const {
  setSelectedUser,
  setCurrentUser,

  setUserLoading,
  setUserFetching,
  setUserSaving,

  openEditModal,
  closeEditModal,

  openProfileModal,
  closeProfileModal,

  openViewModal,
  closeViewModal,

  resetUserState,
} = userSlice.actions;

export default userSlice.reducer;