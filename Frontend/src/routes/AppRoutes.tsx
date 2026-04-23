import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAppSelector } from "../app/hooks";

// Layouts
import PublicLayout from "../layouts/PublicLayout";
import AdminLayout from "../layouts/AdminLayout";
import OfficerLayout from "../layouts/OfficerLayout";
import CitizenLayout from "../layouts/CitizenLayout";

// Guards
import ProtectedRoute from "./ProtectedRoute";
import RoleBasedRoute from "./RoleBasedRoute";

// Reusable
import ComingSoon from "../components/ComingSoon";

// Public Pages
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import HowItWorks from "../pages/HowItWorks";
import VerifyTitle from "../pages/VerifyTitle";
import NotFound from "../pages/NotFound";

// Auth
import VerifyEmail from "../pages/VerifyEmail";
import VerifyNotice from "../pages/VerifyNotice";
import ForgotPassword from "../pages/ForgotPassword";
import VerifyResetCode from "../pages/VerifyResetCode";

// Shared Pages
import Profile from "../pages/Profile"; 

// Citizen Pages
import CitizenDashboard from "../pages/citizen/CitizenDashboard";
import MyLands from "../pages/citizen/MyLands";
import RegisterLand from "../pages/citizen/RegisterLand";
import TransferLand from "../pages/citizen/TransferLand";
import MyRequests from "../pages/citizen/MyRequests";
import CitizenLandDetails from "../pages/citizen/LandDetails";

// Officer Pages
import OfficerDashboard from "../pages/landOfficer/OfficerDashboard";
import VerifyLands from "../pages/landOfficer/VerifyLands";
import TransferApprovals from "../pages/landOfficer/TransferApprovals";
import RegistrySearch from "../pages/landOfficer/RegistrySearch";
import OfficerLandDetails from "../components/officer/LandDetails"; // The new Details Page

// Admin Pages
import AdminDashboard from "../pages/admin/AdminDashboard";
import UserManagement from "../pages/admin/UserManagement";
import GlobalRegistry from "../pages/admin/GlobalRegistry";
import LandsManagement from "../pages/admin/LandsManagement";
import TransfersManagement from "../pages/admin/TransfersManagement";
import AuditLogs from "../pages/admin/AuditLogs";

const AppRoutes: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <Routes>
      {/* ================= PUBLIC ================= */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/verify-title" element={<VerifyTitle />} />

        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/verify-notice" element={<VerifyNotice />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-reset-code" element={<VerifyResetCode />} />
      </Route>

      {/* ================= DASHBOARD REDIRECT ================= */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            {user?.role === "admin" && (
              <Navigate to="/admin/dashboard" replace />
            )}
            {user?.role === "land_officer" && (
              <Navigate to="/officer/dashboard" replace />
            )}
            {user?.role === "citizen" && (
              <Navigate to="/citizen/dashboard" replace />
            )}
          </ProtectedRoute>
        }
      />

      {/* ================= CITIZEN ================= */}
      <Route
        path="/citizen"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={["citizen"]}>
              <CitizenLayout />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<CitizenDashboard />} />
        <Route path="my-lands" element={<MyLands />} />
        <Route path="register-land" element={<RegisterLand />} />
        
        {/* LR Number capture support */}
        <Route path="lands/*" element={<CitizenLandDetails />} />

        <Route path="transfer" element={<TransferLand />} />
        <Route path="transfer/:id" element={<TransferLand />} />
        <Route path="my-requests" element={<MyRequests />} />
        <Route path="profile" element={<Profile />} />

        <Route path="payments" element={<ComingSoon title="Payments" />} />
        <Route path="wallet" element={<ComingSoon title="Wallet" />} />
      </Route>

      {/* ================= OFFICER ================= */}
      <Route
        path="/officer"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={["land_officer"]}>
              <OfficerLayout />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<OfficerDashboard />} />
        <Route path="verify-lands" element={<VerifyLands />} />
        <Route path="transfers" element={<TransferApprovals />} />
        <Route path="search" element={<RegistrySearch />} />
        
        {/* NEW: Official Registry View Route */}
        <Route path="registry/view/:id" element={<OfficerLandDetails />} />
        
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* ================= ADMIN ================= */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={["admin"]}>
              <AdminLayout />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="registry" element={<GlobalRegistry />} />
        <Route path="lands" element={<LandsManagement />} />
        <Route path="transfers" element={<TransfersManagement />} />
        <Route path="audit-logs" element={<AuditLogs />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* ================= FALLBACK ================= */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;