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
  Eye,
  Tag,
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

  /* ================= SEARCH & FILTER LOGIC ================= */
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

  /* ================= SELL / STOP SELLING ================= */
  const toggleForSale = async (land: Land) => {
    try {
      if (land.isForSale) {
        await removeFromSale(land.id).unwrap();
      } else {
        const price = Number(priceMap[land.id] || land.priceInKsh || 0);

        if (!price || price <= 0) {
          alert("Please enter a price before listing.");
          return;
        }

        await listLandForSale({
          id: land.id,
          priceInKsh: price,
        }).unwrap();
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-4">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">My Lands</h1>
          <p className="text-slate-500 mt-1">
            Manage your land records and marketplace listings
          </p>
        </div>

        {/* SEARCH AND FILTER TOOLS */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-grow md:flex-grow-0">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by LR Number..."
              className="w-full md:w-64 pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as FilterType)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white dark:bg-slate-900 font-medium focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
          >
            <option value="all">Show All Status</option>
            <option value="verified">Verified Only</option>
            <option value="pending">Pending Review</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* ERROR MESSAGE */}
      {isError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3">
          <XCircle size={20} />
          <span className="font-medium">Could not load land data. Please try again later.</span>
        </div>
      )}

      {/* MAIN CONTENT */}
      {isLoading ? (
        <LoadingState />
      ) : myLands.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4">
          {myLands.map((land) => (
            <div
              key={land.id}
              className="group flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all"
            >
              {/* LAND INFORMATION */}
              <div className="flex items-start gap-5">
                <div className="p-4 bg-blue-100 text-blue-700 rounded-2xl">
                  <MapIcon size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-mono text-slate-800 dark:text-slate-100">
                    {land.lrNumber}
                  </h3>
                  <p className="text-slate-500 font-medium">
                    {land.county} • {land.sizeInAcres} Acres
                  </p>
                  {land.isForSale && (
                    <div className="mt-2 inline-flex items-center gap-1.5 text-green-600 font-bold bg-green-50 px-3 py-1 rounded-lg">
                      <Tag size={14} />
                      KES {land.priceInKsh?.toLocaleString()}
                    </div>
                  )}
                </div>
              </div>

              {/* STATUS BADGES */}
              <div className="flex flex-wrap gap-3">
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                    land.isForSale
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {land.isForSale ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                  {land.isForSale ? "Listed for Sale" : "Private"}
                </div>

                <div
                  className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                    land.verificationStatus === "verified"
                      ? "bg-blue-100 text-blue-700"
                      : land.verificationStatus === "pending"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {land.verificationStatus}
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex flex-wrap items-center gap-3 pt-4 lg:pt-0 border-t lg:border-none">
                {/* SET PRICE INPUT */}
                {!land.isForSale && land.verificationStatus === "verified" && (
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 mb-1 ml-1">PRICE (KES)</span>
                    <input
                      type="number"
                      placeholder="Enter price..."
                      className="w-32 px-3 py-2 text-sm border rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                      onChange={(e) =>
                        setPriceMap({ ...priceMap, [land.id]: e.target.value })
                      }
                    />
                  </div>
                )}

                {/* LISTING BUTTON */}
                {land.verificationStatus === "verified" && (
                  <button
                    onClick={() => toggleForSale(land)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm ${
                      land.isForSale
                        ? "bg-white border-2 border-red-500 text-red-600 hover:bg-red-50"
                        : "bg-green-600 text-white hover:bg-green-700 hover:shadow-green-200"
                    }`}
                  >
                    {land.isForSale ? "Stop Selling" : "List for Sale"}
                  </button>
                )}

                {/* TRANSFER BUTTON */}
                {land.verificationStatus === "verified" && (
                  <button
                    onClick={() => navigate(`/citizen/transfer?landId=${land.id}`)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl font-bold text-sm transition-all"
                  >
                    <ArrowRightLeft size={16} />
                    <span>Transfer</span>
                  </button>
                )}

                {/* VIEW DETAILS BUTTON */}
                <button
                  onClick={() => navigate(`/citizen/lands/${land.lrNumber}`)}
                  className="flex items-center gap-2 px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-bold text-sm transition-all"
                >
                  <Eye size={18} />
                  <span>View Details</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ================= LOADING STATE ================= */
const LoadingState = () => (
  <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-dashed border-slate-300">
    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    <h2 className="mt-4 font-bold text-slate-700">Loading your property...</h2>
    <p className="text-sm text-slate-400">This will only take a moment.</p>
  </div>
);

/* ================= EMPTY STATE ================= */
const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-24 bg-slate-50 rounded-3xl border border-dashed border-slate-300 text-slate-400">
    <div className="p-5 bg-white rounded-full shadow-sm mb-4">
      <HistoryIcon size={40} className="opacity-40" />
    </div>
    <h2 className="text-xl font-bold text-slate-700">No lands found</h2>
    <p className="max-w-xs text-center mt-2">
      You haven't registered any land yet or no records match your search.
    </p>
    <button 
      onClick={() => window.location.href = '/citizen/register'} 
      className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all"
    >
      Register New Land
    </button>
  </div>
);

export default MyLands;