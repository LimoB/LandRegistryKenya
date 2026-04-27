import { baseApi } from "../../services/baseApi";

/* ============================================================
   TYPES (MATCH BACKEND RELATIONS)
============================================================ */
export interface LandMini {
  id: number;
  lrNumber: string;
}

export interface AuditLog {
  id: number;
  actionType: string;
  createdAt: string;
}

export interface Token {
  id: number;
  token: string;
}

export interface OwnershipHistory {
  id: number;
  fromUserId: number;
  toUserId: number;
}

export interface Request {
  id: number;
  status: string;
  createdAt: string;
}

/* ================================
   USER
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

  ownedLands?: LandMini[];
  sentRequests?: Request[];
  receivedRequests?: Request[];
  logs?: AuditLog[];
  tokens?: Token[];

  ownershipHistoryFrom?: OwnershipHistory[];
  ownershipHistoryTo?: OwnershipHistory[];
}

// Wrapper for the standard API response structure
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  count?: number;
}

/* ================================
   PAYLOADS
================================ */
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

/* ============================================================
   USER API
============================================================ */
export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    /* ======================
       GET ALL USERS
    ====================== */
    getUsers: builder.query<ApiResponse<User[]>, void>({
      query: () => "/users",
      providesTags: (result) =>
        result?.data
          ? [
              { type: "User" as const, id: "LIST" },
              ...result.data.map((u) => ({
                type: "User" as const,
                id: u.id,
              })),
            ]
          : [{ type: "User" as const, id: "LIST" }],
    }),

    /* ======================
       GET USER BY ID
    ====================== */
    getUserById: builder.query<ApiResponse<User>, number>({
      query: (id) => `/users/${id}`,
      providesTags: (_result, _error, id) => [
        { type: "User" as const, id },
      ],
    }),

    /* ======================
       GET CURRENT USER (ME)
    ====================== */
    getMe: builder.query<ApiResponse<User>, void>({
      query: () => "/users/me",
      // Using "ME" tag allows us to invalidate just the current user's cache
      providesTags: [{ type: "User" as const, id: "ME" }],
    }),

    /* ======================
       UPDATE USER (ADMIN)
    ====================== */
    updateUser: builder.mutation<
      ApiResponse<User>,
      { id: number; payload: UpdateUserPayload }
    >({
      query: ({ id, payload }) => ({
        url: `/users/${id}`,
        method: "PUT",
        body: payload,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "User" as const, id },
        { type: "User" as const, id: "LIST" },
        { type: "User" as const, id: "ME" }, // Invalidate ME in case admin updates current user
      ],
    }),

    /* ======================
       DELETE USER
    ====================== */
    deleteUser: builder.mutation<ApiResponse<void>, number>({
      query: (id) => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "User" as const, id: "LIST" }],
    }),

    /* ======================
       UPDATE PROFILE (SELF)
    ====================== */
    updateProfile: builder.mutation<
      ApiResponse<User>,
      UpdateProfilePayload
    >({
      query: (payload) => ({
        url: "/users/profile",
        method: "PUT",
        body: payload,
      }),
      // This ensures that after updating, getMe fetches the fresh data
      invalidatesTags: [{ type: "User" as const, id: "ME" }],
    }),
  }),
});

/* ============================================================
   HOOKS
============================================================ */
export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useGetMeQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useUpdateProfileMutation,
} = userApi;