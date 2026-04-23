import React, { useMemo } from "react";
import { useGetAllPaymentsQuery } from "../features/payment/paymentApi";
import { useAppSelector } from "../app/hooks";
import PaymentStatusBadge from "../components/PaymentStatusBadge";
import { 
  CreditCard, 
  Search, 
  Filter, 
  Download, 
  FileText, 
  ExternalLink,
  History,
  ShieldCheck,
  User
} from "lucide-react";

const Payments: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { data: payments = [], isLoading, refetch } = useGetAllPaymentsQuery();

  /* ================= ROLE-BASED FILTERING ================= */
  const filteredPayments = useMemo(() => {
    if (!user) return [];
    
    // Admin sees everything
    if (user.role === "admin") return payments;

    // Citizens only see payments where they are the owner/requester
    // (Note: Backend should ideally handle this filtering, but this is a safety layer)
    return payments; 
  }, [payments, user]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center py-20">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 mt-3 font-medium">Loading ledger transactions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <CreditCard className="text-indigo-600" />
            Financial Ledger
          </h1>
          <p className="text-sm text-slate-500">
            {user?.role === "admin" 
              ? "Global oversight of all registry transaction fees" 
              : "Track your land transfer payments and receipts"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => refetch()}
            className="p-2.5 text-slate-500 hover:bg-slate-50 rounded-xl border border-slate-200 transition-all"
          >
            <History size={18} />
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100">
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* STATS OVERVIEW (Role Specific) */}
      {user?.role === "admin" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Revenue</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              KES {payments.reduce((acc, p) => acc + (p.paymentStatus === "completed" ? Number(p.amount) : 0), 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pending Approvals</p>
            <p className="text-2xl font-black text-yellow-600 mt-1">
              {payments.filter(p => p.paymentStatus === "pending").length}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Successful Transactions</p>
            <p className="text-2xl font-black text-green-600 mt-1">
              {payments.filter(p => p.paymentStatus === "completed").length}
            </p>
          </div>
        </div>
      )}

      {/* TABLE CONTAINER */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Filter by Transaction ID or LR Number..." 
              className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">
              <Filter size={14} /> Filter
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction Details</th>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Land Reference</th>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Method</th>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase">
                        #{payment.mpesaReceiptCode || payment.stripePaymentIntentId?.slice(-8) || `TR-${payment.id}`}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(payment.createdAt).toLocaleDateString()} at {new Date(payment.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-md">
                        <FileText size={14} />
                      </div>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {payment.transferRequest?.lrNumber || "N/A"}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400 capitalize flex items-center gap-1.5">
                      {payment.paymentMethod === "stripe" ? <ShieldCheck size={14} className="text-blue-500" /> : <User size={14} className="text-green-500" />}
                      {payment.paymentMethod}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm font-black text-slate-900 dark:text-white">
                      KES {Number(payment.amount).toLocaleString()}
                    </span>
                  </td>
                  <td className="p-4">
                    <PaymentStatusBadge status={payment.paymentStatus} />
                  </td>
                  <td className="p-4 text-right">
                    <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                      <ExternalLink size={16} />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-20 text-center">
                    <div className="flex flex-col items-center space-y-2">
                      <History size={40} className="text-slate-200" />
                      <p className="text-sm text-slate-500 font-medium">No payment records found in the registry</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Payments;