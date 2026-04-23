import React, { useState } from "react";
import { 
  ShieldAlert, FileCheck, CheckCircle2, 
  ExternalLink, Loader2, AlertCircle, RefreshCw,
  Clock, MapPin
} from "lucide-react";
import { useDispatch } from "react-redux";

// API & Redux
import { useGetLandsQuery, useVerifyLandMutation, type Land } from "../../features/lands/landApi";
import { setSelectedLand } from "../../features/lands/landSlice";

/* ============================================================
   TYPES & HELPERS
============================================================ */
interface RTKError {
  status?: number;
  data?: {
    error?: string;
    message?: string;
  };
}

const OfficerDashboard: React.FC = () => {
  const dispatch = useDispatch();
  
  // Track which specific land ID is currently being processed
  const [processingId, setProcessingId] = useState<number | null>(null);

  // RTK Query hooks
  const { 
    data: allLands, 
    isLoading, 
    isError, 
    refetch 
  } = useGetLandsQuery();
  
  const [verifyLand] = useVerifyLandMutation();

  /* ============================================================
     STATS LOGIC
  ============================================================ */
  const pendingLands = allLands?.filter(land => land.verificationStatus === 'pending') || [];
  const verifiedCount = allLands?.filter(l => l.verificationStatus === 'verified').length || 0;
  const dailyTarget = 20;
  const progressPercent = Math.min(Math.round((verifiedCount / dailyTarget) * 100), 100);

  /* ============================================================
     ACTION HANDLER
  ============================================================ */
  const handleApproveAndMint = async (land: Land) => {
    // Prevent double-clicking
    if (processingId !== null) return;

    setProcessingId(land.id);
    console.log(`[OFFICER-ACTION] Initiating Minting for LR: ${land.lrNumber}`);
    
    try {
      dispatch(setSelectedLand(land));

      // Trigger the mutation (Calls /lands/verify/:id on the backend)
      const response = await verifyLand(land.id).unwrap();
      
      console.log("[OFFICER-SUCCESS] Blockchain Response:", response);
      // You can replace this alert with a Toast notification later
      alert(`SUCCESS!\nLR: ${land.lrNumber}\nStatus: Verified on Blockchain`);
      
    } catch (err) {
      const error = err as RTKError;
      console.error("[OFFICER-ERROR] Verification failed:", error);
      
      let friendlyMessage = "Transaction failed. Please check Ganache/RPC connection.";
      
      if (error.data?.error?.includes("registerInitialLand")) {
        friendlyMessage = "Contract Mismatch: The backend function name doesn't match the Smart Contract.";
      } else if (error.status === 500) {
        friendlyMessage = "Blockchain Node Error: Is Ganache running on port 7545?";
      }

      alert(`Verification Error: ${error.data?.error || friendlyMessage}`);
    } finally {
      setProcessingId(null);
      dispatch(setSelectedLand(null));
    }
  };

  /* ============================================================
     ERROR STATE
  ============================================================ */
  if (isError) return (
    <div className="p-20 text-center flex flex-col items-center gap-6 text-red-500">
      <AlertCircle size={48} className="animate-pulse" />
      <div className="space-y-2">
        <h2 className="font-black uppercase tracking-widest text-lg">System Sync Error</h2>
        <p className="text-slate-500 text-sm max-w-md mx-auto font-medium">
          The registry cannot connect to the database or blockchain node. 
          Please ensure your backend and Ganache are running.
        </p>
      </div>
      <button 
        onClick={() => refetch()} 
        className="mt-4 flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase hover:bg-slate-800 transition-colors"
      >
        <RefreshCw size={14} /> Reconnect Ledger
      </button>
    </div>
  );

  return (
    <div className="flex-1 min-h-screen bg-[#F8FAFC] dark:bg-slate-950">
      
      {/* Header Section */}
      <div className="px-8 py-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between max-w-[1400px] mx-auto">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase text-amber-600 tracking-[0.2em]">
              <ShieldAlert size={16} /> Government Officer Node
            </div>
            <h1 className="text-4xl font-black tracking-tight dark:text-white uppercase">
              Registry <span className="text-amber-600">Verification</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end mr-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Network Status</span>
              <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                <span className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" /> Local Ganache Active
              </span>
            </div>
            <button 
              onClick={() => refetch()} 
              className="p-4 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl hover:text-amber-500 transition-all border border-slate-200 dark:border-slate-700"
              title="Refresh Data"
            >
              <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
            </button>
          </div>
        </header>
      </div>

      {/* Main Grid Content */}
      <main className="max-w-[1400px] mx-auto px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Verification Queue */}
          <div className="lg:col-span-8 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black dark:text-white uppercase tracking-[0.3em] flex items-center gap-3">
                Incoming Requests <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-800 rounded-md text-[10px]">{pendingLands.length}</span>
              </h2>
            </div>

            <div className="space-y-4">
              {isLoading ? (
                <div className="py-32 text-center flex flex-col items-center gap-6">
                    <Loader2 className="animate-spin text-amber-500" size={40} />
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Syncing with Distributed Ledger...</p>
                </div>
              ) : pendingLands.length === 0 ? (
                <div className="py-32 text-center border-4 border-dashed border-slate-100 dark:border-slate-900 rounded-[3rem] bg-white/50 dark:bg-transparent">
                  <CheckCircle2 size={56} className="mx-auto text-emerald-500/20 mb-6" />
                  <p className="text-slate-400 font-black text-sm uppercase tracking-widest">Queue Clear: All Lands Verified</p>
                </div>
              ) : (
                pendingLands.map((land) => {
                  const isThisLandProcessing = processingId === land.id;
                  
                  return (
                    <div 
                      key={land.id} 
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[2.5rem] flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none transition-all group"
                    >
                      <div className="flex items-start gap-6">
                        <div className="h-20 w-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-slate-400 group-hover:bg-amber-50 dark:group-hover:bg-amber-900/20 group-hover:text-amber-600 transition-colors">
                          <FileCheck size={32} />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                             <h3 className="font-mono text-xl font-black dark:text-white tracking-tight">{land.lrNumber}</h3>
                             <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[9px] font-black uppercase rounded-lg">Pending Mint</span>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 font-bold uppercase mt-2">
                            <span className="flex items-center gap-1.5"><MapPin size={12} className="text-slate-400" /> {land.county}</span>
                            <span className="flex items-center gap-1.5"><Clock size={12} className="text-slate-400" /> {new Date(land.createdAt).toLocaleDateString()}</span>
                            <span className="text-slate-300">|</span>
                            <span className="text-amber-600/80">{land.landType}</span>
                          </div>

                          <a 
                            href={`https://ipfs.io/ipfs/${land.ipfsDocHash}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 text-[10px] text-blue-600 dark:text-blue-400 font-black mt-4 uppercase hover:underline decoration-2 underline-offset-4"
                          >
                            <ExternalLink size={14} /> Open Digital Deed (IPFS)
                          </a>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                        <button 
                          disabled={isThisLandProcessing}
                          className="px-6 py-4 text-xs font-black uppercase text-slate-400 hover:text-red-500 transition-colors disabled:opacity-30"
                        >
                          Reject
                        </button>
                        <button 
                          disabled={processingId !== null} 
                          onClick={() => handleApproveAndMint(land)}
                          className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-5 rounded-[1.5rem] flex items-center gap-3 font-black text-xs uppercase shadow-xl shadow-amber-500/20 hover:shadow-amber-500/40 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
                        >
                          {isThisLandProcessing ? (
                            <>
                              <Loader2 className="animate-spin" size={18} />
                              <span>Minting...</span>
                            </>
                          ) : (
                            <>
                              <ShieldAlert size={18} />
                              <span>Approve & Mint</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Performance Stats */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-slate-900 p-10 rounded-[3rem] text-white relative overflow-hidden shadow-2xl shadow-slate-900/40">
              <div className="relative z-10">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                   Quota Progress
                </h3>
                <p className="text-7xl font-black mt-6 tracking-tighter italic">{progressPercent}<span className="text-3xl text-amber-500 not-italic">%</span></p>
                
                <div className="w-full bg-white/10 h-3 rounded-full mt-10 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-amber-600 to-amber-400 h-full transition-all duration-1000 ease-out" 
                    style={{ width: `${progressPercent}%` }} 
                  />
                </div>
                
                <div className="flex justify-between items-center mt-8 pt-8 border-t border-white/5">
                    <div>
                        <p className="text-2xl font-black">{verifiedCount}</p>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Verified Today</p>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-black text-slate-500">{dailyTarget}</p>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Target Goal</p>
                    </div>
                </div>
              </div>
              
              {/* Decorative background element */}
              <ShieldAlert size={200} className="absolute -bottom-10 -right-10 text-white/5 rotate-12" />
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[2.5rem]">
               <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Recent Log</h4>
               <div className="space-y-4">
                  <div className="flex items-center gap-3 text-[11px] font-bold dark:text-slate-300">
                     <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full" /> 
                     System Online: Node connected
                  </div>
                  <div className="flex items-center gap-3 text-[11px] font-bold dark:text-slate-300 opacity-50">
                     <span className="h-1.5 w-1.5 bg-slate-400 rounded-full" /> 
                     Awaiting signature for new LR
                  </div>
               </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default OfficerDashboard;