import { baseApi } from "../../app/api/baseApi";

/* ================================
   TYPES
================================ */
export interface User {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  idNumber: string;
  walletAddress: string;
  role: "admin" | "land_officer" | "citizen";
  isVerified: boolean;
  createdAt: string;
}

/* Payloads */
export interface UpdateUserPayload {
  fullName?: string;
  email?: string;
  phone?: string;
  role?: "admin" | "land_officer" | "citizen";
  isVerified?: boolean;
}

export interface UpdateProfilePayload {
  fullName?: string;
  phone?: string;
  email?: string;
}

/* ================================
   USER API
================================ */
export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 1️⃣ Get all users (Officer/Admin)
    getUsers: builder.query<User[], void>({
      query: () => "/users",
      providesTags: ["User"],
    }),

    // 2️⃣ Get user by ID
    getUserById: builder.query<User, number>({
      query: (id) => `/users/${id}`,
      providesTags: ["User"],
    }),

    // 3️⃣ Update user (Admin)
    updateUser: builder.mutation<{ message: string }, { id: number; payload: UpdateUserPayload }>({
      query: ({ id, payload }) => ({
        url: `/users/${id}`,
        method: "PUT",
        body: payload,
      }),
      invalidatesTags: ["User"],
    }),

    // 4️⃣ Delete user (Admin)
    deleteUser: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),

    // 5️⃣ Update own profile
    updateProfile: builder.mutation<{ message: string }, UpdateProfilePayload>({
      query: (payload) => ({
        url: "/users/profile",
        method: "PUT",
        body: payload,
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useUpdateProfileMutation,
} = userApi;