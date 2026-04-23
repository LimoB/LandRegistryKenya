import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  useGetLandsQuery 
} from "../../features/lands/landApi";
import { 
  ArrowLeft, 
  Map, 
  ShieldCheck, 
  Database, 
  User, 
  ExternalLink, 
  History,
  Calendar
} from "lucide-react";

const LandDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: lands, isLoading } = useGetLandsQuery();

  // Find the specific land record
  const land = lands?.find((l) => l.id === Number(id));

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Fetching Dossier...</p>
      </div>
    );
  }

  if (!land) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-black text-slate-900 dark:text-white">RECORD NOT FOUND</h2>
        <button onClick={() => navigate(-1)} className="mt-4 text-blue-600 font-bold uppercase text-xs">Return to Registry</button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Top Navigation */}
      <button 
        onClick={() => navigate(-1)}
        className="group flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors text-[10px] font-black uppercase tracking-widest"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Back to Registry
      </button>

      {/* 1. Header Card */}
      <div className="bg-slate-900 dark:bg-slate-950 rounded-[3rem] p-8 md:p-12 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden shadow-2xl">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-emerald-500 text-[10px] font-black px-3 py-1 rounded-full uppercase">
              {land.verificationStatus}
            </span>
            <span className="text-slate-400 font-mono text-xs italic">Deed No. {land.lrNumber}</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic">
            Title Deed Record
          </h1>
        </div>
        
        <div className="relative z-10 flex flex-col items-end gap-2">
          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">On-Chain Asset ID</p>
            <p className="text-xl font-mono font-bold text-blue-400">#{land.onChainId ?? "PENDING"}</p>
          </div>
        </div>
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 2. Primary Information (Left Column) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Geographical Data */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
              <Map className="text-blue-600" size={20} />
              <h2 className="font-black text-sm uppercase tracking-widest dark:text-white">Spatial & Legal Data</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase">County / Region</p>
                <p className="font-bold dark:text-white">{land.county}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase">Land Categorization</p>
                <p className="font-bold dark:text-white">{land.landType}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase">Spatial Dimensions</p>
                <p className="font-bold text-xl dark:text-white">{land.sizeInAcres} Acres</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase">Current Valuation</p>
                <p className="font-bold text-xl text-emerald-600">
                  KES {land.priceInKsh ? land.priceInKsh.toLocaleString() : "---"}
                </p>
              </div>
            </div>
          </div>

          {/* Verification Log */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
              <History className="text-blue-600" size={20} />
              <h2 className="font-black text-sm uppercase tracking-widest dark:text-white">Audit Trail</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="text-emerald-500" size={18} />
                  <div>
                    <p className="text-xs font-black dark:text-white">Ministry Verified</p>
                    <p className="text-[10px] text-slate-400 italic">Certified on Decentralized Ledger</p>
                  </div>
                </div>
                <Calendar size={14} className="text-slate-300" />
              </div>
            </div>
          </div>
        </div>

        {/* 3. Ownership & Blockchain (Right Column) */}
        <div className="space-y-8">
          
          {/* Owner Card */}
          <div className="bg-blue-600 rounded-[2.5rem] p-8 text-white space-y-6 shadow-xl shadow-blue-500/20">
            <div className="flex items-center gap-2">
              <User size={20} />
              <h2 className="font-black text-sm uppercase tracking-widest">Registered Owner</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-black text-blue-200 uppercase">Full Name</p>
                <p className="text-xl font-bold tracking-tight">{land.owner?.fullName}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-blue-200 uppercase">Wallet Address</p>
                <p className="text-[10px] font-mono break-all bg-black/20 p-3 rounded-xl mt-1">
                  {land.owner?.walletAddress}
                </p>
              </div>
            </div>
          </div>

          {/* Blockchain Metadata */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 space-y-6">
             <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
              <Database className="text-blue-600" size={20} />
              <h2 className="font-black text-sm uppercase tracking-widest dark:text-white">Digital Deed</h2>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase">IPFS Document Hash</p>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-between group cursor-pointer border border-transparent hover:border-blue-500/30 transition-all">
                  <p className="text-[10px] font-mono text-slate-500 truncate w-40">{land.ipfsDocHash}</p>
                  <ExternalLink size={14} className="text-blue-600" />
                </div>
              </div>

              <button className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-lg active:scale-95">
                Download Certified Deed
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LandDetails;