import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateTransferMutation } from "../../features/transfers/transferApi";
import { useGetLandsQuery } from "../../features/lands/landApi";
import { useAppSelector } from "../../app/hooks";
import {
  ArrowRightLeft,
  Search,
  MapPin,
  CheckCircle2,
  Landmark,
  Wallet,
} from "lucide-react";

const TransferLand: React.FC = () => {
  const navigate = useNavigate();

  const { user } = useAppSelector((state) => state.auth);

  // APIs
  const { data: lands, isLoading: landsLoading } = useGetLandsQuery();
  const [createTransfer, { isLoading: isSubmitting, isSuccess, isError }] =
    useCreateTransferMutation();

  // Form State
  const [selectedLandId, setSelectedLandId] = useState<number | null>(null);
  const [sellerId, setSellerId] = useState("");
  const [receiptCode, setReceiptCode] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedLandId) return;

    try {
      await createTransfer({
        landId: selectedLandId,
      }).unwrap();

      setTimeout(() => navigate("/citizen/dashboard"), 2500);
    } catch (err) {
      console.error("Transfer failed:", err);
    }
  };

  if (isSuccess) return <SuccessState />;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">
            Property Transfer
          </h1>
          <p className="text-slate-500 mt-1">
            Initiating as{" "}
            <span className="text-blue-600 font-bold">
              {user?.fullName || "Citizen"}
            </span>
          </p>
        </div>

        {/* Wallet */}
        <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 dark:bg-slate-900 rounded-2xl border">
          <Wallet size={16} />
          <span className="text-xs font-mono">
            {user?.walletAddress
              ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`
              : "No Wallet"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LAND LIST */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-950 border rounded-2xl overflow-hidden">
            <div className="p-6 border-b flex justify-between">
              <h3 className="font-bold flex items-center gap-2">
                <Landmark size={16} /> Land Registry
              </h3>

              <div className="relative">
                <Search className="absolute left-2 top-2 text-slate-400" size={12} />
                <input
                  placeholder="Search..."
                  className="pl-7 pr-2 py-1 border rounded text-xs"
                />
              </div>
            </div>

            <div className="p-2 max-h-[450px] overflow-y-auto">
              {landsLoading ? (
                <div className="p-10 text-center">Loading...</div>
              ) : (
                lands
                  ?.filter(
                    (l) =>
                      l.verificationStatus === "verified" && l.isForSale
                  )
                  .map((land) => (
                    <button
                      key={land.id}
                      onClick={() => setSelectedLandId(land.id)}
                      className={`w-full p-4 flex justify-between rounded-xl ${
                        selectedLandId === land.id
                          ? "bg-blue-600 text-white"
                          : "hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex gap-3">
                        <MapPin size={18} />
                        <div>
                          <p className="font-bold">{land.lrNumber}</p>
                          <p className="text-xs">
                            {land.county} • {land.landType}
                          </p>
                        </div>
                      </div>

                      {selectedLandId === land.id ? (
                        <CheckCircle2 />
                      ) : null}
                    </button>
                  ))
              )}
            </div>
          </div>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-slate-950 border p-6 rounded-3xl space-y-6">
            <h3 className="font-bold flex items-center gap-2">
              <ArrowRightLeft size={18} /> Transfer Details
            </h3>

            <div>
              <label className="text-xs font-bold">Seller ID (optional)</label>
              <input
                type="number"
                value={sellerId}
                onChange={(e) => setSellerId(e.target.value)}
                className="w-full p-3 border rounded-xl"
              />
            </div>

            <div>
              <label className="text-xs font-bold">
                M-Pesa Code (optional)
              </label>
              <input
                type="text"
                value={receiptCode}
                onChange={(e) => setReceiptCode(e.target.value)}
                className="w-full p-3 border rounded-xl"
              />
            </div>

            <div className="p-3 bg-yellow-100 rounded-xl text-xs">
              Ensure payment is verified before transfer.
            </div>

            {isError && (
              <p className="text-red-500 text-xs">
                Failed to create transfer. Try again.
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !selectedLandId}
              className="w-full bg-blue-600 text-white py-3 rounded-xl"
            >
              {isSubmitting ? "Processing..." : "Create Transfer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SuccessState = () => (
  <div className="text-center py-20">
    <CheckCircle2 size={48} className="mx-auto text-green-500" />
    <h2 className="text-2xl font-bold mt-4">Transfer Created</h2>
    <p className="text-gray-500">
      Awaiting approval from land officer
    </p>
  </div>
);

export default TransferLand;