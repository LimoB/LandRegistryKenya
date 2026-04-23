import React, { useMemo } from "react";
import { useGetAuditLogsQuery } from "../features/audit/auditApi";
import { useAppSelector } from "../app/hooks";
import { 
  Activity, 
  Search, 
  Filter, 
  Calendar, 
  User as UserIcon, 
  Hash, 
  FileText,
  Clock,
  RefreshCw,
  ShieldAlert
} from "lucide-react";

/* ================= HELPERS ================= */
const getActionColor = (action: string) => {
  const a = action.toLowerCase();
  if (a.includes("create") || a.includes("register")) return "text-green-600 bg-green-50 border-green-100";
  if (a.includes("delete") || a.includes("reject")) return "text-red-600 bg-red-50 border-red-100";
  if (a.includes("update") || a.includes("transfer")) return "text-blue-600 bg-blue-50 border-blue-100";
  return "text-slate-600 bg-slate-50 border-slate-100";
};

const AuditLogs: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { data: auditResponse, isLoading, refetch } = useGetAuditLogsQuery();

  const logs = useMemo(() => auditResponse?.data || [], [auditResponse]);

  /* ================= ROLE-BASED FILTERING ================= */
  const filteredLogs = useMemo(() => {
    if (!user) return [];
    // Citizens only see logs they performed
    if (user.role === "citizen") {
      return logs.filter(log => log.performedBy === user.id);
    }
    // Admin and Officers see everything
    return logs;
  }, [logs, user]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center py-20">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 mt-3 font-medium">Retrieving audit trails...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-600 text-white rounded-xl">
            <Activity size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Audit Trail</h1>
            <p className="text-sm text-slate-500">
              Immutable history of all registry modifications
            </p>
          </div>
        </div>

        <button 
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all"
        >
          <RefreshCw size={16} /> Sync Logs
        </button>
      </div>

      {/* FILTER BAR (Admin/Officer Only) */}
      {user?.role !== "citizen" && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input type="text" placeholder="Action type..." className="w-full pl-9 pr-3 py-2 text-xs border rounded-xl bg-white outline-none focus:ring-2 focus:ring-indigo-500/10" />
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input type="date" className="w-full pl-9 pr-3 py-2 text-xs border rounded-xl bg-white outline-none" />
          </div>
          <div className="relative">
            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input type="text" placeholder="User ID..." className="w-full pl-9 pr-3 py-2 text-xs border rounded-xl bg-white outline-none" />
          </div>
          <button className="flex items-center justify-center gap-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all">
            <Filter size={14} /> Apply Filters
          </button>
        </div>
      )}

      {/* LOGS TIMELINE */}
      <div className="space-y-4">
        {filteredLogs.map((log) => (
          <div key={log.id} className="group relative flex gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:shadow-md transition-all">
            
            {/* ICON & LINE */}
            <div className="flex flex-col items-center">
              <div className={`p-2 rounded-full border ${getActionColor(log.actionType)}`}>
                <ShieldAlert size={16} />
              </div>
              <div className="w-px h-full bg-slate-100 dark:bg-slate-800 mt-2" />
            </div>

            {/* CONTENT */}
            <div className="flex-1 space-y-2">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${getActionColor(log.actionType)}`}>
                    {log.actionType}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock size={12} />
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded">
                  LOG-ID: {log.id.toString().padStart(5, '0')}
                </span>
              </div>

              <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                {log.description}
              </p>

              <div className="flex flex-wrap gap-4 pt-2 border-t border-slate-50 dark:border-slate-800">
                <div className="flex items-center gap-1.5">
                  <UserIcon size={12} className="text-slate-400" />
                  <span className="text-[11px] text-slate-500">Performed by: </span>
                  <span className="text-[11px] font-bold text-slate-900 dark:text-white">User #{log.performedBy}</span>
                </div>

                {log.landId && (
                  <div className="flex items-center gap-1.5">
                    <Hash size={12} className="text-slate-400" />
                    <span className="text-[11px] text-slate-500">Asset: </span>
                    <span className="text-[11px] font-bold text-indigo-600 underline cursor-pointer">Parcel #{log.landId}</span>
                  </div>
                )}
              </div>
            </div>

            {/* DETAILS BUTTON */}
            <button className="self-start p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
              <FileText size={18} />
            </button>
          </div>
        ))}

        {filteredLogs.length === 0 && !isLoading && (
          <div className="flex flex-col items-center py-20 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200">
            <Activity size={48} className="text-slate-200 mb-4" />
            <p className="text-sm text-slate-500 font-bold">No logs found in the audit trail</p>
            <p className="text-xs text-slate-400">Activity will appear here as transactions occur.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;