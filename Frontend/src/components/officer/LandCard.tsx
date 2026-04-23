import React from "react";
import { FileCheck, MapPin, Clock, ExternalLink, ShieldAlert, Loader2 } from "lucide-react";
import type { Land } from "../../features/lands/landApi";

interface LandCardProps {
  land: Land;
  // Use 'any' or 'string | number | null' to match your API ID type
  processingId: string | number | null; 
  onApprove: (land: Land) => void;
}

const LandCard: React.FC<LandCardProps> = ({ land, processingId, onApprove }) => {
  // Check if this specific card is being processed
  // Using == allows comparison if one is a string "1" and other is number 1
  const isThisLandLoading = processingId !== null && processingId == land.id;
  
  // Stop other clicks if any land is loading
  const isAnyLoading = processingId !== null;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[2.5rem] flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-xl transition-all group">
      
      {/* Land Info */}
      <div className="flex items-start gap-6">
        <div className="h-20 w-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-slate-400 group-hover:text-amber-600 transition-colors">
          <FileCheck size={32} />
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h3 className="font-mono text-xl font-black dark:text-white uppercase">
              {land.lrNumber}
            </h3>
            <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[9px] font-black uppercase rounded-lg">
              Pending
            </span>
          </div>
          
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 font-bold uppercase mt-2">
            <span className="flex items-center gap-1.5">
              <MapPin size={12} /> {land.county}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={12} /> {new Date(land.createdAt).toLocaleDateString()}
            </span>
            <span className="text-amber-600 font-black">{land.landType}</span>
          </div>

          <a 
            href={`https://ipfs.io/ipfs/${land.ipfsDocHash}`} 
            target="_blank" 
            rel="noreferrer" 
            className="inline-flex items-center gap-2 text-[10px] text-blue-600 font-black mt-4 uppercase hover:underline"
          >
            <ExternalLink size={14} /> View Documents
          </a>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
        <button 
          type="button"
          disabled={isAnyLoading} 
          className="px-6 py-4 text-xs font-black uppercase text-slate-400 hover:text-red-500 transition-colors disabled:opacity-30"
        >
          Reject
        </button>
        
        <button 
          type="button"
          onClick={() => onApprove(land)}
          disabled={isAnyLoading}
          className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-5 rounded-[1.5rem] flex items-center gap-3 font-black text-xs uppercase shadow-xl transition-all disabled:opacity-50 disabled:grayscale"
        >
          {isThisLandLoading ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              <span>Updating...</span>
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