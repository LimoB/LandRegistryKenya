import React, { useState } from "react";
import { 
  useCreateStripeCheckoutMutation, 
  useRecordMpesaPaymentMutation 
} from "../../features/payment/paymentApi";
import { X, Smartphone, CreditCard, Loader2, CheckCircle } from "lucide-react";

interface PaymentModalProps {
  transferId: number;
  onClose: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ transferId, onClose }) => {
  const [method, setMethod] = useState<"stripe" | "mpesa" | null>(null);
  const [mpesaCode, setMpesaCode] = useState("");

  const [startStripe, { isLoading: stripeLoading }] = useCreateStripeCheckoutMutation();
  const [recordMpesa, { isLoading: mpesaLoading, isSuccess: mpesaSuccess }] = useRecordMpesaPaymentMutation();

  const handleStripePayment = async () => {
    try {
      const { url } = await startStripe({ transferId }).unwrap();
      window.location.href = url; // Redirect to Stripe Checkout
    } catch (err) {
      console.error("Stripe Error:", err);
    }
  };

  const handleMpesaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Amount is usually fetched from land details in a real scenario
      await recordMpesa({ 
        transferId, 
        amount: "500000", // Example amount
        mpesaCode 
      }).unwrap();
    } catch (err) {
      console.error("Mpesa Error:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-black text-slate-900">Secure Payment</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-8">
          {!method ? (
            <div className="space-y-4">
              <p className="text-sm text-slate-500 mb-6">Choose your preferred payment method to secure this land title:</p>
              
              <button 
                onClick={() => setMethod("mpesa")}
                className="w-full flex items-center justify-between p-4 border-2 border-slate-100 rounded-2xl hover:border-green-500 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-50 text-green-600 rounded-xl group-hover:bg-green-600 group-hover:text-white">
                    <Smartphone size={24} />
                  </div>
                  <span className="font-bold text-slate-700">Lipa na M-Pesa</span>
                </div>
                <div className="w-2 h-2 bg-slate-200 rounded-full" />
              </button>

              <button 
                onClick={() => setMethod("stripe")}
                className="w-full flex items-center justify-between p-4 border-2 border-slate-100 rounded-2xl hover:border-indigo-500 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white">
                    <CreditCard size={24} />
                  </div>
                  <span className="font-bold text-slate-700">Credit / Debit Card</span>
                </div>
                <div className="w-2 h-2 bg-slate-200 rounded-full" />
              </button>
            </div>
          ) : method === "mpesa" ? (
            <form onSubmit={handleMpesaSubmit} className="space-y-6">
              {mpesaSuccess ? (
                <div className="text-center py-4 space-y-3">
                  <CheckCircle className="text-green-500 mx-auto" size={48} />
                  <p className="font-bold text-slate-900">M-Pesa Record Submitted!</p>
                  <p className="text-xs text-slate-500">The officer will verify the receipt code.</p>
                  <button onClick={onClose} className="text-indigo-600 font-bold text-sm">Close</button>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400">M-Pesa Transaction Code</label>
                    <input 
                      required
                      placeholder="e.g. QRT789XYZ"
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-lg uppercase tracking-widest focus:ring-2 focus:ring-green-500 outline-none"
                      value={mpesaCode}
                      onChange={(e) => setMpesaCode(e.target.value)}
                    />
                  </div>
                  <button 
                    disabled={mpesaLoading}
                    className="w-full py-4 bg-green-600 text-white rounded-2xl font-black shadow-lg shadow-green-100 flex justify-center items-center gap-2"
                  >
                    {mpesaLoading ? <Loader2 className="animate-spin" /> : "Verify Payment"}
                  </button>
                </>
              )}
            </form>
          ) : (
            <div className="text-center space-y-6">
              <div className="p-6 bg-indigo-50 rounded-3xl">
                <CreditCard className="text-indigo-600 mx-auto" size={48} />
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                You will be redirected to Stripe's secure checkout to complete your land purchase using a bank card.
              </p>
              <button 
                onClick={handleStripePayment}
                disabled={stripeLoading}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-100 flex justify-center items-center gap-2"
              >
                {stripeLoading ? <Loader2 className="animate-spin" /> : "Redirect to Stripe"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;