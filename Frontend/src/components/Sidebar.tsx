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
  ArrowRightLeft,
  LogOut,
  Fingerprint,
  FileSearch,
  CheckSquare,
  Globe,
  // Wallet,
  History,
  UserCircle,
  Activity,
  Blocks,
  KeyRound,
  ChevronDown,
  FileText,
  CreditCard
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
        { name: "Idempotency", path: "/admin/idempotency", icon: KeyRound },
      ],
    },

    land_officer: {
      overview: [
        { name: "Dashboard", path: "/officer/dashboard", icon: LayoutDashboard },
      ],
      operations: [
        { name: "Verify Lands", path: "/officer/verify-lands", icon: FileSearch },
        { name: "Transfer Approvals", path: "/officer/transfers", icon: CheckSquare },
      ],
      tools: [
        { name: "Search Registry", path: "/officer/search", icon: Search }
      ],
    },

    citizen: {
      overview: [{ name: "Dashboard", path: "/citizen/dashboard", icon: Home }],
      property: [
        { name: "My Lands", path: "/citizen/my-lands", icon: Database },
        { name: "Digital Titles", path: "/citizen/titles", icon: FileText },
        { name: "Marketplace", path: "/citizen/transfer", icon: Globe },
      ],
      activity: [
        { name: "My Requests", path: "/citizen/my-requests", icon: ArrowRightLeft },
        { name: "Payment History", path: "/citizen/payments", icon: History },
      ],
      finance: [
        // { name: "On-Chain Wallet", path: "/citizen/wallet", icon: Wallet },
        { name: "Pay Statutory Fees", path: "/citizen/pay", icon: CreditCard, comingSoon: true },
      ],
    },
  };

  const sections = nav[role];

  const renderSection = (title: string, items: NavItem[]) => (
    <div className="mt-6" key={title}>
      <p className="px-3 mb-2 text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 dark:text-slate-500">
        {title}
      </p>

      <div className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          
          // Improved active logic:
          // 1. Check if name matches "My Requests" and we are on a status sub-route
          // 2. Check if the path is an exact match for dashboard
          // 3. Otherwise, check if the current pathname starts with the item path
          const isRequestActive = item.name === "My Requests" && location.pathname.includes("/transfer/status");
          const isDashboard = item.path.endsWith("/dashboard");
          const isActive = isDashboard 
            ? location.pathname === item.path 
            : location.pathname.startsWith(item.path) || isRequestActive;

          return (
            <Link
              key={item.path}
              to={item.comingSoon ? "#" : item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all duration-200 group ${
                item.comingSoon ? "opacity-60 cursor-not-allowed" : ""
              } ${
                isActive
                  ? "bg-indigo-600 text-white font-bold shadow-md shadow-indigo-200 dark:shadow-indigo-900/30"
                  : "text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
              }`}
            >
              <Icon size={16} className={isActive ? "text-white" : "text-slate-400 group-hover:text-indigo-500"} />
              <span className="truncate">{item.name}</span>

              {item.comingSoon && (
                <span className="ml-auto px-1.5 py-0.5 bg-slate-100 dark:bg-white/10 text-slate-400 rounded text-[8px] font-bold uppercase">
                  SOON
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );

  return (
    <aside className="w-64 h-screen sticky top-0 flex flex-col border-r border-slate-100 dark:border-white/10 bg-white dark:bg-[#0B0F1A]">
      {/* BRAND SECTION */}
      <div className="px-5 py-6 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none">
            <Fingerprint size={18} />
          </div>
          <div>
            <span className="text-sm font-black tracking-tight text-slate-900 dark:text-white block leading-none">
              LandLedger 
            </span>
            <span className="text-indigo-600 text-[9px] font-black tracking-widest uppercase">
              Kenya Registry
            </span>
          </div>
        </div>
        <ThemeToggle />
      </div>

      {/* NAVIGATION SECTION */}
      <div className="flex-1 overflow-y-auto px-3 py-4 scrollbar-hide">
        {Object.entries(sections).map(([title, items]) => renderSection(title, items))}
      </div>

      {/* FOOTER USER PROFILE */}
      <div className="border-t border-slate-100 dark:border-white/10 p-4 bg-slate-50/50 dark:bg-white/2">
        <button
          onClick={() => setOpenUserMenu(!openUserMenu)}
          className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-white dark:hover:bg-white/5 transition-all border border-transparent hover:border-slate-200 dark:hover:border-white/10 shadow-sm hover:shadow-md"
        >
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xs font-black shadow-inner">
            {user?.fullName?.charAt(0) || "U"}
          </div>

          <div className="flex-1 text-left min-w-0">
            <p className="text-[11px] font-black truncate text-slate-900 dark:text-white">
              {user?.fullName || "Guest User"}
            </p>
            <p className="text-[9px] text-indigo-500 font-black uppercase tracking-tighter">
              {role.replace("_", " ")}
            </p>
          </div>

          <ChevronDown 
            size={14} 
            className={`text-slate-400 transition-transform duration-300 ${openUserMenu ? 'rotate-180' : ''}`} 
          />
        </button>

        {/* PROFILE DROPDOWN */}
        {openUserMenu && (
          <div className="mt-2 bg-white dark:bg-[#161B29] border border-slate-100 dark:border-white/10 rounded-xl p-1 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <Link
              to={`/${role}/profile`}
              onClick={() => setOpenUserMenu(false)}
              className="flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
            >
              <UserCircle size={14} />
              Account Settings
            </Link>

            <button
              onClick={() => {
                setOpenUserMenu(false);
                dispatch(logout());
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        )}

        {/* STATUS INDICATOR */}
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/5 flex items-center justify-between text-[8px] font-black uppercase tracking-[0.15em] text-slate-400">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            Blockchain Active
          </div>
          <span className="text-indigo-600/60 tabular-nums">v1.2.0-PRO</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;