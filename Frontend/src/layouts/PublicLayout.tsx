import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 relative overflow-hidden">
      
      {/* 1. Subtle Global Background Mesh (Visible on all public pages) */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.07] z-0">
        <div 
          className="absolute inset-0" 
          style={{ 
            backgroundImage: `radial-gradient(#3b82f6 1px, transparent 1px)`, 
            backgroundSize: '40px 40px' 
          }} 
        />
      </div>

      {/* 2. Navigation */}
      <Navbar />
      
      {/* 3. Main Content Area */}
      <main className="flex-1 relative z-10">
        {/* Renders: Home, Login, Register, HowItWorks, or VerifyTitle */}
        <Outlet /> 
      </main>

      {/* 4. Minimal Public Footer */}
      <footer className="relative z-10 py-10 border-t border-slate-100 dark:border-slate-900 bg-white/50 dark:bg-slate-950/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-1">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900 dark:text-white">
              National Land Ledger <span className="text-blue-600">v3.0</span>
            </span>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
              Distributed Infrastructure for Sovereign Title Management
            </p>
          </div>
          
          <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
            © {new Date().getFullYear()} Ministry of Lands & Physical Planning
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;