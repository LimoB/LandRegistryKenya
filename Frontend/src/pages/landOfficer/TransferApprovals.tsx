import React, { useMemo } from "react";
import { 
  PenTool, 
  Loader2, 
  AlertCircle, 
  RefreshCw, 
  CheckCircle2, 
  ShieldCheck, 
  Clock, 
  Database 
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

import { 
  useGetPendingTransfersQuery, 
  useApproveTransferMutation,
  useRejectTransferMutation,
  type TransferRequest 
} from "../../features/transfers/transferApi";

import { getErrorMessage } from "../../utils/errorHelpers";
import TransferCard from "../../components/officer/TransferCard";

/* ================= TYPES ================= */
interface ApprovalResponse {
  success: boolean;
  message: string;
  txHash?: string;
}

interface TransfersApiResponse {
  success?: boolean;
  data?: TransferRequest[];
}

/* ============================================================
   COMPONENT
============================================================ */
const TransferApprovals: React.FC = () => {
  const { data, isLoading, isError, refetch } = useGetPendingTransfersQuery();

  const [approveTransfer, { isLoading: isApproving }] =
    useApproveTransferMutation();

  const [rejectTransfer, { isLoading: isRejecting }] =
    useRejectTransferMutation();

  /* ================= NORMALIZE DATA ================= */
  const transfers = useMemo<TransferRequest[]>(() => {
    if (!data) return [];

    // If backend already returns array
    if (Array.isArray(data)) return data;

    // If wrapped response
    const res = data as TransfersApiResponse;
    return res.data ?? [];
  }, [data]);

  /* ================= GLOBAL PROCESSING FLAG ================= */
  const isProcessing = isApproving || isRejecting;

  /* ================= HANDLERS ================= */

  const handleApprove = async (id: number) => {
    const toastId = toast.loading(
      "Executing smart contract & updating registry..."
    );

    try {
      const res = await approveTransfer(id).unwrap() as ApprovalResponse;

      toast.success(
        () => (
          <div className="flex flex-col gap-1">
            <span className="font-black text-xs uppercase tracking-tight">
              Transfer Approved & Minted
            </span>

            {res.txHash && (
              <span className="text-[9px] font-mono bg-slate-100 p-1 rounded border break-all">
                TX: {res.txHash}
              </span>
            )}
          </div>
        ),
        { id: toastId, duration: 6000 }
      );

      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err), { id: toastId });
    }
  };

  const handleReject = async (id: number) => {
    const reason = prompt(
      "Enter official rejection reason (this will be recorded):"
    );

    if (!reason || reason.trim().length < 3) {
      toast.error("Rejection reason must be provided.");
      return;
    }

    const toastId = toast.loading("Updating request status...");

    try {
      await rejectTransfer({ id, reason }).unwrap();

      toast.success("Transfer rejected successfully.", { id: toastId });
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err), { id: toastId });
    }
  };

  /* ================= ERROR STATE ================= */
  if (isError) {
    return (
      <div className="max-w-6xl mx-auto p-6 mt-10">
        <div className="p-10 flex flex-col items-center text-center gap-4 text-red-600 bg-red-50/50 rounded-[3rem] border-2 border-dashed border-red-200">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center animate-bounce">
            <AlertCircle size={32} />
          </div>

          <div>
            <h2 className="text-xl font-black uppercase tracking-tighter">
              Registry Sync Failed
            </h2>
            <p className="text-sm font-medium text-red-500 mt-2 max-w-xs">
              Unable to reach registry services. Please retry connection.
            </p>
          </div>

          <button
            onClick={() => refetch()}
            className="mt-4 px-8 py-3 bg-red-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-700 transition-all flex items-center gap-2"
          >
            <RefreshCw size={14} /> Reconnect
          </button>
        </div>
      </div>
    );
  }

  /* ================= MAIN UI ================= */
  return (
    <div className="max-w-6xl mx-auto space-y-10 p-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Toaster position="bottom-right" />

      {/* ================= HEADER ================= */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-slate-100 pb-10">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
              <ShieldCheck size={12} /> Authority Access
            </span>

            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          </div>

          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
            <div className="p-3 bg-slate-900 rounded-2xl text-white shadow-xl">
              <PenTool size={28} />
            </div>
            Transfer Approvals
          </h1>

          <p className="text-slate-500 font-medium max-w-md">
            Approve or reject land transfers. Approval triggers blockchain title minting.
          </p>
        </div>

        {/* ================= STATS ================= */}
        <div className="flex items-center gap-4">
          <div className="flex gap-4 px-6 py-4 bg-slate-50 rounded-[2rem] border border-slate-100">
            <div className="pr-4 border-r border-slate-200">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                <Clock size={10} /> Pending
              </p>
              <p className="text-xl font-black text-slate-900">
                {transfers.length}
              </p>
            </div>

            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                <Database size={10} /> Network
              </p>
              <p className="text-xl font-black text-emerald-600">Active</p>
            </div>
          </div>

          <button
            onClick={() => refetch()}
            disabled={isLoading || isProcessing}
            className="group flex items-center gap-3 px-6 py-4 bg-white border-2 border-slate-900 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-900 hover:text-white transition-all shadow-lg disabled:opacity-50"
          >
            {(isLoading || isProcessing) ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <RefreshCw
                className="group-hover:rotate-180 transition-transform duration-700"
                size={16}
              />
            )}
            Sync
          </button>
        </div>
      </header>

      {/* ================= BODY ================= */}
      <div>
        {isLoading ? (
          <div className="py-40 text-center">
            <Loader2 className="animate-spin mx-auto" size={40} />
            <p className="mt-4 text-sm text-slate-500">
              Loading transfer queue...
            </p>
          </div>
        ) : transfers.length === 0 ? (
          <div className="py-40 text-center bg-slate-50/50 rounded-[4rem] border-2 border-dashed border-slate-200">
            <CheckCircle2 size={40} className="mx-auto text-emerald-500" />
            <h3 className="mt-4 font-black text-lg">All Clear</h3>
            <p className="text-sm text-slate-500">
              No pending transfers.
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {transfers.map((tx) => (
              <TransferCard
                key={tx.id}
                tx={tx}
                isProcessing={isProcessing}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransferApprovals;