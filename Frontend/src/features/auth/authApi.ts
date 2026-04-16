import { baseApi } from "../../app/api/baseApi";
import { setCredentials } from "../../app/slices/authSlice";

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

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

/* ============================================================
   AUTH PAYLOADS
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
  token: string; // OTP CODE (6 digits)
  newPassword: string;
}

export interface VerifyEmailPayload {
  token: string; // OTP CODE (6 digits)
}

export interface ResendVerificationPayload {
  email: string;
}

/* ============================================================
   AUTH API
============================================================ */
export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    /* ======================
       LOGIN
    ====================== */
    login: builder.mutation<AuthResponse, LoginPayload>({
      query: (data) => ({
        url: "/auth/login",
        method: "POST",
        body: data,
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials(data));
        } catch {
          // handled in UI
        }
      },
    }),

    /* ======================
       REGISTER
    ====================== */
    register: builder.mutation<
      { message: string; user: User },
      RegisterPayload
    >({
      query: (data) => ({
        url: "/auth/register",
        method: "POST",
        body: data,
      }),
    }),

    /* ======================
       VERIFY EMAIL (OTP VERSION)
    ====================== */
    verifyEmail: builder.mutation<{ message: string }, VerifyEmailPayload>({
      query: (data) => ({
        url: "/auth/verify-email",
        method: "POST", // IMPORTANT: OTP uses POST body, not GET link
        body: data,
      }),
    }),

    /* ======================
       RESEND VERIFICATION
    ====================== */
    resendVerification: builder.mutation<
      { message: string },
      ResendVerificationPayload
    >({
      query: (data) => ({
        url: "/auth/resend-verification",
        method: "POST",
        body: data,
      }),
    }),

    /* ======================
       FORGOT PASSWORD (OTP)
    ====================== */
    forgotPassword: builder.mutation<
      { message: string },
      ForgotPasswordPayload
    >({
      query: (data) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body: data,
      }),
    }),

    /* ======================
       RESET PASSWORD (OTP VERIFY)
    ====================== */
    resetPassword: builder.mutation<
      { message: string },
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

/* ============================================================
   EXPORT HOOKS
============================================================ */
export const {
  useLoginMutation,
  useRegisterMutation,
  useVerifyEmailMutation,
  useResendVerificationMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApi;