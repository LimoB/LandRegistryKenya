import React from "react";
import { 
  User, 
  ArrowRight, 
  CreditCard, 
  ShieldCheck, 
  XCircle, 
  Loader2, 
  CheckCircle2, 
  Hash, 
  Map
} from "lucide-react";
import type { TransferRequest } from "../../features/transfers/transferApi";

interface TransferCardProps {
  tx: TransferRequest;
  isProcessing: boolean;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
}

const TransferCard: React.FC<TransferCardProps> = ({ tx, isProcessing, onApprove, onReject }) => {
  /**
   * Logic: Determine if action buttons should be visible.
   * If status is no longer 'pending', the officer has already acted.
   */
  const isAlreadyProcessed = tx.status !== "pending";

  return (
    <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-900 transition-all duration-300 group">
      <div className="p-6 grid grid-cols-1 lg:grid-cols-4 items-center gap-8">
        
        {/* 1. PARTICIPANTS FLOW */}
        <div className="lg:col-span-1 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 group-hover:bg-blue-50/30 dark:group-hover:bg-blue-950/10 transition-colors">
          <div className="text-center">
            <p className="text-[7px] font-black text-slate-400 uppercase mb-2 tracking-widest">Current Owner</p>
            <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto shadow-sm border border-slate-100 dark:border-slate-700">
              <User size={20} className="text-slate-400" />
            </div>
            <p className="mt-2 text-[10px] font-black dark:text-white truncate w-20 mx-auto">
              {tx.seller?.fullName || "System Record"}
            </p>
          </div>
          
          <div className="flex flex-col items-center gap-1 px-2">
            <div className={`p-1.5 rounded-full ${isAlreadyProcessed ? "bg-emerald-100 text-emerald-600" : "bg-blue-100 text-blue-600"}`}>
              <ArrowRight size={14} className={isAlreadyProcessed ? "" : "animate-pulse"} />
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-[7px] font-black text-slate-400 uppercase mb-2 tracking-widest">New Recipient</p>
            <div className={`w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto shadow-sm border-2 transition-colors ${isAlreadyProcessed ? "border-emerald-500/20" : "border-blue-500/20"}`}>
              <User size={20} className={isAlreadyProcessed ? "text-emerald-500" : "text-blue-600"} />
            </div>
            <p className="mt-2 text-[10px] font-black dark:text-white truncate w-20 mx-auto">
              {tx.buyer?.fullName || "Unknown Buyer"}
            </p>
          </div>
        </div>

        {/* 2. LAND IDENTITY & PAYMENT */}
        <div className="flex flex-col space-y-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-slate-400">
              <Map size={12} />
              <span className="text-[8px] font-black uppercase tracking-widest">Property Details</span>
            </div>
            <p className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span className="px-2 py-0.5 bg-blue-600 text-white rounded text-[10px]">LR</span>
              {tx.land?.lrNumber || "N/A"}
            </p>
            <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-500">
               <Hash size={10} />
               ID: {tx.land?.onChainId ?? "UNREGISTERED"}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-emerald-600 mb-1">
              <CreditCard size={12} />
              <span className="text-[8px] font-black uppercase tracking-widest">Valuation / Price</span>
            </div>
            <p className="font-mono text-lg font-black text-slate-900 dark:text-white tabular-nums tracking-tighter">
              {/* Updated to match your interface: tx.land.priceInKsh */}
              {tx.land?.priceInKsh 
                ? `KES ${Number(tx.land.priceInKsh).toLocaleString()}` 
                : "Price Not Set"}
            </p>
          </div>
        </div>

        {/* 3. WALLET AUTHENTICATION */}
        <div className="hidden lg:flex flex-col gap-2">
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Buyer Wallet Address</span>
          <div className="group/wallet relative">
            <p className="text-[9px] font-mono text-slate-600 dark:text-slate-400 break-all bg-slate-50 dark:bg-slate-900/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 leading-relaxed group-hover/wallet:border-blue-400 transition-colors">
              {tx.buyer?.walletAddress || "0x0000000000000000000000000000000000000000"}
            </p>
            <div className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
          </div>
        </div>

        {/* 4. OFFICER ACTIONS */}
        <div className="flex flex-col gap-2.5">
          {isAlreadyProcessed ? (
            <div className="w-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border border-emerald-100 dark:border-emerald-900/30 px-6 py-5 rounded-[1.5rem] flex items-center justify-center gap-3">
              <CheckCircle2 size={18} />
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-black uppercase tracking-widest leading-none">Record Validated</span>
                <span className="text-[8px] font-medium opacity-70 mt-1 uppercase tracking-tighter">
                  Status: {tx.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          ) : (
            <>
              <button 
                disabled={isProcessing}
                onClick={() => onApprove(tx.id)}
                className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.15em] hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95 shadow-xl shadow-slate-200 dark:shadow-none"
              >
                {isProcessing ? (
                  <Loader2 className="animate-spin" size={14} />
                ) : (
                  <ShieldCheck size={14} className="group-hover:scale-110 transition-transform" />
                )}
                EXECUTE APPROVAL
              </button>

              <button 
                disabled={isProcessing}
                onClick={() => onReject(tx.id)}
                className="w-full bg-white dark:bg-transparent border border-slate-200 dark:border-slate-800 text-red-500 px-6 py-3 rounded-[1.2rem] font-black text-[10px] uppercase tracking-[0.15em] hover:bg-red-50 dark:hover:bg-red-950/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95"
              >
                <XCircle size={14} />
                REJECT REQUEST
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransferCard;