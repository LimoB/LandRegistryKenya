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
    <Route index element={<Navigate to="dashboard" replace />} />
    <Route path="dashboard" element={<OfficerDashboard />} />
    <Route path="verify-lands" element={<VerifyLands />} />
    <Route path="transfers" element={<TransferApprovals />} />
    <Route path="transfers/:id" element={<TransferStatus />} /> 
    <Route path="search" element={<RegistrySearch />} />
    <Route path="registry/view/:id" element={<OfficerLandDetails />} />
    <Route path="profile" element={<Profile />} />
  </>
);