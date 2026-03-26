import React, { useState } from "react";
import { useGetLandsQuery, useVerifyLandMutation, type Land } from "../../features/lands/landApi";
import { useBlockchain } from "../../features/blockchain/useBlockchain";
import { 
  FileSearch, 
  ExternalLink, 
  CheckCircle, 
  FileText, 
  MapPin, 
  Calendar,
  Loader2
} from "lucide-react";

/**
 * Extending the base Land type to include nested owner data 
 * if your landApi.ts doesn't already define it.
 */
interface ExtendedLand extends Land {
  owner?: {
    walletAddress: string;
    full_name: string;
  };
  ipfsDocHash: string;
}

const VerifyLands: React.FC = () => {
  // 1. Get lands from API
  const { data: lands, isLoading } = useGetLandsQuery();
  const [verifyLand, { isLoading: isBackendUpdating }] = useVerifyLandMutation();
  const { getContract, connectWallet } = useBlockchain();
  
  const [isMinting, setIsMinting] = useState(false);

  // 2. FIXED: Changed 'allLands' to 'lands' to match the variable from useGetLandsQuery
  const pendingLands = (lands as ExtendedLand[])?.filter(
    (land) => land.verificationStatus === 'pending'
  ) || [];

  // 3. FIXED: Added 'ExtendedLand' type to parameter to stop 'implicitly any' error
  const handleApproveAndMint = async (land: ExtendedLand) => {
    setIsMinting(true);
    try {
      await connectWallet();
      const contract = await getContract();

      console.log(`Minting NFT for LR: ${land.lrNumber}`);

      // Smart Contract Call
      const transaction = await contract.registerLand(
        land.owner?.walletAddress, 
        land.lrNumber,
        land.ipfsDocHash || "N/A"
      );

      const receipt = await transaction.wait();
      
      // Extract ID from blockchain events
      const event = receipt.events?.find((e: any) => e.event === "LandRegistered");
      const onChainId = event ? event.args.id.toNumber() : Math.floor(Math.random() * 100000);

      // Update the Backend
      await verifyLand({ 
        id: land.id, 
        payload: { 
            onChainId,
            status: "verified" 
        } 
      }).unwrap();
      
      alert(`Success! Asset ${land.lrNumber} is now secured on-chain.`);
    } catch (err: any) {
      console.error("Verification failed", err);
      alert(err.reason || "Blockchain error. Verify your wallet is connected to the right network.");
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-6">
      <div className="border-b border-slate-100 dark:border-slate-900 pb-6">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <FileSearch className="text-blue-600" /> Land Verification Queue
        </h1>
        <p className="text-sm text-slate-500 mt-1 uppercase font-bold tracking-tighter">
          Review physical title deeds and mint digital twin tokens
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <div className="py-20 text-center text-slate-400 font-black uppercase text-xs">
            <Loader2 className="animate-spin mx-auto mb-2" /> Accessing Records...
          </div>
        ) : pendingLands.length > 0 ? (
          pendingLands.map((land) => (
            <div key={land.id} className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:shadow-xl transition-all">
              
              <div className="flex items-start gap-5">
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl text-blue-600 shrink-0">
                  <MapPin size={24} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg font-black text-slate-900 dark:text-white">{land.lrNumber}</h4>
                  <p className="text-xs font-bold text-slate-500 uppercase">{land.county}, {land.constituency}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] bg-blue-50 dark:bg-blue-900/30 text-blue-600 px-2 py-1 rounded-md font-black uppercase">{land.landType}</span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 font-bold italic">
                      <Calendar size={10} /> {new Date(land.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 px-6 border-x border-slate-100 dark:border-slate-800">
                <a 
                  href={`https://ipfs.io/ipfs/${land.ipfsDocHash}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-2 text-xs font-black px-4 py-2 rounded-xl text-blue-600 bg-blue-50 dark:bg-blue-900/20 hover:underline hover:bg-blue-100/50 transition-all"
                >
                  <FileText size={16} /> View IPFS Deed <ExternalLink size={14} />
                </a>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  disabled={isMinting || isBackendUpdating}
                  className="px-6 py-3 rounded-xl text-red-500 text-[10px] font-black uppercase hover:bg-red-50 disabled:opacity-30"
                >
                  Reject
                </button>
                <button 
                  disabled={isMinting || isBackendUpdating}
                  onClick={() => handleApproveAndMint(land)}
                  className="bg-emerald-600 text-white text-[10px] font-black uppercase px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 disabled:opacity-50 transition-all active:scale-95"
                >
                  {isMinting ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle size={14} />}
                  {isMinting ? "MINTING..." : "Approve & Mint"}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="py-24 text-center border-2 border-dashed border-slate-100 dark:border-slate-900 rounded-3xl">
            <p className="text-slate-400 font-black uppercase text-xs tracking-[0.2em]">Queue Empty</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyLands;