import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { logout } from "../app/slices/authSlice";
import { 
  LayoutDashboard, 
  Users, 
  Map as MapIcon, 
  Receipt, 
  // ScrollText, 
  ShieldCheck, 
  Search, 
  Home, 
  PlusCircle, 
  ArrowRightLeft, 
  LogOut,
  Fingerprint,
  Activity,
  UserCircle,
  FileSearch,
  CheckSquare,
  Settings2,
  Database
} from "lucide-react";

interface SidebarProps {
  role: "admin" | "land_officer" | "citizen";
}

const Sidebar: React.FC<SidebarProps> = ({ role }) => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  // Updated navigation mapping to match AppRoutes.tsx
  const navItems = {
    admin: [
      { name: "System Health", path: "/admin/dashboard", icon: Activity },
      { name: "User Management", path: "/admin/users", icon: Users },
      { name: "Global Registry", path: "/admin/registry", icon: Database }, // View Only
      { name: "Lands Control", path: "/admin/lands", icon: Settings2 },   // Management/Flagging
      { name: "Transfer Audit", path: "/admin/transfers", icon: Receipt },
      { name: "Security Logs", path: "/admin/audit-logs", icon: ShieldCheck },
    ],
    land_officer: [
      { name: "Verification Queue", path: "/officer/dashboard", icon: LayoutDashboard },
      { name: "Land Title Review", path: "/officer/verify-lands", icon: FileSearch },
      { name: "Transfer Approvals", path: "/officer/transfers", icon: CheckSquare },
      { name: "Registry Search", path: "/officer/search", icon: Search },
    ],
    citizen: [
      { name: "Overview", path: "/citizen/dashboard", icon: Home },
      { name: "My Properties", path: "/citizen/my-lands", icon: MapIcon },
      { name: "New Registration", path: "/citizen/register-land", icon: PlusCircle },
      { name: "Initiate Transfer", path: "/citizen/transfer-land", icon: ArrowRightLeft },
      { name: "My Requests", path: "/citizen/my-requests", icon: Activity },
      { name: "Account Profile", path: "/citizen/profile", icon: UserCircle },
    ],
  };

  return (
    <aside className="w-72 bg-white dark:bg-slate-950 border-r border-slate-100 dark:border-slate-900 h-screen sticky top-0 flex flex-col transition-all z-50">
      
      {/* 1. Brand Logo */}
      <div className="p-8">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="bg-blue-600 text-white p-2.5 rounded-xl shadow-lg shadow-blue-500/20 font-bold flex items-center justify-center">
              <Fingerprint size={20} />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-950 rounded-full"></div>
          </div>
          <div className="flex flex-col">
            <span className="font-black text-slate-900 dark:text-white tracking-tighter text-lg leading-none">
              LAND<span className="text-blue-600">LEDGER</span>
            </span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1">
              Republic of Kenya
            </span>
          </div>
        </div>
      </div>

      {/* 2. Navigation */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto mt-4 custom-scrollbar">
        <div className="px-4 mb-4">
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em]">
                {role.replace("_", " ")} Portal
            </p>
        </div>

        {navItems[role].map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 group relative ${
                isActive
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-blue-600 dark:hover:text-blue-400"
              }`}
            >
              <Icon 
                size={18} 
                strokeWidth={isActive ? 2.5 : 2} 
                className={`${isActive ? "text-white" : "group-hover:scale-110 transition-transform"} transition-transform duration-300`} 
              />
              <span className="truncate">{item.name}</span>
              
              {isActive && (
                  <span className="absolute right-3 w-1.5 h-1.5 bg-white rounded-full animate-pulse shadow-[0_0_8px_white]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* 3. User & Logout Area */}
      <div className="p-4 border-t border-slate-50 dark:border-slate-900/50">
        <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 transition-all hover:border-blue-500/20">
            <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-sm shadow-inner shrink-0 uppercase tracking-widest">
                        {user?.fullName?.charAt(0) || "U"}
                    </div>
                </div>
                <div className="flex flex-col min-w-0">
                    <span className="text-xs font-black text-slate-900 dark:text-white truncate">
                        {user?.fullName || "Verified User"}
                    </span>
                    <span className="text-[9px] font-bold text-blue-600 dark:text-blue-500 uppercase tracking-widest mt-0.5">
                        {role.replace("_", " ")}
                    </span>
                </div>
            </div>

            <button
              onClick={() => dispatch(logout())}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest text-red-500 bg-red-500/5 hover:bg-red-500 hover:text-white border border-red-500/10 transition-all active:scale-95 shadow-sm group"
            >
              <LogOut size={14} className="group-hover:-translate-x-1 transition-transform" />
              Terminate Session
            </button>
        </div>
        
        {/* Network Status Indicator */}
        <div className="mt-4 px-2 flex items-center justify-between">
            <span className="text-[8px] font-black uppercase text-slate-400 tracking-tighter">Blockchain: Mainnet</span>
            <div className="flex items-center gap-1">
                <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-[8px] font-bold text-emerald-600 uppercase">Synced</span>
            </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;