import React from "react";
import { 
  ShieldCheck, 
  Users, 
  Map as MapIcon, 
  // ArrowRightLeft, 
  Activity, 
  Globe, 
  AlertCircle,
  TrendingUp,
  ExternalLink,
  Zap
} from "lucide-react";
import { useGetLandsQuery } from "../../features/lands/landApi";
// Assuming you'll have these components or replace them with the logic below
// import RevenueChart from "../../components/dashboard/RevenueChart"; 

const AdminDashboard: React.FC = () => {
  const { data: allLands, isLoading } = useGetLandsQuery();

  // Mock analytics (Replace with real RTK Query data as needed)
  const totalAssets = allLands?.length || 0;
  const pendingVerifications = allLands?.filter(l => l.verificationStatus === 'pending').length || 0;

  return (
    <div className="flex-1 min-h-screen bg-white dark:bg-slate-950 transition-colors duration-200">
      
      {/* 1. Integrated System Header */}
      <div className="px-8 py-8 border-b border-slate-100 dark:border-slate-900">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between max-w-[1600px] mx-auto">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
              <Zap size={14} fill="currentColor" />
              Core Infrastructure: Nominal
            </div>
            <h1 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white">
              System <span className="text-indigo-600 dark:text-indigo-500">Overview</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="hidden lg:flex flex-col text-right mr-4 border-r border-slate-100 dark:border-slate-800 pr-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Network Load</span>
                <span className="text-xs font-bold text-emerald-500 uppercase">0.04ms Latency</span>
             </div>
             <button className="bg-slate-900 dark:bg-white dark:text-slate-900 text-white flex items-center gap-2 px-6 py-3 rounded-xl transition-all font-black text-xs uppercase tracking-widest shadow-xl active:scale-95">
                <Globe size={16} />
                Global Audit
             </button>
          </div>
        </header>
      </div>

      {/* 2. Main Content */}
      <main className="max-w-[1600px] mx-auto px-8 py-10 space-y-10">
        
        {/* Top Row: System Stats */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AdminStatItem 
            label="Total Platform Users" 
            value="1,284" 
            growth="+12%" 
            icon={<Users size={20} className="text-indigo-600" />} 
          />
          <AdminStatItem 
            label="Verified Assets" 
            value={isLoading ? "--" : totalAssets.toString()} 
            growth="Active" 
            icon={<MapIcon size={20} className="text-blue-600" />} 
          />
          <AdminStatItem 
            label="Pending Action" 
            value={isLoading ? "--" : pendingVerifications.toString()} 
            growth="Critical" 
            icon={<AlertCircle size={20} className="text-amber-500" />} 
            isAlert={pendingVerifications > 0}
          />
          <AdminStatItem 
            label="System Revenue" 
            value="KES 4.2M" 
            growth="+8.4%" 
            icon={<TrendingUp size={20} className="text-emerald-600" />} 
          />
        </section>

        {/* Middle Row: Analytics Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Chart Area */}
          <div className="xl:col-span-2 bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-900 rounded-[2.5rem] p-8">
             <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Market Activity</h3>
                    <p className="text-[11px] text-slate-500 font-bold uppercase tracking-tighter">Ownership transfers vs value over 30 days</p>
                </div>
                <select className="bg-white dark:bg-slate-800 border-none rounded-lg text-[10px] font-black uppercase px-3 py-1 outline-none ring-1 ring-slate-200 dark:ring-slate-700">
                    <option>Last 30 Days</option>
                    <option>Last 6 Months</option>
                </select>
             </div>
             <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                {/* RevenueChart would go here */}
                <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Analytics Engine Active</span>
             </div>
          </div>

          {/* Side: System Health Card */}
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
             <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                    <div className="flex items-center gap-2 text-indigo-400 mb-4">
                        <ShieldCheck size={20} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Security Protocol</span>
                    </div>
                    <h3 className="text-2xl font-black tracking-tighter leading-tight">All Ledger Nodes Synchronized.</h3>
                    <p className="text-slate-400 text-xs mt-4 leading-relaxed font-medium">
                        Encryption keys were rotated 4 hours ago. No unauthorized access attempts detected in the last 24-hour cycle.
                    </p>
                </div>

                <div className="space-y-3 mt-8">
                    <HealthBar label="Blockchain API" percentage="100%" color="bg-emerald-500" />
                    <HealthBar label="Database Cluster" percentage="98%" color="bg-blue-500" />
                    <HealthBar label="Auth Service" percentage="100%" color="bg-indigo-500" />
                </div>
             </div>
             <Activity className="absolute -right-8 -top-8 w-40 h-40 text-white/5 group-hover:rotate-12 transition-transform duration-700" />
          </div>
        </div>

        {/* Bottom Row: Recent Activity */}
        <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Global Security Log</h3>
                <button className="text-[10px] font-black text-blue-600 uppercase flex items-center gap-2 hover:underline">
                    View Full Audit <ExternalLink size={12} />
                </button>
            </div>
            
            <div className="space-y-4">
                <LogEntry user="Admin_01" action="System Login" time="2 mins ago" status="Success" />
                <LogEntry user="USR_9921" action="Land Transfer initiated" time="14 mins ago" status="Processing" />
                <LogEntry user="Officer_Kim" action="Title Verified: LR-8821" time="1 hour ago" status="Success" />
                <LogEntry user="System" action="Weekly Report Generated" time="3 hours ago" status="Completed" />
            </div>
        </div>

      </main>
    </div>
  );
};

/* --- Admin Specific Components --- */

const AdminStatItem = ({ label, value, growth, icon, isAlert }: any) => (
  <div className="bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 p-6 rounded-[2rem] hover:shadow-xl hover:shadow-indigo-500/5 transition-all">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl">
        {icon}
      </div>
      <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${
        isAlert ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
      }`}>
        {growth}
      </span>
    </div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
    <p className="text-2xl font-black text-slate-900 dark:text-white mt-1 tracking-tighter">{value}</p>
  </div>
);

const HealthBar = ({ label, percentage, color }: any) => (
  <div className="space-y-1">
    <div className="flex justify-between text-[9px] font-black uppercase tracking-tighter text-slate-400">
      <span>{label}</span>
      <span>{percentage}</span>
    </div>
    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
      <div className={`h-full ${color} transition-all duration-1000`} style={{ width: percentage }}></div>
    </div>
  </div>
);

const LogEntry = ({ user, action, time, status }: any) => (
    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition-all">
        <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black uppercase text-slate-600">
                {user.charAt(0)}
            </div>
            <div>
                <p className="text-xs font-black text-slate-900 dark:text-white">{action}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase">{user} • {time}</p>
            </div>
        </div>
        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 bg-white dark:bg-slate-800 px-3 py-1 rounded-lg border border-slate-100 dark:border-slate-700">
            {status}
        </span>
    </div>
);

export default AdminDashboard;