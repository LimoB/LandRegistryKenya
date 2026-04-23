import React, { useState, useMemo } from "react";
import type { ChangeEvent } from "react";
import { useGetLandsQuery } from "../../features/lands/landApi";
import { Search, ShieldCheck, Loader2 } from "lucide-react";
import RegistryCard from "../../components/officer/RegistryCard";

const RegistrySearch: React.FC = () => {
  const { data: allLands, isLoading } = useGetLandsQuery();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "verified" | "pending">("all");

  // Filtering Logic
  const filteredResults = useMemo(() => {
    if (!allLands) return [];

    return allLands.filter((land) => {
      const search = searchTerm.toLowerCase();
      
      const matchesSearch = 
        land.lrNumber.toLowerCase().includes(search) ||
        (land.owner?.fullName?.toLowerCase().includes(search) ?? false) ||
        (land.owner?.walletAddress?.toLowerCase().includes(search) ?? false);
      
      const matchesFilter = filterType === "all" || land.verificationStatus === filterType;
      
      return matchesSearch && matchesFilter;
    });
  }, [allLands, searchTerm, filterType]);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value);
  
  const handleFilterChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setFilterType(e.target.value as "all" | "verified" | "pending");
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 md:space-y-8 p-4 md:p-6 animate-in fade-in zoom-in-95 duration-500">
      
      {/* 1. Search Header Container */}
      <div className="bg-slate-900 dark:bg-slate-950 rounded-[2.5rem] p-6 md:p-12 text-white shadow-2xl relative overflow-hidden border border-white/5">
        <div className="relative z-10 space-y-6 md:space-y-8">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-4xl font-black tracking-tighter uppercase italic flex items-center gap-3 md:gap-4">
              <span className="bg-blue-600 p-2 md:p-3 rounded-2xl shadow-lg shadow-blue-500/40">
                <Search size={24} className="text-white" />
              </span>
              National Registry
            </h1>
            <p className="text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-[0.3em]">
              Real-Time Blockchain Verification Node
            </p>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-1 group">
              <Search 
                className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" 
                size={20} 
              />
              <input 
                type="text"
                placeholder="Search by LR, Owner, or Wallet (0x...)"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 md:py-5 pl-14 pr-4 text-sm font-medium outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-500"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            
            {/* Filter Dropdown */}
            <select 
              className="bg-white/5 border border-white/10 rounded-2xl px-8 py-4 md:py-5 text-[11px] font-black uppercase tracking-widest outline-none cursor-pointer focus:border-blue-500 transition-all appearance-none"
              value={filterType}
              onChange={handleFilterChange}
            >
              <option value="all" className="bg-slate-900">All Records</option>
              <option value="verified" className="bg-slate-900">Verified Only</option>
              <option value="pending" className="bg-slate-900">Pending Review</option>
            </select>
          </div>
        </div>

        {/* Abstract Background Decoration */}
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px]" />
        <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-emerald-600/5 rounded-full blur-[80px]" />
      </div>

      {/* 2. Stats Summary Line */}
      <div className="flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            Found {filteredResults.length} Assets
          </p>
        </div>
        <div className="hidden md:block">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            Ministry of Lands • Ledger 2.4.0
          </p>
        </div>
      </div>

      {/* 3. Results Section */}
      <div className="space-y-4 md:space-y-6">
        {isLoading ? (
          <div className="py-32 text-center space-y-6 bg-white dark:bg-slate-900/50 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
             <div className="relative inline-block">
                <Loader2 className="animate-spin text-blue-600" size={48} />
                <div className="absolute inset-0 blur-xl bg-blue-500/20 animate-pulse" />
             </div>
             <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em]">
               Decrypting Distributed Ledger Data...
             </p>
          </div>
        ) : filteredResults.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {filteredResults.map((land) => (
              <RegistryCard key={land.id} land={land} />
            ))}
          </div>
        ) : (
          <div className="py-32 text-center bg-slate-50 dark:bg-slate-900/20 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
            <ShieldCheck size={56} className="mx-auto text-slate-200 dark:text-slate-700 mb-6" />
            <h3 className="text-slate-900 dark:text-white font-black uppercase text-sm tracking-widest">No Matches Found</h3>
            <p className="text-slate-400 font-medium text-xs mt-2">
              Try adjusting your search terms or filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegistrySearch;