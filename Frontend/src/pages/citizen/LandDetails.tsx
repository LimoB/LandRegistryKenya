import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetLandByLRQuery } from "../../features/lands/landApi";

import {
  ArrowLeft,
  MapPin,
  User,
  Wallet,
  FileText,
  Link as LinkIcon,
  CheckCircle2,
  Clock,
  XCircle,
  SearchX,
} from "lucide-react";

const LandDetails: React.FC = () => {
  // Capture the splat parameter from the route
  const params = useParams();
  const lrNumber = params["*"]; 
  const navigate = useNavigate();

  /* ================= DEBUGGING LOGS ================= */
  useEffect(() => {
    console.group("LandDetails Debugger");
    console.log("Full Params Object:", params);
    console.log("Extracted lrNumber (Splat):", lrNumber);
    console.log("Current Pathname:", window.location.pathname);
    console.groupEnd();
  }, [params, lrNumber]);

  /* ================= FETCH BY LR NUMBER ================= */
  /**
   * IMPORTANT: We use encodeURIComponent here. 
   * This converts slashes (/) into %2F so the backend receives the
   * full LR number as a single parameter.
   */
  const { 
    data: land, 
    isLoading, 
    isError, 
    error 
  } = useGetLandByLRQuery(lrNumber ? encodeURIComponent(lrNumber) : "");

  /* ================= API RESPONSE LOGGING ================= */
  useEffect(() => {
    if (isError) {
      console.error("API Fetch Error:", error);
    }
    if (land) {
      console.log("Land Data Received:", land);
    }
  }, [land, isError, error]);

  /* ================= LOADING STATE ================= */
  if (isLoading) {
    return (
      <div className="flex flex-col items-center py-20">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 mt-3 font-medium">Fetching record for {lrNumber}...</p>
      </div>
    );
  }

  /* ================= ERROR / 404 STATE ================= */
  if (isError || !land) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-6 text-center">
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
           <SearchX size={48} className="text-indigo-400" />
        </div>
        <div>
          <h1 className="text-4xl font-black text-slate-900">404</h1>
          <h2 className="text-xl font-bold text-slate-800">Parcel Not Found</h2>
          <p className="text-sm text-slate-500 max-w-sm mt-2">
            The record for LR No: <span className="font-mono font-bold text-red-500">{lrNumber || "Unknown"}</span> 
            could not be located in the digital registry.
          </p>
        </div>
        
        <div className="flex gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-all"
          >
            <ArrowLeft size={16} /> Go Back
          </button>
          <button
            onClick={() => navigate("/citizen/dashboard")}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all"
          >
            Dashboard
          </button>
        </div>
      </div>
    );
  }

  /* ================= SUCCESS STATE ================= */
  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      {/* NAVIGATION */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Registry
      </button>

      {/* PRIMARY HEADER */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-black font-mono text-slate-900 dark:text-white">
              {land.lrNumber}
            </h1>
            <p className="text-sm text-slate-500 flex items-center gap-2">
              <MapPin size={16} className="text-indigo-500" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">{land.county}</span> 
              <span className="opacity-30">|</span> 
              <span>{land.constituency}</span>
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            {land.verificationStatus === "verified" && (
              <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold px-3 py-1 bg-green-100 text-green-700 rounded-full border border-green-200">
                <CheckCircle2 size={12} /> Verified
              </span>
            )}
            {land.verificationStatus === "pending" && (
              <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full border border-yellow-200">
                <Clock size={12} /> Pending
              </span>
            )}
            {land.verificationStatus === "rejected" && (
              <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold px-3 py-1 bg-red-100 text-red-700 rounded-full border border-red-200">
                <XCircle size={12} /> Rejected
              </span>
            )}
          </div>
        </div>
      </div>

      {/* DETAILS GRID */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* LAND INFO */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">Land Statistics</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-slate-800">
              <span className="text-sm text-slate-500">Total Area</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">{land.sizeInAcres} Acres</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-slate-800">
              <span className="text-sm text-slate-500">Zoning Type</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">{land.landType}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-slate-500">Valuation</span>
              <span className="text-sm font-black text-indigo-600">
                {land.isForSale ? `KES ${land.priceInKsh?.toLocaleString()}` : "Not For Sale"}
              </span>
            </div>
          </div>
        </div>

        {/* OWNER INFO */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <User size={14} /> Registered Owner
          </h2>
          <div className="space-y-1">
            <p className="text-base font-bold text-slate-900 dark:text-white">{land.owner?.fullName}</p>
            <p className="text-xs text-slate-500">{land.owner?.email}</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
            <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Blockchain Wallet</p>
            <p className="text-[10px] font-mono break-all text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <Wallet size={12} className="shrink-0" />
              {land.owner?.walletAddress || "No linked address"}
            </p>
          </div>
        </div>
      </div>

      {/* ASSETS AND LEDGER */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* DOCUMENTS */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-4">
            <FileText size={14} /> Verification Documents
          </h2>

          {land.ipfsDocHash ? (
            <a
              href={`https://gateway.pinata.cloud/ipfs/${land.ipfsDocHash}`}
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center justify-center gap-2 text-sm font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 py-3 rounded-xl hover:bg-indigo-100 transition-all border border-indigo-100 dark:border-indigo-800"
            >
              <LinkIcon size={16} />
              View IPFS Title Deed
            </a>
          ) : (
            <div className="py-4 text-center border-2 border-dashed border-slate-100 rounded-xl">
              <p className="text-xs text-slate-400 italic">No document hash available</p>
            </div>
          )}
        </div>

        {/* BLOCKCHAIN DATA */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">Ledger Metadata</h2>
          <div className="grid grid-cols-1 gap-3">
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Tx Hash</p>
              <p className="text-[10px] font-mono truncate text-indigo-500">{land.blockchainTxHash || "Not Minted"}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Block Confirmation</p>
              <p className="text-xs font-mono font-bold">{land.blockNumber || "Pending..."}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandDetails;