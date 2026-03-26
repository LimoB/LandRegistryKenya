import { baseApi } from "../../app/api/baseApi";
import { setCredentials } from "../../app/slices/authSlice";

/* ================================
   TYPES (Match Backend Exactly)
================================ */
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

// Fixed: Added fullName to the user object inside the response
export interface AuthResponse {
  message: string;
  token: string;
  user: {
    [x: string]: string;
    id: number;
    fullName: string; // <--- Added this to resolve the TS error
    email: string;
    role: "admin" | "land_officer" | "citizen";
    walletAddress: string;
  };
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

          // Now 'data' (AuthResponse) matches the expected 'User' type in setCredentials
          dispatch(setCredentials(data));
        } catch (err) {
          console.error("Login failed:", err);
        }
      },
    }),

    // 📝 REGISTER
    register: builder.mutation<
      { message: string; user: any },
      RegisterPayload
    >({
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