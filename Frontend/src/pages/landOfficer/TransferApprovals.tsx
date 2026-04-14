import React from "react";
import { 
  useGetPendingTransfersQuery, 
  useApproveTransferMutation,
  useRejectTransferMutation,
  type TransferRequest 
} from "../../features/transfers/transferApi";
import { 
  PenTool, 
  ArrowRight, 
  CreditCard, 
  ShieldCheck, 
  User, 
  Loader2,
  AlertCircle,
  XCircle
} from "lucide-react";

/**
 * Type-only imports to satisfy 'verbatimModuleSyntax'
 */
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { SerializedError } from "@reduxjs/toolkit";

const TransferApprovals: React.FC = () => {
  const { data: transfers, isLoading, isError, refetch } = useGetPendingTransfersQuery();
  const [approveTransfer, { isLoading: isApproving }] = useApproveTransferMutation();
  const [rejectTransfer, { isLoading: isRejecting }] = useRejectTransferMutation();

  /**
   * Safe Error Guard to extract messages without using 'any'
   */
  const getErrorMessage = (err: unknown): string => {
    // 1. Handle FetchBaseQueryError (Server responses)
    if (err && typeof err === 'object' && 'status' in err) {
      const fetchErr = err as FetchBaseQueryError;
      if (fetchErr.data && typeof fetchErr.data === 'object') {
        return (fetchErr.data as { error?: string }).error || "Server error occurred";
      }
    }

    // 2. Handle SerializedError (Execution/Network errors)
    if (err && typeof err === 'object' && 'message' in err) {
      const serialErr = err as SerializedError;
      return serialErr.message || "An unexpected error occurred";
    }

    return "An unknown error occurred";
  };

  /* ================================
     HANDLERS
  ================================ */
  const handleApprove = async (id: number) => {
    if (!window.confirm("Are you sure you want to finalize this transfer? This will move the title deed on the blockchain.")) return;
    
    try {
      const response = await approveTransfer(id).unwrap();
      alert(`Success! Ownership transferred on-chain. Tx Hash: ${response.txHash.substring(0, 15)}...`);
    } catch (err: unknown) {
      console.error("Approval Error:", err);
      alert(getErrorMessage(err));
    }
  };

  const handleReject = async (id: number) => {
    const reason = prompt("Enter reason for rejection (e.g., Invalid M-Pesa Code):");
    if (!reason) return;

    try {
      await rejectTransfer({ id, reason }).unwrap();
      alert("Transfer request rejected successfully.");
    } catch (err: unknown) {
      console.error("Rejection Error:", err);
      alert(getErrorMessage(err));
    }
  };

  /* ================================
     ERROR STATE
  ================================ */
  if (isError) {
    return (
      <div className="p-8 flex items-center gap-3 text-red-500 font-bold bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-100 dark:border-red-900">
        <AlertCircle size={20} /> FAILED TO LOAD PENDING LEDGER
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in slide-in-from-right-4 duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-900 pb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <PenTool className="text-blue-600" /> Transfer Approvals
          </h1>
          <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-[0.2em]">
            Ministry of Lands • Official Verification Node
          </p>
        </div>
        <button 
          onClick={() => refetch()} 
          className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-2"
        >
          {isLoading && <Loader2 className="animate-spin" size={12} />}
          Refresh Ledger
        </button>
      </div>

      {/* Main List Section */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="py-24 text-center flex flex-col items-center">
             <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
             <p className="font-bold text-slate-400 uppercase text-[10px] tracking-widest">Querying Distributed Ledger...</p>
          </div>
        ) : !transfers || transfers.length === 0 ? (
          <div className="py-24 text-center bg-slate-50 dark:bg-slate-900/20 rounded-3xl border-2 border-dashed border-slate-100 dark:border-slate-800">
            <p className="text-slate-500 font-medium italic text-sm">All clear! No transfers awaiting signature.</p>
          </div>
        ) : (
          transfers.map((tx: TransferRequest) => (
            <div key={tx.id} className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all">
              <div className="p-6 grid grid-cols-1 lg:grid-cols-4 items-center gap-8">
                
                {/* Visual Flow: Seller to Buyer */}
                <div className="lg:col-span-1 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="text-center">
                    <p className="text-[8px] font-black text-slate-400 uppercase mb-2">Seller</p>
                    <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center mx-auto shadow-sm">
                        <User size={18} className="text-slate-400" />
                    </div>
                    <p className="mt-2 text-[11px] font-black dark:text-white truncate w-20">
                      {tx.seller?.fullName || "Unknown"}
                    </p>
                  </div>
                  
                  <ArrowRight className="text-blue-600" size={16} />
                  
                  <div className="text-center">
                    <p className="text-[8px] font-black text-slate-400 uppercase mb-2">Buyer</p>
                    <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center mx-auto shadow-sm border-2 border-blue-500/20">
                        <User size={18} className="text-blue-600" />
                    </div>
                    <p className="mt-2 text-[11px] font-black dark:text-white truncate w-20">
                      {tx.buyer?.fullName || "Unknown"}
                    </p>
                  </div>
                </div>

                {/* Land & Payment Details */}
                <div className="flex flex-col space-y-2">
                    <div className="flex items-center gap-2 text-emerald-600">
                        <CreditCard size={14} />
                        <span className="text-[9px] font-bold uppercase tracking-widest">M-Pesa Evidence</span>
                    </div>
                    <p className="font-mono text-lg font-black dark:text-white tracking-tighter tabular-nums">
                        {tx.mpesaReceiptCode}
                    </p>
                    <div className="flex flex-col gap-0.5">
                      <p className="text-[11px] text-blue-600 font-bold uppercase">
                        LR: {tx.land?.lrNumber}
                      </p>
                      <span className="text-[8px] font-black text-slate-400 uppercase">
                        On-Chain ID: {tx.land?.onChainId ?? "PENDING"}
                      </span>
                    </div>
                </div>

                {/* Recipient Identity */}
                <div className="hidden lg:flex flex-col gap-1">
                    <span className="text-[8px] font-black text-slate-400 uppercase">Buyer Wallet</span>
                    <p className="text-[10px] font-mono dark:text-slate-300 break-all bg-slate-100 dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                        {tx.buyer?.walletAddress}
                    </p>
                </div>

                {/* Final Actions */}
                <div className="flex flex-col gap-2">
                  <button 
                    disabled={isApproving || isRejecting}
                    onClick={() => handleApprove(tx.id)}
                    className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.15em] hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95"
                  >
                    {isApproving ? <Loader2 className="animate-spin" size={14} /> : <ShieldCheck size={14} />}
                    {isApproving ? "PROCESSING..." : "APPROVE & SYNC"}
                  </button>

                  <button 
                    disabled={isApproving || isRejecting}
                    onClick={() => handleReject(tx.id)}
                    className="w-full bg-white dark:bg-transparent border border-slate-200 dark:border-slate-800 text-red-500 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.15em] hover:bg-red-50 dark:hover:bg-red-950/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95"
                  >
                    {isRejecting ? <Loader2 className="animate-spin" size={14} /> : <XCircle size={14} />}
                    REJECT TRANSFER
                  </button>
                </div>

              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TransferApprovals;