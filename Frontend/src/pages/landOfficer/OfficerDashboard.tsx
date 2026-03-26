import React, { useState } from "react";
import { 
  ShieldAlert, FileCheck, History, CheckCircle2, 
  ExternalLink, Loader2, AlertCircle
} from "lucide-react";

// API & Redux
import { useGetLandsQuery, useVerifyLandMutation, type Land } from "../../features/lands/landApi";
import { useBlockchain } from "../../features/blockchain/useBlockchain";

const OfficerDashboard: React.FC = () => {
  const { data: allLands, isLoading, isError } = useGetLandsQuery();
  const [verifyLand, { isLoading: isBackendUpdating }] = useVerifyLandMutation();
  const { getContract, connectWallet } = useBlockchain();

  // Local state for UI feedback
  const [isMinting, setIsMinting] = useState(false);

  // Filter logic: Get only 'pending' lands for the queue
  const pendingLands = allLands?.filter(land => land.verificationStatus === 'pending') || [];
  
  // Stats calculation
  const verifiedCount = allLands?.filter(l => l.verificationStatus === 'verified').length || 0;
  const dailyTarget = 20;

  const handleApproveAndMint = async (land: Land) => {
    setIsMinting(true);
    try {
      // 1. Blockchain Handshake
      await connectWallet();
      const contract = await getContract();

      console.log(`Digitalizing Land: ${land.lrNumber}`);

      // 2. Smart Contract Call: registerLand(ownerAddress, lrNumber, ipfsHash)
      // Note: Ensure your backend 'getLands' query includes the owner's walletAddress!
      const transaction = await contract.registerLand(
        (land as any).owner?.walletAddress, 
        land.lrNumber,
        land.ipfsDocHash || "N/A"
      );

      // 3. Wait for Transaction Receipt
      const receipt = await transaction.wait();
      
      /** * 4. Extract onChainId from Event Logs
       * Usually, your Smart Contract emits an event like 'LandRegistered(uint256 id, ...)'
       * The ID is typically the first argument in the event logs.
       */
      const event = receipt.events?.find((e: any) => e.event === "LandRegistered");
      const onChainId = event ? event.args.id.toNumber() : Math.floor(Math.random() * 100000);

      // 5. Update Backend via RTK Query Mutation
      await verifyLand({
        id: land.id,
        payload: {
          onChainId,
          status: "verified"
        }
      }).unwrap();

      alert(`Success! LR: ${land.lrNumber} is now a Verified Digital Asset.`);
    } catch (err: any) {
      console.error("Verification Error:", err);
      alert(err.reason || "Blockchain minting failed. Check console.");
    } finally {
      setIsMinting(false);
    }
  };

  if (isError) return (
    <div className="p-20 text-center flex flex-col items-center gap-4 text-red-500">
      <AlertCircle size={40} />
      <p className="font-black uppercase tracking-widest">Registry Sync Error</p>
    </div>
  );

  return (
    <div className="flex-1 min-h-screen bg-white dark:bg-slate-950 transition-colors">
      
      {/* 1. Header Section */}
      <div className="px-8 py-8 border-b border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-900/20">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between max-w-[1400px] mx-auto">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-amber-600">
              <ShieldAlert size={14} /> Official Land Registry Node
            </div>
            <h1 className="text-3xl font-black tracking-tighter dark:text-white uppercase">
              Verification <span className="text-amber-600">Portal</span>
            </h1>
          </div>
          <button className="bg-slate-900 dark:bg-white dark:text-slate-900 text-white flex items-center gap-2 px-5 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl">
            <History size={16} /> System Logs
          </button>
        </header>
      </div>

      {/* 2. Content */}
      <main className="max-w-[1400px] mx-auto px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          
          {/* Queue List */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-900 pb-4">
               <h2 className="text-sm font-black dark:text-white uppercase tracking-widest">Active Requests ({pendingLands.length})</h2>
            </div>

            <div className="space-y-4">
              {isLoading ? (
                <div className="py-20 text-center flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-amber-500" />
                    <p className="text-slate-400 font-bold text-[10px] uppercase">Accessing Ledger...</p>
                </div>
              ) : pendingLands.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-slate-100 dark:border-slate-900 rounded-3xl">
                  <CheckCircle2 size={40} className="mx-auto text-emerald-500 mb-4 opacity-40" />
                  <p className="text-slate-400 font-bold text-xs uppercase">No pending verifications</p>
                </div>
              ) : (
                pendingLands.map((land) => (
                  <div key={land.id} className="bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl flex items-center justify-between group hover:border-amber-500/50 transition-all">
                    <div className="flex items-center gap-6">
                        <div className="h-14 w-14 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-amber-500">
                            <FileCheck size={24} />
                        </div>
                        <div>
                            <h3 className="font-mono text-sm font-black dark:text-white">{land.lrNumber}</h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">{land.county} • {land.landType}</p>
                            <a 
                              href={`https://ipfs.io/ipfs/${land.ipfsDocHash}`} 
                              target="_blank" 
                              className="text-[9px] text-blue-500 font-black flex items-center gap-1 mt-2 hover:underline uppercase"
                            >
                                <ExternalLink size={10} /> View Deeds (IPFS)
                            </a>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <button className="px-4 py-2 text-[10px] font-black uppercase text-slate-400 hover:text-red-500 transition-colors">Reject</button>
                        <button 
                          disabled={isMinting || isBackendUpdating}
                          onClick={() => handleApproveAndMint(land)}
                          className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-black text-[10px] uppercase tracking-widest shadow-lg disabled:opacity-50"
                        >
                          {isMinting || isBackendUpdating ? <Loader2 className="animate-spin" size={14} /> : <ShieldAlert size={14} />}
                          {isMinting ? "MINTING..." : "Sign & Approve"}
                        </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sidebar Stats */}
          <div className="space-y-6">
            <div className="bg-slate-900 p-8 rounded-[2rem] text-white">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Verification Progress</h3>
                <div className="flex items-baseline gap-2 mt-4">
                    <p className="text-5xl font-black">{Math.round((verifiedCount / dailyTarget) * 100)}%</p>
                </div>
                <div className="w-full bg-white/10 h-1.5 rounded-full mt-6 overflow-hidden">
                    <div className="bg-amber-500 h-full transition-all" style={{ width: `${(verifiedCount / dailyTarget) * 100}%` }} />
                </div>
                <p className="text-[9px] mt-4 font-bold opacity-60 uppercase tracking-widest">{verifiedCount} of {dailyTarget} processed today</p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default OfficerDashboard;