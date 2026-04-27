import React, { useEffect, useState, useCallback } from "react";
import { 
  FileCheck, 
  Search, 
  Download, 
  ExternalLink, 
  ShieldCheck, 
  Map, 
  QrCode,
  Info
} from "lucide-react";

interface LandTitle {
  id: string;
  lrNumber: string;
  size: string;
  location: string;
  issuedDate: string;
  txHash: string;
  status: "verified" | "disputed";
  ownerName: string;
}

const DigitalTitles: React.FC = () => {
  const [titles, setTitles] = useState<LandTitle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchTitles = useCallback(async () => {
    setLoading(true);
    try {
      // Mocking the result of your LandOwnership table query
      const mockTitles: LandTitle[] = [
        {
          id: "TITLE-99201",
          lrNumber: "NBI/LAND/45521",
          size: "0.25 Ha",
          location: "Westlands, Nairobi",
          issuedDate: "2024-03-15",
          txHash: "0x742d...4438f44e",
          status: "verified",
          ownerName: "Samuel K. Citizen"
        },
        {
          id: "TITLE-88102",
          lrNumber: "MSA/SEC/9902",
          size: "1.0 Ha",
          location: "Nyali, Mombasa",
          issuedDate: "2023-11-20",
          txHash: "0x991b...332c11d",
          status: "verified",
          ownerName: "Samuel K. Citizen"
        }
      ];
      setTitles(mockTitles);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_err) {
      console.error("Failed to retrieve digital certificates.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTitles();
  }, [fetchTitles]);

  const filteredTitles = titles.filter(t => 
    t.lrNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <div className="p-2 bg-emerald-600 rounded-lg text-white">
              <FileCheck size={24} />
            </div>
            My Digital Titles
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Blockchain-verified ownership certificates for your registered properties.
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text"
            placeholder="Search by LR Number or Location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none w-full md:w-80 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Warning/Info Box */}
      <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-2xl flex items-start gap-3">
        <Info className="text-blue-500 shrink-0" size={20} />
        <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
          These documents are cryptographically signed by the Ministry of Lands. Any changes to the physical registry are reflected on the blockchain in real-time. Use the QR code to allow 3rd-party verification.
        </p>
      </div>

      {/* Grid of Titles */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-64 bg-slate-100 dark:bg-white/5 animate-pulse rounded-3xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredTitles.map((title) => (
            <div key={title.id} className="relative group bg-white dark:bg-[#111622] rounded-3xl border border-slate-100 dark:border-white/5 overflow-hidden shadow-sm hover:shadow-xl hover:border-emerald-500/30 transition-all duration-300">
              {/* Certificate Top Section */}
              <div className="p-8 border-b border-slate-50 dark:border-white/5">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-2 px-2 py-1 bg-emerald-500/10 text-emerald-600 rounded-md">
                    <ShieldCheck size={14} />
                    <span className="text-[10px] font-black uppercase tracking-tighter">Verified Ownership</span>
                  </div>
                  <div className="p-2 bg-slate-50 dark:bg-white/5 rounded-lg text-slate-400">
                    <QrCode size={20} />
                  </div>
                </div>

                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1">{title.lrNumber}</h3>
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-tight">
                  <Map size={14} />
                  {title.location}
                </div>
              </div>

              {/* Certificate Details */}
              <div className="px-8 py-6 grid grid-cols-2 gap-6 bg-slate-50/50 dark:bg-white/2">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Registered Owner</p>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{title.ownerName}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Parcel Area</p>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{title.size}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Date Issued</p>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{title.issuedDate}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Blockchain ID</p>
                  <p className="text-xs font-mono text-slate-400">{title.txHash.substring(0, 10)}...</p>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 bg-white dark:bg-[#111622] flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-900 dark:bg-indigo-600 text-white rounded-xl text-xs font-black hover:opacity-90 transition-all">
                  <Download size={14} />
                  Download PDF
                </button>
                <a 
                  href={`https://etherscan.io/tx/${title.txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-400 hover:text-indigo-500 hover:border-indigo-500 transition-all"
                >
                  <ExternalLink size={16} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filteredTitles.length === 0 && (
        <div className="text-center py-20 bg-slate-50 dark:bg-white/2 rounded-3xl border-2 border-dashed border-slate-200 dark:border-white/5">
          <div className="p-4 bg-white dark:bg-[#111622] w-fit mx-auto rounded-full mb-4 shadow-sm">
            <FileCheck size={32} className="text-slate-300" />
          </div>
          <h3 className="text-slate-900 dark:text-white font-black">No Titles Found</h3>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
            Search again or register a new parcel to see it here.
          </p>
        </div>
      )}
    </div>
  );
};

export default DigitalTitles;