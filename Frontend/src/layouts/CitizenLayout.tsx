import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useAppSelector } from "../app/hooks";
import { Menu, X, Bell, Wallet, ChevronRight } from "lucide-react";

const CitizenLayout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAppSelector((state) => state.auth);
  const location = useLocation();

  const currentPage = location.pathname.split("/").pop()?.replace("-", " ") || "Overview";

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-slate-950 transition-colors duration-300">
      
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Make it a fixed pillar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out shrink-0
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <Sidebar role="citizen" />
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Header - Unified with the background */}
        <header className="h-20 border-b border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950 flex items-center justify-between px-6 lg:px-10 shrink-0 z-30">
          
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl lg:hidden text-slate-600 dark:text-slate-400"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Clean Breadcrumb */}
            <div className="flex flex-col">
                <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-0.5">
                <span>Citizen Portal</span>
                <ChevronRight size={10} strokeWidth={3} />
                <span className="text-blue-600 dark:text-blue-400">{currentPage}</span>
                </nav>
                <h2 className="hidden sm:block text-sm font-bold text-slate-900 dark:text-white capitalize">
                    {currentPage}
                </h2>
            </div>
          </div>

          <div className="flex items-center gap-4 lg:gap-8">
            {/* Wallet - More "GovTech" Professional style */}
            <div className="hidden md:flex items-center gap-3 pl-2 pr-4 py-1.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="w-7 h-7 rounded-lg bg-blue-600/10 flex items-center justify-center">
                <Wallet size={14} className="text-blue-600" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">Active Wallet</span>
                <span className="text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300">
                    {user?.walletAddress ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}` : "Not Linked"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
                <button className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl relative transition-all">
                <Bell size={20} />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 border-2 border-white dark:border-slate-950 rounded-full"></span>
                </button>
            </div>
          </div>
        </header>

        {/* Page Content - Crucial: No extra padding here if Dashboard has its own */}
        <main className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default CitizenLayout;