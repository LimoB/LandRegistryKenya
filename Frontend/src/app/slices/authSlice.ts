import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

/* ================================
   TYPES
================================ */
export type UserRole = "admin" | "land_officer" | "citizen";

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  walletAddress: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
}

/* ================================
   SAFE INITIALIZATION
   Handles potential JSON.parse errors gracefully
================================ */
const getInitialUser = (): User | null => {
  try {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error("Auth initialization error:", error);
    localStorage.removeItem("user"); // Wipe corrupt data
    return null;
  }
};

const initialState: AuthState = {
  user: getInitialUser(),
  token: localStorage.getItem("token") || null,
};

/* ================================
   SLICE
================================ */
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    /**
     * Set credentials upon successful Login or Registration.
     * Persists data to localStorage for persistence across reloads.
     */
    setCredentials: (
      state,
      action: PayloadAction<{
        token: string;
        user: User;
      }>
    ) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
    },

    /**
     * Clears local state and storage.
     */
    logout: (state) => {
      state.user = null;
      state.token = null;

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Optional: Clear other app-specific caches here
    },

    /**
     * Update user details specifically (e.g., after profile update)
     */
    updateUser: (state, action: PayloadAction<User>) => {
        state.user = action.payload;
        localStorage.setItem("user", JSON.stringify(action.payload));
    }
  },
});

export const { setCredentials, logout, updateUser } = authSlice.actions;

/* ================================
   SELECTORS
================================ */
export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectCurrentToken = (state: { auth: AuthState }) => state.auth.token;

export default authSlice.reducer;