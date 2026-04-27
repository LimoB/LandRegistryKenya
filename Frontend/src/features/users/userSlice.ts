import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User } from "./userApi";

/* ============================================================
   STATE TYPES
============================================================ */
interface UserState {
  // currentUser is the logged-in user (from /me)
  currentUser: User | null;
  // selectedUser is for Admin/Officer management tasks
  selectedUser: User | null;

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
  currentUser: null,
  selectedUser: null,

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
       AUTH & IDENTITY
    ====================== */
    // Used when the app loads or after login to store "Me"
    setCurrentUser: (state, action: PayloadAction<User | null>) => {
      state.currentUser = action.payload;
    },

    /* ======================
       USER SELECTION (ADMIN)
    ====================== */
    setSelectedUser: (state, action: PayloadAction<User | null>) => {
      state.selectedUser = action.payload;
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
    // For Admin to edit a citizen/officer
    openEditModal: (state, action: PayloadAction<User>) => {
      state.selectedUser = action.payload;
      state.showEditModal = true;
    },
    closeEditModal: (state) => {
      state.showEditModal = false;
      state.selectedUser = null;
    },

    // For a user to view/edit their own profile
    openProfileModal: (state) => {
      state.showProfileModal = true;
    },
    closeProfileModal: (state) => {
      state.showProfileModal = false;
    },

    // For Admin/Officer to view detailed land/history of a user
    openViewModal: (state, action: PayloadAction<User>) => {
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