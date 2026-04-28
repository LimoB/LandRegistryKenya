import React, { useState, useMemo } from "react";
import { 
  ShieldAlert, Terminal, Search, RefreshCcw, 
  ChevronRight, Lock, User, Database, Loader2} from "lucide-react";
// Ensure this matches the relative path to your auditApi file
import { useGetAuditLogsQuery, type AuditLog } from "../../features/audit/auditApi";

const AuditLogs: React.FC = () => {
  // Accessing 'data' which contains the AuditResponse object { success, count, data: AuditLog[] }
  const { data: response, isLoading, refetch, isFetching } = useGetAuditLogsQuery();
  const [searchTerm, setSearchTerm] = useState("");

  // Extracted logs array from the response object
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const logs = response?.data || [];

  /* ================= SEARCH LOGIC ================= */
  const filteredLogs = useMemo(() => {
    if (!logs) return [];
    return logs.filter((log: AuditLog) => {
      const searchStr = searchTerm.toLowerCase();
      // Updated to match your AuditLog interface: actionType and description
      return (
        log.actionType.toLowerCase().includes(searchStr) ||
        (log.description || "").toLowerCase().includes(searchStr) ||
        // If your actor data is nested in the response, check availability
        log.performedBy.toString().includes(searchStr)
      );
    });
  }, [logs, searchTerm]);

  /* ================= DYNAMIC BADGE STYLING ================= */
  const getActionStyle = (action: string) => {
    const act = action.toUpperCase();
    if (act.includes("SECURITY") || act.includes("REJECT") || act.includes("FAILED") || act.includes("DELETE")) 
        return "bg-red-500/10 text-red-500 border-red-500/20";
    if (act.includes("LAND") || act.includes("MINT") || act.includes("TRANSFER") || act.includes("APPROVED") || act.includes("CREATE")) 
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    if (act.includes("USER") || act.includes("PROMOTED") || act.includes("ROLE") || act.includes("LOGIN")) 
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    return "bg-slate-500/10 text-slate-500 border-slate-500/20";
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
      
      {/* 1. Header Card */}
      <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <ShieldAlert size={20} />
              </div>
              <h1 className="text-2xl font-black tracking-tight uppercase italic">Security Audit Engine</h1>
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
              Kenya Land Information System • Immutable Trace
            </p>
          </div>
          
          <div className="flex items-center gap-4 bg-slate-800/40 p-5 rounded-3xl border border-slate-700/50 backdrop-blur-md">
            <div className="text-right">
              <p className="text-[9px] font-black text-slate-500 uppercase">Node Status</p>
              <p className="text-xs font-black text-emerald-400 uppercase tracking-tighter">Synchronized</p>
            </div>
            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
              <Lock size={18} />
            </div>
          </div>
        </div>
        <Terminal className="absolute -right-10 -bottom-10 w-64 h-64 text-slate-800 opacity-30 rotate-12" />
      </div>

      {/* 2. Controls */}
      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search by Action, Description, or User ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-5 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-[1.5rem] text-xs font-bold outline-none focus:ring-4 ring-blue-500/5 transition-all dark:text-white uppercase tracking-tighter"
          />
        </div>
        <button 
          onClick={() => refetch()}
          disabled={isFetching}
          className="p-5 bg-blue-600 text-white rounded-2xl shadow-xl hover:rotate-180 transition-all duration-500 active:scale-90 disabled:opacity-50"
        >
          <RefreshCcw size={20} className={isFetching ? "animate-spin" : ""} />
        </button>
      </div>

      {/* 3. Real-Time Log Feed */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="py-24 text-center flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-blue-600" size={32} />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Fetching Ledger Metadata...</p>
          </div>
        ) : filteredLogs.length > 0 ? (
          filteredLogs.map((log: AuditLog) => (
            <div 
              key={log.id} 
              className="group bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 p-2 rounded-2xl flex flex-col md:flex-row md:items-center gap-4 hover:border-blue-500/40 transition-all"
            >
              {/* Block Timestamp */}
              <div className="md:w-44 px-4 py-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl text-center md:text-left">
                <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Entry Time</p>
                <p className="font-mono text-[10px] font-bold text-slate-700 dark:text-slate-300">
                  {new Date(log.createdAt).toLocaleDateString()}
                  <span className="text-blue-500 mx-1">/</span>
                  {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              {/* Action Category Badge */}
              <div className="md:w-44 px-2">
                <span className={`inline-block w-full text-center py-2.5 px-3 rounded-lg border text-[9px] font-black uppercase tracking-[0.1em] ${getActionStyle(log.actionType)}`}>
                  {log.actionType.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Details & Metadata */}
              <div className="flex-1 px-4 py-2">
                <div className="flex items-center gap-2 mb-1">
                  <User size={12} className="text-blue-600" />
                  <span className="text-xs font-black text-slate-900 dark:text-white">
                    User ID: {log.performedBy}
                  </span>
                  <ChevronRight size={10} className="text-slate-300" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                    {log.description || "No description provided"}
                  </span>
                </div>
                
                <div className="flex items-center gap-3">
                   <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-100 dark:border-slate-800">
                      <Database size={10} className="text-slate-400" />
                      <span className="text-[8px] font-mono font-bold text-slate-500 uppercase tracking-widest">
                        Land ID: {log.landId || "SYSTEM"}
                      </span>
                   </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="px-4">
                <button className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-slate-300 group-hover:text-blue-500 transition-all">
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="py-24 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2rem]">
             <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest italic">Zero matching log entries found.</p>
          </div>
        )}
      </div>

      {/* 4. Footer Pagination/Sync */}
      <div className="flex items-center justify-between text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] pt-4 px-6">
        <p>Total Records: {response?.count || 0}</p>
        <div className="flex items-center gap-2">
           <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
           <span className="text-emerald-500 italic">Blockchain Verified Stream</span>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;