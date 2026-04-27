import { Route, Navigate } from "react-router-dom";
import AdminDashboard from "../pages/admin/AdminDashboard";
import UserManagement from "../pages/admin/UserManagement";
import GlobalRegistry from "../pages/admin/GlobalRegistry";
import LandsManagement from "../pages/admin/LandsManagement";
import TransfersManagement from "../pages/admin/TransfersManagement";
import AuditLogs from "../pages/admin/AuditLogs";
import BlockchainEvents from "../pages/admin/BlockchainEvents"; // For monitoring on-chain activity
import IdempotencyKeys from "../pages/admin/IdempotencyKeys";   // For managing retry logic
import FraudMonitoring from "../pages/admin/FraudMonitoring";   // Added per Sidebar specs
import TransferStatus from "../pages/citizen/TransferStatus";
import Profile from "../pages/Profile";

export const AdminRoutes = (
  <>
    {/* Core Navigation */}
    <Route index element={<Navigate to="dashboard" replace />} />
    <Route path="dashboard" element={<AdminDashboard />} />
    
    {/* Management & Registry */}
    <Route path="users" element={<UserManagement />} />
    <Route path="registry" element={<GlobalRegistry />} />
    <Route path="lands" element={<LandsManagement />} />
    
    {/* Transfer Logic */}
    <Route path="transfers" element={<TransfersManagement />} />
    <Route path="transfers/:id" element={<TransferStatus />} />
    
    {/* Security & System Health */}
    <Route path="audit-logs" element={<AuditLogs />} />
    <Route path="fraud" element={<FraudMonitoring />} />
    
    {/* Blockchain Infrastructure */}
    <Route path="blockchain" element={<BlockchainEvents />} />
    <Route path="idempotency" element={<IdempotencyKeys />} />
    
    {/* User Context */}
    <Route path="profile" element={<Profile />} />
  </>
);