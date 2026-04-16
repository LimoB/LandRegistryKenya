import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { logout } from "../app/slices/authSlice";
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
  FileText,
  Globe,
  Wallet,
  History,
  UserCircle,
  Activity,
  CreditCard,
  Blocks,
  KeyRound,
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

  const nav: Record<SidebarProps["role"], NavSection> = {
    admin: {
      overview: [
        { name: "System Overview", path: "/admin/dashboard", icon: Activity },
      ],
      core: [
        { name: "Users", path: "/admin/users", icon: Users },
        { name: "Land Registry", path: "/admin/lands", icon: Database },
        { name: "Transfers", path: "/admin/transfers", icon: ArrowRightLeft },
      ],
      finance: [
        { name: "Payments", path: "/admin/payments", icon: CreditCard, comingSoon: true },
      ],
      security: [
        { name: "Audit Logs", path: "/admin/audit-logs", icon: ShieldCheck },
        { name: "Fraud Monitoring", path: "/admin/fraud", icon: AlertTriangle },
      ],
      blockchain: [
        { name: "Blockchain Events", path: "/admin/blockchain", icon: Blocks },
        { name: "Idempotency Keys", path: "/admin/idempotency", icon: KeyRound },
      ],
    },

    land_officer: {
      overview: [
        { name: "Dashboard", path: "/officer/dashboard", icon: LayoutDashboard },
      ],
      operations: [
        { name: "Verify Lands", path: "/officer/verify-lands", icon: FileSearch },
        { name: "Approve Transfers", path: "/officer/transfers", icon: CheckSquare },
      ],
      tools: [
        { name: "Registry Search", path: "/officer/search", icon: Search },
        { name: "Reports", path: "/officer/reports", icon: FileText, comingSoon: true },
      ],
    },

    citizen: {
      overview: [
        { name: "Dashboard", path: "/citizen/dashboard", icon: Home },
      ],
      property: [
        { name: "My Lands", path: "/citizen/my-lands", icon: Database },
        { name: "Register Land", path: "/citizen/register-land", icon: PlusCircle },
        { name: "Transfer Land", path: "/citizen/transfer-land", icon: ArrowRightLeft },
      ],
      finance: [
        { name: "Payments", path: "/citizen/payments", icon: History, comingSoon: true },
        { name: "Wallet", path: "/citizen/wallet", icon: Wallet, comingSoon: true },
      ],
      identity: [
        { name: "Profile", path: "/citizen/profile", icon: UserCircle },
      ],
    },
  };

  const sections = nav[role];

  const renderSection = (title: string, items: NavItem[]) => {
    return (
      <div className="mt-6">
        <p className="px-4 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
          {title}
        </p>

        <div className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            if (item.comingSoon) {
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-slate-400 hover:bg-white/40 dark:hover:bg-slate-900/40 transition"
                >
                  <Icon size={18} />
                  <span className="truncate">{item.name}</span>
                  <span className="ml-auto text-[10px] text-yellow-500">
                    soon
                  </span>
                </Link>
              );
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? "bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-400 text-white shadow-lg"
                    : "text-slate-600 hover:bg-white/50 dark:hover:bg-slate-900/50 hover:backdrop-blur"
                }`}
              >
                <Icon size={18} />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <aside className="w-72 h-screen sticky top-0 flex flex-col glass">

      {/* BRAND */}
      <div className="px-6 py-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl">
            <Fingerprint size={20} />
          </div>

          <div>
            <h1 className="font-bold text-text">LandLedger</h1>
            <p className="text-[10px] text-slate-400">
              Kenya Registry System
            </p>
          </div>
        </div>

        {/* ROLE + THEME TOGGLE */}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-[10px] px-2 py-1 rounded-full bg-primary/10 text-primary">
            {role}
          </span>

          {/* THEME TOGGLE HERE */}
          <ThemeToggle />
        </div>
      </div>

      {/* NAV */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        {Object.entries(sections).map(([title, items]) => (
          <div key={title}>{renderSection(title, items)}</div>
        ))}
      </div>

      {/* USER PANEL */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 text-white flex items-center justify-center font-bold">
            {user?.fullName?.charAt(0) || "U"}
          </div>

          <div className="min-w-0">
            <p className="text-sm font-bold truncate">
              {user?.fullName || "User"}
            </p>
            <p className="text-[10px] text-emerald-500">
              Verified Identity
            </p>
          </div>
        </div>

        <button
          onClick={() => dispatch(logout())}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-red-500 hover:bg-red-500/10 rounded-xl transition"
        >
          <LogOut size={14} />
          Logout
        </button>

        {/* FOOTER */}
        <div className="mt-4 flex items-center justify-between text-[10px] text-slate-400">
          <div className="flex items-center gap-1">
            <Globe size={12} />
            Polygon Network
          </div>
          <span className="text-emerald-500 font-bold">Secure</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;