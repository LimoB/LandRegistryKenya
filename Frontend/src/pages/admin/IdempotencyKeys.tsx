import React, { useEffect, useState, useCallback } from "react";
import { 
  KeyRound, 
  RotateCcw, 
  Trash2, 
  Search, 
  ShieldCheck, 
  Clock, 
  AlertCircle,
  type LucideIcon
} from "lucide-react";

interface IdempotencyKey {
  id: string;
  key: string; // The unique UUID or Hash
  requestPath: string;
  status: "active" | "completed" | "expired";
  createdAt: string;
  payloadSummary: string;
}

interface KeyStatProps {
  icon: LucideIcon;
  label: string;
  value: string;
  status: "success" | "warning" | "danger";
}

const IdempotencyKeys: React.FC = () => {
  const [keys, setKeys] = useState<IdempotencyKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchKeys = useCallback(async () => {
    setLoading(true);
    try {
      // Logic to fetch from your backend (e.g., GET /api/admin/idempotency)
      const mockKeys: IdempotencyKey[] = [
        {
          id: "1",
          key: "req_land_tx_9921",
          requestPath: "/api/transfers/finalize",
          status: "completed",
          createdAt: new Date().toISOString(),
          payloadSummary: "Transfer LR: NBI/45521 to User: 882"
        },
        {
          id: "2",
          key: "req_mint_0034",
          requestPath: "/api/lands/register",
          status: "active",
          createdAt: new Date(Date.now() - 300000).toISOString(),
          payloadSummary: "Minting LR: MSA/9902"
        }
      ];
      setKeys(mockKeys);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_err) {
      console.error("Failed to load idempotency ledger");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  const filteredKeys = keys.filter(k => 
    k.key.toLowerCase().includes(searchTerm.toLowerCase()) || 
    k.payloadSummary.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <div className="p-2 bg-amber-500 rounded-lg text-white">
              <KeyRound size={24} />
            </div>
            Idempotency Control
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Preventing duplicate transactions and ensuring blockchain data integrity.
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text"
            placeholder="Search keys or payloads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 outline-none w-full md:w-64 transition-all"
          />
        </div>
      </div>

      {/* Health Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <KeyStat icon={ShieldCheck} label="Integrity Status" value="Healthy" status="success" />
        <KeyStat icon={Clock} label="Active Locks" value="02" status="warning" />
        <KeyStat icon={AlertCircle} label="Failures (24h)" value="0" status="success" />
      </div>

      {/* Ledger Table */}
      <div className="bg-white dark:bg-[#111622] rounded-2xl border border-slate-100 dark:border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-white/2 border-b border-slate-100 dark:border-white/5">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Request Key</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Endpoint</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Age</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400 animate-pulse">Syncing cache...</td></tr>
              ) : filteredKeys.map((k) => (
                <tr key={k.id} className="group hover:bg-slate-50/50 dark:hover:bg-white/2 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">{k.key}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{k.payloadSummary}</p>
                  </td>
                  <td className="px-6 py-4 text-[10px] font-mono text-slate-500">
                    {k.requestPath}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-tighter ${
                      k.status === 'completed' 
                        ? 'bg-emerald-500/10 text-emerald-500' 
                        : k.status === 'active' 
                        ? 'bg-amber-500/10 text-amber-500 animate-pulse' 
                        : 'bg-slate-500/10 text-slate-500'
                    }`}>
                      {k.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[10px] text-slate-500">
                    {new Date(k.createdAt).toLocaleTimeString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-lg">
                        <RotateCcw size={14} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const KeyStat: React.FC<KeyStatProps> = ({ icon: Icon, label, value, status }) => {
  const statusColors = {
    success: "text-emerald-500 bg-emerald-500/10",
    warning: "text-amber-500 bg-amber-500/10",
    danger: "text-red-500 bg-red-500/10",
  };

  return (
    <div className="bg-white dark:bg-[#111622] p-5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${statusColors[status]}`}>
          <Icon size={20} />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
          <p className="text-lg font-black text-slate-900 dark:text-white leading-tight">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default IdempotencyKeys;