import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAppSelector } from "../app/hooks";

// --- Layouts ---
import PublicLayout from "../layouts/PublicLayout";
import AdminLayout from "../layouts/AdminLayout";
import OfficerLayout from "../layouts/OfficerLayout";
import CitizenLayout from "../layouts/CitizenLayout";

// --- Guards ---
import ProtectedRoute from "./ProtectedRoute";
import RoleBasedRoute from "./RoleBasedRoute";

// --- Public Pages ---
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import HowItWorks from "../pages/HowItWorks";
import VerifyTitle from "../pages/VerifyTitle";
import NotFound from "../pages/NotFound";

// ✅ NEW: Auth & Recovery Pages
import VerifyEmail from "../pages/VerifyEmail";
import VerifyNotice from "../pages/VerifyNotice";
import ForgotPassword from "../pages/ForgotPassword";

// --- Citizen Pages ---
import CitizenDashboard from "../pages/citizen/CitizenDashboard";
import MyLands from "../pages/citizen/MyLands";
import RegisterLand from "../pages/citizen/RegisterLand";
import TransferLand from "../pages/citizen/TransferLand";
import MyRequests from "../pages/citizen/MyRequests";

// --- Land Officer Pages ---
import OfficerDashboard from "../pages/landOfficer/OfficerDashboard";
import VerifyLands from "../pages/landOfficer/VerifyLands";
import TransferApprovals from "../pages/landOfficer/TransferApprovals";
import RegistrySearch from "../pages/landOfficer/RegistrySearch";

// --- Admin Pages ---
import AdminDashboard from "../pages/admin/AdminDashboard";
import UserManagement from "../pages/admin/UserManagement";
import GlobalRegistry from "../pages/admin/GlobalRegistry";
import LandsManagement from "../pages/admin/LandsManagement";
import TransfersManagement from "../pages/admin/TransfersManagement";
import AuditLogs from "../pages/admin/AuditLogs";
import VerifyResetCode from "../pages/VerifyResetCode";

const AppRoutes: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <Routes>
      {/* 1. Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/verify-title" element={<VerifyTitle />} />
        
        {/* ✅ New Auth Flow Routes */}
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/verify-notice" element={<VerifyNotice />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-reset-code" element={<VerifyResetCode />} />
        <Route 
          path="/reset-password" 
          element={
            <div className="min-h-screen flex items-center justify-center font-bold text-blue-600 uppercase tracking-tighter">
              Reset Password Component Hooked to Backend Token Logic
            </div>
          } 
        />
      </Route>

      {/* 2. Smart Dashboard Redirect Handler */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            {user?.role === "admin" ? (
              <Navigate to="/admin/dashboard" replace />
            ) : user?.role === "land_officer" ? (
              <Navigate to="/officer/dashboard" replace />
            ) : (
              <Navigate to="/citizen/dashboard" replace />
            )}
          </ProtectedRoute>
        }
      />

      {/* 3. Citizen Routes */}
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
        <Route path="transfer-land" element={<TransferLand />} />
        <Route path="my-requests" element={<MyRequests />} />
        <Route 
          path="profile" 
          element={
            <div className="p-8 text-slate-900 dark:text-white font-black uppercase text-[10px] tracking-widest">
              Identity Profile & Wallet Settings Under Construction
            </div>
          } 
        />
      </Route>

      {/* 4. Land Officer Routes */}
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
      </Route>

      {/* 5. Admin Routes */}
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
      </Route>

      {/* 6. Catch All */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;