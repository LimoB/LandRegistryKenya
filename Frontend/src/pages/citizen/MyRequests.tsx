import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
// NOTE: If you have an endpoint like useGetMyTransfersQuery, use that instead of 'Pending'
import { useGetPendingTransfersQuery, type TransferRequest } from "../../features/transfers/transferApi";
import { useAppSelector } from "../../app/hooks";
import {
  Activity,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
  CreditCard,
  MapPin,
  Search
} from "lucide-react";

/* ================= TYPES ================= */
type TransferStatus =
  | "pending"
  | "payment_pending"
  | "paid"
  | "completed"
  | "rejected";

interface StatusStyle {
  icon: React.ReactNode;
  label: string;
  color: string;
  bg: string;
  border: string;
}

const MyRequests: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const [filter, setFilter] = useState<TransferStatus | "all">("all");

  // If your API allows, replace this with a query that fetches ALL history, 
  // not just 'Pending', to ensure approved items remain visible.
  const { data: response, isLoading, isError, refetch } = useGetPendingTransfersQuery();

  /* ================= FILTER LOGIC ================= */
  const myRequests = useMemo(() => {
    if (!user || !response) return [];
    
    const rawList = Array.isArray(response)
      ? response
      : (response && "data" in response
          ? (response as { data: TransferRequest[] }).data
          : []);
    
    return rawList.filter((t: TransferRequest) => {
      // 1. Ensure it belongs to the user
      const isParticipant = String(t.buyerId) === String(user.id) || String(t.sellerId) === String(user.id);
      
      // 2. Apply status filter (if user selected one)
      const matchesFilter = filter === "all" || t.status === filter;
      
      return isParticipant && matchesFilter;
    });
  }, [response, user, filter]);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Transactions</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Managing {myRequests.length} active land transfer {myRequests.length === 1 ? 'record' : 'records'}
          </p>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          {(["all", "pending", "payment_pending", "completed"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                filter === s 
                ? "bg-slate-900 text-white shadow-lg" 
                : "bg-white text-slate-400 border border-slate-200 hover:border-slate-300"
              }`}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <div className="space-y-4">
        {isLoading ? (
          <LoadingState />
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : myRequests.length === 0 ? (
          <EmptyRequests isFiltered={filter !== "all"} />
        ) : (
          myRequests.map((req: TransferRequest) => (
            <RequestCard 
              key={req.id} 
              request={req} 
              currentUserId={user?.id}
              onClick={() => navigate(`/citizen/transfer/status/${req.id}`)}
            />
          ))
        )}
      </div>
    </div>
  );
};

/* ================= CARD COMPONENT ================= */
const RequestCard = ({ 
  request, 
  currentUserId, 
  onClick 
}: { 
  request: TransferRequest; 
  currentUserId?: number | string; 
  onClick: () => void; 
}) => {
  const isBuyer = String(request.buyerId) === String(currentUserId);

  const statusMap: Record<TransferStatus, StatusStyle> = {
    pending: {
      icon: <Clock size={14} />,
      label: "Verification",
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-100",
    },
    payment_pending: {
      icon: <CreditCard size={14} />,
      label: "Awaiting Payment",
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-100",
    },
    paid: {
      icon: <Activity size={14} />,
      label: "Processing Title",
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      border: "border-indigo-100",
    },
    completed: {
      icon: <CheckCircle2 size={14} />,
      label: "Transfer Success",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
    },
    rejected: {
      icon: <XCircle size={14} />,
      label: "Cancelled",
      color: "text-red-600",
      bg: "bg-red-50",
      border: "border-red-100",
    },
  };

  const style = statusMap[request.status as TransferStatus] || statusMap.pending;

  return (
    <div 
      onClick={onClick}
      className="group bg-white border border-slate-200 p-5 rounded-[2rem] hover:border-indigo-400 hover:shadow-2xl hover:shadow-indigo-100/50 transition-all cursor-pointer flex flex-col md:flex-row justify-between items-center gap-6"
    >
      <div className="flex items-center gap-6 w-full md:w-auto">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${isBuyer ? "bg-indigo-50 text-indigo-600" : "bg-slate-50 text-slate-400"}`}>
          <ArrowUpRight size={28} className={isBuyer ? "" : "rotate-180"} />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-md ${isBuyer ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
              {isBuyer ? "Purchase" : "Sale"}
            </span>
            <span className="text-slate-300">/</span>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              LR: {request.land?.lrNumber || `#${request.landId}`}
            </p>
          </div>
          <p className="text-lg font-black text-slate-900 leading-none">
            Land Title Transfer
          </p>
          <p className="text-[10px] text-slate-400 font-bold mt-2 flex items-center gap-1">
            <Clock size={10} />
            {request.createdAt ? new Date(request.createdAt).toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Date Unknown'}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0">
        <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border text-[10px] font-black uppercase tracking-widest ${style.bg} ${style.border} ${style.color}`}>
          {style.icon}
          {style.label}
        </div>

        {isBuyer && request.status === "payment_pending" && (
          <div className="hidden md:block w-px h-8 bg-slate-100 mx-2" />
        )}

        {isBuyer && request.status === "payment_pending" && (
          <button className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95">
            Complete Payment
          </button>
        )}

        <div className="p-2 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-2 transition-all">
          <ChevronRight size={24} />
        </div>
      </div>
    </div>
  );
};

/* ================= STATE HELPERS ================= */
const LoadingState = () => (
  <div className="py-32 text-center space-y-4">
    <div className="relative w-16 h-16 mx-auto">
      <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
      <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Accessing Registry</p>
  </div>
);

const ErrorState = ({ onRetry }: { onRetry: () => void }) => (
  <div className="py-20 text-center bg-red-50 rounded-[2.5rem] border border-red-100 space-y-4">
    <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
      <Activity size={24} />
    </div>
    <div>
      <p className="font-black text-slate-900">Synchronization Failed</p>
      <p className="text-xs text-slate-500">Could not connect to the land transfer ledger.</p>
    </div>
    <button onClick={onRetry} className="px-6 py-2 bg-white border border-red-200 text-red-600 text-[10px] font-black uppercase rounded-xl hover:bg-red-50 transition-all">
      Try Again
    </button>
  </div>
);

const EmptyRequests = ({ isFiltered }: { isFiltered: boolean }) => (
  <div className="py-32 flex flex-col items-center text-slate-400 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200">
    <div className="p-5 bg-white rounded-3xl shadow-sm mb-6">
      {isFiltered ? <Search size={40} className="text-slate-200" /> : <MapPin size={40} className="text-slate-200" />}
    </div>
    <p className="font-black text-slate-900 text-lg">
      {isFiltered ? "No matching records" : "No transactions yet"}
    </p>
    <p className="text-sm max-w-xs text-center mt-1">
      {isFiltered 
        ? "Try changing your status filter to see other records." 
        : "Once you initiate a land transfer, it will appear here for tracking."}
    </p>
  </div>
);

export default MyRequests;