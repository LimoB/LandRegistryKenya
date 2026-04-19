import React, { useMemo } from "react";
import { useGetPendingTransfersQuery, type TransferRequest } from "../../features/transfers/transferApi";
import { useAppSelector } from "../../app/hooks";
import {
  Activity,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Filter,
} from "lucide-react";

/* ================= TYPES ================= */
type TransferStatus =
  | "pending"
  | "payment_pending"
  | "paid"
  | "completed"
  | "rejected";

/* ================= COMPONENT ================= */
const MyRequests: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);

  const { data: transfers = [], isLoading } = useGetPendingTransfersQuery();

  /* ================= FILTER MY REQUESTS ================= */
  const myRequests = useMemo(() => {
    if (!user) return [];

    return transfers.filter(
      (t) => t.buyerId === user.id || t.sellerId === user.id
    );
  }, [transfers, user]);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-900 pb-8">

        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            My Transactions
          </h1>

          <p className="text-sm text-slate-500">
            Track all your land transfer activity
          </p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-900 border rounded-xl text-xs font-bold text-slate-500">
          <Filter size={14} />
          Filter
        </button>

      </div>

      {/* CONTENT */}
      <div className="space-y-4">

        {isLoading ? (
          <LoadingState />
        ) : myRequests.length === 0 ? (
          <EmptyRequests />
        ) : (
          myRequests.map((req) => (
            <RequestCard key={req.id} request={req} />
          ))
        )}

      </div>
    </div>
  );
};

/* ================= CARD ================= */
const RequestCard = ({ request }: { request: TransferRequest }) => {
  const isBuyer = request.buyerId !== request.sellerId;

  /* ================= STATUS UI MAP ================= */
  const statusMap: Record<
    TransferStatus,
    {
      icon: React.ReactNode;
      color: string;
      bg: string;
      border: string;
    }
  > = {
    pending: {
      icon: <Clock size={16} />,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
    },
    payment_pending: {
      icon: <Clock size={16} />,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    paid: {
      icon: <Activity size={16} />,
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
      border: "border-indigo-500/20",
    },
    completed: {
      icon: <CheckCircle2 size={16} />,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
    rejected: {
      icon: <XCircle size={16} />,
      color: "text-red-500",
      bg: "bg-red-500/10",
      border: "border-red-500/20",
    },
  };

  const style =
    statusMap[request.status as TransferStatus] || statusMap.pending;

  return (
    <div className="group bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 p-5 rounded-2xl hover:border-blue-500/30 transition-all flex flex-col md:flex-row justify-between gap-6 shadow-sm">

      {/* LEFT */}
      <div className="flex items-center gap-5">

        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            isBuyer
              ? "bg-blue-50 text-blue-600"
              : "bg-slate-50 text-slate-600"
          }`}
        >
          <ArrowUpRight size={22} />
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase text-slate-400">
            {isBuyer ? "Buying Land" : "Selling Land"}
          </p>

          <p className="text-sm font-bold text-slate-900 dark:text-white">
            Land #{request.landId}
          </p>

          <p className="text-xs text-slate-500 font-mono">
            Receipt: {request.mpesaReceiptCode || "N/A"}
          </p>

          <p className="text-[10px] text-slate-400">
            {new Date(request.createdAt).toDateString()}
          </p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4">

        {/* STATUS */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold uppercase ${style.bg} ${style.border} ${style.color}`}
        >
          {style.icon}
          {request.status.replace("_", " ")}
        </div>

        {/* VIEW */}
        <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition">
          <ChevronRight size={18} />
        </button>

      </div>
    </div>
  );
};

/* ================= LOADING ================= */
const LoadingState = () => (
  <div className="py-20 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
    Loading transactions...
  </div>
);

/* ================= EMPTY ================= */
const EmptyRequests = () => (
  <div className="py-20 flex flex-col items-center text-slate-500">
    <Activity size={28} className="mb-3" />
    <p className="font-bold text-sm">No transactions yet</p>
    <p className="text-xs">Your activity will appear here</p>
  </div>
);

export default MyRequests;