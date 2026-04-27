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
  data?: TransferRequest[];
  success?: boolean;
}

const TransferApprovals: React.FC = () => {
  const { data, isLoading, isError, refetch } = useGetPendingTransfersQuery();
  const [approveTransfer, { isLoading: isApproving }] = useApproveTransferMutation();
  const [rejectTransfer, { isLoading: isRejecting }] = useRejectTransferMutation();

  const transfers = useMemo((): TransferRequest[] => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    const responseBody = data as TransfersApiResponse;
    return responseBody.data || [];
  }, [data]);

  /* ================= HANDLERS ================= */
  const handleApprove = async (id: number) => {
    const loadingToast = toast.loading("Executing Smart Contract & Updating Ledger...");
    
    try {
      const res = await approveTransfer(id).unwrap() as ApprovalResponse;
      
      toast.success(
        () => (
          <div className="flex flex-col gap-1">
            <span className="font-black text-xs uppercase tracking-tight">Block Minted Successfully</span>
            {res.txHash && (
              <span className="text-[9px] font-mono bg-slate-100 p-1 rounded border break-all">
                TX: {res.txHash}
              </span>
            )}
          </div>
        ),
        { id: loadingToast, duration: 6000 }
      );
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err), { id: loadingToast });
    }
  };

  const handleReject = async (id: number) => {
    const reason = prompt("Enter formal reason for rejection (this will be logged):");
    if (!reason) return;

    const loadingToast = toast.loading("Updating request status...");
    
    try {
      await rejectTransfer({ id, reason }).unwrap();
      toast.success("Request flagged as rejected.", { id: loadingToast });
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err), { id: loadingToast });
    }
  };

  /* ================= ERROR STATE ================= */
  if (isError) return (
    <div className="max-w-6xl mx-auto p-6 mt-10">
      <div className="p-10 flex flex-col items-center text-center gap-4 text-red-600 bg-red-50/50 rounded-[3rem] border-2 border-dashed border-red-200">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center animate-bounce">
          <AlertCircle size={32} /> 
        </div>
        <div>
          <h2 className="text-xl font-black uppercase tracking-tighter">Registry Sync Failed</h2>
          <p className="text-sm font-medium text-red-500 mt-2 max-w-xs">
            The blockchain node is unreachable or your session has expired.
          </p>
        </div>
        <button 
          onClick={() => refetch()} 
          className="mt-4 px-8 py-3 bg-red-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-700 transition-all flex items-center gap-2"
        >
          <RefreshCw size={14} /> Reconnect to Node
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-10 p-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <Toaster position="bottom-right" reverseOrder={false} />
      
      {/* HEADER SECTION */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-slate-100 pb-10">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
              <ShieldCheck size={12} /> Secure Authority Access
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
            Review and verify land transfer requests. Approving will trigger ownership updates on the distributed ledger.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
           {/* STATS MINI-CARDS */}
           <div className="flex gap-4 px-6 py-4 bg-slate-50 rounded-[2rem] border border-slate-100">
              <div className="pr-4 border-r border-slate-200">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                  <Clock size={10} /> Pending
                </p>
                <p className="text-xl font-black text-slate-900">{transfers.length}</p>
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
            disabled={isLoading || isApproving || isRejecting}
            className="group flex items-center gap-3 px-6 py-4 bg-white border-2 border-slate-900 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 hover:bg-slate-900 hover:text-white transition-all shadow-lg active:scale-95 disabled:opacity-50"
          >
            {(isLoading || isApproving || isRejecting) ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <RefreshCw className="group-hover:rotate-180 transition-transform duration-700" size={16} />
            )}
            Sync Ledger
          </button>
        </div>
      </header>

      {/* CONTENT BODY */}
      <div className="relative">
        {isLoading ? (
          <div className="py-40 text-center bg-white rounded-[4rem] border border-slate-100 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-50/20 to-transparent" />
            <div className="relative z-10">
              <div className="w-20 h-20 mx-auto relative">
                 <div className="absolute inset-0 border-4 border-blue-100 rounded-full" />
                 <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
              <p className="font-black text-slate-900 uppercase text-sm mt-8 tracking-[0.3em]">Querying Node Clusters</p>
              <p className="text-[10px] text-slate-400 mt-2 font-mono">ENCRYPTED TUNNEL: ESTABLISHED</p>
            </div>
          </div>
        ) : transfers.length === 0 ? (
          <div className="py-40 text-center bg-slate-50/50 rounded-[4rem] border-2 border-dashed border-slate-200">
            <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl border border-slate-100">
              <CheckCircle2 className="text-emerald-500" size={40} />
            </div>
            <h3 className="text-slate-900 font-black text-2xl tracking-tighter">Queue Empty</h3>
            <p className="text-slate-500 text-sm mt-2 max-w-sm mx-auto">
              Outstanding requests have been processed. All titles are synchronized with the national registry.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 pb-20">
            {transfers.map((tx: TransferRequest) => (
              <TransferCard 
                key={tx.id} 
                tx={tx} 
                isProcessing={isApproving || isRejecting} 
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