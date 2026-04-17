import React, { useState } from "react";
import {
  Search,
  ShieldCheck,
  MapPin,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { ethers, type InterfaceAbi } from "ethers";
import LandRegistryArtifact from "../features/blockchain/artifacts/LandRegistry.json";

/* ---------------- TYPES ---------------- */

interface LandRecord {
  id: string;
  lrNumber: string;
  owner: string;
  isVerified: boolean;
  ipfsHash: string;
  contract: string;
}

interface ContractArtifact {
  abi: InterfaceAbi;
  networks: {
    [key: string]: {
      address: string;
    };
  };
}

interface SolidityLandData {
  id: bigint;
  lrNumber: string;
  owner: string;
  isVerified: boolean;
  ipfsDocHash: string;
}

/* ---------------- COMPONENT ---------------- */

const VerifyTitle: React.FC = () => {
  const [landId, setLandId] = useState("");
  const [result, setResult] = useState<LandRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!landId) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const provider = new ethers.JsonRpcProvider("http://127.0.0.1:7545");

      const artifact = LandRegistryArtifact as unknown as ContractArtifact;

      const network = await provider.getNetwork();
      const networkId = network.chainId.toString();

      const networkData =
        artifact.networks[networkId] ||
        Object.values(artifact.networks)[0];

      if (!networkData?.address) {
        throw new Error("Contract not found on this network.");
      }

      const contract = new ethers.Contract(
        networkData.address,
        artifact.abi,
        provider
      );

      const landData = (await contract.lands(
        landId
      )) as unknown as SolidityLandData;

      if (!landData.lrNumber) {
        throw new Error("No record found for this Land ID.");
      }

      setResult({
        id: landData.id.toString(),
        lrNumber: landData.lrNumber,
        owner: landData.owner,
        isVerified: landData.isVerified,
        ipfsHash: landData.ipfsDocHash,
        contract: networkData.address,
      });
    } catch (err: unknown) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Verification failed. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-text px-6 py-16 flex justify-center">
      <div className="w-full max-w-xl space-y-10">

        {/* HEADER */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Verify Land Title
          </h1>
          <p className="text-xs text-text/50">
            Enter a Land ID to validate ownership on the blockchain
          </p>
        </div>

        {/* SEARCH */}
        <form
          onSubmit={handleVerify}
          className="flex items-center gap-2"
        >
          <input
            type="number"
            placeholder="Enter Land ID..."
            className="flex-1 px-4 py-2.5 text-sm rounded-lg bg-card border border-border/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
            value={landId}
            onChange={(e) => setLandId(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="px-3 py-2.5 rounded-lg bg-primary text-white flex items-center justify-center hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Search size={16} />
            )}
          </button>
        </form>

        {/* ERROR */}
        {error && (
          <div className="flex items-center gap-2 text-xs text-red-500 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        {/* RESULT */}
        {result && (
          <div className="p-5 rounded-xl border border-border/40 bg-card space-y-5">

            {/* STATUS */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-500 text-xs font-medium">
                <ShieldCheck size={16} />
                {result.isVerified ? "Verified Record" : "Unverified"}
              </div>

              <span className="text-[10px] text-text/40 font-mono truncate max-w-[140px]">
                {result.contract}
              </span>
            </div>

            {/* DATA */}
            <div className="space-y-4 text-sm">

              <div>
                <p className="text-[10px] text-text/40 mb-1">
                  Owner Address
                </p>
                <p className="font-mono text-xs bg-bg p-2 rounded border border-border/30 truncate">
                  {result.owner}
                </p>
              </div>

              <div>
                <p className="text-[10px] text-text/40 mb-1">
                  LR Number
                </p>
                <p className="flex items-center gap-2">
                  <MapPin size={14} className="text-primary" />
                  {result.lrNumber}
                </p>
              </div>

              <div>
                <p className="text-[10px] text-text/40 mb-1">
                  IPFS Hash
                </p>
                <p className="font-mono text-xs text-primary break-all">
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