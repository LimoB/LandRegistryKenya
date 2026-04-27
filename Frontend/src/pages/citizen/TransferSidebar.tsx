import React from "react";
import { MapPin, Wallet, Receipt, ExternalLink, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { useAppSelector } from "../../app/hooks";
import { useApproveTransferMutation } from "../../features/transfers/transferApi";

// 1. Define the shape of your data
interface TransferData {
  id: number;
  status: "pending" | "payment_pending" | "paid" | "completed";
  blockchainTxHash?: string;
  land: {
    lrNumber: string;
    priceInKsh: number | string;
  };
  seller: {
    fullName: string;
  };
  buyer: {
    fullName: string;
    walletAddress: string;
  };
}

interface SidebarProps {
  transfer: TransferData;
}

const TransferSidebar: React.FC<SidebarProps> = ({ transfer }) => {
  const { user } = useAppSelector((state) => state.auth);
  const [approveTransfer, { isLoading }] = useApproveTransferMutation();

  const isOfficer = user?.role === "land_officer";

  const handleApprove = async () => {
    try {
      await approveTransfer(transfer.id).unwrap();
      console.log(`[Registry] Transfer ${transfer.id} approved by ${user?.fullName}`);
    } catch (err) {
      console.error("Approval failed:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* ASSET INFO */}
      <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl">
        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-4">
          Land Asset Details
        </p>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <MapPin size={18} className="text-indigo-300" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">LR Number</p>
              <p className="text-sm font-black">{transfer.land.lrNumber}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <Receipt size={18} className="text-indigo-300" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Agreed Price</p>
              <p className="text-sm font-black text-green-400">
                KES {Number(transfer.land.priceInKsh).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* OFFICER ACTION PANEL */}
      {isOfficer && transfer.status === "pending" && (
        <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-lg shadow-indigo-100 space-y-4 animate-in zoom-in duration-300">
          <div className="flex items-start gap-3">
            <AlertCircle size={18} className="text-indigo-200 shrink-0" />
            <p className="text-[10px] font-bold uppercase tracking-tight text-indigo-100">
              Officer Verification Required
            </p>
          </div>
          <button
            onClick={handleApprove}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-white text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all active:scale-95 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <>
                <CheckCircle size={16} /> Approve Title Transfer
              </>
            )}
          </button>
        </div>
      )}

      {/* PARTIES */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
          <Wallet size={14} className="text-indigo-600" /> Verification Nodes
        </h3>
        <div className="space-y-6">
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-tight">Seller (Current)</p>
            <p className="text-xs font-bold text-slate-900 mt-1">{transfer.seller.fullName}</p>
          </div>
          <div className="w-full h-px bg-slate-100" />
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-tight">Buyer (Proposed)</p>
            <p className="text-xs font-bold text-slate-900 mt-1">{transfer.buyer.fullName}</p>
            <p className="text-[10px] font-mono text-slate-400 mt-1 break-all bg-slate-50 p-2 rounded-lg">
              {transfer.buyer.walletAddress}
            </p>
          </div>
        </div>
      </div>

      {/* BLOCKCHAIN TX */}
      {transfer.blockchainTxHash && (
        <div className="bg-white rounded-3xl border-2 border-indigo-50 p-6">
          <p className="text-[10px] font-black text-indigo-600 uppercase mb-3">Blockchain Transaction</p>
          <a href="#" className="flex items-center justify-between group">
            <span className="text-[10px] font-mono text-slate-500 break-all leading-relaxed mr-2">
              {transfer.blockchainTxHash}
            </span>
            <ExternalLink size={14} className="text-slate-300 group-hover:text-indigo-600 transition-colors" />
          </a>
        </div>
      )}
    </div>
  );
};

export default TransferSidebar;