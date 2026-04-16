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

  // OTP / EMAIL FLOW SUPPORT
  tempEmail: string | null;
  pendingVerification: boolean;

  isAuthenticated: boolean;
  authHydrated: boolean;
}

/* ============================================================
   SAFE LOCAL STORAGE LOAD
============================================================ */
const getInitialUser = (): User | null => {
  try {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  } catch {
    localStorage.removeItem("user");
    return null;
  }
};

const initialState: AuthState = {
  user: getInitialUser(),
  token: localStorage.getItem("token"),

  tempEmail: null,
  pendingVerification: false,

  isAuthenticated: !!localStorage.getItem("token"),
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

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
    },

    /* ======================
       EMAIL VERIFICATION FLOW (OTP START)
    ====================== */
    setTempEmail: (state, action: PayloadAction<string>) => {
      state.tempEmail = action.payload;
    },

    setPendingVerification: (state, action: PayloadAction<boolean>) => {
      state.pendingVerification = action.payload;
    },

    /* ======================
       AFTER EMAIL VERIFIED
    ====================== */
    markVerified: (state) => {
      if (state.user) {
        state.user.isVerified = true;
        localStorage.setItem("user", JSON.stringify(state.user));
      }

      state.pendingVerification = false;
    },

    /* ======================
       UPDATE USER PROFILE
    ====================== */
    updateUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      localStorage.setItem("user", JSON.stringify(action.payload));
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

      localStorage.removeItem("token");
      localStorage.removeItem("user");
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
  setTempEmail,
  setPendingVerification,
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