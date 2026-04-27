import React, { useEffect, useState, useCallback } from "react";
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Copy, 
  ShieldCheck, 
  CreditCard,
  RefreshCw,
  type LucideIcon,
  CheckCircle
} from "lucide-react";

interface WalletTransaction {
  id: string;
  type: "payment" | "refund" | "transfer_fee";
  amount: string;
  status: "completed" | "pending" | "failed";
  date: string;
  reference: string;
}

interface WalletStatProps {
  icon: LucideIcon;
  label: string;
  value: string;
  subtext: string;
}

const CitizenWallet: React.FC = () => {
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const address = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";

  const fetchWalletData = useCallback(async () => {
    setLoading(true);
    try {
      // Mocking transaction history linked to the Land Registry activities
      const mockTx: WalletTransaction[] = [
        {
          id: "1",
          type: "transfer_fee",
          amount: "2,500.00",
          status: "completed",
          date: new Date().toISOString(),
          reference: "Statutory Fee: NBI/45521"
        },
        {
          id: "2",
          type: "payment",
          amount: "15,000.00",
          status: "completed",
          date: new Date(Date.now() - 86400000).toISOString(),
          reference: "Stamp Duty Deposit"
        }
      ];
      setTransactions(mockTx);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_err) {
      console.error("Failed to load wallet data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWalletData();
  }, [fetchWalletData]);

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header & Balance Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-8 text-white shadow-xl shadow-indigo-200 dark:shadow-none relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-12">
              <div>
                <p className="text-indigo-100 text-xs font-black uppercase tracking-widest mb-1">Available Balance</p>
                <h2 className="text-4xl font-black italic">KES 42,050.00</h2>
              </div>
              <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl">
                <Wallet size={28} />
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-6 border-t border-white/10">
              <div>
                <p className="text-indigo-100 text-[10px] font-bold uppercase mb-1">On-Chain Identity</p>
                <div className="flex items-center gap-2 font-mono text-xs bg-black/20 px-3 py-2 rounded-lg">
                  {address.substring(0, 10)}...{address.substring(address.length - 8)}
                  <button 
                    onClick={copyAddress} 
                    className="hover:text-indigo-300 transition-colors p-1"
                    title="Copy Address"
                  >
                    {copied ? <CheckCircle size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-600 rounded-xl text-xs font-black hover:bg-indigo-50 transition-all shadow-lg">
                  <ArrowUpRight size={14} /> Deposit Funds
                </button>
              </div>
            </div>
          </div>
          {/* Decorative Circles */}
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full" />
          <div className="absolute -right-20 -bottom-20 w-60 h-60 bg-white/5 rounded-full" />
        </div>

        <div className="bg-white dark:bg-[#111622] rounded-3xl border border-slate-100 dark:border-white/5 p-6 flex flex-col justify-center gap-6 shadow-sm">
          <WalletStat icon={ShieldCheck} label="Identity Status" value="Verified" subtext="KYC Level 2" />
          <WalletStat icon={CreditCard} label="Linked Accounts" value="03" subtext="Stripe/M-Pesa" />
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white dark:bg-[#0B0F1A] rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Transaction Ledger</h3>
          <button 
            onClick={fetchWalletData} 
            className="p-2 text-slate-400 hover:text-indigo-600 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-white/5"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-white/5">
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-sm italic font-medium">Syncing with Blockchain...</div>
          ) : (
            transactions.map((tx) => (
              <div key={tx.id} className="px-8 py-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/2 transition-all group">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl transition-transform group-hover:scale-110 ${
                    tx.type === 'payment' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-indigo-500/10 text-indigo-500'
                  }`}>
                    {tx.type === 'payment' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900 dark:text-white">
                      {tx.type === 'transfer_fee' ? 'Registry Fee' : 'Wallet Deposit'}
                    </p>
                    <p className="text-[10px] font-medium text-slate-400">{tx.reference}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-black ${
                    tx.type === 'payment' ? 'text-emerald-500' : 'text-slate-900 dark:text-white'
                  }`}>
                    {tx.type === 'payment' ? '+' : '-'} KES {tx.amount}
                  </p>
                  <p className="text-[10px] font-mono text-slate-400">
                    {new Date(tx.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const WalletStat: React.FC<WalletStatProps> = ({ icon: Icon, label, value, subtext }) => (
  <div className="flex items-center gap-4">
    <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-2xl text-indigo-600 dark:text-indigo-400">
      <Icon size={20} />
    </div>
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-lg font-black text-slate-900 dark:text-white">{value}</span>
        <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-tighter">{subtext}</span>
      </div>
    </div>
  </div>
);

export default CitizenWallet;