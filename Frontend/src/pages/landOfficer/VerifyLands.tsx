import React, { useState } from "react";
import { 
  useGetLandsQuery, 
  useVerifyLandMutation, 
  type Land 
} from "../../features/lands/landApi";
import { useBlockchain } from "../../features/blockchain/useBlockchain";
import { ethers } from "ethers";
import { FileSearch, CheckCircle, Loader2 } from "lucide-react";
import LandCard from "../../components/officer/LandCard";
import toast from "react-hot-toast";

/* TYPES */
interface TransactionError {
  reason?: string;
  message?: string;
  data?: unknown;
}

const VerifyLands: React.FC = () => {
  const { data: lands, isLoading } = useGetLandsQuery();
  const [verifyLand] = useVerifyLandMutation();
  const { getContract, connectWallet } = useBlockchain();
  
  const [processingId, setProcessingId] = useState<string | number | null>(null);

  const pendingLands = lands?.filter(land => land.verificationStatus === 'pending') || [];

  const handleApproveAndMint = async (land: Land) => {
    setProcessingId(land.id);
    
    // Create the promise for toast to track
    const processAction = async () => {
      // 1. Validate Address
      const rawAddress = land.owner?.walletAddress?.trim();
      if (!rawAddress) throw new Error("Owner wallet address is missing.");
      const validatedAddress = ethers.getAddress(rawAddress.toLowerCase());

      // 2. Blockchain Logic
      await connectWallet();
      const contract = await getContract();
      
      const transaction = await contract.registerLand(
        validatedAddress, 
        land.lrNumber,
        land.ipfsDocHash || "N/A"
      );

      // Wait for block confirmation
      await transaction.wait();
      
      // 3. Backend Sync
      await verifyLand(land.id).unwrap();
      
      return land.lrNumber;
    };

    // Trigger the themed toast
    toast.promise(processAction(), {
      loading: `Verifying ${land.lrNumber} on the ledger...`,
      success: (lr) => `Land ${lr} successfully registered!`,
      error: (err: unknown) => {
        const error = err as TransactionError;
        // Smart error messaging
        if (error.message?.includes("user rejected")) return "Transaction cancelled by user.";
        if (error.message?.includes("estimateGas")) return "Chain Revert: Likely duplicate LR Number.";
        return error.reason || error.message || "Failed to verify land.";
      }
    });

    try {
      await processAction;
    } catch (error) {
      console.error("Verification Flow Error:", error);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-6">
      <div className="border-b border-border pb-6">
        <h1 className="text-2xl font-black text-text flex items-center gap-3">
          <FileSearch className="text-primary" /> New Land Requests
        </h1>
        <p className="text-sm text-text/50 mt-1 uppercase font-bold tracking-tight">
          Review these records and save them to the permanent ledger
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <div className="py-20 text-center text-text/40 font-black uppercase text-xs">
            <Loader2 className="animate-spin mx-auto mb-2 text-primary" /> 
            Searching Records...
          </div>
        ) : pendingLands.length > 0 ? (
          pendingLands.map((land) => (
            <LandCard 
              key={land.id} 
              land={land} 
              processingId={processingId}
              onApprove={handleApproveAndMint}
            />
          ))
        ) : (
          <div className="py-24 text-center border-2 border-dashed border-border rounded-3xl bg-card/30">
            <CheckCircle className="mx-auto text-border mb-4" size={48} />
            <p className="text-text/40 font-black uppercase text-xs tracking-widest">
              No records waiting for review
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyLands;