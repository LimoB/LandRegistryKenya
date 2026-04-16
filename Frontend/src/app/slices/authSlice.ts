import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type UserRole = "admin" | "land_officer" | "citizen";

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  walletAddress: string;
  isVerified?: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;

  tempEmail: string | null;

  isAuthenticated: boolean;
  authHydrated: boolean;
}

/* ================================
   SAFE LOCAL STORAGE LOAD
================================ */
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

  isAuthenticated: !!localStorage.getItem("token"),
  authHydrated: false,
};

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

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
    },

    /* ======================
       EMAIL VERIFICATION FLOW
    ====================== */
    setTempEmail: (state, action: PayloadAction<string>) => {
      state.tempEmail = action.payload;
    },

    /* ======================
       UPDATE USER (PROFILE)
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

export const {
  setCredentials,
  setTempEmail,
  updateUser,
  logout,
  setAuthHydrated,
} = authSlice.actions;

/* ================================
   SELECTORS
================================ */
export const selectCurrentUser = (state: { auth: AuthState }) =>
  state.auth.user;

export const selectCurrentToken = (state: { auth: AuthState }) =>
  state.auth.token;

export const selectTempEmail = (state: { auth: AuthState }) =>
  state.auth.tempEmail;

export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  state.auth.isAuthenticated;

export const selectAuthHydrated = (state: { auth: AuthState }) =>
  state.auth.authHydrated;

export default authSlice.reducer;