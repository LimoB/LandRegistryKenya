import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Fingerprint, Menu, Globe } from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";

const Navbar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navClass = (path: string) =>
    `text-xs font-medium transition ${
      isActive(path)
        ? "text-primary"
        : "text-text/50 hover:text-text"
    }`;

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-bg/70 border-b border-border/40">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-5 py-2.5">

        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2">
          <div className="p-1.5 bg-gradient-to-r from-blue-500 to-emerald-400 text-white rounded-md">
            <Fingerprint size={16} />
          </div>

          <div className="leading-tight">
            <h1 className="text-sm font-semibold tracking-tight">
              Land<span className="text-primary">Ledger</span>
            </h1>
            <p className="text-[7px] text-text/40 uppercase tracking-wider">
              registry.ke
            </p>
          </div>
        </Link>

        {/* CENTER NAV */}
        <div className="hidden md:flex items-center gap-5">
          <Link to="/how-it-works" className={navClass("/how-it-works")}>
            How it Works
          </Link>

          <Link to="/verify-title" className={navClass("/verify-title")}>
            Verify
          </Link>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-2.5">

          {/* network */}
          <div className="hidden lg:flex items-center gap-1 text-[9px] text-text/40">
            <Globe size={11} className="text-emerald-500" />
            Mainnet
          </div>

          {/* SMALL THEME TOGGLE WRAPPER */}
          <div className="scale-90">
            <ThemeToggle />
          </div>

          {/* SMALL SIGN IN BUTTON */}
          <Link
            to="/login"
            className={`px-3 py-1.5 text-[11px] rounded-md font-medium transition ${
              isActive("/login")
                ? "bg-primary text-white"
                : "bg-text text-bg hover:opacity-90"
            }`}
          >
            Sign In
          </Link>

          {/* mobile */}
          <button className="md:hidden p-1.5 rounded-md hover:bg-white/10 transition">
            <Menu size={18} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;