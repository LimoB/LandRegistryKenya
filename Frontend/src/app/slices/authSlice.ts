import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

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
  tempEmail: string | null; // Stores email for verification/resend flows
}

const getInitialUser = (): User | null => {
  try {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    localStorage.removeItem("user");
    return null;
  }
};

const initialState: AuthState = {
  user: getInitialUser(),
  token: localStorage.getItem("token") || null,
  tempEmail: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    /**
     * Set credentials upon successful Login.
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
      state.tempEmail = null; // Clear temp email on successful login

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
    },

    /**
     * Used for the "Verification Pending" state.
     * Stores the email so the user can resend the code without re-typing.
     */
    setTempEmail: (state, action: PayloadAction<string>) => {
      state.tempEmail = action.payload;
    },

    logout: (state) => {
      state.user = null;
      state.token = null;
      state.tempEmail = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },

    updateUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      localStorage.setItem("user", JSON.stringify(action.payload));
    }
  },
});

export const { setCredentials, setTempEmail, logout, updateUser } = authSlice.actions;

export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectCurrentToken = (state: { auth: AuthState }) => state.auth.token;
export const selectTempEmail = (state: { auth: AuthState }) => state.auth.tempEmail;

export default authSlice.reducer;