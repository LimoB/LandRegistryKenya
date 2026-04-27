import React, { useEffect, useState, useCallback } from "react";
import { 
  Blocks, 
  ExternalLink, 
  RefreshCcw, 
  CheckCircle2, 
  History,
  Link as LinkIcon,
  type LucideIcon
} from "lucide-react";

interface BlockchainEvent {
  id: string;
  type: "REGISTRATION" | "TRANSFER";
  lrNumber: string;
  txHash: string;
  blockNumber: number;
  status: "confirmed" | "pending" | "failed";
  timestamp: string;
  fromWallet?: string;
  toWallet: string;
}

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  color: "emerald" | "indigo" | "blue";
}

const BlockchainEvents: React.FC = () => {
  const [events, setEvents] = useState<BlockchainEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      // Mock data representing on-chain events
      const mockData: BlockchainEvent[] = [
        {
          id: "1",
          type: "TRANSFER",
          lrNumber: "NBI/LAND/45521",
          txHash: "0x742d643876541b",
          blockNumber: 15420,
          status: "confirmed",
          timestamp: new Date().toISOString(),
          fromWallet: "0x123...abc",
          toWallet: "0x789...xyz"
        },
        {
          id: "2",
          type: "REGISTRATION",
          lrNumber: "MSA/SEC/9902",
          txHash: "0x991b882736522c",
          blockNumber: 15418,
          status: "confirmed",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          toWallet: "0x444...ddd"
        }
      ];
      setEvents(mockData);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      // Prefixing with underscore resolves 'unused variable' warning
      console.error("Failed to fetch blockchain events from the node.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return (
    <div className="p-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg text-white">
              <Blocks size={24} />
            </div>
            Blockchain Event Ledger
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Auditing immutable records for LandLedger Kenya Mainnet.
          </p>
        </div>

        <button 
          onClick={fetchEvents}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 transition-all shadow-sm"
        >
          <RefreshCcw size={14} className={loading ? "animate-spin" : ""} />
          Refresh Registry
        </button>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard icon={CheckCircle2} label="Validated Transfers" value={events.length.toString()} color="emerald" />
        <StatCard icon={History} label="Current Block" value="#15,420" color="indigo" />
        <StatCard icon={LinkIcon} label="Network Status" value="Mainnet" color="blue" />
      </div>

      {/* Events Table */}
      <div className="bg-white dark:bg-[#111622] rounded-2xl border border-slate-100 dark:border-white/5 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-white/2 border-b border-slate-100 dark:border-white/5">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Type</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">LR Number</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">TX Hash</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Block</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Explorer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400 animate-pulse">Scanning Ledger...</td></tr>
              ) : (
                events.map((event) => (
                  <tr key={event.id} className="hover:bg-slate-50/50 dark:hover:bg-white/2 transition-colors">
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-black ${
                        event.type === 'TRANSFER' 
                          ? 'bg-blue-500/10 text-blue-500' 
                          : 'bg-indigo-500/10 text-indigo-500'
                      }`}>
                        {event.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-700 dark:text-slate-300">
                      {event.lrNumber}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-mono text-slate-400 dark:text-slate-500">
                        {event.txHash.substring(0, 14)}...
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-500">
                      {event.blockNumber}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-emerald-500 text-xs font-bold">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                        Confirmed
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <a 
                        href={`https://etherscan.io/tx/${event.txHash}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center justify-center p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-all"
                      >
                        <ExternalLink size={16} />
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, color }) => {
  // Mapping colors to classes to satisfy Tailwind's static analysis
  const colorMap = {
    emerald: "bg-emerald-500/10 text-emerald-500",
    indigo: "bg-indigo-500/10 text-indigo-500",
    blue: "bg-blue-500/10 text-blue-500",
  };

  return (
    <div className="bg-white dark:bg-[#111622] p-5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${colorMap[color]}`}>
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

export default BlockchainEvents;