import React from "react";
import { useGetLandsQuery } from "../../features/lands/landApi";
import { 
  Search, 
  ExternalLink, 
  Database,
  Globe} from "lucide-react";

const GlobalRegistry: React.FC = () => {
  const { data: allLands, isLoading } = useGetLandsQuery();

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-700">
      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-600 p-6 rounded-[2rem] text-white shadow-xl shadow-blue-500/20">
            <Globe size={24} className="mb-4 opacity-50" />
            <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Total Registered Land</p>
            <p className="text-3xl font-black mt-1 tabular-nums">{allLands?.length || 0}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800">
            <Database size={24} className="mb-4 text-emerald-500" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">On-Chain Verified</p>
            <p className="text-3xl font-black mt-1 dark:text-white tabular-nums">
                {allLands?.filter(l => l.verificationStatus === 'verified').length || 0}
            </p>
        </div>
        {/* ... More quick stats can go here */}
      </div>

      {/* Registry Table */}
      <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-[2.5rem] p-8 space-y-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Master Land Ledger</h2>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter mt-1">Real-time synchronization with Kenya Land Registry</p>
            </div>
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Search by LR Number or County..." 
                    className="pl-12 pr-6 py-3 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl w-full md:w-80 text-sm focus:ring-2 ring-blue-500/20 outline-none transition-all dark:text-white"
                />
            </div>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-50 dark:border-slate-900">
                        <th className="py-4 px-4">LR Number</th>
                        <th className="py-4 px-4">Location</th>
                        <th className="py-4 px-4">Size</th>
                        <th className="py-4 px-4">Owner ID</th>
                        <th className="py-4 px-4">Status</th>
                        <th className="py-4 px-4 text-right">Ledger</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-900">
                    {isLoading ? (
                        <tr><td colSpan={6} className="py-20 text-center animate-pulse text-slate-400 font-black uppercase text-xs">Accessing Distributed Ledger...</td></tr>
                    ) : (
                        allLands?.map((land) => (
                            <tr key={land.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-all">
                                <td className="py-5 px-4">
                                    <span className="font-mono text-sm font-black text-blue-600 dark:text-blue-400">
                                        {land.lrNumber}
                                    </span>
                                </td>
                                <td className="py-5 px-4">
                                    <p className="text-xs font-black text-slate-800 dark:text-slate-200">{land.county}</p>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">{land.constituency}</p>
                                </td>
                                <td className="py-5 px-4 text-xs font-bold text-slate-600 dark:text-slate-400">
                                    {land.sizeInAcres} Acres
                                </td>
                                <td className="py-5 px-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-500">
                                            {land.ownerId}
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Verified Owner</span>
                                    </div>
                                </td>
                                <td className="py-5 px-4">
                                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${
                                        land.verificationStatus === 'verified' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' : 'bg-amber-500/10 border-amber-500/20 text-amber-600'
                                    }`}>
                                        <div className={`h-1 w-1 rounded-full ${land.verificationStatus === 'verified' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                        <span className="text-[8px] font-black uppercase">{land.verificationStatus}</span>
                                    </div>
                                </td>
                                <td className="py-5 px-4 text-right">
                                    <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                                        <ExternalLink size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default GlobalRegistry;