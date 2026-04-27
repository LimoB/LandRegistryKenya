import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  CreditCard, 
  Smartphone, 
  ArrowLeft, 
  ShieldCheck, 
  Loader2, 
  CheckCircle2, 
  AlertCircle 
} from "lucide-react";
import { 
  useCreateStripeCheckoutMutation, 
  useRecordMpesaPaymentMutation 
} from "../features/payment/paymentApi";
import { useGetTransferByIdQuery } from "../features/transfers/transferApi";

// Helper interface for RTK Query Errors
interface RTKQueryError {
  data?: {
    message?: string;
  };
  status?: number;
}

const Payment: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const transferId = Number(id);

  // 1. Fetch Transfer Details
  const { data: transfer, isLoading: loadingTransfer } = useGetTransferByIdQuery(transferId);

  // 2. Payment Mutations
  const [createStripe] = useCreateStripeCheckoutMutation();
  const [recordMpesa, { isLoading: mpesaLoading }] = useRecordMpesaPaymentMutation();

  // 3. Local State
  const [method, setMethod] = useState<"stripe" | "mpesa">("mpesa");
  const [mpesaCode, setMpesaCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  // --- HANDLERS ---

  const handleStripePayment = async () => {
    try {
      setError(null);
      const response = await createStripe({ transferId }).unwrap();
      if (response.url) {
        window.location.href = response.url;
      }
    } catch (err) {
      const errorData = err as RTKQueryError;
      setError(errorData.data?.message || "Failed to initiate Stripe checkout.");
    }
  };

  const handleMpesaPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mpesaCode.length < 10) {
      setError("Please enter a valid 10-digit M-Pesa code.");
      return;
    }

    try {
      setError(null);
      await recordMpesa({
        transferId,
        amount: String(transfer?.land.priceInKsh),
        mpesaCode: mpesaCode.toUpperCase(),
      }).unwrap();
      
      navigate(`/citizen/transfer/status/${transferId}`);
    } catch (err) {
      const errorData = err as RTKQueryError;
      setError(errorData.data?.message || "M-Pesa verification failed.");
    }
  };

  if (loadingTransfer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="mt-4 text-slate-500 font-medium">Preparing secure checkout...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="group flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-bold">Cancel Checkout</span>
        </button>
        <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full border border-green-100">
          <ShieldCheck size={14} />
          <span className="text-[10px] font-black uppercase">Secure Payment</span>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-xl shadow-slate-100">
        <div className="p-6 md:p-8 bg-slate-50 border-b border-slate-100">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Complete Transfer</h1>
          <p className="text-slate-500 text-sm mt-1">
            Settle the agreed price for LR: <span className="font-bold text-slate-700">{transfer?.land.lrNumber}</span>
          </p>
          
          <div className="mt-6 flex items-baseline gap-2">
            <span className="text-sm font-bold text-slate-400 uppercase">Total Amount:</span>
            <span className="text-3xl font-black text-indigo-600">
              KES {Number(transfer?.land.priceInKsh).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          {/* METHOD SELECTOR */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setMethod("mpesa")}
              className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                method === "mpesa" ? "border-green-500 bg-green-50" : "border-slate-100 hover:border-slate-200"
              }`}
            >
              <Smartphone className={method === "mpesa" ? "text-green-600" : "text-slate-400"} />
              <span className={`text-[10px] font-black uppercase tracking-wider ${method === "mpesa" ? "text-green-700" : "text-slate-500"}`}>M-Pesa</span>
            </button>

            <button
              type="button"
              onClick={() => setMethod("stripe")}
              className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                method === "stripe" ? "border-indigo-500 bg-indigo-50" : "border-slate-100 hover:border-slate-200"
              }`}
            >
              <CreditCard className={method === "stripe" ? "text-indigo-600" : "text-slate-400"} />
              <span className={`text-[10px] font-black uppercase tracking-wider ${method === "stripe" ? "text-indigo-700" : "text-slate-500"}`}>Card / Stripe</span>
            </button>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm font-medium animate-shake">
              <AlertCircle size={18} className="shrink-0" />
              {error}
            </div>
          )}

          {/* DYNAMIC FORM */}
          {method === "mpesa" ? (
            <form onSubmit={handleMpesaPayment} className="space-y-4 animate-in slide-in-from-left-4 duration-300">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  M-Pesa Transaction Code
                </label>
                <input
                  type="text"
                  placeholder="E.g. QXA123BCDE"
                  value={mpesaCode}
                  onChange={(e) => setMpesaCode(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-lg font-mono focus:ring-2 focus:ring-green-500 outline-none transition-all uppercase placeholder:text-slate-300"
                />
              </div>
              <button
                type="submit"
                disabled={mpesaLoading}
                className="w-full py-4 bg-green-600 text-white rounded-2xl font-black uppercase tracking-[0.1em] hover:bg-green-700 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-100"
              >
                {mpesaLoading ? <Loader2 className="animate-spin" /> : "Verify Transaction"}
              </button>
            </form>
          ) : (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
              <p className="text-sm text-slate-500 text-center px-4 leading-relaxed">
                You will be redirected to Stripe's secure portal to pay with Credit Card, Apple Pay, or Google Pay.
              </p>
              <button
                type="button"
                onClick={handleStripePayment}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-[0.1em] hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-indigo-100"
              >
                Proceed to Secure Checkout
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="text-center">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2">
          <CheckCircle2 size={12} className="text-green-500" /> Powered by Ministry of Lands Blockchain Gateway
        </p>
      </div>
    </div>
  );
};

export default Payment;