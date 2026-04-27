import React from "react";
import { MapPin, CheckCircle2, User, Tag, Map as MapIcon, Lock } from "lucide-react";

// 1. IMPORT the central type from your API to ensure priceInKsh matches (string vs number)
// 1. IMPORT the central type from your API to ensure priceInKsh matches (string vs number)
import type { Land } from "../../features/lands/landApi";

interface LandCardProps {
  land: Land;
  isSelected: boolean;
  isMine: boolean;
  onSelect: (id: number) => void;
}

const LandCard: React.FC<LandCardProps> = ({ 
  land, 
  isSelected, 
  isMine, 
  onSelect 
}) => {
  
  // 2. HELPER to handle price display safely whether it is a string or a number
  const formatPrice = (price: string | number | undefined) => {
    if (!price) return "Not Set";
    // Convert string to number if necessary so .toLocaleString() works
    const numericPrice = typeof price === "string" ? parseFloat(price) : price;
    return numericPrice.toLocaleString();
  };

  return (
    <div className="relative group">
      <button
        type="button"
        disabled={isMine}
        onClick={() => onSelect(land.id)}
        className={`w-full flex flex-col p-5 rounded-2xl border-2 transition-all text-left ${
          isSelected
            ? "border-blue-600 bg-blue-50/50 shadow-md ring-2 ring-blue-500/20"
            : isMine
            ? "border-slate-100 bg-slate-50 cursor-not-allowed opacity-70"
            : "border-slate-100 bg-white hover:border-blue-200 hover:shadow-sm"
        }`}
      >
        {/* TOP ROW: ICON & TITLE */}
        <div className="flex items-start justify-between w-full mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${isSelected ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-600"}`}>
              <MapIcon size={20} />
            </div>
            <div>
              <p className="font-black text-slate-900 tracking-tight text-base leading-none">
                {land.lrNumber}
              </p>
              <div className="flex items-center gap-1 mt-1.5 text-slate-500">
                <MapPin size={12} />
                <span className="text-[11px] font-bold uppercase tracking-wider">{land.county}</span>
              </div>
            </div>
          </div>

          {/* STATUS INDICATOR */}
          {isSelected ? (
            <CheckCircle2 size={24} className="text-blue-600 animate-in zoom-in" />
          ) : isMine ? (
            <div className="flex items-center gap-1 px-2 py-1 bg-slate-200 text-slate-600 rounded-lg text-[10px] font-black uppercase">
              <Lock size={10} />
              Yours
            </div>
          ) : null}
        </div>

        {/* MIDDLE ROW: LAND SPECS */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-white/50 p-2 rounded-lg border border-slate-50">
            <p className="text-[10px] uppercase text-slate-400 font-bold">Category</p>
            <p className="text-xs font-bold text-slate-700 capitalize">{land.landType}</p>
          </div>
          <div className="bg-white/50 p-2 rounded-lg border border-slate-50">
            <p className="text-[10px] uppercase text-slate-400 font-bold">Price (KES)</p>
            <p className="text-xs font-bold text-blue-600">
              {formatPrice(land.priceInKsh)}
            </p>
          </div>
        </div>

        {/* BOTTOM ROW: OWNER INFO */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100/50">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center">
              <User size={12} className="text-slate-500" />
            </div>
            <span className="text-[11px] font-medium text-slate-400">
              Owner ID: {land.ownerId}
            </span>
          </div>
          
          {!isMine && !isSelected && (
            <div className="flex items-center gap-1 text-blue-600 font-bold text-[11px] uppercase tracking-tight opacity-0 group-hover:opacity-100 transition-opacity">
              <span>View Details</span>
              <Tag size={12} />
            </div>
          )}
        </div>
      </button>

      {/* OVERLAY FOR OWN PROPERTY */}
      {isMine && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-white/80 px-4 py-2 rounded-full border border-slate-200 shadow-sm">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ownership Restricted</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandCard;