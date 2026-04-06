import React, { useState } from 'react';
import { Search, ShieldCheck, MapPin, Loader2, AlertCircle } from 'lucide-react';
import { ethers, type InterfaceAbi } from 'ethers';
import LandRegistryArtifact from '../features/blockchain/artifacts/LandRegistry.json';

// --- Interfaces ---

interface LandRecord {
  id: string;
  lrNumber: string;
  owner: string;
  isVerified: boolean;
  ipfsHash: string;
  contract: string;
}

// Fixed 'any' by using ethers specific types
interface ContractArtifact {
  abi: InterfaceAbi; 
  networks: {
    [key: string]: {
      address: string;
    };
  };
}

// Define the shape of the data returned from Solidity mapping
interface SolidityLandData {
  id: bigint;
  lrNumber: string;
  owner: string;
  isVerified: boolean;
  ipfsDocHash: string;
}

const VerifyTitle: React.FC = () => {
  const [landId, setLandId] = useState<string>("");
  const [result, setResult] = useState<LandRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!landId) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      // 1. Connect to provider
      const provider = new ethers.JsonRpcProvider("http://127.0.0.1:7545");
      
      // 2. Cast artifact safely
      const artifact = LandRegistryArtifact as unknown as ContractArtifact;
      
      const network = await provider.getNetwork();
      const networkId = network.chainId.toString();
      
      const networkData = artifact.networks[networkId] || Object.values(artifact.networks)[0];

      if (!networkData || !networkData.address) {
        throw new Error("Contract not found on the detected network.");
      }
      
      const address = networkData.address;
      const contract = new ethers.Contract(address, artifact.abi, provider);

      // 3. Call contract and type the response
      // We use 'as unknown as SolidityLandData' to map the proxy object to our interface
      const landData = (await contract.lands(landId)) as unknown as SolidityLandData;

      if (!landData.lrNumber || landData.lrNumber === "") {
        throw new Error("Land record not found on the blockchain ledger.");
      }

      setResult({
        id: landData.id.toString(),
        lrNumber: landData.lrNumber,
        owner: landData.owner,
        isVerified: landData.isVerified,
        ipfsHash: landData.ipfsDocHash,
        contract: address 
      });

    } catch (err: unknown) {
      // Improved error handling by avoiding 'any'
      console.error("Blockchain Error:", err);
      
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred during verification.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 flex flex-col items-center pt-20">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">
            Blockchain <span className="text-blue-600">Verification.</span>
          </h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Instantly verify land ownership via the Distributed Ledger
          </p>
        </div>

        <form onSubmit={handleVerify} className="relative group">
          <input 
            type="number"
            placeholder="Enter Land ID (e.g., 1, 2, 3)"
            className="w-full pl-6 pr-16 py-5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold focus:ring-4 ring-blue-500/10 outline-none transition-all dark:text-white"
            value={landId}
            onChange={(e) => setLandId(e.target.value)}
          />
          <button 
            type="submit"
            disabled={loading}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-600 p-3 rounded-xl text-white hover:bg-blue-700 transition-colors disabled:bg-slate-400 flex items-center justify-center min-w-[44px]"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
          </button>
        </form>

        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm font-bold animate-in fade-in zoom-in-95">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {result && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <ShieldCheck className="text-emerald-500" size={24} />
                </div>
                <div>
                  <span className="text-xs font-black uppercase tracking-widest text-emerald-500 block">
                    {result.isVerified ? "Authentic Record" : "Unverified"}
                  </span>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Verified by Smart Contract</span>
                </div>
              </div>
              <span className="text-[9px] font-mono text-slate-400 truncate max-w-[150px] md:max-w-xs">
                CONTRACT: {result.contract}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase">Registered Owner Address</p>
                <p className="text-xs font-mono font-bold dark:text-white truncate bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                  {result.owner}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase">LR Number</p>
                <p className="text-sm font-bold dark:text-white flex items-center gap-2 p-2">
                  <MapPin size={14} className="text-blue-600"/> {result.lrNumber}
                </p>
              </div>
              <div className="col-span-1 md:col-span-2 space-y-1 pt-4 border-t border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-black text-slate-400 uppercase">IPFS Document Hash</p>
                <p className="text-[11px] font-mono text-blue-600 dark:text-blue-400 break-all bg-blue-50/50 dark:bg-blue-900/10 p-3 rounded-xl border border-blue-100/50 dark:border-blue-900/30">
                  {result.ipfsHash}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyTitle;