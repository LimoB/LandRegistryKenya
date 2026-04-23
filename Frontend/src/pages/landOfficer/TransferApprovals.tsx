import React from "react";
import { PenTool, Loader2, AlertCircle } from "lucide-react";
import { 
  useGetPendingTransfersQuery, 
  useApproveTransferMutation,
  useRejectTransferMutation 
} from "../../features/transfers/transferApi";
import { getErrorMessage } from "../../utils/errorHelpers";
import TransferCard from "../../components/officer/TransferCard";

/**
 * Define the expected successful response from the approve mutation
 */
interface ApprovalResponse {
  success: boolean;
  message: string;
  txHash?: string;
}

const TransferApprovals: React.FC = () => {
  const { data: transfers, isLoading, isError, refetch } = useGetPendingTransfersQuery();
  const [approveTransfer, { isLoading: isApproving }] = useApproveTransferMutation();
  const [rejectTransfer, { isLoading: isRejecting }] = useRejectTransferMutation();

  const handleApprove = async (id: number) => {
    if (!window.confirm("Finalize transfer? This moves ownership on the blockchain.")) return;
    
    try {
      // Cast the unwrapped result to our expected interface
      const res = (await approveTransfer(id).unwrap()) as ApprovalResponse;
      
      const hashDisplay = res.txHash 
        ? `\nTx: ${res.txHash.substring(0, 15)}...` 
        : "";

      alert(`Success! Ownership transferred.${hashDisplay}`);
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  const handleReject = async (id: number) => {
    const reason = prompt("Enter rejection reason (e.g. Invalid documents):");
    if (!reason) return;
    
    try {
      await rejectTransfer({ id, reason }).unwrap();
      alert("Transfer request rejected.");
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  if (isError) return (
    <div className="p-8 flex items-center gap-3 text-red-500 font-bold bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-100 dark:border-red-900">
      <AlertCircle size={20} /> FAILED TO LOAD PENDING LEDGER
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-6">
      {/* Page Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-900 pb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <PenTool className="text-blue-600" /> Transfer Approvals
          </h1>
          <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-[0.2em]">
            Ministry of Lands Node
          </p>
        </div>
        <button 
          onClick={() => refetch()} 
          className="text-[10px] font-bold uppercase text-slate-500 hover:text-blue-600 flex items-center gap-2 transition-colors"
        >
          {(isLoading || isApproving || isRejecting) && <Loader2 className="animate-spin" size={12} />}
          Refresh Ledger
        </button>
      </header>

      {/* Main Container */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="py-24 text-center">
            <Loader2 className="animate-spin text-blue-600 mx-auto" size={40} />
            <p className="font-bold text-slate-400 uppercase text-[10px] mt-4 tracking-widest">Querying Ledger...</p>
          </div>
        ) : transfers?.length === 0 ? (
          <div className="py-24 text-center bg-slate-50 dark:bg-slate-900/20 rounded-[2rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
            <p className="text-slate-500 font-medium italic text-sm">All clear! No pending transfers.</p>
          </div>
        ) : (
          transfers?.map((tx) => (
            <TransferCard 
              key={tx.id} 
              tx={tx} 
              isProcessing={isApproving || isRejecting} 
              onApprove={handleApprove} 
              onReject={handleReject} 
            />
          ))
        )}
      </div>
    </div>
  );
};

export default TransferApprovals;