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

    /* ======================
       GET ALL USERS
    ====================== */
    getUsers: builder.query<User[], void>({
      query: () => "/users",
      providesTags: (result) =>
        result
          ? [
              { type: "User", id: "LIST" },
              ...result.map((u) => ({ type: "User" as const, id: u.id })),
            ]
          : [{ type: "User", id: "LIST" }],
    }),

    /* ======================
       GET SINGLE USER
    ====================== */
    getUserById: builder.query<User, number>({
      query: (id) => `/users/${id}`,
      providesTags: (_result, _error, id) => [{ type: "User", id }],
    }),

    /* ======================
       GET CURRENT USER (ME)
       🔥 VERY IMPORTANT for auth
    ====================== */
    getMe: builder.query<User, void>({
      query: () => "/users/me",
      providesTags: [{ type: "User", id: "ME" }],
    }),

    /* ======================
       ADMIN: UPDATE USER
    ====================== */
    updateUser: builder.mutation<
      { message: string },
      { id: number; payload: UpdateUserPayload }
    >({
      query: ({ id, payload }) => ({
        url: `/users/${id}`,
        method: "PUT",
        body: payload,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "User", id },
        { type: "User", id: "LIST" },
      ],
    }),

    /* ======================
       ADMIN: DELETE USER
    ====================== */
    deleteUser: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "User", id: "LIST" }],
    }),

    /* ======================
       USER: UPDATE PROFILE
    ====================== */
    updateProfile: builder.mutation<
      { message: string },
      UpdateProfilePayload
    >({
      query: (payload) => ({
        url: "/users/profile",
        method: "PUT",
        body: payload,
      }),
      invalidatesTags: [{ type: "User", id: "ME" }],
    }),
  }),
});

/* ================================
   HOOKS
================================ */
export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useGetMeQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useUpdateProfileMutation,
} = userApi;