import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { SerializedError } from "@reduxjs/toolkit";

/**
 * Extracts human-readable error messages from RTK Query error objects
 */
export const getErrorMessage = (err: unknown): string => {
  // 1. Handle FetchBaseQueryError (Server responses)
  if (err && typeof err === 'object' && 'status' in err) {
    const fetchErr = err as FetchBaseQueryError;
    if (fetchErr.data && typeof fetchErr.data === 'object') {
      return (fetchErr.data as { error?: string }).error || "Server error occurred";
    }
  }

  // 2. Handle SerializedError (Execution/Network errors)
  if (err && typeof err === 'object' && 'message' in err) {
    const serialErr = err as SerializedError;
    return serialErr.message || "An unexpected error occurred";
  }

  return "An unknown error occurred";
};