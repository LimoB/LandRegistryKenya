import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../app/hooks";

type UserRole = "admin" | "land_officer" | "citizen";

interface RoleBasedRouteProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({
  allowedRoles,
  children,
}) => {
  const { user, token } = useAppSelector((state) => state.auth);
  const location = useLocation();

  // 🚫 Not logged in → go to login
  if (!token || !user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  //  Logged in but wrong role
  if (!allowedRoles.includes(user.role as UserRole)) {
    // Redirect to their correct dashboard instead of login
    switch (user.role) {
      case "admin":
        return <Navigate to="/admin/dashboard" replace />;
      case "land_officer":
        return <Navigate to="/officer/dashboard" replace />;
      case "citizen":
        return <Navigate to="/citizen/dashboard" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  // ✅ Authorized
  return <>{children}</>;
};

export default RoleBasedRoute;