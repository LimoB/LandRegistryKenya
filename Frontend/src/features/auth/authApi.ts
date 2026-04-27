import { baseApi } from "../../services/baseApi";
import { setCredentials } from "./authSlice";

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

// Adjusted to match backend: res.json({ success, message, token, data: user })
export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  data: User; 
}

/* ============================================================
   PAYLOADS
============================================================ */
export interface RegisterPayload {
  fullName: string;
  email: string;
  idNumber: string;
  walletAddress: string;
  password: string;
  role: UserRole;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}

export interface VerifyEmailPayload {
  token: string;
}

export interface ResendVerificationPayload {
  email: string;
}

/* ============================================================
   AUTH API
============================================================ */
export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginPayload>({
      query: (data) => ({
        url: "/auth/login",
        method: "POST",
        body: data,
      }),

      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Mapping data.data (the user) and data.token to credentials
          dispatch(setCredentials({
            user: data.data,
            token: data.token
          }));
        } catch {
          // No "error" variable here to avoid ESLint unused-var errors
        }
      },
    }),

    register: builder.mutation<
      { success: boolean; message: string; data: User },
      RegisterPayload
    >({
      query: (data) => ({
        url: "/auth/register",
        method: "POST",
        body: data,
      }),
    }),

    verifyEmail: builder.mutation<
      { success: boolean; message: string; data?: Partial<User> }, 
      VerifyEmailPayload
    >({
      query: ({ token }) => ({
        url: `/auth/verify-email?token=${encodeURIComponent(token)}`,
        method: "GET",
      }),
    }),

    resendVerification: builder.mutation<
      { success: boolean; message: string },
      ResendVerificationPayload
    >({
      query: (data) => ({
        url: "/auth/resend-verification",
        method: "POST",
        body: data,
      }),
    }),

    forgotPassword: builder.mutation<
      { success: boolean; message: string },
      ForgotPasswordPayload
    >({
      query: (data) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body: data,
      }),
    }),

    resetPassword: builder.mutation<
      { success: boolean; message: string },
      ResetPasswordPayload
    >({
      query: (data) => ({
        url: "/auth/reset-password",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useVerifyEmailMutation,
  useResendVerificationMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApi;