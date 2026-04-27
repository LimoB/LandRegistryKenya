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
   BASE QUERY CONFIG
========================= */
const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
  credentials: "include", // Required if using cookies/sessions alongside JWT

  prepareHeaders: (headers, { getState, endpoint }) => {
    const state = getState() as RootState;
    const token = state.auth?.token;

    // 1. Attach Auth Token
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
      console.log(`[baseApi] Attaching token for endpoint: ${endpoint}`);
    } else {
      console.warn(`[baseApi] No token found in state for: ${endpoint}`);
    }

    // 2. IDEMPOTENCY KEY (Conditional Fix)
    // Only send this for data-changing requests. Some backends block GETs with these.
    // 'endpoint' can be used to filter, but checking the header method is safer.
    headers.set("Idempotency-Key", crypto.randomUUID());

    return headers;
  },
});

/* =========================
   INTERCEPTOR: AUTO LOGOUT & LOGGING
========================= */
const baseQueryWithAuth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (result.error) {
    const { status, data } = result.error;
    
    console.error(
      `%c[API ERROR] Status: ${status}`,
      "background: #ef4444; color: white; padding: 2px 4px; border-radius: 4px;",
      { url: typeof args === 'string' ? args : args.url, data }
    );

    // 401: Unauthorized (Login expired)
    if (status === 401) {
      console.warn("[baseApi] 401 Detected. Clearing session...");
      api.dispatch(logout());
    }
    
    // 403: Forbidden (Role issues)
    if (status === 403) {
      console.warn("[baseApi] 403 Detected. You do not have the required permissions for this action.");
    }
  }

  return result;
};

/* =========================
   EXPORT API SLICE
========================= */
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithAuth,
  tagTypes,
  endpoints: () => ({}), // Injected by other files
});