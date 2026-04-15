import { baseApi } from "../../app/api/baseApi";
import { setCredentials } from "../../app/slices/authSlice";

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

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

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

/* ================================
   AUTH API
================================ */
export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    
    // 🔐 LOGIN
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
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
          // Errors are handled in the UI component or via global error middleware
        }
      },
    }),

    // 📝 REGISTER
    register: builder.mutation<{ message: string; user: User }, RegisterPayload>({
      query: (data) => ({
        url: "/auth/register",
        method: "POST",
        body: data,
      }),
    }),

    // ✅ NEW: VERIFY EMAIL (Used on the /verify-email page)
    verifyEmail: builder.query<{ message: string }, string>({
      query: (token) => ({
        url: `/auth/verify-email?token=${token}`,
        method: "GET",
      }),
    }),

    // ✅ NEW: RESEND VERIFICATION
    resendVerification: builder.mutation<{ message: string }, { email: string }>({
      query: (data) => ({
        url: "/auth/resend-verification",
        method: "POST",
        body: data,
      }),
    }),

    // ✅ NEW: FORGOT PASSWORD
    forgotPassword: builder.mutation<{ message: string }, { email: string }>({
      query: (data) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body: data,
      }),
    }),

    // ✅ NEW: RESET PASSWORD
    resetPassword: builder.mutation<{ message: string }, { token: string; newPassword: string }>({
      query: (data) => ({
        url: "/auth/reset-password",
        method: "POST",
        body: data,
      }),
    }),

    // 👤 PROFILE (Optional check for auth status)
    getProfile: builder.query<AuthResponse, void>({
      query: () => "/auth/me",
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useVerifyEmailQuery, // Lazy query or standard query for the verification page
  useResendVerificationMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useGetProfileQuery,
} = authApi;