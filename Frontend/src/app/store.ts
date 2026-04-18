// store.ts
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { baseApi } from "../services/baseApi";

import authReducer from "../features/auth/authSlice";
import landReducer from "../features/lands/landSlice";
import transferReducer from "../features/transfers/transferSlice";
import userReducer from "../features/users/userSlice";
import paymentReducer from "../features/payment/paymentSlice";
import auditReducer from "../features/audit/auditSlice";

// ✅ redux persist
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

import storage from "redux-persist/lib/storage";

// ✅ combine reducers (scalable)
const rootReducer = combineReducers({
  [baseApi.reducerPath]: baseApi.reducer,

  auth: authReducer,
  land: landReducer,
  transfer: transferReducer,
  user: userReducer,
  payment: paymentReducer,
  audit: auditReducer,
});

// ✅ persist config (ONLY auth)
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"], // 🔥 important
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // ✅ required for redux-persist
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(baseApi.middleware),
});

// ✅ export persistor
export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;