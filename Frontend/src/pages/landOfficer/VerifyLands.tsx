import React, { useState } from "react";
import { 
  useGetLandsQuery, 
  useVerifyLandMutation, 
  type Land 
} from "../../features/lands/landApi";
import { useBlockchain } from "../../features/blockchain/useBlockchain";
import { FileSearch, CheckCircle, Loader2 } from "lucide-react";
import LandCard from "../../components/officer/LandCard";

/* TYPES */
interface TransactionError {
  reason?: string;
  message?: string;
}

const VerifyLands: React.FC = () => {
  const { data: lands, isLoading } = useGetLandsQuery();
  
  // verifyLand mutation accepts a 'number' (id) per your landApi.ts
  const [verifyLand, { isLoading: isBackendUpdating }] = useVerifyLandMutation();
  const { getContract, connectWallet } = useBlockchain();
  
  const [isMinting, setIsMinting] = useState(false);

  // Filter for lands that need verification
  const pendingLands = lands?.filter(land => land.verificationStatus === 'pending') || [];

  const handleApproveAndMint = async (land: Land) => {
    setIsMinting(true);
    try {
      // 1. Prepare Blockchain Connection
      await connectWallet();
      const contract = await getContract();

      console.log(`[Blockchain] Initiating mint for LR: ${land.lrNumber}`);

      // 2. Execute Smart Contract Call
      const transaction = await contract.registerLand(
        land.owner?.walletAddress || "0x0000000000000000000000000000000000000000", 
        land.lrNumber,
        land.ipfsDocHash || "N/A"
      );

      // Wait for block confirmation
      await transaction.wait();
      
      // 3. Update Database via API
      // Passing only land.id to match your Mutation definition
      await verifyLand(land.id).unwrap();
      
      alert(`SUCCESS!\nLR: ${land.lrNumber}\nStatus: Secured on Distributed Ledger`);
      
    } catch (err: unknown) {
      const error = err as TransactionError;
      console.error("Verification failed", error);
      alert(error.reason || error.message || "Transaction failed. Please check your wallet connection.");
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-6">
      {/* Header */}
      <div className="border-b border-slate-100 dark:border-slate-900 pb-6">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <FileSearch className="text-blue-600" /> Land Verification Queue
        </h1>
        <p className="text-sm text-slate-500 mt-1 uppercase font-bold tracking-tighter">
          Validating titles and generating blockchain digital twins
        </p>
      </div>

      {/* Verification Queue */}
      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <div className="py-20 text-center text-slate-400 font-black uppercase text-xs">
            <Loader2 className="animate-spin mx-auto mb-2" /> Loading Registry Data...
          </div>
        ) : pendingLands.length > 0 ? (
          pendingLands.map((land) => (
            <LandCard 
              key={land.id} 
              land={land} 
              isProcessing={isMinting || isBackendUpdating}
              onApprove={handleApproveAndMint}
            />
          ))
        ) : (
          <div className="py-24 text-center border-2 border-dashed border-slate-100 dark:border-slate-900 rounded-3xl">
            <CheckCircle className="mx-auto text-slate-200 mb-4" size={48} />
            <p className="text-slate-400 font-black uppercase text-xs tracking-[0.2em]">Queue Clear: No Pending Records</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyLands;