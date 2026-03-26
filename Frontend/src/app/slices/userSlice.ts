import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User } from "../../features/users/userApi";

interface UserState {
  selectedUser: User | null;
  showEditModal: boolean;
  showProfileModal: boolean;
}

const initialState: UserState = {
  selectedUser: null,
  showEditModal: false,
  showProfileModal: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setSelectedUser: (state, action: PayloadAction<User | null>) => {
      state.selectedUser = action.payload;
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
  },
});

export const {
  setSelectedUser,
  openEditModal,
  closeEditModal,
  openProfileModal,
  closeProfileModal,
} = userSlice.actions;

export default userSlice.reducer;