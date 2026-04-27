import { Route, Navigate } from "react-router-dom";
import AdminDashboard from "../pages/admin/AdminDashboard";
import UserManagement from "../pages/admin/UserManagement";
import GlobalRegistry from "../pages/admin/GlobalRegistry";
import LandsManagement from "../pages/admin/LandsManagement";
import TransfersManagement from "../pages/admin/TransfersManagement";
import AuditLogs from "../pages/admin/AuditLogs";
import TransferStatus from "../pages/citizen/TransferStatus";
import Profile from "../pages/Profile";

export const AdminRoutes = (
  <>
    <Route index element={<Navigate to="dashboard" replace />} />
    <Route path="dashboard" element={<AdminDashboard />} />
    <Route path="users" element={<UserManagement />} />
    <Route path="registry" element={<GlobalRegistry />} />
    <Route path="lands" element={<LandsManagement />} />
    <Route path="transfers" element={<TransfersManagement />} />
    <Route path="transfers/:id" element={<TransferStatus />} />
    <Route path="audit-logs" element={<AuditLogs />} />
    <Route path="profile" element={<Profile />} />
  </>
);