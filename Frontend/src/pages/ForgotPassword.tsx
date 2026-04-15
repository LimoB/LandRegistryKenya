import React, { useState } from "react";
import { useForgotPasswordMutation } from "../features/auth/authApi";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Mail, ArrowLeft, Send, Fingerprint, Loader2 } from "lucide-react";

// ✅ Define the structured error type
interface ApiError {
  status?: number;
  data?: {
    message?: string;
    error?: string;
  };
}

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadToast = toast.loading("Sending recovery link...");
    try {
      await forgotPassword({ email }).unwrap();
      toast.success("Recovery link sent to your email!", { id: loadToast });
    } catch (err: unknown) {
      // ✅ Proper type casting for RTK Query errors
      const error = err as ApiError;
      const errorMessage = error.data?.message || error.data?.error || "User not found.";
      toast.error(errorMessage, { id: loadToast });
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#fafafa] dark:bg-slate-950 font-sans">
      <div className="flex items-center justify-center p-6 md:p-12 lg:p-20">
        <div className="w-full max-w-md space-y-10">
          <Link to="/login" className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-600 font-bold text-xs uppercase tracking-widest transition-colors">
            <ArrowLeft size={14} /> Back to Sign In
          </Link>
          <header className="space-y-4">
            <h2 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">Recover <span className="text-blue-600">Access.</span></h2>
            <p className="text-sm font-medium text-slate-500">Enter your official email to receive a secure password reset link.</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative group">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
              <input
                type="email"
                className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
                placeholder="Official Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button disabled={isLoading} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-sm uppercase tracking-widest shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-3 h-14">
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : <>Send Reset Link <Send size={18} /></>}
            </button>
          </form>
        </div>
      </div>

      <section className="hidden lg:flex bg-slate-900 items-center justify-center relative m-4 rounded-[3rem] overflow-hidden">
         <div className="relative z-10 p-12 text-center text-white space-y-6">
            <div className="p-8 bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/10 inline-block">
                <Fingerprint size={60} className="text-blue-500" />
            </div>
            <h3 className="text-3xl font-bold">Secure Recovery</h3>
            <p className="max-w-xs mx-auto text-slate-400 text-sm">Our automated system ensures that only the verified account owner can reset their portal credentials.</p>
         </div>
      </section>
    </div>
  );
};

export default ForgotPassword;