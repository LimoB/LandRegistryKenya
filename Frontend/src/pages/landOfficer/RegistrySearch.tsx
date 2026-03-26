import React, { useState, useMemo } from "react";
import { 
  useGetLandsQuery 
} from "../../features/lands/landApi";
import { 
  Search, 
  Map, 
  User, 
  ShieldCheck, 
  Database, 
  ChevronRight,
  History
} from "lucide-react";

const RegistrySearch: React.FC = () => {
  const { data: allLands, isLoading } = useGetLandsQuery();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "verified" | "pending">("all");

  // Optimized Search Logic
  const filteredResults = useMemo(() => {
    if (!allLands) return [];
    
    return allLands.filter((land) => {
      const matchesSearch = 
        land.lrNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (land as any).owner?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (land as any).owner?.walletAddress?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterType === "all" || land.verificationStatus === filterType;
      
      return matchesSearch && matchesFilter;
    });
  }, [allLands, searchTerm, filterType]);

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
      
      {/* 1. Enhanced Search Header */}
      <div className="bg-slate-900 dark:bg-white rounded-[3rem] p-10 text-white dark:text-slate-900 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Search size={20} className="text-white" />
            </div>
            <h1 className="text-3xl font-black tracking-tighter uppercase italic">National Registry Search</h1>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text"
                placeholder="Search by LR Number, Owner Name, or Wallet Address (0x...)"
                className="w-full bg-white/10 dark:bg-slate-100 border border-white/20 dark:border-slate-200 rounded-2xl py-5 pl-12 pr-4 text-sm font-medium outline-none focus:ring-4 ring-blue-500/30 transition-all placeholder:text-slate-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select 
              className="bg-white/10 dark:bg-slate-100 border border-white/20 dark:border-slate-200 rounded-2xl px-6 py-5 text-xs font-black uppercase tracking-widest outline-none cursor-pointer"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
            >
              <option value="all">All Records</option>
              <option value="verified">Verified Only</option>
              <option value="pending">Pending Review</option>
            </select>
          </div>
        </div>
        {/* Decorative background element */}
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
      </div>

      {/* 2. Results Grid */}
      <div className="grid grid-cols-1 gap-4">
        <div className="flex items-center justify-between px-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            Showing {filteredResults.length} Secure Entries
          </p>
        </div>

        {isLoading ? (
          <div className="py-20 text-center space-y-4">
             <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
             <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Accessing Distributed Data...</p>
          </div>
        ) : filteredResults.length > 0 ? (
          filteredResults.map((land) => (
            <div key={land.id} className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 hover:shadow-xl hover:border-blue-500/30 transition-all group">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                
                {/* Land Identity */}
                <div className="flex items-center gap-6 flex-1">
                  <div className="h-16 w-16 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <Map size={28} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black dark:text-white tracking-tight italic uppercase">{land.lrNumber}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter flex items-center gap-1">
                        <Database size={12} /> On-Chain ID: {land.onChainId || "N/A"}
                      </span>
                      <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase ${
                        land.verificationStatus === 'verified' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                      }`}>
                        {land.verificationStatus}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Owner Info */}
                <div className="flex flex-col lg:items-end flex-1">
                    <div className="flex items-center gap-2 text-slate-900 dark:text-white font-black text-sm">
                        <User size={14} className="text-blue-600" />
                        {(land as any).owner?.fullName}
                    </div>
                    <p className="text-[10px] font-mono text-slate-400 mt-1 truncate w-48 text-right">
                        {(land as any).owner?.walletAddress}
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-8 px-8 border-x border-slate-100 dark:border-slate-900 hidden xl:grid">
                    <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase">Size (Acres)</p>
                        <p className="text-sm font-black dark:text-white">{land.sizeInAcres}</p>
                    </div>
                    <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase">Valuation</p>
                        <p className="text-sm font-black text-emerald-600">
                          {land.priceInKsh ? `KES ${land.priceInKsh.toLocaleString()}` : "Not for Sale"}
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <button className="p-4 bg-slate-50 dark:bg-slate-900 text-slate-400 hover:text-blue-600 rounded-2xl transition-all">
                        <History size={18} />
                    </button>
                    <button className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-blue-600 hover:text-white transition-all shadow-lg">
                        View Full Details
                        <ChevronRight size={14} />
                    </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-32 text-center bg-slate-50 dark:bg-slate-900/20 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
            <ShieldCheck size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 font-black uppercase text-xs tracking-widest">No matching records found in the National Registry</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegistrySearch;