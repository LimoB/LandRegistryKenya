import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store";
import { tagTypes } from "./tagTypes";

export const baseApi = createApi({
  reducerPath: "api",

  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:4000/api",

    credentials: "include",

    prepareHeaders: (headers, { getState }) => {
      // Option 1: get token from Redux
      const token = (getState() as RootState).auth.token;

      // Option 2: fallback to localStorage
      const localToken = localStorage.getItem("token");

      const finalToken = token || localToken;

      if (finalToken) {
        headers.set("Authorization", `Bearer ${finalToken}`);
      }

      return headers;
    },
  }),

  tagTypes,

  endpoints: () => ({}),
});