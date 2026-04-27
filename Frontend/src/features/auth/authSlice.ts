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
    // Matches the updated Auth API dispatch: { user, token }
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;

      // Clear any pending states upon successful login
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

    // Used to manually restore state from persistence layers (e.g., cookies)
    hydrateAuth: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = !!action.payload.token;
      state.authHydrated = true;
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
  hydrateAuth,
  logout,
  setAuthHydrated,
} = authSlice.actions;

export default authSlice.reducer;