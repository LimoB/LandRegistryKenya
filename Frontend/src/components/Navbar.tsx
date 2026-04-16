import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Fingerprint, Menu, Globe } from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";

const Navbar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  // Modern link styling matching the Sidebar's font weight and spacing
  const navClass = (path: string) =>
    `hidden md:flex flex-col items-center gap-1 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 group ${
      isActive(path) ? "text-primary" : "text-text/40 hover:text-text"
    }`;

  return (
    <nav className="sticky top-0 z-50 glass border-b border-border/50">
      <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        
        {/* BRAND - Unified with Sidebar */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="p-2.5 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-400 text-white rounded-xl shadow-lg shadow-blue-500/20 group-hover:scale-105 group-hover:rotate-3 transition-all duration-300">
            <Fingerprint size={22} />
          </div>

          <div className="leading-none">
            <h1 className="font-black text-xl text-text tracking-tighter uppercase">
              Land<span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">Ledger</span>
            </h1>
            <div className="flex items-center gap-1.5">
              <p className="text-[8px] text-text/30 font-bold uppercase tracking-[0.4em]">
                Registry.ke
              </p>
              <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </div>
        </Link>

        {/* NAVIGATION LINKS */}
        <div className="flex items-center gap-6 lg:gap-10">
          
          <div className="hidden md:flex items-center gap-8">
            <Link to="/how-it-works" className={navClass("/how-it-works")}>
              How it Works
              <span
                className={`h-1 w-1 rounded-full bg-primary transition-all duration-300 ${
                  isActive("/how-it-works") 
                    ? "scale-100 opacity-100 shadow-[0_0_8px_rgb(var(--primary))]" 
                    : "scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-40"
                }`}
              />
            </Link>

            <Link to="/verify-title" className={navClass("/verify-title")}>
              Verify Title
              <span
                className={`h-1 w-1 rounded-full bg-primary transition-all duration-300 ${
                  isActive("/verify-title") 
                    ? "scale-100 opacity-100 shadow-[0_0_8px_rgb(var(--primary))]" 
                    : "scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-40"
                }`}
              />
            </Link>
          </div>

          {/* UTILITIES (Toggle + Sign In) */}
          <div className="flex items-center gap-4 border-l border-border/60 pl-6">
            <div className="hidden lg:flex items-center gap-2 text-[9px] font-bold text-text/40 uppercase tracking-widest mr-2">
              <Globe size={12} className="text-emerald-500" />
              Mainnet
            </div>
            
            <ThemeToggle />

            <Link
              to="/login"
              className={`
                hidden sm:block px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 active:scale-95
                ${
                  isActive("/login")
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "bg-text text-bg hover:opacity-90"
                }
              `}
            >
              Sign In
            </Link>

            {/* MOBILE MENU */}
            <button className="md:hidden p-2 text-text hover:bg-card border border-transparent hover:border-border rounded-xl transition-all">
              <Menu size={24} />
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;