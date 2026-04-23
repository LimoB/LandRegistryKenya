import React from "react";
import { 
  ShieldAlert, 
  RefreshCw, 
  ArrowUpRight, 
  History, 
  LandPlot, 
  Clock,
  FileText,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Tools to fetch data from the server
import { useGetLandsQuery } from "../../features/lands/landApi";
import { useGetPendingTransfersQuery } from "../../features/transfers/transferApi";
import { useGetAuditLogsQuery } from "../../features/audit/auditApi";

// Sidebar Stats component
import DashboardStats from "../../components/officer/DashboardStats";

const OfficerDashboard: React.FC = () => {
  const navigate = useNavigate();

  // 1. Get data from all APIs
  const { 
    data: allLands, 
    isLoading: landsLoading, 
    refetch: refetchLands 
  } = useGetLandsQuery();

  const { 
    data: pendingTransfers, 
    isLoading: transfersLoading 
  } = useGetPendingTransfersQuery();

  const { 
    data: auditData, 
    isLoading: auditLoading 
  } = useGetAuditLogsQuery();

  // 2. Prepare data for the screen
  const pendingVerification = allLands?.filter(l => l.verificationStatus === 'pending') || [];
  const verifiedCount = allLands?.filter(l => l.verificationStatus === 'verified').length || 0;
  const dailyGoal = 20;
  const progressPercent = Math.min(Math.round((verifiedCount / dailyGoal) * 100), 100);

  // Check if anything is still loading
  const isLoading = landsLoading || transfersLoading || auditLoading;

  return (
    <div className="flex-1 min-h-screen bg-[#F8FAFC] dark:bg-slate-950">
      
      {/* --- HEADER --- */}
      <div className="px-8 py-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between max-w-[1400px] mx-auto">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-black uppercase text-amber-600 tracking-[0.2em] mb-2">
              <ShieldAlert size={16} /> Registry Control
            </div>
            <h1 className="text-4xl font-black tracking-tight dark:text-white uppercase">
              Officer <span className="text-amber-600">Dashboard</span>
            </h1>
          </div>
          
          <button 
            onClick={() => refetchLands()} 
            className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:text-amber-600 transition-colors"
          >
            <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
          </button>
        </header>
      </div>

      <main className="max-w-[1400px] mx-auto px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* --- LEFT SIDE: WORK QUEUES --- */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* 1. Land Transfers section */}
            <section className="space-y-4">
              <div className="flex justify-between items-end">
                <h2 className="text-xs font-black dark:text-white uppercase tracking-[0.3em] flex items-center gap-3">
                  <ArrowUpRight size={16} className="text-blue-500" /> Land Transfers
                </h2>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Requests for review</span>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
                {pendingTransfers?.length ? (
                  <div className="divide-y divide-slate-50 dark:divide-slate-800">
                    {pendingTransfers.slice(0, 4).map((transfer) => (
                      <div key={transfer.id} className="p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                            <FileText size={20} />
                          </div>
                          <div>
                            <p className="font-bold text-sm dark:text-white">LR: {transfer.land?.lrNumber}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Buyer: {transfer.buyer?.fullName}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => navigate(`/officer/transfers`)}
                          className="px-5 py-2 bg-slate-900 dark:bg-slate-700 text-white text-[10px] font-black uppercase rounded-xl hover:bg-blue-600 transition-all"
                        >
                          Review
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center text-slate-400 font-bold text-[10px] uppercase">
                    <CheckCircle2 size={32} className="mx-auto mb-2 opacity-20 text-emerald-500" />
                    No transfers to process
                  </div>
                )}
              </div>
            </section>

            {/* 2. Verification section */}
            <section className="space-y-4">
              <h2 className="text-xs font-black dark:text-white uppercase tracking-[0.3em] flex items-center gap-3">
                <LandPlot size={16} className="text-amber-500" /> New Land Records
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingVerification.length > 0 ? (
                  pendingVerification.slice(0, 2).map((land) => (
                    <div key={land.id} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 flex flex-col justify-between gap-6 shadow-sm">
                      <div>
                        <p className="text-xs font-black text-amber-600 uppercase mb-1 tracking-widest">{land.landType}</p>
                        <h3 className="text-xl font-black dark:text-white">LR: {land.lrNumber}</h3>
                        <p className="text-xs text-slate-500 font-bold uppercase mt-1">{land.county} County</p>
                      </div>
                      
                      {/* Navigates to verify-lands to match your existing routes */}
                      <button 
                        onClick={() => navigate('/officer/verify-lands')}
                        className="w-full py-3 bg-amber-50 dark:bg-amber-900/10 text-amber-600 text-[10px] font-black uppercase rounded-xl border border-amber-100 dark:border-amber-900/30 hover:bg-amber-600 hover:text-white transition-all"
                      >
                        Start Verification
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 py-12 bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-dashed border-slate-100 dark:border-slate-800 text-center text-slate-400 font-bold text-[10px] uppercase">
                    Queue clear: All records verified
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* --- RIGHT SIDE: STATS & ACTIVITY --- */}
          <div className="lg:col-span-4 space-y-10">
            
            <DashboardStats 
              verifiedCount={verifiedCount} 
              dailyTarget={dailyGoal} 
              progressPercent={progressPercent} 
            />

            {/* Activity Feed */}
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                  <History size={14} /> System Activity
                </h3>
                <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
              </div>
              
              <div className="space-y-8">
                {auditData?.data && auditData.data.length > 0 ? (
                  auditData.data.slice(0, 5).map((log) => (
                    <div key={log.id} className="relative pl-6 border-l border-slate-800 pb-2">
                      <div className="absolute -left-[5px] top-0 h-2 w-2 rounded-full bg-slate-700" />
                      <p className="text-[11px] font-bold leading-tight uppercase tracking-tight">
                        {log.actionType.replace(/_/g, ' ')}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock size={10} className="text-slate-500" />
                        <p className="text-[9px] text-slate-500 font-black">
                          {new Date(log.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <AlertCircle size={20} className="mx-auto mb-2 opacity-20" />
                    <p className="text-[10px] font-black text-slate-600 uppercase">No recent activity</p>
                  </div>
                )}
              </div>

              <button 
                onClick={() => navigate('/admin/audit-logs')}
                className="w-full mt-8 py-3 text-[9px] font-black uppercase text-slate-400 border border-slate-800 rounded-xl hover:bg-slate-800 hover:text-white transition-all"
              >
                View Full Logs
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default OfficerDashboard;