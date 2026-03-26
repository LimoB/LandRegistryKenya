import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { Menu, X, Bell, Search, ChevronRight, Settings, Command } from "lucide-react";

const AdminLayout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Extract current page name
  const pathname = location.pathname.split("/").pop()?.replace("-", " ") || "Dashboard";

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-slate-950 transition-colors duration-300">
      
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Fixed Pillar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out shrink-0
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <Sidebar role="admin" />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Technical Admin Header */}
        <header className="h-20 border-b border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950 flex items-center justify-between px-6 lg:px-10 shrink-0 z-30">
          
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl lg:hidden text-slate-600 dark:text-slate-400"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Breadcrumbs with "Command" icon for Admin feel */}
            <div className="flex flex-col">
              <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-0.5">
                <Command size={10} className="text-blue-600" />
                <span>Root</span>
                <ChevronRight size={10} strokeWidth={3} />
                <span className="text-blue-600 dark:text-blue-400">System</span>
              </nav>
              <h1 className="hidden sm:block text-sm font-black text-slate-900 dark:text-white capitalize tracking-tight">
                {pathname}
              </h1>
            </div>
          </div>

          {/* Admin Header Actions */}
          <div className="flex items-center gap-4 lg:gap-8">
            
            {/* Minimalist Tech Search */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                type="text" 
                placeholder="Find user or asset..." 
                className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-xs focus:ring-1 ring-blue-500 w-72 text-slate-300 transition-all outline-none"
              />
            </div>
            
            <div className="flex items-center gap-2 border-l border-slate-100 dark:border-slate-800 pl-6">
                <button className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl relative transition-all">
                    <Bell size={20} />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-blue-600 border-2 border-white dark:border-slate-950 rounded-full animate-pulse"></span>
                </button>
                
                <button className="p-2.5 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl transition-all">
                    <Settings size={20} />
                </button>
            </div>
          </div>
        </header>

        {/* Admin Content Area - Seamless Integration */}
        <main className="flex-1 overflow-y-auto bg-white dark:bg-slate-950 scrollbar-hide">
          <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
            
            {/* Optional System Status Bar for Admin Only */}
            <div className="mb-10 flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/5 rounded-lg border border-blue-500/10">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Mainnet Live</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/5 rounded-lg border border-emerald-500/10">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">PostgreSQL: 24ms</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-500/5 rounded-lg border border-slate-500/10">
                    <div className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">v2.4.1-Stable</span>
                </div>
            </div>

            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;