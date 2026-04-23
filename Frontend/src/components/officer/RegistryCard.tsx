import React from "react";
import { useNavigate } from "react-router-dom";
import { Map, User, Database, History, ChevronRight, MapPin } from "lucide-react";
import type { Land } from "../../features/lands/landApi";

interface RegistryCardProps {
  land: Land;
}

const RegistryCard: React.FC<RegistryCardProps> = ({ land }) => {
  const navigate = useNavigate();

  /**
   * IMPORTANT: The path must start with /officer because the route 
   * is nested inside the OfficerLayout in AppRoutes.tsx
   */
  const handleViewDetails = () => {
    navigate(`/officer/registry/view/${land.id}`);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[2.5rem] flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none transition-all group">
      
      {/* Visual & Land Identity */}
      <div className="flex items-start gap-6 flex-1">
        <div className="h-20 w-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:text-blue-600 transition-colors">
          <Map size={32} />
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h3 className="font-mono text-xl font-black dark:text-white tracking-tight uppercase italic">
              {land.lrNumber}
            </h3>
            <span className={`px-2 py-1 text-[9px] font-black uppercase rounded-lg ${
              land.verificationStatus === 'verified' 
                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' 
                : land.verificationStatus === 'pending'
                ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
            }`}>
              {land.verificationStatus}
            </span>
          </div>
          
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 font-bold uppercase mt-2">
            <span className="flex items-center gap-1.5">
              <MapPin size={12} /> {land.county}
            </span>
            <span className="flex items-center gap-1.5 font-mono text-[10px]">
              <Database size={12} className="text-blue-600" /> ID: {land.onChainId ?? "UNMINTED"}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-4">
             <div className="flex items-center gap-2 text-slate-900 dark:text-white font-black text-xs uppercase">
                <User size={14} className="text-blue-600" />
                {land.owner?.fullName ?? "System Reserved"}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section (Desktop Only) */}
      <div className="hidden xl:grid grid-cols-2 gap-8 px-8 border-x border-slate-100 dark:border-slate-800">
        <div>
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Area</p>
          <p className="text-sm font-black dark:text-white">{land.sizeInAcres} ACRES</p>
        </div>
        <div>
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Valuation</p>
          <p className="text-sm font-black text-emerald-600">
            {land.priceInKsh ? `KES ${Number(land.priceInKsh).toLocaleString()}` : "UNPRICED"}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
        <button 
          type="button"
          title="View Transaction History"
          className="p-4 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-blue-600 rounded-2xl transition-all"
        >
          <History size={20} />
        </button>
        
        <button 
          type="button"
          onClick={handleViewDetails} 
          className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-5 rounded-[1.5rem] flex items-center gap-3 font-black text-xs uppercase shadow-xl hover:shadow-blue-500/20 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 transition-all active:scale-95"
        >
          <span>View Details</span>
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default RegistryCard;