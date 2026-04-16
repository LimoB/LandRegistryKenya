import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User } from "../../features/users/userApi";

interface UserState {
  selectedUser: User | null;
  currentUser: User | null;

  showEditModal: boolean;
  showProfileModal: boolean;

  isLoading: boolean;
}

const initialState: UserState = {
  selectedUser: null,
  currentUser: null,

  showEditModal: false,
  showProfileModal: false,

  isLoading: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setSelectedUser: (state, action: PayloadAction<User | null>) => {
      state.selectedUser = action.payload;
    },

    setCurrentUser: (state, action: PayloadAction<User | null>) => {
      state.currentUser = action.payload;
    },

    setUserLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

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

    resetUserState: () => initialState,
  },
});

export const {
  setSelectedUser,
  setCurrentUser,
  setUserLoading,
  openEditModal,
  closeEditModal,
  openProfileModal,
  closeProfileModal,
  resetUserState,
} = userSlice.actions;

export default userSlice.reducer;