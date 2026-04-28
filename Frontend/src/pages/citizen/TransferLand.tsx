import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Wallet, CheckCircle2, ArrowRight, Info, Store, Search } from "lucide-react";

import { useCreateTransferMutation } from "../../features/transfers/transferApi";
import { useGetLandsQuery } from "../../features/lands/landApi";
import { useAppSelector } from "../../app/hooks";

import LandList from "./LandList";
import TransferActionPanel from "./TransferActionPanel";

const TransferLand: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  const { data: lands = [], isLoading: landsLoading } = useGetLandsQuery();
  const [createTransfer, { isLoading, isSuccess, isError, error, data }] =
    useCreateTransferMutation();

  const [selectedLandId, setSelectedLandId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  /* ============================================================
     FILTER AVAILABLE LANDS
  ============================================================ */
  const availableLands = useMemo(() => {
    return lands.filter((land) => {
      const isForSale = land.isForSale;
      const isVerified = land.verificationStatus === "verified";
      const matchesSearch = land.lrNumber
        .toLowerCase()
        .includes(search.toLowerCase());

      return isForSale && isVerified && matchesSearch;
    });
  }, [lands, search]);

  /* ============================================================
     SELECTED LAND
  ============================================================ */
  const selectedLand = useMemo(
    () => lands.find((l) => l.id === selectedLandId),
    [selectedLandId, lands]
  );

  const isOwnLandSelected = !!(
    selectedLand && selectedLand.ownerId === user?.id
  );

  /* ============================================================
     HANDLE SUBMIT
  ============================================================ */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("[UI] Attempting transfer...");

    if (!selectedLandId) {
      console.warn("[Validation] No land selected");
      return;
    }

    if (isOwnLandSelected) {
      console.warn("[Validation] User trying to buy own land");
      return;
    }

    if (isLoading) {
      console.warn("[UI] Request already in progress");
      return;
    }

    try {
      const result = await createTransfer({ landId: selectedLandId }).unwrap();

      console.log("[Success] Transfer created:", result);

      // 🚀 Navigate immediately (NO setTimeout)
      navigate(`/citizen/transfer/status/${result.data.id}`);
    } catch (err) {
      console.error("[Error] Transfer failed:", err);
    }
  };

  /* ============================================================
     SIDE EFFECT: SUCCESS LOGGING
  ============================================================ */
  useEffect(() => {
    if (isSuccess) {
      console.log("[State] Transfer mutation success", data);
    }
  }, [isSuccess, data]);

  /* ============================================================
     SUCCESS STATE (OPTIONAL UI)
  ============================================================ */
  if (isSuccess && data?.data?.id) {
    return (
      <SuccessState
        landNumber={selectedLand?.lrNumber}
        onView={() => navigate(`/citizen/transfer/status/${data.data.id}`)}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-100">
            <Store size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Land Marketplace
            </h1>
            <p className="text-slate-500 font-medium">
              Browse and buy verified land records
            </p>
          </div>
        </div>

        {/* WALLET */}
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 mr-1">
            Your Connected Wallet
          </span>
          <div className="flex items-center gap-3 px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 shadow-inner">
            <Wallet size={18} className="text-blue-600" />
            <span className="text-sm font-mono font-bold text-slate-700">
              {user?.walletAddress
                ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`
                : "Not Connected"}
            </span>
          </div>
        </div>
      </header>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT */}
        <div className="lg:col-span-8 space-y-6">
          <div className="relative group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by Title Number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none text-lg"
            />
          </div>

          <LandList
            lands={availableLands}
            isLoading={landsLoading}
            selectedLandId={selectedLandId}
            onSelectLand={setSelectedLandId}
            currentUserId={user?.id}
          />
        </div>

        {/* RIGHT */}
        <div className="lg:col-span-4">
          <div className="sticky top-8 space-y-4">
            <TransferActionPanel
              selectedLand={selectedLand}
              onSubmit={handleSubmit}
              isLoading={isLoading}
              isError={isError}
              error={error}
              isOwnLandSelected={isOwnLandSelected}
            />

            {isOwnLandSelected && (
              <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl flex gap-4">
                <Info className="text-amber-500 shrink-0" size={22} />
                <div>
                  <p className="font-bold text-amber-800 text-sm">
                    Action Restricted
                  </p>
                  <p className="text-xs text-amber-700 mt-1">
                    You cannot buy your own land.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ================= SUCCESS UI ================= */
const SuccessState = ({
  landNumber,
  onView,
}: {
  landNumber?: string;
  onView: () => void;
}) => (
  <div className="flex flex-col items-center justify-center py-32 space-y-8">
    <CheckCircle2 size={80} className="text-green-500" />
    <h2 className="text-3xl font-bold">Request Sent</h2>
    <p>Land {landNumber} request submitted.</p>
    <button onClick={onView} className="px-6 py-3 bg-black text-white rounded-xl">
      View Status <ArrowRight size={16} />
    </button>
  </div>
);

export default TransferLand;