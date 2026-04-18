import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

/* ============================================================
   TYPES
============================================================ */
export type UserRole = "admin" | "land_officer" | "citizen";

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  walletAddress: string;
  isVerified?: boolean;
}

/* ============================================================
   STATE
============================================================ */
interface AuthState {
  user: User | null;
  token: string | null;

  tempEmail: string | null;
  pendingVerification: boolean;

  isAuthenticated: boolean;
  authHydrated: boolean;
}

/* ============================================================
   INITIAL STATE (NO localStorage)
============================================================ */
const initialState: AuthState = {
  user: null,
  token: null,

  tempEmail: null,
  pendingVerification: false,

  isAuthenticated: false,
  authHydrated: false,
};

/* ============================================================
   SLICE
============================================================ */
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; user: User }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;

      state.tempEmail = null;
      state.pendingVerification = false;
    },

    setLoginPendingVerification: (
      state,
      action: PayloadAction<string>
    ) => {
      state.tempEmail = action.payload;
      state.pendingVerification = true;
      state.isAuthenticated = false;
    },

    markVerified: (state) => {
      if (state.user) {
        state.user.isVerified = true;
      }

      state.pendingVerification = false;
      state.tempEmail = null;
    },

    updateUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },

    logout: (state) => {
      state.user = null;
      state.token = null;

      state.tempEmail = null;
      state.pendingVerification = false;
      state.isAuthenticated = false;
    },

    setAuthHydrated: (state) => {
      state.authHydrated = true;
    },
  },
});

/* ============================================================
   EXPORTS
============================================================ */
export const {
  setCredentials,
  setLoginPendingVerification,
  markVerified,
  updateUser,
  logout,
  setAuthHydrated,
} = authSlice.actions;

export default authSlice.reducer;