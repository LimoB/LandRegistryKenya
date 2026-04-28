import React from "react";
import {
  MapPin,
  Receipt,
  ExternalLink,
  Loader2,
  CheckCircle2,
  XCircle,
  RefreshCw
} from "lucide-react";

import { useAppSelector } from "../../app/hooks";
import {
  useApproveTransferMutation,
  useRetryBlockchainMutation,
  type TransferRequest
} from "../../features/transfers/transferApi";

import {
  useCreateStripeCheckoutMutation,
  useRecordMpesaPaymentMutation
} from "../../features/payment/paymentApi";

interface SidebarProps {
  transfer: TransferRequest;
}

const TransferSidebar: React.FC<SidebarProps> = ({ transfer }) => {
  const { user } = useAppSelector((state) => state.auth);

  /* ================= HOOKS ================= */
  const [approveTransfer, { isLoading: isApproving }] =
    useApproveTransferMutation();

  const [retryBlockchain, { isLoading: isRetrying }] =
    useRetryBlockchainMutation();

  const [createStripe, { isLoading: isStripeLoading }] =
    useCreateStripeCheckoutMutation();

  const [recordMpesa, { isLoading: isMpesaLoading }] =
    useRecordMpesaPaymentMutation();

  /* ================= ROLE LOGIC ================= */
  const isOfficer = user?.role === "land_officer";
  const isBuyer = Number(user?.id) === Number(transfer.buyer.id);

  /* ================= STATUS FLAGS ================= */
  const isCompleted = transfer.status === "completed";
  // const isRejected = transfer.status === "rejected";
  const isBlockchainFailed = transfer.blockchainStatus === "failed";

  const isProcessing =
    transfer.status === "pending" ||
    transfer.status === "payment_pending" ||
    transfer.blockchainStatus === "processing" ||
    transfer.blockchainStatus === "submitted" ||
    (transfer.status === "paid" &&
      transfer.blockchainStatus === "pending");

  /* ================= DEBUG LOGS ================= */
  console.log("[Sidebar] Transfer State:", {
    id: transfer.id,
    status: transfer.status,
    blockchainStatus: transfer.blockchainStatus,
    buyer: transfer.buyer?.id,
    user: user?.id
  });

  /* ================= ACTIONS ================= */
  const handleApprove = async () => {
    console.log("[Action] Approving transfer:", transfer.id);

    try {
      await approveTransfer(transfer.id).unwrap();
      console.log("[Success] Transfer approved");
    } catch (err) {
      console.error("[Error] Approval failed:", err);
    }
  };

  const handleRetryBlockchain = async () => {
    console.log("[Action] Retrying blockchain for transfer:", transfer.id);

    try {
      const res = await retryBlockchain(transfer.id).unwrap();
      console.log("[Retry Success]", res);
    } catch (err) {
      console.error("[Retry Failed]", err);
    }
  };

  const handleStripePayment = async () => {
    console.log("[Action] Starting Stripe payment:", transfer.id);

    try {
      const response = await createStripe({
        transferId: transfer.id,
      }).unwrap();

      console.log("[Stripe] Checkout response:", response);

      if (response.url) {
        window.location.href = response.url;
      } else {
        console.error("[Stripe] Missing checkout URL");
      }
    } catch (err) {
      console.error("[Stripe Error]", err);
    }
  };

  const handleMpesaPayment = async () => {
    console.log("[Action] Recording M-Pesa payment:", transfer.id);

    try {
      const code = prompt("Enter M-Pesa Receipt Code:");
      if (!code) {
        console.warn("[M-Pesa] No code entered");
        return;
      }

      await recordMpesa({
        transferId: transfer.id,
        amount: String(transfer.land.priceInKsh),
        mpesaCode: code,
      }).unwrap();

      console.log("[M-Pesa] Payment recorded successfully");
    } catch (err) {
      console.error("[M-Pesa Error]", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* ================= LAND INFO ================= */}
      <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl">
        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-4">
          Land Asset Details
        </p>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <MapPin size={18} className="text-indigo-300" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase">LR Number</p>
              <p className="text-sm font-black">{transfer.land.lrNumber}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Receipt size={18} className="text-indigo-300" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase">Price</p>
              <p className="text-sm font-black text-green-400">
                KES {Number(transfer.land.priceInKsh).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ================= PROCESSING ================= */}
      {isProcessing && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-center gap-3">
          <Loader2 className="text-indigo-600 animate-spin" size={20} />
          <div>
            <p className="text-xs font-bold text-indigo-800">
              Processing Transfer
            </p>
            <p className="text-[11px] text-indigo-600">
              Waiting for blockchain confirmation...
            </p>
          </div>
        </div>
      )}

      {/* ================= BLOCKCHAIN FAILED ================= */}
      {isBlockchainFailed && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 space-y-4">
          <div className="flex items-center gap-3">
            <XCircle className="text-red-600" size={20} />
            <div>
              <p className="text-xs font-bold text-red-800">
                Blockchain Transfer Failed
              </p>
              <p className="text-[11px] text-red-600">
                Payment succeeded but ownership update failed.
              </p>
            </div>
          </div>

          <button
            onClick={handleRetryBlockchain}
            disabled={isRetrying}
            className="w-full py-2 bg-red-600 text-white rounded-xl font-bold flex items-center justify-center gap-2"
          >
            {isRetrying ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <>
                <RefreshCw size={14} />
                Retry Blockchain
              </>
            )}
          </button>
        </div>
      )}

      {/* ================= COMPLETED ================= */}
      {isCompleted && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-3">
          <CheckCircle2 className="text-emerald-600" size={20} />
          <div>
            <p className="text-xs font-bold text-emerald-800">
              Transfer Completed
            </p>
            <p className="text-[11px] text-emerald-600">
              Ownership updated successfully
            </p>
          </div>
        </div>
      )}

      {/* ================= OFFICER ================= */}
      {isOfficer && transfer.status === "pending" && (
        <div className="bg-indigo-600 p-6 rounded-3xl text-white space-y-4">
          <button
            onClick={handleApprove}
            disabled={isApproving}
            className="w-full py-3 bg-white text-indigo-600 rounded-xl font-bold"
          >
            {isApproving ? (
              <Loader2 className="animate-spin mx-auto" />
            ) : (
              "Approve Transfer"
            )}
          </button>
        </div>
      )}

      {/* ================= PAYMENT ================= */}
      {isBuyer && transfer.status === "payment_pending" && (
        <div className="bg-indigo-600 p-6 rounded-3xl text-white space-y-4">
          <button
            onClick={handleStripePayment}
            disabled={isStripeLoading}
            className="w-full py-3 bg-white text-indigo-700 rounded-xl font-bold"
          >
            {isStripeLoading ? (
              <Loader2 className="animate-spin mx-auto" />
            ) : (
              "Pay with Card (Stripe)"
            )}
          </button>

          <button
            onClick={handleMpesaPayment}
            disabled={isMpesaLoading}
            className="w-full py-3 bg-green-500 text-white rounded-xl font-bold"
          >
            {isMpesaLoading ? (
              <Loader2 className="animate-spin mx-auto" />
            ) : (
              "Pay with M-Pesa"
            )}
          </button>
        </div>
      )}

      {/* ================= BLOCKCHAIN TX ================= */}
      {transfer.blockchainTxHash && (
        <div className="bg-white border p-4 rounded-2xl">
          <p className="text-xs font-bold mb-2">
            Blockchain Transaction
          </p>

          <a
            href={`https://etherscan.io/tx/${transfer.blockchainTxHash}`}
            target="_blank"
            rel="noreferrer"
            className="flex justify-between items-center"
          >
            <span className="text-xs font-mono break-all">
              {transfer.blockchainTxHash}
            </span>
            <ExternalLink size={14} />
          </a>
        </div>
      )}
    </div>
  );
};

export default TransferSidebar;