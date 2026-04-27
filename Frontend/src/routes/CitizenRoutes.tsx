import { Route, Navigate } from "react-router-dom";
import CitizenDashboard from "../pages/citizen/CitizenDashboard";
import MyLands from "../pages/citizen/MyLands";
import RegisterLand from "../pages/citizen/RegisterLand";
import CitizenLandDetails from "../pages/citizen/LandDetails";
import TransferLand from "../pages/citizen/TransferLand";
import MyRequests from "../pages/citizen/MyRequests";
import TransferStatus from "../pages/citizen/TransferStatus";
import Profile from "../pages/Profile";
import ComingSoon from "../components/ComingSoon";

export const CitizenRoutes = (
  <>
    <Route index element={<Navigate to="dashboard" replace />} />
    <Route path="dashboard" element={<CitizenDashboard />} />
    <Route path="my-lands" element={<MyLands />} />
    <Route path="register-land" element={<RegisterLand />} />
    <Route path="lands/:id" element={<CitizenLandDetails />} />
    
    {/* Transfer Flow */}
    <Route path="transfer" element={<TransferLand />} />
    <Route path="transfer/:id" element={<TransferLand />} />
    <Route path="my-requests" element={<MyRequests />} />
    <Route path="transfer/status/:id" element={<TransferStatus />} />
    
    <Route path="profile" element={<Profile />} />
    <Route path="payments" element={<ComingSoon title="Payments" />} />
    <Route path="wallet" element={<ComingSoon title="Wallet" />} />
  </>
);