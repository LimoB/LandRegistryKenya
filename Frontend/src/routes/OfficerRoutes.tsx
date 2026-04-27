import { Route, Navigate } from "react-router-dom";
import OfficerDashboard from "../pages/landOfficer/OfficerDashboard";
import VerifyLands from "../pages/landOfficer/VerifyLands";
import TransferApprovals from "../pages/landOfficer/TransferApprovals";
import RegistrySearch from "../pages/landOfficer/RegistrySearch";
import OfficerLandDetails from "../components/officer/LandDetails";
import TransferStatus from "../pages/citizen/TransferStatus";
import Profile from "../pages/Profile";

export const OfficerRoutes = (
  <>
    {/* Executive Overview */}
    <Route index element={<Navigate to="dashboard" replace />} />
    <Route path="dashboard" element={<OfficerDashboard />} />
    
    {/* Land & Document Verification */}
    <Route path="verify-lands" element={<VerifyLands />} />
    
    {/* Transfer Approval Pipeline */}
    {/* This is where the officer clicks "Approve" to move state to 'payment_pending' */}
    <Route path="transfers" element={<TransferApprovals />} /> 
    
    {/* Real-time status monitoring for on-chain events */}
    <Route path="transfers/:id" element={<TransferStatus />} /> 
    
    {/* Registry Tools */}
    <Route path="search" element={<RegistrySearch />} />
    <Route path="registry/view/:id" element={<OfficerLandDetails />} />
    
    {/* Account Management */}
    <Route path="profile" element={<Profile />} />
  </>
);