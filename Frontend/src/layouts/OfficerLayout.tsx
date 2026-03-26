import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { Menu, X, Bell, ShieldCheck, ChevronRight, Zap } from "lucide-react";

const OfficerLayout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Dynamic breadcrumb
  const pathParts = location.pathname.split("/").filter(Boolean);
  const currentPage = pathParts[pathParts.length - 1]?.replace("-", " ") || "Verification Queue";

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-slate-950 transition-colors duration-300">
      
      {/* Mobile Overlay */}
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
        <Sidebar role="land_officer" />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Unified Officer Header */}
        <header className="h-20 border-b border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950 flex items-center justify-between px-6 lg:px-10 shrink-0 z-30">
          
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl lg:hidden text-slate-600 dark:text-slate-400"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Professional Breadcrumbs */}
            <div className="flex flex-col">
              <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-0.5">
                <span>Internal Registry</span>
                <ChevronRight size={10} strokeWidth={3} />
                <span className="text-blue-600 dark:text-blue-400">Officer Portal</span>
              </nav>
              <h1 className="hidden sm:block text-sm font-black text-slate-900 dark:text-white capitalize tracking-tight">
                {currentPage}
              </h1>
            </div>
          </div>

          {/* Right Side Tools */}
          <div className="flex items-center gap-4 lg:gap-6">
            
            {/* Ledger Status - Clean GovTech Look */}
            <div className="hidden md:flex items-center gap-3 px-3 py-1.5 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </div>
              <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest">
                Ledger Node: Synced
              </span>
            </div>

            {/* Notification & Security */}
            <div className="flex items-center gap-2 border-l border-slate-100 dark:border-slate-800 pl-4 lg:pl-6">
              <button className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl relative transition-all">
                <Bell size={20} />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-amber-500 border-2 border-white dark:border-slate-950 rounded-full"></span>
              </button>
              
              <div className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400 border border-slate-100 dark:border-slate-800">
                <ShieldCheck size={20} />
              </div>
            </div>
          </div>
        </header>

        {/* Action-Focused Content Area */}
        <main className="flex-1 overflow-y-auto bg-white dark:bg-slate-950">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-10 space-y-8 animate-in fade-in duration-500">
            
            {/* Urgent Task Banner - Now integrated, not "floating" */}
            <div className="group relative overflow-hidden p-1 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 transition-all hover:shadow-xl hover:shadow-blue-200 dark:hover:shadow-none">
                <div className="relative bg-white dark:bg-slate-950 px-6 py-4 rounded-[14px] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-200 dark:shadow-none">
                            <Zap size={20} fill="currentColor" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-blue-600 uppercase tracking-widest">Action Required</p>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">You have 4 pending land verifications in your queue.</p>
                        </div>
                    </div>
                    <button className="whitespace-nowrap px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 shadow-md shadow-blue-100 dark:shadow-none">
                        Open Verification Queue
                    </button>
                </div>
            </div>

            {/* The Dashboard/Page Content */}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default OfficerLayout;