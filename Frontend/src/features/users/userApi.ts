import { baseApi } from "../../app/api/baseApi";

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
   USER (FULL BACKEND SHAPE)
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

  /* RELATIONS FROM BACKEND */
  ownedLands?: LandMini[];
  sentRequests?: Request[];
  receivedRequests?: Request[];
  logs?: AuditLog[];
  tokens?: Token[];

  ownershipHistoryFrom?: OwnershipHistory[];
  ownershipHistoryTo?: OwnershipHistory[];
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
       GET ALL USERS (ADMIN/OFFICER)
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
       GET USER BY ID (FULL RELATIONS)
    ====================== */
    getUserById: builder.query<User, number>({
      query: (id) => `/users/${id}`,
      providesTags: (_res, _err, id) => [{ type: "User", id }],
    }),

    /* ======================
       GET CURRENT USER (ME)
    ====================== */
    getMe: builder.query<User, void>({
      query: () => "/users/me",
      providesTags: [{ type: "User", id: "ME" }],
    }),

    /* ======================
       ADMIN UPDATE USER (AUDIT LOGGED)
    ====================== */
    updateUser: builder.mutation<
      { message: string; user: User },
      { id: number; payload: UpdateUserPayload }
    >({
      query: ({ id, payload }) => ({
        url: `/users/${id}`,
        method: "PUT",
        body: payload,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: "User", id },
        { type: "User", id: "LIST" },
      ],
    }),

    /* ======================
       DELETE USER (AUDIT LOGGED)
    ====================== */
    deleteUser: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "User", id: "LIST" }],
    }),

    /* ======================
       UPDATE PROFILE (SELF ONLY)
    ====================== */
    updateProfile: builder.mutation<
      { message: string; user: User },
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