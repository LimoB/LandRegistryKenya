import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetLandsQuery, type Land } from "../../features/lands/landApi";
import { useAppSelector } from "../../app/hooks";
import {
  Map as MapIcon,
  Search,
  ChevronRight,
  FileText,
  History as HistoryIcon,
  ArrowRightLeft,
} from "lucide-react";

const MyLands: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const { data: allLands, isLoading, isError } = useGetLandsQuery();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "verified" | "pending" | "rejected">("all");

  /* ================================
     FILTER + SEARCH LOGIC
  ================================ */
  const myLands = useMemo(() => {
    if (!allLands || !user) return [];

    let filtered = allLands.filter((land) => land.ownerId === user.id);

    if (filter !== "all") {
      filtered = filtered.filter((l) => l.verificationStatus === filter);
    }

    if (search.trim()) {
      filtered = filtered.filter((l) =>
        l.lrNumber.toLowerCase().includes(search.toLowerCase())
      );
    }

    return filtered;
  }, [allLands, user, search, filter]);

  if (isLoading) return <LoadingState />;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            My Land Portfolio
          </h1>
          <p className="text-sm text-slate-500">
            {myLands.length} properties on record
          </p>
        </div>

        {/* SEARCH + FILTER */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={14}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search LR Number..."
              className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border rounded-xl text-xs w-48 lg:w-64 outline-none"
            />
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as "all" | "verified" | "pending" | "rejected")}
            className="px-3 py-2 text-xs border rounded-xl bg-slate-50 dark:bg-slate-900"
          >
            <option value="all">All</option>
            <option value="verified">Verified</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* ERROR */}
      {isError && (
        <div className="text-red-500 text-sm font-bold">
          Failed to load lands
        </div>
      )}

      {/* TABLE */}
      <div className="min-w-full">
        <table className="w-full border-separate border-spacing-y-3">
          <thead>
            <tr className="text-slate-400 text-[10px] font-black uppercase">
              <th className="px-6 py-2 text-left">Property</th>
              <th className="px-6 py-2 text-left">Type</th>
              <th className="px-6 py-2 text-left">Size</th>
              <th className="px-6 py-2 text-left">Status</th>
              <th className="px-6 py-2 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {myLands.length > 0 ? (
              myLands.map((land) => (
                <LandRow key={land.id} land={land} navigate={navigate} />
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

/* ================= COMPONENTS ================= */

const LandRow = ({
  land,
  navigate,
}: {
  land: Land;
  navigate: ReturnType<typeof useNavigate>;
}) => {
  const isVerified = land.verificationStatus === "verified";

  return (
    <tr className="group bg-white dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all">
      <td className="px-6 py-5 rounded-l-2xl">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl">
            <MapIcon size={20} />
          </div>
          <div>
            <p className="font-mono text-sm font-bold">{land.lrNumber}</p>
            <p className="text-xs text-slate-500">
              {land.county}, {land.constituency}
            </p>
          </div>
        </div>
      </td>

      <td className="px-6 py-5 capitalize">{land.landType}</td>

      <td className="px-6 py-5">
        {land.sizeInAcres} acres
      </td>

      <td className="px-6 py-5">
        <StatusBadge status={land.verificationStatus} />
      </td>

      <td className="px-6 py-5 text-right rounded-r-2xl">
        <div className="flex justify-end gap-2">
          {/* VIEW DOC */}
          <button
            title="View Document"
            className="p-2 text-slate-400 hover:text-blue-600"
          >
            <FileText size={18} />
          </button>

          {/* TRANSFER */}
          {isVerified && (
            <button
              onClick={() =>
                navigate(`/citizen/transfer?landId=${land.id}`)
              }
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
              title="Transfer Land"
            >
              <ArrowRightLeft size={18} />
            </button>
          )}

          {/* DETAILS */}
          <button
            onClick={() =>
              navigate(`/citizen/lands/${land.id}`)
            }
            className="p-2 text-slate-400 hover:text-black dark:hover:text-white"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </td>
    </tr>
  );
};

const StatusBadge = ({
  status,
}: {
  status: "verified" | "pending" | "rejected";
}) => {
  const styles = {
    verified: "bg-green-100 text-green-600",
    pending: "bg-yellow-100 text-yellow-600",
    rejected: "bg-red-100 text-red-600",
  };

  return (
    <span className={`px-2 py-1 rounded text-xs font-bold ${styles[status]}`}>
      {status}
    </span>
  );
};

const LoadingState = () => (
  <div className="flex flex-col items-center py-20">
    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    <p className="text-xs mt-3">Loading lands...</p>
  </div>
);

const EmptyState = () => (
  <tr>
    <td colSpan={5} className="py-20 text-center">
      <div className="flex flex-col items-center">
        <HistoryIcon size={30} className="text-slate-300 mb-3" />
        <p className="font-bold">No lands found</p>
        <p className="text-xs text-slate-400">
          You haven't registered any land yet
        </p>
      </div>
    </td>
  </tr>
);

export default MyLands;