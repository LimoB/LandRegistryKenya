import React, { useState } from "react";
import { 
  useGetPendingTransfersQuery, 
  useApproveTransferMutation,
  type TransferRequest // Import the updated interface
 // Import the updated interface
} from "../../features/transfers/transferApi";
import { useBlockchain } from "../../features/blockchain/useBlockchain";
import { 
  PenTool, 
  ArrowRight, 
  CreditCard, 
  ShieldCheck, 
  User, 
  Loader2,
  AlertCircle
} from "lucide-react";

const TransferApprovals: React.FC = () => {
  const { data: transfers, isLoading, isError } = useGetPendingTransfersQuery();
  const [approveTransfer, { isLoading: isBackendUpdating }] = useApproveTransferMutation();
  
  const { getContract, connectWallet } = useBlockchain();
  const [isMinting, setIsMinting] = useState(false);

  const handleApprove = async (txData: TransferRequest) => {
    // 1. Validation: Extract nested data from Drizzle 'with' join
    const buyerWallet = txData.buyer?.walletAddress;
    const onChainLandId = txData.land?.onChainId;

    if (!buyerWallet || onChainLandId === undefined) {
       alert("Error: Critical blockchain data (Wallet or On-Chain ID) is missing for this record.");
       return;
    }

    setIsMinting(true);
    
    try {
      // 2. Blockchain Handshake
      await connectWallet();
      const contract = await getContract();

      console.log(`Finalizing Transfer: Land #${onChainLandId} to Buyer ${buyerWallet}`);

      // 3. Contract Call: transferOwnership(landId, newOwner, mpesaRef)
      const transaction = await contract.transferOwnership(
        onChainLandId, 
        buyerWallet, 
        txData.mpesaReceiptCode
      );

      // 4. Wait for Block Confirmation
      const receipt = await transaction.wait();
      
      // 5. Sync Backend Database via RTK Query
      await approveTransfer({ 
        id: txData.id, 
        payload: { 
          blockchainTxHash: receipt.hash, 
          status: 'transferred' // Matches your requestStatusEnum
        } 
      }).unwrap();

      alert(`Success! Title Deed Transferred. Hash: ${receipt.hash.substring(0, 10)}...`);
    } catch (err: any) {
      console.error("Blockchain Approval Error:", err);
      alert(err.reason || "Transaction failed. Please check your MetaMask connection.");
    } finally {
      setIsMinting(false);
    }
  };

  // Error Handling UI
  if (isError) {
    return (
      <div className="p-8 flex items-center gap-3 text-red-500 font-bold bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-100 dark:border-red-900">
        <AlertCircle /> FAILED TO LOAD PENDING LEDGER
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in slide-in-from-right-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-900 pb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <PenTool className="text-blue-600" /> Transfer Approvals
          </h1>
          <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-[0.2em]">
            Ministry of Lands • Official Verification Node
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="py-24 text-center flex flex-col items-center">
             <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
             <p className="font-bold text-slate-400 uppercase text-[10px] tracking-widest">Querying Distributed Ledger...</p>
          </div>
        ) : !transfers || transfers.length === 0 ? (
          <div className="py-24 text-center bg-slate-50 dark:bg-slate-900/20 rounded-3xl border-2 border-dashed border-slate-100 dark:border-slate-800">
            <p className="text-slate-500 font-medium italic text-sm">All clear! No transfers awaiting signature.</p>
          </div>
        ) : (
          transfers.map((tx) => (
            <div key={tx.id} className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all">
              <div className="p-6 grid grid-cols-1 lg:grid-cols-4 items-center gap-8">
                
                {/* Ownership Flow Visual */}
                <div className="lg:col-span-2 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="text-center">
                    <p className="text-[8px] font-black text-slate-400 uppercase mb-2">Seller</p>
                    <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center mx-auto shadow-sm">
                        <User size={18} className="text-slate-400" />
                    </div>
                    <p className="mt-2 text-[11px] font-black dark:text-white truncate w-24">
                      {tx.seller?.fullName}
                    </p>
                  </div>

                  <ArrowRight className="text-blue-600 animate-pulse" size={24} />

                  <div className="text-center">
                    <p className="text-[8px] font-black text-slate-400 uppercase mb-2">Buyer</p>
                    <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center mx-auto shadow-sm border-2 border-blue-500/20">
                        <User size={18} className="text-blue-600" />
                    </div>
                    <p className="mt-2 text-[11px] font-black dark:text-white truncate w-24">
                      {tx.buyer?.fullName}
                    </p>
                  </div>
                </div>

                {/* Audit & Land Details */}
                <div className="flex flex-col space-y-2">
                    <div className="flex items-center gap-2 text-emerald-600">
                        <CreditCard size={14} />
                        <span className="text-[9px] font-bold uppercase tracking-widest">M-Pesa Verified</span>
                    </div>
                    <p className="font-mono text-lg font-black dark:text-white tracking-tighter tabular-nums">
                        {tx.mpesaReceiptCode}
                    </p>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[8px] font-black text-slate-400 uppercase">Parcel Reference</span>
                      <p className="text-[11px] text-blue-600 font-bold uppercase">
                        LR: {tx.land?.lrNumber} (ID: {tx.land?.onChainId})
                      </p>
                    </div>
                </div>

                {/* Signing Action */}
                <div className="text-right">
                  <button 
                    disabled={isMinting || isBackendUpdating}
                    onClick={() => handleApprove(tx)}
                    className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.15em] hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95 shadow-xl"
                  >
                    {isMinting || isBackendUpdating ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <ShieldCheck size={16} />
                    )}
                    {isMinting ? "SIGNING..." : isBackendUpdating ? "SAVING..." : "FINALIZE"}
                  </button>
                </div>

              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TransferApprovals;