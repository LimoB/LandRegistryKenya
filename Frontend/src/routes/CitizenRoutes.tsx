import { Route, Navigate } from "react-router-dom";
import CitizenDashboard from "../pages/citizen/CitizenDashboard";
import MyLands from "../pages/citizen/MyLands";
import RegisterLand from "../pages/citizen/RegisterLand";
import CitizenLandDetails from "../pages/citizen/LandDetails";
import TransferLand from "../pages/citizen/TransferLand";
import MyRequests from "../pages/citizen/MyRequests";
import TransferStatus from "../pages/citizen/TransferStatus";
import PaymentHistory from "../pages/Payments"; // Replaced ComingSoon
import CitizenWallet from "../pages/citizen/CitizenWallet";     // Replaced ComingSoon
import DigitalTitles from "../pages/citizen/DigitalTitles";     // Added for final ownership view
import Profile from "../pages/Profile";

export const CitizenRoutes = (
  <>
    {/* Core Navigation */}
    <Route index element={<Navigate to="dashboard" replace />} />
    <Route path="dashboard" element={<CitizenDashboard />} />
    
    {/* Property Management */}
    <Route path="my-lands" element={<MyLands />} />
    <Route path="register-land" element={<RegisterLand />} />
    <Route path="lands/:id" element={<CitizenLandDetails />} />
    <Route path="titles" element={<DigitalTitles />} />
    
    {/* Transfer & Marketplace Flow */}
    <Route path="transfer" element={<TransferLand />} />
    <Route path="transfer/:id" element={<TransferLand />} />
    <Route path="my-requests" element={<MyRequests />} />
    
    {/* The Payment & Blockchain Handover Bridge */}
    <Route path="transfer/status/:id" element={<TransferStatus />} />
    
    {/* Finance & History */}
    <Route path="payments" element={<PaymentHistory />} />
    <Route path="wallet" element={<CitizenWallet />} />
    
    {/* Personal Account */}
    <Route path="profile" element={<Profile />} />
  </>
);