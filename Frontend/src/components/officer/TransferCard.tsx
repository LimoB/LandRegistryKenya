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
  Map,
  Copy
} from "lucide-react";

import type { TransferRequest } from "../../features/transfers/transferApi";

interface TransferCardProps {
  tx: TransferRequest;
  isProcessing: boolean;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
}

const TransferCard: React.FC<TransferCardProps> = ({
  tx,
  isProcessing,
  onApprove,
  onReject,
}) => {
  /* ================= STATUS ================= */
  const isProcessed = tx.status !== "pending";

  /* ================= HELPERS ================= */
  const shortWallet = (addr?: string) => {
    if (!addr) return "N/A";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatPrice = (value?: string | number) => {
    if (!value) return "Price Not Set";
    return `KES ${Number(value).toLocaleString()}`;
  };

  /* ================= UI ================= */
  return (
    <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-900 transition-all duration-300 group">
      
      <div className="p-6 grid grid-cols-1 lg:grid-cols-4 items-center gap-8">
        
        {/* ================= PARTICIPANTS ================= */}
        <div className="lg:col-span-1 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 group-hover:bg-blue-50/30 dark:group-hover:bg-blue-950/10 transition-colors">
          
          {/* SELLER */}
          <div className="text-center">
            <p className="text-[7px] font-black text-slate-400 uppercase mb-2 tracking-widest">
              Current Owner
            </p>

            <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto shadow-sm border">
              <User size={20} className="text-slate-400" />
            </div>

            <p className="mt-2 text-[10px] font-black dark:text-white truncate w-20 mx-auto">
              {tx.seller?.fullName || "System"}
            </p>
          </div>

          {/* ARROW */}
          <div className="flex flex-col items-center px-2">
            <div className={`p-1.5 rounded-full ${
              isProcessed ? "bg-emerald-100 text-emerald-600" : "bg-blue-100 text-blue-600"
            }`}>
              <ArrowRight size={14} className={!isProcessed ? "animate-pulse" : ""} />
            </div>
          </div>

          {/* BUYER */}
          <div className="text-center">
            <p className="text-[7px] font-black text-slate-400 uppercase mb-2 tracking-widest">
              New Owner
            </p>

            <div className={`w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto shadow-sm border-2 ${
              isProcessed ? "border-emerald-400/30" : "border-blue-400/30"
            }`}>
              <User size={20} className={isProcessed ? "text-emerald-500" : "text-blue-600"} />
            </div>

            <p className="mt-2 text-[10px] font-black dark:text-white truncate w-20 mx-auto">
              {tx.buyer?.fullName || "Unknown"}
            </p>
          </div>
        </div>

        {/* ================= LAND + PRICE ================= */}
        <div className="flex flex-col space-y-3">
          
          {/* LAND */}
          <div>
            <div className="flex items-center gap-2 text-slate-400">
              <Map size={12} />
              <span className="text-[8px] font-black uppercase tracking-widest">
                Property
              </span>
            </div>

            <p className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span className="px-2 py-0.5 bg-blue-600 text-white rounded text-[10px]">
                LR
              </span>
              {tx.land?.lrNumber || "N/A"}
            </p>

            <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-500">
              <Hash size={10} />
              ID: {tx.land?.onChainId ?? "UNREGISTERED"}
            </div>
          </div>

          {/* PRICE */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-emerald-600 mb-1">
              <CreditCard size={12} />
              <span className="text-[8px] font-black uppercase tracking-widest">
                Price
              </span>
            </div>

            <p className="font-mono text-lg font-black text-slate-900 dark:text-white">
              {formatPrice(tx.land?.priceInKsh)}
            </p>
          </div>
        </div>

        {/* ================= WALLET ================= */}
        <div className="hidden lg:flex flex-col gap-2">
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
            Buyer Wallet
          </span>

          <div className="relative group/wallet">
            <p className="text-[9px] font-mono text-slate-600 dark:text-slate-400 break-all bg-slate-50 dark:bg-slate-900 p-3 rounded-2xl border leading-relaxed">
              {shortWallet(tx.buyer?.walletAddress)}
            </p>

            {/* copy hint */}
            <Copy
              size={12}
              className="absolute top-2 right-2 text-slate-300 group-hover/wallet:text-blue-600 transition"
            />

            <div className="absolute top-2 left-2 w-2 h-2 bg-emerald-500 rounded-full" />
          </div>
        </div>

        {/* ================= ACTIONS ================= */}
        <div className="flex flex-col gap-3">
          {isProcessed ? (
            <div className="w-full bg-emerald-50 text-emerald-600 border px-6 py-5 rounded-[1.5rem] flex items-center gap-3">
              <CheckCircle2 size={18} />
              <div>
                <p className="text-[10px] font-black uppercase">
                  Processed
                </p>
                <p className="text-[8px] opacity-70 uppercase">
                  {tx.status.replace("_", " ")}
                </p>
              </div>
            </div>
          ) : (
            <>
              <button
                disabled={isProcessing}
                onClick={() => onApprove(tx.id)}
                className="w-full bg-slate-900 text-white px-6 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isProcessing ? (
                  <Loader2 className="animate-spin" size={14} />
                ) : (
                  <ShieldCheck size={14} />
                )}
                Approve Transfer
              </button>

              <button
                disabled={isProcessing}
                onClick={() => onReject(tx.id)}
                className="w-full bg-white border text-red-500 px-6 py-3 rounded-[1.2rem] font-black text-[10px] uppercase tracking-widest hover:bg-red-50 transition flex items-center justify-center gap-3 disabled:opacity-50"
              >
                <XCircle size={14} />
                Reject
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransferCard;