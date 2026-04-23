import React from "react";
import { User, ArrowRight, CreditCard, ShieldCheck, XCircle, Loader2 } from "lucide-react";
import type { TransferRequest } from "../../features/transfers/transferApi";

interface TransferCardProps {
  tx: TransferRequest;
  isProcessing: boolean;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
}

const TransferCard: React.FC<TransferCardProps> = ({ tx, isProcessing, onApprove, onReject }) => {
  return (
    <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all">
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
            disabled={isProcessing}
            onClick={() => onApprove(tx.id)}
            className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.15em] hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95"
          >
            {isProcessing ? <Loader2 className="animate-spin" size={14} /> : <ShieldCheck size={14} />}
            APPROVE & SYNC
          </button>

          <button 
            disabled={isProcessing}
            onClick={() => onReject(tx.id)}
            className="w-full bg-white dark:bg-transparent border border-slate-200 dark:border-slate-800 text-red-500 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.15em] hover:bg-red-50 dark:hover:bg-red-950/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95"
          >
            <XCircle size={14} />
            REJECT
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransferCard;