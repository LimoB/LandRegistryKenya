import React, { useState, useMemo } from "react";
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

/* ================= TYPES ================= */
interface TransactionError {
  reason?: string;
  message?: string;
  data?: unknown;
}

/* ============================================================
   COMPONENT
============================================================ */
const VerifyLands: React.FC = () => {
  const { data: lands = [], isLoading } = useGetLandsQuery();
  const [verifyLand] = useVerifyLandMutation();

  const { getContract, connectWallet } = useBlockchain();

  const [processingId, setProcessingId] = useState<string | number | null>(null);

  /* ================= FILTER ================= */
  const pendingLands = useMemo(
    () => lands.filter((l) => l.verificationStatus === "pending"),
    [lands]
  );

  /* ================= HANDLER ================= */
  const handleApproveAndMint = async (land: Land) => {
    if (processingId) return; // prevent double clicks

    setProcessingId(land.id);

    const action = async () => {
      /* ---------- 1. VALIDATE WALLET ---------- */
      const rawAddress = land.owner?.walletAddress?.trim();

      if (!rawAddress) {
        throw new Error("Owner wallet address is missing.");
      }

      let validatedAddress: string;
      try {
        validatedAddress = ethers.getAddress(rawAddress);
      } catch {
        throw new Error("Invalid wallet address format.");
      }

      /* ---------- 2. CONNECT WALLET ---------- */
      await connectWallet();

      /* ---------- 3. GET CONTRACT ---------- */
      const contract = await getContract();

      if (!contract) {
        throw new Error("Smart contract not available.");
      }

      /* ---------- 4. SEND TX ---------- */
      const tx = await contract.registerLand(
        validatedAddress,
        land.lrNumber,
        land.ipfsDocHash || "N/A"
      );

      /* ---------- 5. WAIT FOR CONFIRMATION ---------- */
      await tx.wait();

      /* ---------- 6. BACKEND SYNC ---------- */
      await verifyLand(land.id).unwrap();

      return land.lrNumber;
    };

    try {
      await toast.promise(action(), {
        loading: `Registering ${land.lrNumber} on blockchain...`,

        success: (lr) =>
          `Land ${lr} successfully verified & minted.`,

        error: (err: unknown) => {
          const error = err as TransactionError;

          const msg = error?.message || "";

          if (msg.includes("user rejected")) {
            return "Transaction cancelled in wallet.";
          }

          if (msg.includes("insufficient funds")) {
            return "Insufficient gas fees in wallet.";
          }

          if (msg.includes("already exists") || msg.includes("duplicate")) {
            return "Duplicate land record detected.";
          }

          if (msg.includes("estimateGas")) {
            return "Transaction failed (possible contract rule violation).";
          }

          return error.reason || msg || "Verification failed.";
        },
      });
    } catch (err) {
      console.error("Verification Flow Error:", err);
    } finally {
      setProcessingId(null);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="max-w-6xl mx-auto space-y-8 p-6">
      
      {/* HEADER */}
      <div className="border-b border-border pb-6">
        <h1 className="text-2xl font-black text-text flex items-center gap-3">
          <FileSearch className="text-primary" />
          New Land Requests
        </h1>

        <p className="text-sm text-text/50 mt-1 uppercase font-bold tracking-tight">
          Review and register land records on the blockchain
        </p>
      </div>

      {/* CONTENT */}
      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <div className="py-20 text-center text-text/40 font-black uppercase text-xs">
            <Loader2 className="animate-spin mx-auto mb-2 text-primary" />
            Loading registry records...
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
              No pending land verifications
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyLands;