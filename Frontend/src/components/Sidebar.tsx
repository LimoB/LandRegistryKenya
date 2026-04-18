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
      overview: [
        { name: "Overview", path: "/admin/dashboard", icon: Activity },
      ],
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

        // ✅ FIXED PATH (THIS WAS THE BUG)
        { name: "Transfer", path: "/citizen/transfer", icon: ArrowRightLeft },
      ],
      finance: [
        { name: "Payments", path: "/citizen/payments", icon: History },
        { name: "Wallet", path: "/citizen/wallet", icon: Wallet },
      ],
    },
  };

  const sections = nav[role];

  const renderSection = (title: string, items: NavItem[]) => (
    <div className="mt-5">
      <p className="px-3 mb-2 text-[9px] uppercase tracking-widest text-text/30">
        {title}
      </p>

      <div className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition ${
                isActive
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-text/60 hover:bg-white/5 hover:text-text"
              }`}
            >
              <Icon size={16} />
              <span className="truncate">{item.name}</span>

              {item.comingSoon && (
                <span className="ml-auto text-[9px] text-yellow-500">
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
    <aside className="w-64 h-screen sticky top-0 flex flex-col border-r border-border/40 bg-bg">

      {/* BRAND */}
      <div className="px-5 py-4 border-b border-border/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary text-white rounded-lg">
            <Fingerprint size={16} />
          </div>
          <span className="text-sm font-semibold">LandLedger</span>
        </div>

        <ThemeToggle />
      </div>

      {/* NAV */}
      <div className="flex-1 overflow-y-auto px-2 py-3">
        {Object.entries(sections).map(([title, items]) => (
          <div key={title}>{renderSection(title, items)}</div>
        ))}
      </div>

      {/* USER PANEL */}
      <div className="border-t border-border/40 p-3">

        <button
          onClick={() => setOpenUserMenu(!openUserMenu)}
          className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition"
        >
          <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center text-xs font-bold">
            {user?.fullName?.charAt(0) || "U"}
          </div>

          <div className="flex-1 text-left">
            <p className="text-xs font-semibold truncate">
              {user?.fullName || "User"}
            </p>
            <p className="text-[10px] text-text/40 capitalize">
              {role.replace("_", " ")}
            </p>
          </div>

          <ChevronDown size={14} className="text-text/40" />
        </button>

        {openUserMenu && (
          <div className="mt-2 bg-card border border-border/40 rounded-lg p-1 space-y-1">

            <Link
              to={`/${role}/profile`}
              className="flex items-center gap-2 px-3 py-2 text-xs rounded-md hover:bg-white/5"
            >
              <UserCircle size={14} />
              Profile
            </Link>

            <button
              onClick={() => dispatch(logout())}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-md text-red-500 hover:bg-red-500/10"
            >
              <LogOut size={14} />
              Sign out
            </button>
          </div>
        )}

        <div className="mt-3 flex items-center justify-between text-[10px] text-text/40">
          <div className="flex items-center gap-1">
            <Globe size={10} />
            Mainnet
          </div>
          <span className="text-emerald-500">Secure</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;