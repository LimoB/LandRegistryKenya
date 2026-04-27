import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAppSelector } from "../app/hooks";

// Layouts & Guards
import PublicLayout from "../layouts/PublicLayout";
import AdminLayout from "../layouts/AdminLayout";
import OfficerLayout from "../layouts/OfficerLayout";
import CitizenLayout from "../layouts/CitizenLayout";
import ProtectedRoute from "./ProtectedRoute";
import RoleBasedRoute from "./RoleBasedRoute";

// Pages
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import NotFound from "../pages/NotFound";

// Sub-Routes
import { CitizenRoutes } from "./CitizenRoutes";
import { OfficerRoutes } from "./OfficerRoutes";
import { AdminRoutes } from "./AdminRoutes";

const AppRoutes: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <Routes>
      {/* PUBLIC */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* ROLE REDIRECT */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          {user?.role === "admin" && <Navigate to="/admin" replace />}
          {user?.role === "land_officer" && <Navigate to="/officer" replace />}
          {user?.role === "citizen" && <Navigate to="/citizen" replace />}
        </ProtectedRoute>
      } />

      {/* CITIZEN */}
      <Route path="/citizen" element={
        <ProtectedRoute>
          <RoleBasedRoute allowedRoles={["citizen"]}>
            <CitizenLayout />
          </RoleBasedRoute>
        </ProtectedRoute>
      }>
        {CitizenRoutes}
      </Route>

      {/* OFFICER */}
      <Route path="/officer" element={
        <ProtectedRoute>
          <RoleBasedRoute allowedRoles={["land_officer"]}>
            <OfficerLayout />
          </RoleBasedRoute>
        </ProtectedRoute>
      }>
        {OfficerRoutes}
      </Route>

      {/* ADMIN */}
      <Route path="/admin" element={
        <ProtectedRoute>
          <RoleBasedRoute allowedRoles={["admin"]}>
            <AdminLayout />
          </RoleBasedRoute>
        </ProtectedRoute>
      }>
        {AdminRoutes}
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;