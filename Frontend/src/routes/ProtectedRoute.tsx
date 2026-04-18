import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../app/hooks";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { token, user } = useAppSelector((state) => state.auth);
  const location = useLocation();

  // 🔐 Not authenticated
  if (!token || !user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }} // 👈 useful for redirect after login
      />
    );
  }

  // ✅ Authenticated
  return <>{children}</>;
};

export default ProtectedRoute;