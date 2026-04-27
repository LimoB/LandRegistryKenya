import React, { useMemo } from "react";
import { PenTool, Loader2, AlertCircle, RefreshCw, CheckCircle2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { 
  useGetPendingTransfersQuery, 
  useApproveTransferMutation,
  useRejectTransferMutation,
  type TransferRequest // Import your existing type
} from "../../features/transfers/transferApi";
import { getErrorMessage } from "../../utils/errorHelpers";
import TransferCard from "../../components/officer/TransferCard";

/**
 * Interfaces to eliminate 'any'
 */
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

  /**
   * FIX: Replaced 'any' with explicit 'TransfersApiResponse'
   */
  const transfers = useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data)) return data as TransferRequest[];
    return (data as TransfersApiResponse).data || [];
  }, [data]);

  const handleApprove = async (id: number) => {
    const loadingToast = toast.loading("Finalizing transfer on blockchain...");
    
    try {
      const res = (await approveTransfer(id).unwrap()) as ApprovalResponse;
      
      toast.success(
        () => ( // FIX: Removed unused '(t)' parameter
          <span className="flex flex-col">
            <b className="font-bold">Ownership Transferred!</b>
            {res.txHash && (
              <span className="text-[10px] font-mono opacity-70 break-all">
                Hash: {res.txHash.substring(0, 20)}...
              </span>
            )}
          </span>
        ),
        { id: loadingToast, duration: 5000 }
      );
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err), { id: loadingToast });
    }
  };

  const handleReject = async (id: number) => {
    const reason = prompt("Reason for rejection:");
    if (!reason) return;

    const loadingToast = toast.loading("Processing rejection...");
    
    try {
      await rejectTransfer({ id, reason }).unwrap();
      toast.success("Transfer request rejected.", { id: loadingToast });
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err), { id: loadingToast });
    }
  };

  if (isError) return (
    <div className="max-w-6xl mx-auto p-6 mt-10">
      <div className="p-8 flex items-center justify-between gap-3 text-red-600 font-black bg-red-50 rounded-3xl border border-red-100">
        <div className="flex items-center gap-3">
          <AlertCircle size={24} /> 
          <div>
            <p className="uppercase tracking-widest text-xs">Ledger Sync Failed</p>
            <p className="text-[10px] font-medium opacity-70 italic font-sans">Node connection timed out.</p>
          </div>
        </div>
        <button onClick={() => refetch()} className="p-2 bg-white rounded-xl shadow-sm hover:rotate-180 transition-transform duration-500">
          <RefreshCw size={18} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-6 animate-in fade-in duration-700">
      <Toaster position="top-right" reverseOrder={false} />
      
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">
              Ministry of Lands Registry
            </span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <PenTool className="text-blue-600" size={32} /> Transfer Approvals
          </h1>
        </div>

        <div className="flex items-center gap-3">
           <div className="text-right hidden sm:block">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Queue Status</p>
              <p className="text-sm font-bold text-slate-700">{transfers.length} Pending Actions</p>
           </div>
           <button 
            onClick={() => refetch()} 
            disabled={isLoading || isApproving}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 hover:border-blue-200 transition-all shadow-sm"
          >
            {(isLoading || isApproving || isRejecting) ? (
              <Loader2 className="animate-spin" size={14} />
            ) : (
              <RefreshCw size={14} />
            )}
            Refresh Ledger
          </button>
        </div>
      </header>

      <div className="space-y-6">
        {isLoading ? (
          <div className="py-32 text-center bg-white rounded-[3rem] border border-slate-100 shadow-sm">
            <Loader2 className="animate-spin text-blue-600 mx-auto" size={48} />
            <p className="font-black text-slate-900 uppercase text-xs mt-6 tracking-[0.2em]">Decrypting Ledger Data...</p>
            <p className="text-[10px] text-slate-400 mt-2">Connecting to distributed node 0x71C...ae22</p>
          </div>
        ) : transfers.length === 0 ? (
          <div className="py-32 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
            <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
              <CheckCircle2 className="text-emerald-500" size={32} />
            </div>
            <p className="text-slate-900 font-black text-xl italic tracking-tight">Ledger Is Current</p>
            <p className="text-slate-500 text-xs mt-1">There are no pending land transfer requests awaiting approval.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {/* FIX: Explicitly typed 'tx' as TransferRequest */}
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