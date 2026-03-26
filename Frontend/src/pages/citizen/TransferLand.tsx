import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useInitiateTransferMutation } from "../../features/transfers/transferApi";
import { useGetLandsQuery } from "../../features/lands/landApi";
import { useAppSelector } from "../../app/hooks";
import { 
  ArrowRightLeft, 
  Search, 
  CreditCard, 
  User as UserIcon, 
  MapPin, 
  AlertCircle,
  CheckCircle2,
  Landmark,
  Wallet
} from "lucide-react";

const TransferLand: React.FC = () => {
  const navigate = useNavigate();
  
  // Reading 'user' here clears the TS(6133) error
  const { user } = useAppSelector((state) => state.auth);
  
  // APIs
  const { data: lands, isLoading: landsLoading } = useGetLandsQuery();
  const [initiateTransfer, { isLoading: isSubmitting, isSuccess }] = useInitiateTransferMutation();

  // Form State
  const [selectedLandId, setSelectedLandId] = useState<number | null>(null);
  const [sellerId, setSellerId] = useState(""); 
  const [receiptCode, setReceiptCode] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Safety check using the 'user' object
    if (user && parseInt(sellerId) === user.id) {
      alert("System Error: You cannot transfer a property to yourself.");
      return;
    }

    if (!selectedLandId || !sellerId || !receiptCode) return;

    try {
      await initiateTransfer({
        landId: selectedLandId,
        sellerId: parseInt(sellerId),
        mpesaReceiptCode: receiptCode.toUpperCase(),
      }).unwrap();
      
      setTimeout(() => navigate("/citizen/dashboard"), 3000);
    } catch (err) {
      console.error("Transfer failed:", err);
    }
  };

  if (isSuccess) return <SuccessState />;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Dynamic Header using Auth Data */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Property Transfer
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Initiating request as: <span className="text-blue-600 font-bold">{user?.fullName || "Verified Citizen"}</span>
          </p>
        </div>
        
        {/* Wallet Display */}
        <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
            <Wallet size={16} className="text-slate-400" />
            <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Active Wallet</span>
                <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
                    {user?.walletAddress ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}` : "Not Connected"}
                </span>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Property Selection List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-50 dark:border-slate-900 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/20">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
                <Landmark size={16} className="text-blue-600" /> Global Land Registry
              </h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
                <input placeholder="Filter LR..." className="pl-8 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] outline-none focus:ring-1 ring-blue-500" />
              </div>
            </div>

            <div className="p-2 max-h-[450px] overflow-y-auto custom-scrollbar">
              {landsLoading ? (
                <div className="p-20 text-center space-y-3">
                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Accessing Ledger...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-1">
                  {lands?.map((land) => (
                    <button
                      key={land.id}
                      onClick={() => setSelectedLandId(land.id)}
                      className={`flex items-center justify-between p-4 rounded-xl transition-all group ${
                        selectedLandId === land.id 
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
                        : "hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-4 text-left">
                        <div className={`p-2.5 rounded-xl transition-colors ${selectedLandId === land.id ? "bg-white/20" : "bg-slate-100 dark:bg-slate-800 group-hover:bg-white dark:group-hover:bg-slate-700"}`}>
                          <MapPin size={18} />
                        </div>
                        <div>
                          <p className="font-mono text-sm font-bold tracking-tight">{land.lrNumber}</p>
                          <p className={`text-[10px] font-bold uppercase tracking-tighter mt-0.5 ${selectedLandId === land.id ? "text-blue-100" : "text-slate-400"}`}>
                            {land.county} • {land.landType}
                          </p>
                        </div>
                      </div>
                      {selectedLandId === land.id ? <CheckCircle2 size={20} /> : <div className="w-5 h-5 rounded-full border-2 border-slate-200 dark:border-slate-800" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Transfer Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none space-y-6">
            <div className="flex items-center gap-3 pb-2">
                <div className="p-2 bg-blue-600 rounded-lg text-white">
                    <ArrowRightLeft size={18} />
                </div>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white">Transaction Details</h3>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1 tracking-widest">Current Owner ID</label>
              <div className="relative group">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={16} />
                <input 
                  type="number"
                  placeholder="e.g. 402"
                  required
                  value={sellerId}
                  onChange={(e) => setSellerId(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-transparent rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1 tracking-widest">M-Pesa Transaction Code</label>
              <div className="relative group">
                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={16} />
                <input 
                  type="text"
                  placeholder="Enter Code (e.g. RBS7...)"
                  required
                  value={receiptCode}
                  onChange={(e) => setReceiptCode(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-transparent rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all uppercase"
                />
              </div>
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-2xl">
               <div className="flex gap-3">
                  <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-[9px] font-bold text-amber-700 dark:text-amber-500 leading-relaxed uppercase tracking-tighter">
                    Ensure the M-Pesa code matches the payment made to the Ministry of Lands escrow.
                  </p>
               </div>
            </div>

            <button 
              type="submit"
              disabled={isSubmitting || !selectedLandId}
              className="w-full bg-slate-900 dark:bg-blue-600 hover:bg-black dark:hover:bg-blue-700 text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] transition-all disabled:opacity-50 shadow-lg active:scale-95"
            >
              {isSubmitting ? "Processing..." : "Confirm Transfer Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SuccessState = () => (
  <div className="flex flex-col items-center justify-center py-24 text-center animate-in zoom-in-95 duration-500">
    <div className="w-24 h-24 bg-emerald-500 text-white rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-500/30 mb-8 rotate-12">
      <CheckCircle2 size={48} />
    </div>
    <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter italic">REQUEST LOGGED</h2>
    <p className="text-slate-500 font-medium max-w-md mt-3">
      The transfer request has been broadcasted to the Land Officer queue. You will receive a notification once the ledger is updated.
    </p>
  </div>
);

export default TransferLand;