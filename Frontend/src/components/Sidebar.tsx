import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { logout } from "../app/slices/authSlice";
import { 
  LayoutDashboard, Users, Map as MapIcon, Receipt, ShieldCheck, 
  Search, Home, PlusCircle, ArrowRightLeft, LogOut, Fingerprint, 
  Activity, UserCircle, FileSearch, CheckSquare, 
  Database, Globe, Wallet, History, AlertTriangle, FileText
} from "lucide-react";

interface SidebarProps {
  role: "admin" | "land_officer" | "citizen";
}

const Sidebar: React.FC<SidebarProps> = ({ role }) => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const navItems = {
    admin: [
      { name: "System Overview", path: "/admin/dashboard", icon: Activity },
      { name: "Manage Users", path: "/admin/users", icon: Users },
      { name: "National Registry", path: "/admin/registry", icon: Database }, 
      { name: "Fraud Control", path: "/admin/lands", icon: AlertTriangle },   
      { name: "Global Transfers", path: "/admin/transfers", icon: Receipt },
      { name: "Security Audit", path: "/admin/audit-logs", icon: ShieldCheck },
    ],
    land_officer: [
      { name: "Task Dashboard", path: "/officer/dashboard", icon: LayoutDashboard },
      { name: "Pending Checks", path: "/officer/verify-lands", icon: FileSearch },
      { name: "Approve Transfers", path: "/officer/transfers", icon: CheckSquare },
      { name: "Registry Search", path: "/officer/search", icon: Search },
      { name: "Official Reports", path: "/officer/reports", icon: FileText },
    ],
    citizen: [
      { name: "My Dashboard", path: "/citizen/dashboard", icon: Home },
      { name: "My Properties", path: "/citizen/my-lands", icon: MapIcon },
      { name: "Register New Land", path: "/citizen/register-land", icon: PlusCircle },
      { name: "Transfer Land", path: "/citizen/transfer-land", icon: ArrowRightLeft },
      { name: "Payment History", path: "/citizen/payments", icon: History },
      { name: "Digital Wallet", path: "/citizen/wallet", icon: Wallet },
      { name: "My Profile", path: "/citizen/profile", icon: UserCircle },
    ],
  };

  return (
    <aside className="w-72 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-900 h-screen sticky top-0 flex flex-col z-50">
      
      {/* Brand Logo */}
      <div className="p-8 pb-4">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="bg-blue-600 text-white p-2.5 rounded-2xl shadow-xl shadow-blue-500/30 group-hover:rotate-6 transition-all">
            <Fingerprint size={22} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 dark:text-white tracking-tight text-xl leading-none">
              Land<span className="text-blue-600">Ledger</span>
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Registry.ke</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto mt-6 custom-scrollbar">
        <div className="px-4 mb-4">
          <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-lg">
            {role.replace("_", " ")}
          </span>
        </div>

        {navItems[role].map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 group ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-blue-600"
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className={isActive ? "text-white" : "text-slate-400 group-hover:text-blue-600"} />
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Profile & Logout */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-900">
        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-3xl p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
              {user?.fullName?.charAt(0) || "U"}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-slate-900 dark:text-white truncate">{user?.fullName || "Guest User"}</span>
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter flex items-center gap-1">
                <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" /> Identity Verified
              </span>
            </div>
          </div>

          <button
            onClick={() => dispatch(logout())}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all border border-transparent hover:border-red-100"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>

        {/* Blockchain Status */}
        <div className="mt-4 px-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe size={12} className="text-slate-400" />
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Chain: Polygon</span>
            </div>
            <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">Secure</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;