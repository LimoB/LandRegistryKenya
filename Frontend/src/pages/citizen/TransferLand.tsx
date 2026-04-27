import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Wallet, CheckCircle2, ArrowRight, Info } from "lucide-react";

import { useCreateTransferMutation } from "../../features/transfers/transferApi";
import { useGetLandsQuery } from "../../features/lands/landApi";
import { useAppSelector } from "../../app/hooks";

import LandList from "./LandList";
import TransferActionPanel from "./TransferActionPanel";

const TransferLand: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  
  // 1. Fetching all available land records
  const { data: lands = [], isLoading: landsLoading } = useGetLandsQuery();
  const [createTransfer, { isLoading, isSuccess, isError, error }] = useCreateTransferMutation();

  const [selectedLandId, setSelectedLandId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  // 2. Logic: Filter lands that are actually available for purchase
  const availableLands = useMemo(() => {
    return lands.filter((land) => {
      const isForSale = land.isForSale;
      const isVerified = land.verificationStatus === "verified";
      const matchesSearch = land.lrNumber.toLowerCase().includes(search.toLowerCase());
      
      // We show everything for sale, but the UI will handle "Buy" vs "Own" states
      return isForSale && isVerified && matchesSearch;
    });
  }, [lands, search]);

  const selectedLand = useMemo(() => 
    lands.find((l) => l.id === selectedLandId), 
  [selectedLandId, lands]);

  // 3. Security Check: Prevent a user from buying their own land
  const isOwnLandSelected = !!(selectedLand && selectedLand.ownerId === user?.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLandId || isLoading || isOwnLandSelected) return;

    try {
      // Result contains the new TransferRequest object from your backend
      const result = await createTransfer({ landId: selectedLandId }).unwrap();
      
      // Note: result.data.id corresponds to the TransferRequest ID, not the Land ID
      setTimeout(() => {
        navigate(`/citizen/transfer/status/${result.data.id}`);
      }, 1500);
    } catch (err) {
      console.error("Transfer initiation failed:", err);
    }
  };

  // SUCCESS STATE: Clean visual feedback after successful POST
  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-6 animate-in zoom-in duration-500">
        <div className="relative">
          <div className="absolute inset-0 bg-green-200 blur-2xl rounded-full opacity-50 animate-pulse" />
          <CheckCircle2 size={80} className="relative text-green-500" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black text-slate-900">Request Sent</h2>
          <p className="text-slate-500 max-w-xs mx-auto">
            Your request for <span className="font-bold text-slate-900">{selectedLand?.lrNumber}</span> has been logged. 
            Redirecting to status page...
          </p>
        </div>
        <button 
          onClick={() => navigate("/citizen/my-requests")}
          className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-indigo-600 transition-all"
        >
          View All Requests <ArrowRight size={18} />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Land Marketplace</h1>
          <p className="text-sm text-slate-500 font-medium">Verified titles currently listed for transfer</p>
        </div>
        
        <div className="flex items-center gap-3 px-4 py-2 border border-slate-200 rounded-2xl bg-white shadow-sm">
          <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
            <Wallet size={16} />
          </div>
          <span className="text-xs font-mono font-bold text-slate-600">
            {user?.walletAddress 
              ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}` 
              : "No Wallet Linked"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT: MARKETPLACE LISTING */}
        <div className="lg:col-span-2">
          <LandList
            lands={availableLands}
            isLoading={landsLoading}
            search={search}
            onSearchChange={setSearch}
            selectedLandId={selectedLandId}
            onSelectLand={setSelectedLandId}
            currentUserId={user?.id}
          />
        </div>

        {/* RIGHT: ACTION PANEL */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            <TransferActionPanel
              onSubmit={handleSubmit}
              isLoading={isLoading}
              isError={isError}
              error={error}
              isOwnLandSelected={isOwnLandSelected}
              isDisabled={!selectedLandId || isLoading || isOwnLandSelected}
            />
            
            {/* Contextual Warning for Sellers */}
            {isOwnLandSelected && (
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex gap-3">
                <Info className="text-amber-500 shrink-0" size={20} />
                <p className="text-xs text-amber-700 leading-relaxed">
                  You are the current owner of this title. You cannot initiate a purchase request for your own listed land.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransferLand;