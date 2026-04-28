import React, { useState, useMemo } from "react";
import {
  FileCheck,
  Search,
  Download,
  ExternalLink,
  ShieldCheck,
  Map,
  QrCode,
  Info,
  AlertTriangle
} from "lucide-react";

import { useGetMyLandsQuery } from "../../features/lands/landApi";

/* ============================================================
   TYPES
============================================================ */
interface LandTitle {
  id: string;
  lrNumber: string;
  size: string;
  location: string;
  issuedDate: string;
  txHash?: string;
  status: "verified" | "disputed";
  ownerName: string;
  documentLink?: string;
}

/* ============================================================
   ENV CONFIG
============================================================ */
const NETWORK = import.meta.env.VITE_NETWORK || "local";

/* ============================================================
   HELPERS
============================================================ */
const formatDate = (date?: string) =>
  date
    ? new Date(date).toLocaleDateString("en-KE", {
        year: "numeric",
        month: "short",
        day: "numeric"
      })
    : "—";

const getExplorerUrl = (txHash?: string) => {
  if (!txHash) return null;

  if (NETWORK === "local") return null;

  if (NETWORK === "sepolia") {
    return `https://sepolia.etherscan.io/tx/${txHash}`;
  }

  return `https://etherscan.io/tx/${txHash}`;
};

/* ============================================================
   COMPONENT
============================================================ */
const DigitalTitles: React.FC = () => {
  const { data: lands = [], isLoading, isError } = useGetMyLandsQuery();
  const [searchTerm, setSearchTerm] = useState("");

  /* ============================================================
     MAP BACKEND → UI (FINAL FIX)
  ============================================================ */
  const titles: LandTitle[] = useMemo(() => {
    return lands.map((land) => ({
      id: String(land.id),
      lrNumber: land.lrNumber,
      size: `${land.sizeInAcres} Acres`,
      location: `${land.constituency}, ${land.county}`,
      issuedDate: land.createdAt,
      txHash: land.blockchainTxHash,
      status:
        land.verificationStatus === "verified"
          ? "verified"
          : "disputed",

      // ✅ FINAL CLEAN UX
      ownerName: land.owner?.fullName || "You",

      documentLink: land.ipfsLink
    }));
  }, [lands]);

  /* ============================================================
     FILTER
  ============================================================ */
  const filteredTitles = titles.filter(
    (t) =>
      t.lrNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto animate-in fade-in duration-700">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl text-white">
              <FileCheck size={22} />
            </div>
            Digital Land Titles
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Blockchain-secured certificates
          </p>
        </div>

        {/* SEARCH */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search LR Number or Location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2.5 border rounded-xl text-xs w-full md:w-80 focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>
      </div>

      {/* INFO */}
      <div className="mb-6 p-4 bg-blue-50 rounded-xl flex gap-3 text-xs">
        <Info size={16} />
        <span>
          {NETWORK === "local"
            ? "Running on local blockchain (Ganache). Transactions are not publicly visible."
            : "Transactions are publicly verifiable on blockchain explorer."}
        </span>
      </div>

      {/* ERROR */}
      {isError && (
        <div className="text-center text-red-500 text-sm">
          Failed to load titles.
        </div>
      )}

      {/* LOADING */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-60 bg-slate-200 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {filteredTitles.map((title) => {
            const explorerUrl = getExplorerUrl(title.txHash);

            return (
              <div key={title.id} className="bg-white rounded-2xl border p-5 shadow-sm hover:shadow-lg transition">

                {/* TOP */}
                <div className="flex justify-between mb-4">
                  <div
                    className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${
                      title.status === "verified"
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-red-100 text-red-500"
                    }`}
                  >
                    {title.status === "verified" ? (
                      <ShieldCheck size={12} />
                    ) : (
                      <AlertTriangle size={12} />
                    )}
                    {title.status}
                  </div>

                  <QrCode size={16} className="text-slate-400" />
                </div>

                <h3 className="font-bold">{title.lrNumber}</h3>

                <p className="text-xs text-slate-500 flex gap-1 mt-1">
                  <Map size={12} /> {title.location}
                </p>

                {/* DETAILS */}
                <div className="grid grid-cols-2 gap-3 text-xs mt-4">
                  <div>
                    <p className="text-slate-400">Owner</p>
                    <p className="font-semibold text-slate-800">{title.ownerName}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Size</p>
                    <p className="font-semibold">{title.size}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Issued</p>
                    <p className="font-semibold">{formatDate(title.issuedDate)}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Tx</p>
                    <p className="font-mono text-slate-400">
                      {title.txHash ? `${title.txHash.slice(0, 10)}...` : "N/A"}
                    </p>
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="flex gap-2 mt-5">
                  {title.documentLink && (
                    <a
                      href={title.documentLink}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 text-center py-2 bg-black text-white rounded-lg text-xs flex items-center justify-center gap-2 hover:opacity-90"
                    >
                      <Download size={14} />
                      View Doc
                    </a>
                  )}

                  {explorerUrl ? (
                    <a
                      href={explorerUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-2 border rounded-lg text-slate-400 hover:text-indigo-500"
                    >
                      <ExternalLink size={16} />
                    </a>
                  ) : title.txHash ? (
                    <div className="px-3 py-2 text-xs text-slate-400 border rounded-lg">
                      Local TX
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* EMPTY */}
      {!isLoading && filteredTitles.length === 0 && (
        <div className="text-center py-16 text-sm text-slate-500">
          No titles found.
        </div>
      )}
    </div>
  );
};

export default DigitalTitles;