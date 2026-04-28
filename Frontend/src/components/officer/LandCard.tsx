import React from "react";
import { 
  FileCheck, 
  MapPin, 
  Clock, 
  ExternalLink, 
  ShieldAlert, 
  Loader2 
} from "lucide-react";
import type { Land } from "../../features/lands/landApi";

interface LandCardProps {
  land: Land;
  processingId: string | number | null;
  onApprove: (land: Land) => void;
}

const LandCard: React.FC<LandCardProps> = ({ land, processingId, onApprove }) => {
  /* ================= STATE ================= */
  const isThisLandLoading = processingId !== null && processingId == land.id;
  const isAnyLoading = processingId !== null;

  /* ================= SAFE VALUES ================= */
  const createdDate = land.createdAt
    ? new Date(land.createdAt).toLocaleDateString("en-KE", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Unknown Date";

  const hasIpfs = Boolean(land.ipfsDocHash);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[2.5rem] flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-xl hover:border-amber-300 dark:hover:border-amber-700 transition-all group">
      
      {/* ================= LAND INFO ================= */}
      <div className="flex items-start gap-6">
        <div className="h-20 w-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-slate-400 group-hover:text-amber-600 transition-colors">
          <FileCheck size={32} />
        </div>
        
        <div className="space-y-2">
          {/* LR + STATUS */}
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="font-mono text-xl font-black dark:text-white uppercase">
              {land.lrNumber || "UNREGISTERED"}
            </h3>

            <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[9px] font-black uppercase rounded-lg">
              Pending
            </span>
          </div>

          {/* META */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 font-bold uppercase">
            <span className="flex items-center gap-1.5">
              <MapPin size={12} /> {land.county || "Unknown County"}
            </span>

            <span className="flex items-center gap-1.5">
              <Clock size={12} /> {createdDate}
            </span>

            <span className="text-amber-600 font-black">
              {land.landType || "Unspecified"}
            </span>
          </div>

          {/* DOCUMENT LINK */}
          {hasIpfs ? (
            <a 
              href={`https://ipfs.io/ipfs/${land.ipfsDocHash}`} 
              target="_blank" 
              rel="noreferrer" 
              className="inline-flex items-center gap-2 text-[10px] text-blue-600 font-black mt-3 uppercase hover:underline"
            >
              <ExternalLink size={14} /> View Documents
            </a>
          ) : (
            <p className="text-[10px] text-slate-300 font-bold mt-3 uppercase">
              No documents available
            </p>
          )}
        </div>
      </div>

      {/* ================= ACTIONS ================= */}
      <div className="flex items-center gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
        
        {/* REJECT (future hook) */}
        <button 
          type="button"
          disabled={isAnyLoading}
          className="px-6 py-4 text-xs font-black uppercase text-slate-400 hover:text-red-500 transition-colors disabled:opacity-30"
        >
          Reject
        </button>
        
        {/* APPROVE */}
        <button 
          type="button"
          onClick={() => onApprove(land)}
          disabled={isAnyLoading}
          className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-5 rounded-[1.5rem] flex items-center gap-3 font-black text-xs uppercase shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
        >
          {isThisLandLoading ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              <span>Processing...</span>
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
};

export default LandCard;