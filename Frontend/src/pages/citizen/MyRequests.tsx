import React from "react";
import { useGetPendingTransfersQuery } from "../../features/transfers/transferApi";
import { useAppSelector } from "../../app/hooks";
import { 
  Activity, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ChevronRight,
  Filter,
//   CreditCard
} from "lucide-react";

const MyRequests: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  
  // We use the pending transfers query, but in a real app, 
  // you'd likely have a 'useGetMyRequestsQuery' 
  const { data: transfers, isLoading } = useGetPendingTransfersQuery();

  // Filter transfers where the user is either the Buyer or Seller
  const myRequests = transfers?.filter(t => t.buyerId === user?.id || t.sellerId === user?.id) || [];

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-900 pb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Transaction History
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Monitor the real-time status of your land transfers and registrations.
          </p>
        </div>
        <div className="flex items-center gap-2">
           <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-500">
              <Filter size={14} />
              Filter Status
           </button>
        </div>
      </div>

      {/* Request List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="py-20 text-center text-slate-400 font-black uppercase text-[10px] tracking-[0.3em] animate-pulse">
            Syncing with Registry...
          </div>
        ) : myRequests.length > 0 ? (
          myRequests.map((req) => (
            <RequestCard key={req.id} request={req} currentUserId={user?.id} />
          ))
        ) : (
          <EmptyRequests />
        )}
      </div>
    </div>
  );
};

/* --- Sub-Components --- */

const RequestCard = ({ request, currentUserId }: { request: any, currentUserId?: number }) => {
  const isBuyer = request.buyerId === currentUserId;
  
  const statusStyles: any = {
    pending: { icon: <Clock size={16} />, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    approved: { icon: <CheckCircle2 size={16} />, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    transferred: { icon: <Activity size={16} />, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    rejected: { icon: <XCircle size={16} />, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" },
  };

  const style = statusStyles[request.status] || statusStyles.pending;

  return (
    <div className="group bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 p-5 rounded-2xl hover:border-blue-500/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
      <div className="flex items-center gap-5">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isBuyer ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-600'} dark:bg-slate-900`}>
          <ArrowUpRight size={24} className={isBuyer ? "" : "rotate-90"} />
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              {isBuyer ? "Purchase Request" : "Sale Notification"}
            </span>
            <span className="text-slate-300 dark:text-slate-800">•</span>
            <span className="text-[10px] font-mono text-slate-500">{request.createdAt.split('T')[0]}</span>
          </div>
          <h4 className="text-sm font-black text-slate-900 dark:text-white">
            Land ID: #{request.landId} 
            <span className="mx-2 text-slate-300 font-thin">|</span> 
            Receipt: <span className="font-mono text-blue-600 uppercase">{request.mpesaReceiptCode}</span>
          </h4>
        </div>
      </div>

      <div className="flex items-center gap-6 justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-slate-50 dark:border-slate-900">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${style.bg} ${style.border} ${style.color}`}>
          {style.icon}
          <span className="text-[10px] font-black uppercase tracking-widest">{request.status}</span>
        </div>
        
        <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-all">
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

const EmptyRequests = () => (
  <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 dark:border-slate-900 rounded-3xl">
    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center text-slate-300 mb-4">
      <Activity size={32} />
    </div>
    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">No Active Requests</h3>
    <p className="text-xs text-slate-500 mt-1">Your transaction history will appear here.</p>
  </div>
);

export default MyRequests;