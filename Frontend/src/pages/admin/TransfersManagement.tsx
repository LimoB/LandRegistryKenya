import React, { useState } from "react";
import { useGetPendingTransfersQuery } from "../../features/transfers/transferApi";
import { 
  ArrowRightLeft, 
  Search, 
  TrendingUp, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  ShieldAlert,
  Download,
  Filter
} from "lucide-react";

const TransfersManagement: React.FC = () => {
  const { data: transfers, isLoading } = useGetPendingTransfersQuery();
  const [searchTerm, setSearchTerm] = useState("");

  // Stats calculation
  const totalVolume = transfers?.reduce((acc, curr) => acc + (curr.id * 150000), 0) || 0; 
  const pendingCount = transfers?.filter(t => t.status === 'pending').length || 0;

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in slide-in-from-top-4 duration-700">
      
      {/* 1. Transaction Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-950 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
            <div className="relative z-10">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Total Market Volume</p>
                <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight tabular-nums">
                    KES {totalVolume.toLocaleString()}
                </p>
                <div className="flex items-center gap-2 mt-4 text-emerald-500 font-bold text-[10px] uppercase">
                    <TrendingUp size={14} /> +12.5% vs Last Month
                </div>
            </div>
            <ArrowRightLeft className="absolute -right-4 -bottom-4 w-32 h-32 text-slate-50 dark:text-slate-900 group-hover:rotate-12 transition-transform duration-500" />
        </div>

        <div className="bg-white dark:bg-slate-950 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Active Escrow Requests</p>
            <p className="text-3xl font-black text-blue-600 tracking-tight tabular-nums">{pendingCount}</p>
            <div className="flex items-center gap-2 mt-4 text-amber-500 font-bold text-[10px] uppercase">
                <Clock size={14} /> Average Resolution: 4.2 Hours
            </div>
        </div>

        <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-xl shadow-blue-900/10 flex flex-col justify-between">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Quick Report</p>
            <button className="flex items-center justify-between w-full bg-blue-600 hover:bg-blue-500 text-white px-6 py-4 rounded-2xl transition-all active:scale-95">
                <span className="font-black text-xs uppercase tracking-widest">Export Audit CSV</span>
                <Download size={18} />
            </button>
        </div>
      </div>

      {/* 2. Global Transfer Ledger */}
      <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="p-8 border-b border-slate-50 dark:border-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <ArrowRightLeft className="text-blue-600" size={20} /> Exchange Registry
                </h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-tighter">Monitoring Peer-to-Peer land ownership cycles</p>
            </div>
            
            <div className="flex items-center gap-2">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                        type="text" 
                        placeholder="Search M-Pesa Receipt..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-12 pr-6 py-3 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-xs font-bold w-64 outline-none focus:ring-2 ring-blue-500/20 transition-all dark:text-white"
                    />
                </div>
                <button className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-slate-400">
                    <Filter size={18} />
                </button>
            </div>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] border-b border-slate-50 dark:border-slate-900">
                        <th className="py-5 px-8">Transaction ID</th>
                        <th className="py-5 px-8 text-center">Transfer Flow</th>
                        <th className="py-5 px-8">M-Pesa Reference</th>
                        <th className="py-5 px-8">Asset ID</th>
                        <th className="py-5 px-8">Status</th>
                        <th className="py-5 px-8 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-900">
                    {isLoading ? (
                        <tr><td colSpan={6} className="py-20 text-center text-xs font-black text-slate-400 animate-pulse uppercase">Syncing Exchange Data...</td></tr>
                    ) : (
                        transfers?.map((tx) => (
                            <tr key={tx.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors">
                                <td className="py-6 px-8">
                                    <span className="text-xs font-black text-slate-900 dark:text-white">#TRX-{tx.id.toString().padStart(5, '0')}</span>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Automated Escrow</p>
                                </td>
                                
                                <td className="py-6 px-8">
                                    <div className="flex items-center justify-center gap-3 bg-slate-50 dark:bg-slate-900/50 py-2 px-4 rounded-xl border border-slate-100 dark:border-slate-800">
                                        <div className="text-center">
                                            <p className="text-[8px] font-black text-slate-400 uppercase">Seller</p>
                                            <p className="text-[10px] font-black text-slate-700 dark:text-slate-300">ID:{tx.sellerId}</p>
                                        </div>
                                        <ArrowRight className="text-blue-500" size={14} />
                                        <div className="text-center">
                                            <p className="text-[8px] font-black text-slate-400 uppercase">Buyer</p>
                                            <p className="text-[10px] font-black text-slate-700 dark:text-slate-300">ID:{tx.buyerId}</p>
                                        </div>
                                    </div>
                                </td>

                                <td className="py-6 px-8 font-mono text-xs font-black text-slate-600 dark:text-slate-400 tracking-tighter uppercase">
                                    {tx.mpesaReceiptCode}
                                </td>

                                <td className="py-6 px-8">
                                    <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-100 dark:border-blue-800">
                                        Asset #{tx.landId}
                                    </span>
                                </td>

                                <td className="py-6 px-8">
                                    {/* FIX: Use 'transferred' or 'approved' based on your type definition */}
                                    <div className={`flex items-center gap-1.5 font-black text-[9px] uppercase tracking-widest ${
                                        tx.status === 'transferred' || tx.status === 'approved' 
                                          ? 'text-emerald-500' 
                                          : tx.status === 'rejected' 
                                          ? 'text-red-500' 
                                          : 'text-amber-500'
                                    }`}>
                                        {(tx.status === 'transferred' || tx.status === 'approved') ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                                        {tx.status}
                                    </div>
                                </td>

                                <td className="py-6 px-8 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button className="p-2 text-slate-400 hover:text-red-500 transition-colors" title="Revoke Transfer">
                                            <ShieldAlert size={18} />
                                        </button>
                                        <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors" title="View Details">
                                            <AlertCircle size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </div>

      {/* 3. Footer */}
      <div className="flex items-center gap-4 p-6 bg-blue-600 rounded-[2rem] text-white overflow-hidden relative">
          <AlertCircle className="shrink-0 opacity-50" size={32} />
          <div className="z-10">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Admin Advisory</p>
              <p className="text-xs font-bold leading-relaxed">
                  Transfers are only finalized after Land Officer signature. If a transaction is stuck for more than 24 hours with a valid M-Pesa receipt, please contact the regional Land Officer assigned to Asset ID.
              </p>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16" />
      </div>
    </div>
  );
};

export default TransfersManagement;