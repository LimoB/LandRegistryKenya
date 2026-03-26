import React from "react";
import { useGetLandsQuery } from "../../features/lands/landApi";
import { useAppSelector } from "../../app/hooks";
import { 
  Map as MapIcon, 
  Search, 
  Filter, 
  ChevronRight, 
  FileText,
  // Fix: Renaming History to HistoryIcon to avoid conflict with browser's 'History' type
  History as HistoryIcon 
} from "lucide-react";

const MyLands: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { data: allLands, isLoading } = useGetLandsQuery();

  // Filter lands belonging to the logged-in citizen
  const myLands = allLands?.filter((land) => land.ownerId === user?.id) || [];

  if (isLoading) return <LoadingState />;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            My Land Portfolio
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Manage and track your {myLands.length} registered properties on the ledger.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              type="text" 
              placeholder="Search LR Number..." 
              className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-xs focus:ring-1 ring-blue-500 w-48 lg:w-64 outline-none transition-all"
            />
          </div>
          <button className="p-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-500 hover:text-blue-600 transition-colors">
            <Filter size={18} />
          </button>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="min-w-full">
        <table className="w-full border-separate border-spacing-y-3">
          <thead>
            <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
              <th className="px-6 py-2 text-left">Property Details</th>
              <th className="px-6 py-2 text-left">Category</th>
              <th className="px-6 py-2 text-left">Area</th>
              <th className="px-6 py-2 text-left">Status</th>
              <th className="px-6 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {myLands.length > 0 ? (
              myLands.map((land) => (
                <LandRow key={land.id} land={land} />
              ))
            ) : (
              <EmptyState />
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* --- Sub-Components --- */

const LandRow = ({ land }: { land: any }) => (
  <tr className="group bg-white dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all cursor-pointer">
    <td className="px-6 py-5 first:rounded-l-2xl border-y border-l border-transparent dark:group-hover:border-slate-800">
      <div className="flex items-center gap-4">
        <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl">
          <MapIcon size={20} />
        </div>
        <div>
          <p className="font-mono text-sm font-bold text-slate-900 dark:text-white leading-none">
            {land.lrNumber}
          </p>
          <p className="text-[11px] text-slate-500 font-bold mt-1.5 uppercase tracking-tighter">
            {land.county}, {land.constituency}
          </p>
        </div>
      </div>
    </td>

    <td className="px-6 py-5 border-y border-transparent dark:group-hover:border-slate-800">
      <span className="text-xs font-bold text-slate-600 dark:text-slate-400 capitalize bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
        {land.landType}
      </span>
    </td>

    <td className="px-6 py-5 border-y border-transparent dark:group-hover:border-slate-800">
      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
        {land.sizeInAcres} <span className="text-[10px] text-slate-400 uppercase">Acres</span>
      </p>
    </td>

    <td className="px-6 py-5 border-y border-transparent dark:group-hover:border-slate-800">
      <StatusBadge status={land.verificationStatus} />
    </td>

    <td className="px-6 py-5 text-right border-y border-r border-transparent dark:group-hover:border-slate-800 first:rounded-l-2xl last:rounded-r-2xl">
      <div className="flex items-center justify-end gap-2">
        <button 
          title="View Documents"
          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-all"
        >
          <FileText size={18} />
        </button>
        <button 
          className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-all"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </td>
  </tr>
);

const StatusBadge = ({ status }: { status: string }) => {
  const styles: any = {
    verified: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    rejected: "bg-red-500/10 text-red-600 border-red-500/20",
  };
  return (
    <span className={`px-2.5 py-1 text-[10px] font-black uppercase border rounded-lg ${styles[status]}`}>
      {status}
    </span>
  );
};

const LoadingState = () => (
  <div className="flex flex-col items-center justify-center py-20 space-y-4">
    <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Querying Ledger...</p>
  </div>
);

const EmptyState = () => (
  <tr>
    <td colSpan={5} className="py-20 text-center">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center text-slate-300 mb-4">
          <HistoryIcon size={32} />
        </div>
        <p className="text-sm font-bold text-slate-600 dark:text-slate-300">No properties found</p>
        <p className="text-xs text-slate-400 mt-1">You haven't registered any land on the blockchain yet.</p>
      </div>
    </td>
  </tr>
);

export default MyLands;