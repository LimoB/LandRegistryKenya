import React from "react";
import { 
  MapPin, 
  Wallet, 
  Receipt, 
  ExternalLink, 
  Loader2, 
  AlertCircle, 
  CreditCard,
  CheckCircle2
} from "lucide-react";
import { useAppSelector } from "../../app/hooks";
import { 
  useApproveTransferMutation, 
  type TransferRequest 
} from "../../features/transfers/transferApi";
import { useCreateStripeCheckoutMutation } from "../../features/payment/paymentApi";

interface SidebarProps {
  transfer: TransferRequest;
}

const TransferSidebar: React.FC<SidebarProps> = ({ transfer }) => {
  const { user } = useAppSelector((state) => state.auth);
  
  // Hooks
  const [approveTransfer, { isLoading: isApproving }] = useApproveTransferMutation();
  const [createStripe, { isLoading: isStripeLoading }] = useCreateStripeCheckoutMutation();

  // Permissions & Logic
  const isOfficer = user?.role === "land_officer";
  const isBuyer = Number(user?.id) === Number(transfer.buyer.id);

  const handleApprove = async () => {
    try {
      await approveTransfer(transfer.id).unwrap();
    } catch (err) {
      console.error("Approval failed:", err);
    }
  };

  const handleStripePayment = async () => {
    try {
      // Calling your specific Stripe endpoint
      const response = await createStripe({ transferId: transfer.id }).unwrap();
      
      if (response.url) {
        // Redirect to Stripe's secure hosted checkout
        window.location.href = response.url;
      }
    } catch (err) {
      console.error("Stripe Checkout Error:", err);
      alert("Could not open payment gateway. Please try again.");
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

      {/* STATUS BADGE FOR PAID/COMPLETED */}
      {(transfer.status === "paid" || transfer.status === "completed") && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="text-emerald-600" size={20} />
          <div>
            <p className="text-[10px] font-black text-emerald-800 uppercase">Payment Secured</p>
            <p className="text-[10px] text-emerald-600 font-medium">Registry update in progress</p>
          </div>
        </div>
      )}

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
            disabled={isApproving}
            className="w-full flex items-center justify-center gap-2 py-3 bg-white text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all active:scale-95 disabled:opacity-50"
          >
            {isApproving ? <Loader2 className="animate-spin" size={16} /> : "Approve Title Transfer"}
          </button>
        </div>
      )}

      {/* BUYER STRIPE PANEL */}
      {isBuyer && transfer.status === "payment_pending" && (
        <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-lg shadow-indigo-100 space-y-4 animate-in bounce-in duration-500">
          <div className="flex items-start gap-3">
            <CreditCard size={18} className="text-indigo-200 shrink-0" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-tight text-indigo-100">
                Payment Ready
              </p>
              <p className="text-[11px] text-indigo-50 mt-1 leading-tight">
                Verified by Land Office. Complete your payment via Credit Card or Apple/Google Pay.
              </p>
            </div>
          </div>
          <button
            onClick={handleStripePayment}
            disabled={isStripeLoading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-white text-indigo-700 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all active:scale-95 shadow-md disabled:opacity-70"
          >
            {isStripeLoading ? <Loader2 className="animate-spin" size={16} /> : "Pay with Card"}
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
          <a 
            href={`https://etherscan.io/tx/${transfer.blockchainTxHash}`} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center justify-between group"
          >
            <span className="text-[10px] font-mono text-slate-500 break-all leading-relaxed mr-2">
              {transfer.blockchainTxHash}
            </span>
            <ExternalLink size={14} className="text-slate-300 group-hover:text-indigo-600 transition-colors shrink-0" />
          </a>
        </div>
      )}
    </div>
  );
};

export default TransferSidebar;