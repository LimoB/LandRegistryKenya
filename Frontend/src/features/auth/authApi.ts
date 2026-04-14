import { baseApi } from "../../app/api/baseApi";
import { setCredentials } from "../../app/slices/authSlice";

/* ================================
   TYPES
================================ */
export interface User {
  id: number;
  fullName: string;
  email: string;
  role: "admin" | "land_officer" | "citizen";
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
  role: "admin" | "land_officer" | "citizen";
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
          // Dispatches the typed AuthResponse to your auth slice
          dispatch(setCredentials(data));
        } catch (err: unknown) {
          // Avoiding 'any' here as well
          if (err && typeof err === 'object' && 'error' in err) {
             console.error("Login failed:", err);
          }
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

    // 👤 PROFILE
    getProfile: builder.query<AuthResponse, void>({
      query: () => "/auth/me",
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetProfileQuery,
} = authApi;