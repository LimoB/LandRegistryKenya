import React from "react";
import { 
  ShieldCheck, 
  AlertCircle, 
  Loader2, 
  Clock, 
  Wallet,
  Tag,
  Info
} from "lucide-react";
import type { Land } from "../../features/lands/landApi";

/**
 * API Error structure for Type Safety
 */
interface ApiError {
  data?: {
    error?: string;
    message?: string;
  };
  status?: number;
}

interface ActionPanelProps {
  selectedLand: Land | undefined; // Required to fix the ts(2322) error
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  isError: boolean;
  error: ApiError | null | unknown; 
  isOwnLandSelected: boolean;
}

const TransferActionPanel: React.FC<ActionPanelProps> = ({
  selectedLand,
  onSubmit,
  isLoading,
  isError,
  error,
  isOwnLandSelected,
}) => {
  /* ================================
     ERROR HANDLING LOGIC
  ================================ */
  const getErrorMessage = () => {
    if (!isError || !error) return null;
    const apiErr = error as ApiError;
    return apiErr.data?.error || apiErr.data?.message || "Something went wrong. Please try again.";
  };

  // Button is disabled if no land is selected, loading, or user owns the land
  const isDisabled = !selectedLand || isLoading || isOwnLandSelected;

  /* ================================
     EMPTY STATE (NO SELECTION)
  ================================ */
  if (!selectedLand) {
    return (
      <div className="border-2 border-dashed border-slate-200 rounded-3xl p-10 bg-slate-50/50 text-center flex flex-col items-center justify-center space-y-4">
        <div className="p-4 bg-white rounded-full shadow-sm">
          <Info className="text-slate-300" size={32} />
        </div>
        <div>
          <p className="text-slate-600 font-bold">Select Property</p>
          <p className="text-xs text-slate-400 mt-1">Pick a land from the marketplace to view purchase details.</p>
        </div>
      </div>
    );
  }

  /* ================================
     ACTIVE STATE
  ================================ */
  return (
    <form onSubmit={onSubmit} className="w-full animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="border border-slate-200 rounded-3xl p-8 bg-white shadow-xl shadow-slate-100 space-y-8">
        
        {/* HEADER & PRICE */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-blue-600">
            <div className="p-2 bg-blue-50 rounded-xl">
              <Tag size={22} />
            </div>
            <h3 className="font-black text-xl text-slate-900 tracking-tight">
              Purchase Summary
            </h3>
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex justify-between items-center">
            <span className="text-sm font-bold text-slate-500">Total Price</span>
            <span className="text-2xl font-black text-blue-700">
              KES {selectedLand.priceInKsh?.toLocaleString()}
            </span>
          </div>
        </div>

        {/* TRUST STEPS */}
        <div className="space-y-4 pt-4 border-t border-slate-50">
          <div className="flex items-start gap-4">
            <div className="mt-1 p-1 bg-emerald-100 text-emerald-600 rounded-full">
              <ShieldCheck size={14} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Secure Escrow</p>
              <p className="text-xs text-slate-500">Payments are encrypted and verified by blockchain.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="mt-1 p-1 bg-amber-100 text-amber-600 rounded-full">
              <Clock size={14} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Legal Review</p>
              <p className="text-xs text-slate-500">Manual approval by registry officers takes 24-48h.</p>
            </div>
          </div>
        </div>

        {/* ALERTS */}
        {(isOwnLandSelected || isError) && (
          <div className="space-y-3">
            {isOwnLandSelected && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700">
                <AlertCircle size={18} className="shrink-0" />
                <p className="text-xs font-bold leading-tight">
                  You are the owner of this title. Purchase restricted.
                </p>
              </div>
            )}

            {isError && (
              <div className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-100 rounded-2xl text-orange-700">
                <AlertCircle size={18} className="shrink-0" />
                <p className="text-xs font-medium italic">{getErrorMessage()}</p>
              </div>
            )}
          </div>
        )}

        {/* ACTION BUTTON */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isDisabled}
            className={`group w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-lg ${
              isDisabled 
                ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none" 
                : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-200 active:scale-[0.98]"
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Wallet size={18} className={isDisabled ? "" : "group-hover:animate-bounce"} />
                <span>Start Purchase</span>
              </>
            )}
          </button>
          
          <p className="mt-4 text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest">
            Registry-Linked Transaction
          </p>
        </div>
      </div>
    </form>
  );
};

export default TransferActionPanel;