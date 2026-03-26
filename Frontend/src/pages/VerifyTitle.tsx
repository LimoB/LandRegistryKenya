import React, { useState } from 'react';
import { Search, ShieldCheck, MapPin, Loader2, AlertCircle } from 'lucide-react';
import { ethers } from 'ethers';
import LandRegistryArtifact from '../features/blockchain/artifacts/LandRegistry.json';

const VerifyTitle = () => {
  const [landId, setLandId] = useState(""); // Your contract uses uint for lookup
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      // 1. Connect to your local Truffle node
      const provider = new ethers.JsonRpcProvider("http://127.0.0.1:9545");
      
      // 2. Get contract address from artifacts
      const networkId = Object.keys(LandRegistryArtifact.networks)[0];
      const address = (LandRegistryArtifact.networks as any)[networkId].address;
      
      const contract = new ethers.Contract(address, LandRegistryArtifact.abi, provider);

      // 3. Call the mapping: lands(uint256)
      // Note: If you want to search by LR Number string, 
      // you'd need a different function in your Solidity.
      const landData = await contract.lands(parseInt(landId));

      if (landData.lrNumber === "") {
        throw new Error("Land record not found on-chain.");
      }

      setResult({
        id: landData.id.toString(),
        lrNumber: landData.lrNumber,
        owner: landData.owner,
        isVerified: landData.isVerified,
        ipfsHash: landData.ipfsDocHash,
        // Since we are reading from mapping, we don't get the TX hash 
        // unless we search events, but we can show the contract address.
        contract: address 
      });

    } catch (err: any) {
      setError(err.message || "Failed to fetch from blockchain.");
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
            disabled={loading}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-600 p-3 rounded-xl text-white hover:bg-blue-700 transition-colors disabled:bg-slate-400"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
          </button>
        </form>

        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm font-bold">
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
                <span className="text-xs font-black uppercase tracking-widest text-emerald-500">
                   {result.isVerified ? "Authentic Record" : "Unverified"}
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 truncate max-w-[200px]">
                CONTRACT: {result.contract}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase">Registered Owner Address</p>
                <p className="text-xs font-mono font-bold dark:text-white truncate">{result.owner}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase">LR Number</p>
                <p className="text-sm font-bold dark:text-white flex items-center gap-2"><MapPin size={14}/> {result.lrNumber}</p>
              </div>
              <div className="col-span-2 space-y-1 pt-4 border-t border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-black text-slate-400 uppercase">IPFS Document Hash</p>
                <p className="text-[10px] font-mono dark:text-blue-400 truncate">{result.ipfsHash}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyTitle;