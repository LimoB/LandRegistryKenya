import React from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../app/hooks";
import { useGetLandsQuery } from "../../features/lands/landApi";
import { 
  PlusCircle, 
  Map as MapIcon, 
  Clock, 
  BadgeCheck, 
  // TrendingUp, 
  ChevronRight,
  ShieldCheck,
  Search,
  Wallet
} from "lucide-react";

const CitizenDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  
  // Real API Data
  const { data: allLands, isLoading } = useGetLandsQuery();
  
  // Logic: Filter user's specific lands
  const myLands = allLands?.filter(land => land.ownerId === user?.id) || [];
  const verifiedCount = myLands.filter(l => l.verificationStatus === 'verified').length;
  const pendingCount = myLands.filter(l => l.verificationStatus === 'pending').length;

  return (
    <div className="flex-1 min-h-screen bg-white dark:bg-slate-950 transition-colors duration-200">
      
      {/* 1. Integrated Header */}
      <div className="px-8 py-8 border-b border-slate-100 dark:border-slate-900">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between max-w-[1400px] mx-auto">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-500">
              <ShieldCheck size={14} strokeWidth={3} />
              Operational Node: Active
            </div>
            <h1 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white">
              Welcome back, <span className="text-blue-600">{user?.fullName?.split(' ')[0]}</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="relative hidden lg:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input 
                  type="text" 
                  placeholder="Search your titles..." 
                  className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:ring-2 ring-blue-500/20 w-64 text-slate-700 dark:text-slate-300 outline-none transition-all"
                />
             </div>
             <button 
                onClick={() => navigate("/citizen/register-land")}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 px-6 py-3 rounded-xl transition-all font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95"
             >
                <PlusCircle size={18} />
                Register Asset
             </button>
          </div>
        </header>
      </div>

      {/* 2. Main Content */}
      <main className="max-w-[1400px] mx-auto px-8 py-10 space-y-12">
        
        {/* Stats Section: Using Real Counts */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <StatItem 
            label="Total Assets" 
            value={isLoading ? "--" : myLands.length.toString().padStart(2, '0')} 
            sub={`${verifiedCount} Fully Verified`} 
            icon={<MapIcon size={22} className="text-blue-600" />} 
          />
          <StatItem 
            label="Pending Review" 
            value={isLoading ? "--" : pendingCount.toString().padStart(2, '0')} 
            sub="Processing on Ledger" 
            icon={<Clock size={22} className="text-amber-500" />} 
            badge={pendingCount > 0 ? "Action" : undefined}
          />
          <StatItem 
            label="Wallet Identity" 
            value={user?.walletAddress ? `${user.walletAddress.slice(0, 4)}...${user.walletAddress.slice(-4)}` : "None"} 
            sub="Encrypted Signature" 
            icon={<Wallet size={22} className="text-emerald-600" />} 
          />
        </section>

        {/* 3. Recent Property Table */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Active Portfolio</h2>
              <p className="text-[11px] text-slate-500 font-bold mt-1 uppercase tracking-tighter">Blockchain-backed land registry entries</p>
            </div>
            <div className="flex items-center gap-2 text-blue-500 font-black text-[10px] uppercase tracking-[0.2em] bg-blue-500/5 px-4 py-2 rounded-xl border border-blue-500/10">
              <BadgeCheck size={14} />
              Synced with Mainnet
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-y-3">
              <thead>
                <tr className="text-slate-400 text-[10px] uppercase tracking-[0.2em] font-black">
                  <th className="px-6 py-2">Property Identifier</th>
                  <th className="px-6 py-2">Location</th>
                  <th className="px-6 py-2">Size (Acres)</th>
                  <th className="px-6 py-2">Ledger Status</th>
                  <th className="px-6 py-2 text-right">Review</th>
                </tr>
              </thead>
              <tbody className="divide-y-0">
                {isLoading ? (
                    <tr><td colSpan={5} className="text-center py-20 text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Fetching records...</td></tr>
                ) : myLands.length > 0 ? (
                    myLands.slice(0, 5).map((land) => (
                        <LandRow 
                          key={land.id}
                          lrNumber={land.lrNumber} 
                          location={`${land.county}, ${land.constituency}`} 
                          size={land.sizeInAcres} 
                          status={land.verificationStatus} 
                        />
                    ))
                ) : (
                    <tr><td colSpan={5} className="text-center py-20 text-slate-400 font-bold text-sm italic">No records found on the ledger.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

/* --- Sub-Components --- */

const StatItem = ({ label, value, sub, icon, badge }: any) => (
  <div className="flex items-center gap-6 p-6 bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-900 rounded-3xl group hover:border-blue-500/30 transition-all">
    <div className="w-14 h-14 flex items-center justify-center bg-white dark:bg-slate-900 rounded-2xl group-hover:scale-110 transition-transform shadow-sm">
      {icon}
    </div>
    <div>
      <div className="flex items-center gap-2">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        {badge && <span className="text-[8px] px-2 py-0.5 bg-amber-500 text-white rounded-full font-black uppercase">Active</span>}
      </div>
      <p className="text-2xl font-black text-slate-900 dark:text-white leading-none mt-1 tracking-tighter">{value}</p>
      <p className="text-[11px] font-bold text-slate-500 mt-2 uppercase tracking-tight">{sub}</p>
    </div>
  </div>
);

const LandRow = ({ lrNumber, location, size, status }: any) => {
    const isVerified = status === 'verified';
    return (
        <tr className="group bg-white dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all cursor-pointer">
            <td className="px-6 py-5 first:rounded-l-2xl border-y border-l border-transparent dark:group-hover:border-slate-800">
                <span className="font-mono text-sm font-black text-slate-900 dark:text-white">
                    {lrNumber}
                </span>
            </td>
            <td className="px-6 py-5 border-y border-transparent dark:group-hover:border-slate-800">
                <p className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-tight">{location.split(',')[0]}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{location.split(',')[1]}</p>
            </td>
            <td className="px-6 py-5 border-y border-transparent dark:group-hover:border-slate-800">
                <p className="text-sm font-black text-slate-600 dark:text-slate-400">{size}</p>
            </td>
            <td className="px-6 py-5 border-y border-transparent dark:group-hover:border-slate-800">
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border ${
                    isVerified ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' : 'bg-amber-500/10 border-amber-500/20 text-amber-600'
                }`}>
                    <div className={`h-1.5 w-1.5 rounded-full ${isVerified ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                    <span className="text-[10px] font-black uppercase tracking-widest">{status}</span>
                </div>
            </td>
            <td className="px-6 py-5 text-right last:rounded-r-2xl border-y border-r border-transparent dark:group-hover:border-slate-800">
                <div className="inline-flex p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-all">
                    <ChevronRight size={16} />
                </div>
            </td>
        </tr>
    );
};

export default CitizenDashboard;