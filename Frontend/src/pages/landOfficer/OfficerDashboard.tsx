import React, { useState } from "react";
import { ShieldAlert, CheckCircle2, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { useDispatch } from "react-redux";
import { useGetLandsQuery, useVerifyLandMutation, type Land } from "../../features/lands/landApi";
import { setSelectedLand } from "../../features/lands/landSlice";

// Sub-components
import LandCard from "../../components/officer/LandCard";
import DashboardStats from "../../components/officer/DashboardStats";

const OfficerDashboard: React.FC = () => {
  const dispatch = useDispatch();
  const [processingId, setProcessingId] = useState<number | null>(null);
  const { data: allLands, isLoading, isError, refetch } = useGetLandsQuery();
  const [verifyLand] = useVerifyLandMutation();

  const pendingLands = allLands?.filter(land => land.verificationStatus === 'pending') || [];
  const verifiedCount = allLands?.filter(l => l.verificationStatus === 'verified').length || 0;
  const progressPercent = Math.min(Math.round((verifiedCount / 20) * 100), 100);

  const handleApproveAndMint = async (land: Land) => {
    if (processingId !== null) return;
    setProcessingId(land.id);
    try {
      dispatch(setSelectedLand(land));
      await verifyLand(land.id).unwrap();
      alert(`SUCCESS!\nLR: ${land.lrNumber} Verified on Blockchain`);
    } catch {
      // Removed the 'err' parameter entirely to satisfy strict ESLint rules
      alert("Verification Error: Connection to Blockchain failed.");
    } finally {
      setProcessingId(null);
      dispatch(setSelectedLand(null));
    }
  };

  if (isError) return (
    <div className="p-20 text-center flex flex-col items-center gap-6 text-red-500">
      <AlertCircle size={48} className="animate-pulse" />
      <h2 className="font-black uppercase text-lg">System Sync Error</h2>
      <button onClick={() => refetch()} className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase">
        <RefreshCw size={14} className="inline mr-2" /> Reconnect Ledger
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
          <button 
            onClick={() => refetch()} 
            className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:text-amber-600 transition-colors"
          >
            <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
          </button>
        </header>
      </div>

      <main className="max-w-[1400px] mx-auto px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Queue Section */}
          <div className="lg:col-span-8 space-y-8">
            <h2 className="text-xs font-black dark:text-white uppercase tracking-[0.3em] flex items-center gap-3">
              Incoming Requests <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-800 rounded-md text-[10px]">{pendingLands.length}</span>
            </h2>
            
            {isLoading ? (
              <div className="py-32 text-center flex flex-col items-center gap-6">
                <Loader2 className="animate-spin text-amber-500" size={40} />
                <p className="text-slate-400 font-bold text-xs uppercase">Syncing with Distributed Ledger...</p>
              </div>
            ) : pendingLands.length === 0 ? (
              <div className="py-32 text-center border-4 border-dashed border-slate-100 dark:border-slate-900 rounded-[3rem]">
                <CheckCircle2 size={56} className="mx-auto text-emerald-500/20 mb-6" />
                <p className="text-slate-400 font-black text-sm uppercase">Queue Clear: All Lands Verified</p>
              </div>
            ) : (
              pendingLands.map(land => (
                <LandCard 
                  key={land.id} 
                  land={land} 
                  isProcessing={processingId === land.id} 
                  onApprove={handleApproveAndMint} 
                />
              ))
            )}
          </div>

          {/* Stats Section */}
          <DashboardStats 
            verifiedCount={verifiedCount} 
            dailyTarget={20} 
            progressPercent={progressPercent} 
          />
        </div>
      </main>
    </div>
  );
};

export default OfficerDashboard;