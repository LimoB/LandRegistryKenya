import React from "react";
import { ShieldAlert, Target, CheckCircle } from "lucide-react";

interface StatsProps {
  verifiedCount: number;
  dailyTarget: number;
  progressPercent: number;
}

const DashboardStats: React.FC<StatsProps> = ({ 
  verifiedCount, 
  dailyTarget, 
  progressPercent 
}) => {
  return (
    <div className="space-y-8">
      {/* Main Progress Card */}
      <div className="bg-slate-900 p-10 rounded-[3rem] text-white relative overflow-hidden shadow-2xl shadow-slate-900/40">
        <div className="relative z-10">
          <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
            Work Progress
          </h3>
          
          <p className="text-7xl font-black mt-6 tracking-tighter italic">
            {progressPercent}<span className="text-3xl text-amber-500 not-italic">%</span>
          </p>

          {/* Progress Bar */}
          <div className="w-full bg-white/10 h-3 rounded-full mt-10 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-amber-600 to-amber-400 h-full transition-all duration-1000 ease-out" 
              style={{ width: `${progressPercent}%` }} 
            />
          </div>

          {/* Counts */}
          <div className="flex justify-between items-center mt-8 pt-8 border-t border-white/5">
            <div>
              <p className="text-2xl font-black">{verifiedCount}</p>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1 text-emerald-500">
                Done Today
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-slate-500">{dailyTarget}</p>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                Daily Goal
              </p>
            </div>
          </div>
        </div>

        {/* Background Icon Decor */}
        <ShieldAlert 
          size={200} 
          className="absolute -bottom-10 -right-10 text-white/5 rotate-12" 
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-[2rem]">
          <Target className="text-amber-500 mb-2" size={20} />
          <p className="text-xs font-black dark:text-white uppercase tracking-tight">
            Next Task
          </p>
          <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">
            Check Queue
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-[2rem]">
          <CheckCircle className="text-emerald-500 mb-2" size={20} />
          <p className="text-xs font-black dark:text-white uppercase tracking-tight">
            System
          </p>
          <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">
            Active
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;