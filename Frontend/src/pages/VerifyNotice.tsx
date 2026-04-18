import React from "react";
import { useSelector } from "react-redux";
import { selectTempEmail } from "../features/auth/authSlice";
import { useResendVerificationMutation } from "../features/auth/authApi";
import { Mail, RefreshCw, ArrowLeft, ShieldAlert, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

interface ApiError {
  data?: { message?: string; error?: string };
}

const VerifyNotice: React.FC = () => {
  const email = useSelector(selectTempEmail);
  const [resend, { isLoading }] = useResendVerificationMutation();

  const handleResend = async () => {
    if (!email) return toast.error("Please log in again.");
    const loadToast = toast.loading("Resending link...");
    try {
      await resend({ email }).unwrap();
      toast.success("Verification link sent!", { id: loadToast });
    } catch (err: unknown) {
      const error = err as ApiError;
      toast.error(error.data?.message || "Failed to resend.", { id: loadToast });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] p-6 font-sans">
      <div className="max-w-lg w-full bg-white rounded-[3rem] p-10 md:p-14 shadow-xl border border-slate-100 space-y-8 text-center">
        <div className="inline-flex p-5 bg-amber-50 rounded-3xl text-amber-600 border border-amber-100">
          <ShieldAlert size={40} />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Email Required</h2>
          <p className="text-slate-500 text-sm">Your account is created but requires email verification before accessing blockchain features.</p>
        </div>

        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center gap-4 text-left">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
            <Mail size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Verifying Address</p>
            <p className="font-bold text-slate-700">{email || "N/A"}</p>
          </div>
        </div>

        <button 
          onClick={handleResend}
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg hover:bg-blue-700 transition-all disabled:opacity-50 h-14"
        >
          {isLoading ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
          Resend Verification Link
        </button>

        <Link to="/login" className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-blue-600">
          <ArrowLeft size={16} /> Back to Sign In
        </Link>
      </div>
    </div>
  );
};

export default VerifyNotice;