import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Fingerprint } from "lucide-react";

const Navbar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navLinkStyles = (path: string) => `
    hidden md:flex items-center flex-col gap-1 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 group
    ${isActive(path) ? 'text-blue-600' : 'text-slate-500 hover:text-blue-600'}
  `;

  return (
    <nav className="sticky top-0 z-[100] bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-900/50">
      <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        
        {/* Logo Section - Matched to the Fingerprint Branding */}
        <Link to="/" className="flex items-center gap-4 group">
          <div className="bg-blue-600 p-2.5 rounded-2xl group-hover:rotate-6 transition-all duration-500 shadow-xl shadow-blue-500/20 group-hover:shadow-blue-500/40">
             <Fingerprint className="text-white" size={22} strokeWidth={1.5} />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-2xl tracking-tighter uppercase text-slate-900 dark:text-white leading-none">
              Land<span className="text-blue-600">Ledger</span>
            </span>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] ml-0.5">Registry.ke</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-10">
          <Link to="/how-it-works" className={navLinkStyles('/how-it-works')}>
            How it Works
            <div className={`h-1 w-1 rounded-full bg-blue-600 transition-all duration-300 ${isActive('/how-it-works') ? 'opacity-100 scale-100' : 'opacity-0 scale-0 group-hover:opacity-50 group-hover:scale-100'}`} />
          </Link>
          
          <Link to="/verify-title" className={navLinkStyles('/verify-title')}>
            Verify Title
            <div className={`h-1 w-1 rounded-full bg-blue-600 transition-all duration-300 ${isActive('/verify-title') ? 'opacity-100 scale-100' : 'opacity-0 scale-0 group-hover:opacity-50 group-hover:scale-100'}`} />
          </Link>
          
          {/* Sign In Button - Matched to Login/Register Action Buttons */}
          <Link 
            to="/login" 
            className={`px-8 py-3.5 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.25em] transition-all duration-500 active:scale-95 shadow-lg
                ${isActive('/login') 
                ? 'bg-blue-600 text-white shadow-blue-500/40 translate-y-[-1px]' 
                : 'bg-slate-900 dark:bg-blue-600 text-white hover:shadow-blue-500/20 hover:-translate-y-1'
            }`}
          >
            Sign In
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;