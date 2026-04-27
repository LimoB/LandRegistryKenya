import React, { useMemo, useState } from "react";
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
  const [createTransfer, { isLoading, isSuccess, isError, error }] = useCreateTransferMutation();

  const [selectedLandId, setSelectedLandId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const availableLands = useMemo(() => {
    return lands.filter((land) => {
      const isForSale = land.isForSale;
      const isVerified = land.verificationStatus === "verified";
      const matchesSearch = land.lrNumber.toLowerCase().includes(search.toLowerCase());
      return isForSale && isVerified && matchesSearch;
    });
  }, [lands, search]);

  const selectedLand = useMemo(() => 
    lands.find((l) => l.id === selectedLandId), 
  [selectedLandId, lands]);

  const isOwnLandSelected = !!(selectedLand && selectedLand.ownerId === user?.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLandId || isLoading || isOwnLandSelected) return;

    try {
      const result = await createTransfer({ landId: selectedLandId }).unwrap();
      setTimeout(() => {
        navigate(`/citizen/transfer/status/${result.data.id}`);
      }, 1500);
    } catch (err) {
      console.error("Purchase failed:", err);
    }
  };

  if (isSuccess) return <SuccessState landNumber={selectedLand?.lrNumber} onView={() => navigate("/citizen/my-requests")} />;

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-8 animate-in fade-in duration-500">
      
      {/* TOP BAR: MARKETPLACE TITLE & WALLET */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-100">
            <Store size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Land Marketplace</h1>
            <p className="text-slate-500 font-medium">Browse and buy verified land records</p>
          </div>
        </div>
        
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 mr-1">Your Connected Wallet</span>
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT: SEARCH & LISTING (COL-8) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
            <input 
              type="text"
              placeholder="Search by Title Number (LR Number)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all text-lg"
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

        {/* RIGHT: BUYING PANEL (COL-4) */}
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
              <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl flex gap-4 animate-in slide-in-from-top-2">
                <Info className="text-amber-500 shrink-0" size={22} />
                <div>
                  <p className="font-bold text-amber-800 text-sm">Action Restricted</p>
                  <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                    You cannot buy your own land. This property is currently listed under your portfolio.
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
const SuccessState = ({ landNumber, onView }: { landNumber?: string, onView: () => void }) => (
  <div className="flex flex-col items-center justify-center py-32 space-y-8 animate-in zoom-in duration-500">
    <div className="relative">
      <div className="absolute inset-0 bg-green-200 blur-3xl rounded-full opacity-40 animate-pulse" />
      <div className="relative bg-white p-6 rounded-full shadow-xl">
        <CheckCircle2 size={80} className="text-green-500" />
      </div>
    </div>
    <div className="text-center space-y-3">
      <h2 className="text-4xl font-black text-slate-900">Purchase Initiated!</h2>
      <p className="text-slate-500 max-w-sm mx-auto text-lg leading-relaxed">
        Your request for <span className="font-bold text-slate-900">{landNumber}</span> has been sent to the owner for approval.
      </p>
    </div>
    <button 
      onClick={onView}
      className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-blue-600 hover:scale-105 transition-all shadow-lg"
    >
      View My Requests <ArrowRight size={20} />
    </button>
  </div>
);

export default TransferLand;