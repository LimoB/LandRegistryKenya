import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";

import type { RootState } from "../app/store";
import { tagTypes } from "./tagTypes";
import { logout } from "../features/auth/authSlice";

/* =========================
   BASE QUERY
========================= */
const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
  credentials: "include",

  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState;

    const token = state.auth?.token;

    /* =========================
       AUTH HEADER
    ========================= */
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    /* =========================
       🔥 IDEMPOTENCY HEADER (FIX)
       REQUIRED by backend middleware
    ========================= */
    headers.set("Idempotency-Key", crypto.randomUUID());

    return headers;
  },
});

/* =========================
   AUTO LOGOUT ON 401
========================= */
const baseQueryWithAuth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // 🔥 token expired or invalid
    api.dispatch(logout());
  }

  return result;
};

/* =========================
   API SLICE
========================= */
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithAuth,
  tagTypes,
  endpoints: () => ({}),
});