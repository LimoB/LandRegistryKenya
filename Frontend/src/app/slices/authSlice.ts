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
   SAFE STORAGE HELPERS
============================================================ */
const safeGet = (key: string): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(key);
};

const safeGetUser = (): User | null => {
  try {
    const stored = safeGet("user");
    return stored ? JSON.parse(stored) : null;
  } catch {
    if (typeof window !== "undefined") localStorage.removeItem("user");
    return null;
  }
};

/* ============================================================
   INITIAL STATE
============================================================ */
const token = safeGet("token");

const initialState: AuthState = {
  user: safeGetUser(),
  token,

  tempEmail: null,
  pendingVerification: false,

  isAuthenticated: !!token,
  authHydrated: false,
};

/* ============================================================
   SLICE
============================================================ */
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {

    /* ======================
       LOGIN SUCCESS
    ====================== */
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; user: User }>
    ) => {
      const { user, token } = action.payload;

      state.user = user;
      state.token = token;
      state.isAuthenticated = true;

      state.tempEmail = null;
      state.pendingVerification = false;

      if (typeof window !== "undefined") {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
      }
    },

    /* ======================
       LOGIN FAILED (UNVERIFIED FLOW SUPPORT)
    ====================== */
    setLoginPendingVerification: (
      state,
      action: PayloadAction<string>
    ) => {
      state.tempEmail = action.payload;
      state.pendingVerification = true;
      state.isAuthenticated = false;
    },

    /* ======================
       EMAIL VERIFICATION SUCCESS
    ====================== */
    markVerified: (state) => {
      if (state.user) {
        state.user.isVerified = true;

        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(state.user));
        }
      }

      state.pendingVerification = false;
      state.tempEmail = null;
    },

    /* ======================
       UPDATE USER PROFILE
    ====================== */
    updateUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;

      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(action.payload));
      }
    },

    /* ======================
       LOGOUT
    ====================== */
    logout: (state) => {
      state.user = null;
      state.token = null;

      state.tempEmail = null;
      state.pendingVerification = false;
      state.isAuthenticated = false;

      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    },

    /* ======================
       HYDRATION COMPLETE
    ====================== */
    setAuthHydrated: (state) => {
      state.authHydrated = true;
    },
  },
});

/* ============================================================
   EXPORT ACTIONS
============================================================ */
export const {
  setCredentials,
  setLoginPendingVerification,
  markVerified,
  updateUser,
  logout,
  setAuthHydrated,
} = authSlice.actions;

/* ============================================================
   SELECTORS
============================================================ */
export const selectCurrentUser = (state: { auth: AuthState }) =>
  state.auth.user;

export const selectCurrentToken = (state: { auth: AuthState }) =>
  state.auth.token;

export const selectTempEmail = (state: { auth: AuthState }) =>
  state.auth.tempEmail;

export const selectPendingVerification = (state: { auth: AuthState }) =>
  state.auth.pendingVerification;

export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  state.auth.isAuthenticated;

export const selectAuthHydrated = (state: { auth: AuthState }) =>
  state.auth.authHydrated;

export default authSlice.reducer;