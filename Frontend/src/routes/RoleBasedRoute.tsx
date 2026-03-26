import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../app/store";

interface RoleBasedRouteProps {
  allowedRoles: string[]; // Roles that can access this route
  children: React.ReactNode;
}

const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ allowedRoles, children }) => {
  const userRole = useSelector((state: RootState) => state.auth.user?.role);

  if (!userRole || !allowedRoles.includes(userRole)) {
    // Unauthorized → redirect to login or home
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default RoleBasedRoute;