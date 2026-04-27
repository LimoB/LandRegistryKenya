import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { logout } from "../features/auth/authSlice";
import ThemeToggle from "../components/ThemeToggle";

import {
  LayoutDashboard,
  Users,
  Database,
  AlertTriangle,
  ShieldCheck,
  Search,
  Home,
  PlusCircle,
  ArrowRightLeft,
  LogOut,
  Fingerprint,
  FileSearch,
  CheckSquare,
  Globe,
  Wallet,
  History,
  UserCircle,
  Activity,
  Blocks,
  KeyRound,
  ChevronDown,
} from "lucide-react";

interface SidebarProps {
  role: "admin" | "land_officer" | "citizen";
}

type NavItem = {
  name: string;
  path: string;
  icon: React.ElementType;
  comingSoon?: boolean;
};

type NavSection = Record<string, NavItem[]>;

const Sidebar: React.FC<SidebarProps> = ({ role }) => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [openUserMenu, setOpenUserMenu] = useState(false);

  const nav: Record<SidebarProps["role"], NavSection> = {
    admin: {
      overview: [{ name: "Overview", path: "/admin/dashboard", icon: Activity }],
      management: [
        { name: "Users", path: "/admin/users", icon: Users },
        { name: "Land Registry", path: "/admin/lands", icon: Database },
        { name: "Transfers", path: "/admin/transfers", icon: ArrowRightLeft },
      ],
      security: [
        { name: "Audit Logs", path: "/admin/audit-logs", icon: ShieldCheck },
        { name: "Fraud Monitoring", path: "/admin/fraud", icon: AlertTriangle },
      ],
      blockchain: [
        { name: "Events", path: "/admin/blockchain", icon: Blocks },
        { name: "Keys", path: "/admin/idempotency", icon: KeyRound },
      ],
    },

    land_officer: {
      overview: [
        { name: "Dashboard", path: "/officer/dashboard", icon: LayoutDashboard },
      ],
      operations: [
        { name: "Verify Lands", path: "/officer/verify-lands", icon: FileSearch },
        { name: "Transfers", path: "/officer/transfers", icon: CheckSquare },
      ],
      tools: [{ name: "Search", path: "/officer/search", icon: Search }],
    },

    citizen: {
      overview: [{ name: "Dashboard", path: "/citizen/dashboard", icon: Home }],
      property: [
        { name: "My Lands", path: "/citizen/my-lands", icon: Database },
        { name: "Register", path: "/citizen/register-land", icon: PlusCircle },
        { name: "Marketplace", path: "/citizen/transfer", icon: Globe },
      ],
      activity: [
        { name: "My Requests", path: "/citizen/my-requests", icon: ArrowRightLeft },
        { name: "Payment History", path: "/citizen/payments", icon: History },
      ],
      finance: [
        { name: "Wallet", path: "/citizen/wallet", icon: Wallet },
      ],
    },
  };

  const sections = nav[role];

  const renderSection = (title: string, items: NavItem[]) => (
    <div className="mt-5" key={title}>
      <p className="px-3 mb-2 text-[9px] uppercase font-black tracking-[0.2em] text-slate-400 dark:text-text/30">
        {title}
      </p>

      <div className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          
          /**
           * ENHANCED ACTIVE LINK LOGIC
           * 1. Exact match for dashboards.
           * 2. StartsWith for standard pages.
           * 3. Special Case: If user is on a status page, keep "My Requests" active.
           */
          const isRequestDetail = item.name === "My Requests" && location.pathname.includes("/transfer/status/");
          const isDashboard = item.path.endsWith("/dashboard");
          const isActive = isDashboard 
            ? location.pathname === item.path 
            : location.pathname.startsWith(item.path) || isRequestDetail;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all duration-200 ${
                isActive
                  ? "bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20"
                  : "text-slate-500 hover:bg-slate-50 dark:text-text/60 dark:hover:bg-white/5 dark:hover:text-text"
              }`}
            >
              <Icon size={16} />
              <span className="truncate">{item.name}</span>

              {item.comingSoon && (
                <span className="ml-auto px-1.5 py-0.5 bg-yellow-500/10 text-yellow-500 rounded text-[8px] font-bold uppercase">
                  soon
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );

  return (
    <aside className="w-64 h-screen sticky top-0 flex flex-col border-r border-slate-100 dark:border-border/40 bg-white dark:bg-bg">
      {/* BRAND */}
      <div className="px-5 py-6 border-b border-slate-100 dark:border-border/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-inner">
            <Fingerprint size={18} />
          </div>
          <span className="text-sm font-black tracking-tight text-slate-900 dark:text-white">
            LandLedger 
            <span className="text-indigo-600 text-[10px] block font-medium -mt-1 tracking-widest uppercase">
              Kenya
            </span>
          </span>
        </div>
        <ThemeToggle />
      </div>

      {/* NAV */}
      <div className="flex-1 overflow-y-auto px-3 py-4 custom-scrollbar">
        {Object.entries(sections).map(([title, items]) => renderSection(title, items))}
      </div>

      {/* USER PANEL */}
      <div className="border-t border-slate-100 dark:border-border/40 p-4">
        <button
          onClick={() => setOpenUserMenu(!openUserMenu)}
          className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all border border-transparent"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center text-xs font-black shrink-0">
            {user?.fullName?.charAt(0) || "U"}
          </div>

          <div className="flex-1 text-left min-w-0">
            <p className="text-xs font-black truncate text-slate-900 dark:text-white">
              {user?.fullName || "User"}
            </p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
              {role.replace("_", " ")}
            </p>
          </div>

          <ChevronDown 
            size={14} 
            className={`text-slate-400 transition-transform duration-300 ${openUserMenu ? 'rotate-180' : ''}`} 
          />
        </button>

        {openUserMenu && (
          <div className="mt-2 bg-white dark:bg-card border border-slate-100 dark:border-border/40 rounded-xl p-1 shadow-xl animate-in slide-in-from-bottom-2 duration-300">
            <Link
              to={`/${role}/profile`}
              onClick={() => setOpenUserMenu(false)}
              className="flex items-center gap-2 px-3 py-2.5 text-xs font-bold rounded-lg hover:bg-indigo-50 dark:hover:bg-primary/10 text-slate-700 dark:text-text hover:text-indigo-600 transition-colors"
            >
              <UserCircle size={14} />
              My Profile
            </Link>

            <button
              onClick={() => {
                setOpenUserMenu(false);
                dispatch(logout());
              }}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
            >
              <LogOut size={14} />
              Sign out
            </button>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-border/10 flex items-center justify-between text-[9px] font-black uppercase tracking-[0.1em] text-slate-400">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            Mainnet Online
          </div>
          <span className="text-indigo-600/50 italic">v1.0.4</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;