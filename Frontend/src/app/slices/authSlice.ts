import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

/* ================================
   TYPES
================================ */
export type UserRole = "admin" | "land_officer" | "citizen";

export interface User {
  id: number;
  fullName: string; // Added to match backend & Sidebar requirements
  email: string;
  role: UserRole;
  walletAddress: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
}

/* ================================
   INITIAL STATE
   Pulling from localStorage to prevent state loss on refresh
================================ */
const storedUser = localStorage.getItem("user");
const storedToken = localStorage.getItem("token");

const initialState: AuthState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken || null,
};

/* ================================
   SLICE
================================ */
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        token: string;
        user: User;
      }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;

      // Persist both for session persistence
      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("user", JSON.stringify(action.payload.user));
    },

    logout: (state) => {
      state.user = null;
      state.token = null;

      // Clear all auth-related storage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;