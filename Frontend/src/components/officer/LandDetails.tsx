import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetLandsQuery } from "../../features/lands/landApi";
import { 
  ArrowLeft, 
  Map, 
  ShieldCheck, 
  Database, 
  User, 
  ExternalLink, 
  History,
  FileText,
  BadgeCheck,
  Globe
} from "lucide-react";

const LandDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: lands, isLoading } = useGetLandsQuery();

  // Find the specific land record
  const land = lands?.find((l) => l.id === Number(id));

  // Reliable IPFS gateway logic
  const ipfsUrl = land?.ipfsDocHash 
    ? `https://ipfs.io/ipfs/${land.ipfsDocHash}` 
    : null;

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
      <div className="p-8 text-center h-screen flex flex-col items-center justify-center">
        <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Record Not Found</h2>
        <p className="text-xs text-slate-500 mt-2">The requested Title Deed does not exist in the digital registry.</p>
        <button onClick={() => navigate(-1)} className="mt-6 px-6 py-3 bg-slate-900 text-white rounded-xl font-black uppercase text-[10px]">Return to Registry</button>
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
          <div className="flex items-center gap-3 mb-4">
            <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border ${
              land.verificationStatus === 'verified' 
              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
              : 'bg-amber-500/20 border-amber-500 text-amber-400'
            }`}>
              {land.verificationStatus}
            </span>
            <span className="text-slate-400 font-mono text-xs font-bold uppercase">LR NO: {land.lrNumber}</span>
          </div>
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter uppercase italic leading-none">
            Registry <br /> Dossier
          </h1>
        </div>
        
        <div className="relative z-10 flex flex-col items-end gap-2">
          <div className="p-6 bg-white/5 border border-white/10 rounded-[2rem] backdrop-blur-md">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">On-Chain Asset ID</p>
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-blue-400" size={24} />
              <p className="text-3xl font-mono font-bold text-white tracking-tighter">
                #{land.onChainId ?? "UNMINTED"}
              </p>
            </div>
          </div>
        </div>
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 2. Primary Information (Left Column) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Geographical Data */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-10 space-y-8 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-6">
              <div className="flex items-center gap-3">
                <Map className="text-blue-600" size={24} />
                <h2 className="font-black text-base uppercase tracking-widest dark:text-white">Spatial Characteristics</h2>
              </div>
              <Globe className="text-slate-200" size={20} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-12">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">County / Administrative Area</p>
                <p className="text-xl font-bold dark:text-white uppercase tracking-tight">{land.county}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Land Use Classification</p>
                <p className="text-xl font-bold dark:text-white uppercase tracking-tight">{land.landType}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Registered Area</p>
                <p className="font-black text-3xl dark:text-white tracking-tighter">{land.sizeInAcres} <span className="text-sm font-bold text-slate-400 uppercase">Acres</span></p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Official Valuation</p>
                <p className="font-black text-3xl text-emerald-600 tracking-tighter">
                  KES {land.priceInKsh ? Number(land.priceInKsh).toLocaleString() : "---"}
                </p>
              </div>
            </div>
          </div>

          {/* Audit Trail */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-10 space-y-8 shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-6">
              <History className="text-blue-600" size={24} />
              <h2 className="font-black text-base uppercase tracking-widest dark:text-white">Validation History</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500">
                    <BadgeCheck size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-black dark:text-white uppercase tracking-widest">Ministry Approved</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Blockchain Timestamp Verified</p>
                  </div>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Record Date</p>
                    <p className="text-xs font-bold dark:text-white">{new Date(land.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Ownership & Blockchain (Right Column) */}
        <div className="space-y-8">
          
          {/* Owner Card */}
          <div className="bg-blue-600 rounded-[3rem] p-10 text-white space-y-8 shadow-2xl shadow-blue-500/30 relative overflow-hidden">
            <div className="flex items-center gap-3 relative z-10">
              <User size={24} />
              <h2 className="font-black text-base uppercase tracking-widest">Legal Proprietor</h2>
            </div>
            
            <div className="space-y-6 relative z-10">
              <div>
                <p className="text-[9px] font-black text-blue-200 uppercase tracking-[0.2em] mb-1">Full Legal Name</p>
                <p className="text-2xl font-bold tracking-tight uppercase leading-tight">{land.owner?.fullName}</p>
              </div>
              <div>
                <p className="text-[9px] font-black text-blue-200 uppercase tracking-[0.2em] mb-2">Authenticated Wallet</p>
                <p className="text-[10px] font-mono break-all bg-black/30 backdrop-blur-md p-4 rounded-2xl border border-white/10 leading-relaxed">
                  {land.owner?.walletAddress}
                </p>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
          </div>

          {/* Blockchain & Documents */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-10 space-y-8 shadow-sm">
             <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-6">
              <Database className="text-blue-600" size={24} />
              <h2 className="font-black text-base uppercase tracking-widest dark:text-white">Digital Proof</h2>
            </div>

            <div className="space-y-8">
              <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">IPFS Metadata Hash</p>
                {ipfsUrl ? (
                    <a 
                      href={ipfsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800 rounded-3xl group border-2 border-transparent hover:border-blue-600 transition-all duration-300"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-600/20">
                          <FileText size={20} />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-[10px] font-black uppercase dark:text-white">Original Document</p>
                          <p className="text-[9px] font-mono text-slate-500 truncate w-32">{land.ipfsDocHash}</p>
                        </div>
                      </div>
                      <ExternalLink size={18} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
                    </a>
                ) : (
                    <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700 text-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase">No Digital Hash Found</p>
                    </div>
                )}
              </div>

              <div className="pt-2">
                <button 
                  disabled={!ipfsUrl}
                  onClick={() => ipfsUrl && window.open(ipfsUrl, '_blank')}
                  className="w-full py-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.2em] hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition-all shadow-xl active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Download Certified Deed
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LandDetails;