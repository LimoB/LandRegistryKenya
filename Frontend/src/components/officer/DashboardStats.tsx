import React from "react";
import { ShieldAlert } from "lucide-react";

interface StatsProps {
  verifiedCount: number;
  dailyTarget: number;
  progressPercent: number;
}

const DashboardStats: React.FC<StatsProps> = ({ verifiedCount, dailyTarget, progressPercent }) => {
  return (
    <div className="lg:col-span-4 space-y-8">
      <div className="bg-slate-900 p-10 rounded-[3rem] text-white relative overflow-hidden shadow-2xl shadow-slate-900/40">
        <div className="relative z-10">
          <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
            Quota Progress
          </h3>
          <p className="text-7xl font-black mt-6 tracking-tighter italic">
            {progressPercent}<span className="text-3xl text-amber-500 not-italic">%</span>
          </p>
          <div className="w-full bg-white/10 h-3 rounded-full mt-10 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-amber-600 to-amber-400 h-full transition-all duration-1000 ease-out" 
              style={{ width: `${progressPercent}%` }} 
            />
          </div>
          <div className="flex justify-between items-center mt-8 pt-8 border-t border-white/5">
            <div>
              <p className="text-2xl font-black">{verifiedCount}</p>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Verified Today</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-slate-500">{dailyTarget}</p>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Target Goal</p>
            </div>
          </div>
        </div>
        <ShieldAlert size={200} className="absolute -bottom-10 -right-10 text-white/5 rotate-12" />
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[2.5rem]">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Recent Log</h4>
        <div className="space-y-4 text-[11px] font-bold dark:text-slate-300">
          <div className="flex items-center gap-3"><span className="h-1.5 w-1.5 bg-emerald-500 rounded-full" /> System Online: Node connected</div>
          <div className="flex items-center gap-3 opacity-50"><span className="h-1.5 w-1.5 bg-slate-400 rounded-full" /> Awaiting signature for new LR</div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;