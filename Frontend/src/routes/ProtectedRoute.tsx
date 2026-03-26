import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../app/store";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const token = useSelector((state: RootState) => state.auth.token);

  if (!token) {
    // Not logged in → redirect to login
    return <Navigate to="/login" replace />;
  }

  // Logged in → render children
  return <>{children}</>;
};

export default ProtectedRoute;