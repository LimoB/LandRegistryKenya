import React from "react";
import { Search, Landmark } from "lucide-react";
import LandCard from "./LandCard";
// Import the actual Land type from your API feature
// Import the actual Land type from your API feature
import type { Land } from "../../features/lands/landApi";

interface LandListProps {
  lands: Land[]; 
  isLoading: boolean;
  search: string;
  onSearchChange: (val: string) => void;
  selectedLandId: number | null;
  onSelectLand: (id: number) => void;
  // Changed to number to match the API's ownerId and user.id
  currentUserId?: number; 
}

const LandList: React.FC<LandListProps> = ({
  lands,
  isLoading,
  search,
  onSearchChange,
  selectedLandId,
  onSelectLand,
  currentUserId,
}) => {
  return (
    <div className="border rounded-2xl bg-white dark:bg-slate-950">
      
      {/* HEADER & SEARCH */}
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100">
          <Landmark size={16} />
          Available Lands
        </h3>
        <div className="relative">
          <Search size={12} className="absolute left-2 top-2.5 text-slate-400" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search LR number..."
            className="pl-7 pr-3 py-1.5 text-xs border rounded-lg bg-transparent focus:ring-1 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      {/* LAND ITEMS LIST */}
      <div className="max-h-[450px] overflow-y-auto p-2">
        {isLoading ? (
          <p className="p-10 text-center text-sm text-slate-500">
            Loading marketplace...
          </p>
        ) : lands.length === 0 ? (
          <p className="p-10 text-center text-sm text-slate-500">
            No lands available for sale
          </p>
        ) : (
          lands.map((land) => (
            <LandCard
              key={land.id}
              land={land}
              isSelected={selectedLandId === land.id}
              // This comparison now works because both are numbers
              isMine={land.ownerId === currentUserId}
              onSelect={onSelectLand}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default LandList;