import React from "react";
import { Loader2, Inbox, Map } from "lucide-react";
import LandCard from "./LandCard";
import type { Land } from "../../features/lands/landApi";

interface LandListProps {
  lands: Land[]; 
  isLoading: boolean;
  selectedLandId: number | null;
  onSelectLand: (id: number) => void;
  currentUserId?: number; 
}

const LandList: React.FC<LandListProps> = ({
  lands,
  isLoading,
  selectedLandId,
  onSelectLand,
  currentUserId,
}) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full">
      
      {/* SECTION TITLE */}
      <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
            <Map size={18} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Available Listings</h3>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
              {lands.length} Properties Found
            </p>
          </div>
        </div>
      </div>

      {/* LAND ITEMS LIST */}
      <div className="overflow-y-auto custom-scrollbar" style={{ maxHeight: '600px' }}>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-4">
            <Loader2 className="animate-spin text-blue-500" size={32} />
            <p className="text-sm font-medium">Opening marketplace records...</p>
          </div>
        ) : lands.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3">
            <div className="p-4 bg-slate-50 rounded-full">
              <Inbox size={40} className="opacity-20" />
            </div>
            <p className="font-bold text-slate-600">No Land for Sale</p>
            <p className="text-xs max-w-[200px] text-center">
              There are currently no verified properties listed in this area.
            </p>
          </div>
        ) : (
          <div className="p-4 grid grid-cols-1 gap-4">
            {lands.map((land) => (
              <LandCard
                key={land.id}
                land={land}
                isSelected={selectedLandId === land.id}
                isMine={land.ownerId === currentUserId}
                onSelect={() => onSelectLand(land.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LandList;