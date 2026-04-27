// store.ts
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { baseApi } from "../services/baseApi";

import authReducer from "../features/auth/authSlice";
import landReducer from "../features/lands/landSlice";
import transferReducer from "../features/transfers/transferSlice";
import userReducer from "../features/users/userSlice";
import paymentReducer from "../features/payment/paymentSlice";
import auditReducer from "../features/audit/auditSlice";

import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";

/* =========================
   CUSTOM STORAGE (VITE SAFE)
========================= */
const createNoopStorage = () => ({
  getItem: async () => null,
  setItem: async (_: string, value: unknown) => value,
  removeItem: async () => {},
});

const webStorage = {
  getItem: (key: string) =>
    Promise.resolve(localStorage.getItem(key)),

  setItem: (key: string, value: string) => {
    localStorage.setItem(key, value);
    return Promise.resolve(true);
  },

  removeItem: (key: string) => {
    localStorage.removeItem(key);
    return Promise.resolve();
  },
};

const storage =
  typeof window !== "undefined" ? webStorage : createNoopStorage();

/* =========================
   ROOT REDUCER
========================= */
const rootReducer = combineReducers({
  [baseApi.reducerPath]: baseApi.reducer,
  auth: authReducer,
  land: landReducer,
  transfer: transferReducer,
  user: userReducer,
  payment: paymentReducer,
  audit: auditReducer,
});

/* =========================
   ROOT STATE (BEFORE PERSIST)
========================= */
export type RootState = ReturnType<typeof rootReducer>;

/* =========================
   PERSIST CONFIG
========================= */
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"],
  blacklist: [baseApi.reducerPath],
};

/* =========================
   PERSISTED REDUCER
========================= */
const persistedReducer = persistReducer(persistConfig, rootReducer);

/* =========================
   STORE
========================= */
export const store = configureStore({
  reducer: persistedReducer,

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // FIX: Increase threshold for heavy state (land, audit, etc.)
      immutableCheck: {
        warnAfter: 128, 
      },
      serializableCheck: {
        ignoredActions: [
          FLUSH,
          REHYDRATE,
          PAUSE,
          PERSIST,
          PURGE,
          REGISTER,
        ],
      },
    }).concat(baseApi.middleware),

  devTools: import.meta.env.MODE !== "production",
});

/* =========================
   PERSISTOR
========================= */
export const persistor = persistStore(store);

/* =========================
   TYPES
========================= */
export type AppDispatch = typeof store.dispatch;