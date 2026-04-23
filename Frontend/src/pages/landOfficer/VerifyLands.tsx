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

/* TYPES */
// Fixed: replaced 'any' with 'unknown' for the data field
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
    
    console.log("Process started for Land ID:", land.id);
    
    try {
      // 1. Clean and Validate Address
      const rawAddress = land.owner?.walletAddress?.trim();
      if (!rawAddress) {
        throw new Error("The owner does not have a wallet address assigned.");
      }

      const validatedAddress = ethers.getAddress(rawAddress.toLowerCase());

      // 2. Blockchain Connection
      await connectWallet();
      const contract = await getContract();

      // 3. Execution
      console.log("Initiating transaction for LR:", land.lrNumber);
      
      const transaction = await contract.registerLand(
        validatedAddress, 
        land.lrNumber,
        land.ipfsDocHash || "N/A"
      );

      console.log("Transaction sent. Hash:", transaction.hash);
      await transaction.wait();
      
      // 4. Backend Sync
      await verifyLand(land.id).unwrap();
      alert(`Success! ${land.lrNumber} is now officially registered.`);
      
    } catch (err: unknown) {
      // Fixed: Cast 'err' to 'TransactionError' so we avoid 'any'
      const error = err as TransactionError;
      console.error("Critical error in handleApproveAndMint:", error);
      
      let errorMessage = "An unexpected error occurred.";

      if (error.message?.includes("estimateGas") || error.message?.includes("Internal JSON-RPC error")) {
        errorMessage = "Blockchain Revert: You may not have permission to register land, or this LR Number already exists on-chain.";
      } else if (error.message?.includes("bad address checksum")) {
        errorMessage = "Address verification failed. The wallet address format is incorrect.";
      } else if (error.reason) {
        errorMessage = error.reason;
      } else if (error.message) {
        errorMessage = error.message;
      }
        
      alert(errorMessage);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-6">
      <div className="border-b border-slate-100 dark:border-slate-900 pb-6">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
          <FileSearch className="text-blue-600" /> New Land Requests
        </h1>
        <p className="text-sm text-slate-500 mt-1 uppercase font-bold tracking-tight">
          Review these records and save them to the permanent ledger
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <div className="py-20 text-center text-slate-400 font-black uppercase text-xs">
            <Loader2 className="animate-spin mx-auto mb-2" /> Searching Records...
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
          <div className="py-24 text-center border-2 border-dashed border-slate-100 dark:border-slate-900 rounded-3xl">
            <CheckCircle className="mx-auto text-slate-200 mb-4" size={48} />
            <p className="text-slate-400 font-black uppercase text-xs tracking-widest">
              No records waiting for review
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyLands;