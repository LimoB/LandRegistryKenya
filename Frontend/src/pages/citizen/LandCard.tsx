import React from "react";
import { MapPin, CheckCircle2 } from "lucide-react";

/**
 * Updated Land interface:
 * ownerId changed to number to match your API and Redux user state.
 */
export interface Land {
  id: number;
  lrNumber: string;
  county: string;
  landType: string;
  ownerId: number; // Changed from string to number
  isForSale: boolean;
  verificationStatus: string;
}

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
  return (
    <button
      type="button"
      disabled={isMine}
      onClick={() => onSelect(land.id)}
      className={`w-full flex items-center justify-between p-4 rounded-xl transition ${
        isSelected
          ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
          : isMine
          ? "opacity-40 cursor-not-allowed bg-slate-50 dark:bg-slate-900"
          : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100"
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Dynamic icon color based on selection */}
        <MapPin 
          size={18} 
          className={isSelected ? "text-white" : "text-blue-500"} 
        />
        
        <div className="text-left">
          <p className="font-bold leading-tight">{land.lrNumber}</p>
          <p className={`text-xs ${isSelected ? "text-blue-100" : "text-slate-500 dark:text-slate-400"}`}>
            {land.county} • {land.landType}
          </p>
        </div>
      </div>

      {/* Visual feedback for selection */}
      {isSelected && (
        <CheckCircle2 
          size={20} 
          className="text-white animate-in zoom-in duration-300" 
        />
      )}
    </button>
  );
};

export default LandCard;