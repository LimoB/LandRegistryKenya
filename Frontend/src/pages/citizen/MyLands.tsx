import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useGetLandsQuery,
  useListLandForSaleMutation,
  useRemoveFromSaleMutation,
  type Land,
} from "../../features/lands/landApi";

import { useAppSelector } from "../../app/hooks";

import {
  Map as MapIcon,
  Search,
  ChevronRight,
  History as HistoryIcon,
  ArrowRightLeft,
  CheckCircle2,
  XCircle,
} from "lucide-react";

/* ================= FILTER TYPE ================= */
type FilterType = "all" | "verified" | "pending" | "rejected";

const MyLands: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  const { data: lands = [], isLoading, isError } = useGetLandsQuery();

  const [listLandForSale] = useListLandForSaleMutation();
  const [removeFromSale] = useRemoveFromSaleMutation();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [priceMap, setPriceMap] = useState<Record<number, string>>({});

  /* ================= FILTER LOGIC ================= */
  const myLands = useMemo(() => {
    if (!user) return [];

    return lands
      .filter((land) => land.ownerId === user.id)
      .filter((land) => {
        if (filter === "all") return true;
        return land.verificationStatus === filter;
      })
      .filter((land) =>
        land.lrNumber.toLowerCase().includes(search.toLowerCase())
      );
  }, [lands, user, filter, search]);

  /* ================= LIST / UNLIST ================= */
  const toggleForSale = async (land: Land) => {
    try {
      if (land.isForSale) {
        await removeFromSale(land.id).unwrap();
      } else {
        const price = Number(priceMap[land.id] || land.priceInKsh || 0);

        if (!price || price <= 0) {
          alert("Please set a valid price first");
          return;
        }

        await listLandForSale({
          id: land.id,
          priceInKsh: price,
        }).unwrap();
      }
    } catch (err) {
      console.error("Error updating sale status:", err);
    }
  };

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Land Portfolio</h1>
          <p className="text-sm text-slate-500">
            Manage ownership and marketplace listings
          </p>
        </div>

        {/* SEARCH + FILTER */}
        <div className="flex gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search LR number..."
              className="pl-9 pr-3 py-2 text-xs border rounded-lg bg-white dark:bg-slate-900"
            />
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as FilterType)}
            className="px-3 py-2 text-xs border rounded-lg bg-white dark:bg-slate-900"
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
        <div className="text-red-500 text-sm font-semibold">
          Failed to load your lands
        </div>
      )}

      {/* LOADING */}
      {isLoading ? (
        <LoadingState />
      ) : myLands.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-3">
          {myLands.map((land) => (
            <div
              key={land.id}
              className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-white dark:bg-slate-900 rounded-xl border"
            >
              {/* LEFT INFO */}
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <MapIcon size={18} />
                </div>
                <div>
                  <p className="font-mono font-semibold text-sm">
                    {land.lrNumber}
                  </p>
                  <p className="text-xs text-slate-500">
                    {land.county} | {land.sizeInAcres} acres
                  </p>
                  {land.isForSale && (
                    <p className="text-xs text-green-600 font-bold">
                      KES {land.priceInKsh?.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>

              {/* STATUS INDICATORS */}
              <div className="flex items-center gap-2">
                {land.isForSale ? (
                  <span className="flex items-center gap-1 text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                    <CheckCircle2 size={12} />
                    For Sale
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-full">
                    <XCircle size={12} />
                    Not Listed
                  </span>
                )}
                <span className="text-xs px-2 py-1 bg-slate-100 rounded-full capitalize">
                  {land.verificationStatus}
                </span>
              </div>

              {/* ACTIONS */}
              <div className="flex items-center gap-2">
                {/* PRICE INPUT */}
                {!land.isForSale && land.verificationStatus === "verified" && (
                  <input
                    type="number"
                    placeholder="Set price"
                    className="w-24 px-2 py-1 text-xs border rounded"
                    onChange={(e) =>
                      setPriceMap({
                        ...priceMap,
                        [land.id]: e.target.value,
                      })
                    }
                  />
                )}

                {/* LIST / UNLIST BUTTON */}
                {land.verificationStatus === "verified" && (
                  <button
                    onClick={() => toggleForSale(land)}
                    className={`px-3 py-1 text-xs rounded font-bold transition-colors ${
                      land.isForSale
                        ? "bg-red-500 text-white hover:bg-red-600"
                        : "bg-green-600 text-white hover:bg-green-700"
                    }`}
                  >
                    {land.isForSale ? "Unlist" : "List for Sale"}
                  </button>
                )}

                {/* TRANSFER ACTION */}
                {land.verificationStatus === "verified" && (
                  <button
                    onClick={() =>
                      navigate(`/citizen/transfer?landId=${land.id}`)
                    }
                    title="Transfer Land"
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <ArrowRightLeft size={16} />
                  </button>
                )}

                {/* VIEW DETAILS ACTION */}
                <button
                  onClick={() =>
                    navigate(`/citizen/lands/${land.lrNumber}`)
                  }
                  title="View Detailed Record"
                  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ================= LOADING COMPONENT ================= */
const LoadingState = () => (
  <div className="flex flex-col items-center py-16">
    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    <p className="text-xs text-slate-500 mt-3">Loading your lands...</p>
  </div>
);

/* ================= EMPTY COMPONENT ================= */
const EmptyState = () => (
  <div className="flex flex-col items-center py-20 text-slate-500">
    <HistoryIcon size={28} className="mb-2 opacity-20" />
    <p className="font-semibold">No land records found</p>
    <p className="text-xs">Register your first land to get started</p>
  </div>
);

export default MyLands;