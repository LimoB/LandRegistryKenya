import React, { useState } from "react";
import { useGetLandsQuery, useVerifyLandMutation } from "../../features/lands/landApi";
import { 
  ShieldAlert, 
  Edit3, 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  Search, 
  Filter,
  Layers,
  MoreHorizontal
} from "lucide-react";

const LandsManagement: React.FC = () => {
  const { data: lands, isLoading } = useGetLandsQuery();
  const [updateStatus] = useVerifyLandMutation();
  const [searchTerm, setSearchTerm] = useState("");

  const handleFlag = async (id: number) => {
    if (window.confirm("Flag this land for investigation? This will temporarily suspend transfers.")) {
      try {
        await updateStatus({ id, payload: { status: "rejected" } }).unwrap();
      } catch (err) {
        console.error("Failed to flag asset:", err);
      }
    }
  };

  const filteredLands = lands?.filter(l => 
    l.lrNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.county.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Control Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 dark:border-slate-900 pb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Layers className="text-blue-600" /> Asset Management
          </h1>
          <p className="text-sm text-slate-500 font-bold uppercase tracking-tighter mt-1">
            Administrative overrides and data integrity controls
          </p>
        </div>
        
        <div className="flex items-center gap-3">
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                <input 
                    type="text" 
                    placeholder="Search LR/ID..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 pr-6 py-3 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-xs font-bold outline-none ring-blue-500/10 focus:ring-4 transition-all w-64"
                />
            </div>
            <button className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-slate-400 hover:text-blue-600 transition-all">
                <Filter size={20} />
            </button>
        </div>
      </div>

      {/* Management Grid */}
      <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-[2.5rem] overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-slate-900/50 text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 border-b border-slate-100 dark:border-slate-900">
              <th className="px-8 py-5">Land Reference</th>
              <th className="px-8 py-5">Value/Size</th>
              <th className="px-8 py-5">Owner Cluster</th>
              <th className="px-8 py-5">Ledger Status</th>
              <th className="px-8 py-5 text-right">Emergency Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
            {isLoading ? (
              <tr><td colSpan={5} className="py-20 text-center text-xs font-black text-slate-400 uppercase animate-pulse">Scanning Registry...</td></tr>
            ) : (
              filteredLands?.map((land) => (
                <tr key={land.id} className="group hover:bg-slate-50/30 dark:hover:bg-slate-900/30 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${
                        land.landType === 'commercial' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'
                      } dark:bg-slate-900`}>
                        {land.landType.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 dark:text-white">{land.lrNumber}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{land.county}</p>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-8 py-6">
                    <p className="text-xs font-black text-slate-700 dark:text-slate-300">{land.sizeInAcres} Acres</p>
                    <p className="text-[10px] text-emerald-600 font-mono font-bold uppercase">
                        {land.priceInKsh ? `KES ${land.priceInKsh.toLocaleString()}` : "Not Listed"}
                    </p>
                  </td>

                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Public Key</span>
                        <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-100 dark:border-slate-800">
                           USR_{land.ownerId.toString().padStart(4, '0')}
                        </span>
                    </div>
                  </td>

                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                        {land.verificationStatus === 'verified' ? (
                            <CheckCircle size={14} className="text-emerald-500" />
                        ) : (
                            <AlertTriangle size={14} className="text-amber-500" />
                        )}
                        <span className={`text-[10px] font-black uppercase tracking-widest ${
                            land.verificationStatus === 'verified' ? 'text-emerald-600' : 'text-amber-600'
                        }`}>
                            {land.verificationStatus}
                        </span>
                    </div>
                  </td>

                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                            title="Edit Record"
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all"
                        >
                            <Edit3 size={16} />
                        </button>
                        <button 
                            onClick={() => handleFlag(land.id)}
                            title="Flag/Suspend Asset"
                            className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-lg transition-all"
                        >
                            <ShieldAlert size={16} />
                        </button>
                        <button 
                            title="Purge (Admin Only)"
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all"
                        >
                            <Trash2 size={16} />
                        </button>
                        <div className="h-4 w-[1px] bg-slate-100 dark:bg-slate-800 mx-1" />
                        <button className="p-2 text-slate-300 hover:text-slate-600">
                            <MoreHorizontal size={16} />
                        </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Alert Footer */}
      <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-2xl flex items-center gap-4">
        <AlertTriangle className="text-amber-600 shrink-0" size={20} />
        <p className="text-[10px] font-bold text-amber-700 uppercase tracking-tight">
            <span className="font-black">Caution:</span> Any modifications to land assets here will be logged in the permanent audit trail. Flagging a property will disable the "Initiate Transfer" action for the current owner immediately.
        </p>
      </div>
    </div>
  );
};

export default LandsManagement;