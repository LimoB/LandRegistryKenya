import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateTransferMutation } from "../../features/transfers/transferApi";
import { useGetLandsQuery } from "../../features/lands/landApi";
import { useAppSelector } from "../../app/hooks";

import {
  ArrowRightLeft,
  Search,
  MapPin,
  CheckCircle2,
  Landmark,
  Wallet,
} from "lucide-react";

/* ================================
   MAIN COMPONENT
================================ */
const TransferLand: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  const { data: lands = [], isLoading: landsLoading } = useGetLandsQuery();

  const [createTransfer, { isLoading, isSuccess, isError, error }] =
    useCreateTransferMutation();

  const [selectedLandId, setSelectedLandId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  /* ================================
     MARKETPLACE LANDS (IMPORTANT FIX)
     - show ALL lands for sale
     - NOT only owned lands
  ================================ */
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

  /* ================================
     AVOID SELF-TRANSFER (UI SAFETY)
  ================================ */
  const selectedLand = useMemo(() => {
    return lands.find((l) => l.id === selectedLandId);
  }, [selectedLandId, lands]);

  const isOwnLandSelected =
    selectedLand && selectedLand.ownerId === user?.id;

  /* ================================
     SUBMIT TRANSFER
  ================================ */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedLandId || isLoading) return;

    if (isOwnLandSelected) {
      alert("You cannot buy your own land.");
      return;
    }

    try {
      await createTransfer({
        landId: selectedLandId,
      }).unwrap();

      setSelectedLandId(null);

      setTimeout(() => {
        navigate("/citizen/my-transfers");
      }, 1200);
    } catch (err) {
      console.error("Transfer failed:", err);
    }
  };

  /* ================================
     SUCCESS STATE
  ================================ */
  if (isSuccess) return <SuccessState />;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b pb-6">

        <div>
          <h1 className="text-3xl font-black">Land Marketplace</h1>
          <p className="text-sm text-slate-500">
            Browse available land and initiate purchase requests
          </p>
        </div>

        {/* WALLET */}
        <div className="flex items-center gap-2 px-4 py-2 border rounded-xl bg-slate-50 dark:bg-slate-900">
          <Wallet size={16} />
          <span className="text-xs font-mono">
            {user?.walletAddress
              ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`
              : "No wallet connected"}
          </span>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ================================
            MARKETPLACE LIST
        ================================ */}
        <div className="lg:col-span-2">

          <div className="border rounded-2xl bg-white dark:bg-slate-950">

            {/* SEARCH */}
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2">
                <Landmark size={16} />
                Available Lands
              </h3>

              <div className="relative">
                <Search size={12} className="absolute left-2 top-2 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search LR number..."
                  className="pl-7 pr-3 py-1 text-xs border rounded-lg"
                />
              </div>
            </div>

            {/* LIST */}
            <div className="max-h-[450px] overflow-y-auto p-2">

              {landsLoading ? (
                <p className="p-10 text-center text-sm text-slate-500">
                  Loading marketplace...
                </p>
              ) : availableLands.length === 0 ? (
                <p className="p-10 text-center text-sm text-slate-500">
                  No lands available for sale
                </p>
              ) : (
                availableLands.map((land) => {
                  const isMine = land.ownerId === user?.id;

                  return (
                    <button
                      key={land.id}
                      type="button"
                      disabled={isMine}
                      onClick={() => setSelectedLandId(land.id)}
                      className={`w-full flex items-center justify-between p-4 rounded-xl transition ${
                        selectedLandId === land.id
                          ? "bg-blue-600 text-white"
                          : isMine
                          ? "opacity-40 cursor-not-allowed"
                          : "hover:bg-slate-100 dark:hover:bg-slate-900"
                      }`}
                    >

                      <div className="flex items-center gap-3">
                        <MapPin size={18} />
                        <div className="text-left">
                          <p className="font-bold">{land.lrNumber}</p>
                          <p className="text-xs opacity-70">
                            {land.county} • {land.landType}
                          </p>
                        </div>
                      </div>

                      {selectedLandId === land.id && <CheckCircle2 />}

                    </button>
                  );
                })
              )}

            </div>
          </div>
        </div>

        {/* ================================
            ACTION PANEL
        ================================ */}
        <form onSubmit={handleSubmit} className="space-y-6">

          <div className="border rounded-2xl p-6 bg-white dark:bg-slate-950 space-y-6">

            <h3 className="font-bold flex items-center gap-2">
              <ArrowRightLeft size={18} />
              Purchase Request
            </h3>

            <div className="p-3 bg-yellow-50 text-xs rounded-xl">
              This will create a transfer request pending officer approval.
            </div>

            {/* SELF TRANSFER WARNING */}
            {isOwnLandSelected && (
              <p className="text-red-500 text-xs">
                You cannot initiate transfer on your own land.
              </p>
            )}

            {/* ERROR */}
            {isError && (
              <p className="text-red-500 text-xs">
                {typeof error === "object" && error !== null && "data" in error
                  ? (error.data as { error?: string }).error || "Transfer failed"
                  : "Transfer failed"}
              </p>
            )}

            <button
              type="submit"
              disabled={!selectedLandId || isLoading || isOwnLandSelected}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold disabled:opacity-50"
            >
              {isLoading ? "Creating request..." : "Initiate Purchase"}
            </button>

          </div>

        </form>

      </div>
    </div>
  );
};

/* ================================
   SUCCESS STATE
================================ */
const SuccessState = () => (
  <div className="text-center py-20 space-y-3">
    <CheckCircle2 size={48} className="mx-auto text-green-500" />
    <h2 className="text-2xl font-bold">Request Submitted</h2>
    <p className="text-slate-500">
      Your purchase request is now pending officer approval.
    </p>
  </div>
);

export default TransferLand;