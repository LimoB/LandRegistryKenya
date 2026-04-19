import React from "react";
import { useSelector } from "react-redux";
import { useResendVerificationMutation } from "../features/auth/authApi";
import {
  Mail,
  RefreshCw,
  ArrowLeft,
  ShieldAlert,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import type { RootState } from "../app/store";

interface ApiError {
  data?: {
    message?: string;
    error?: string;
  };
}

const VerifyNotice: React.FC = () => {
  // ✅ FIX: correctly type redux state
  const email = useSelector(
    (state: RootState) => state.auth.tempEmail
  );

  const [resend, { isLoading }] = useResendVerificationMutation();

  const handleResend = async () => {
    if (!email) {
      toast.error("No email found. Please log in again.");
      return;
    }

    const toastId = toast.loading("Sending verification email...");

    try {
      await resend({ email }).unwrap();

      toast.success("Verification email sent!", {
        id: toastId,
      });
    } catch (err: unknown) {
      const error = err as ApiError;

      toast.error(
        error?.data?.message || "Failed to resend verification email.",
        { id: toastId }
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-6">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 shadow-sm space-y-8 text-center">

        {/* ICON */}
        <div className="flex justify-center">
          <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-100">
            <ShieldAlert size={34} />
          </div>
        </div>

        {/* TITLE */}
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Verify your email
          </h1>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            We sent a verification link to your email. Please verify it before continuing.
          </p>
        </div>

        {/* EMAIL DISPLAY */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-left">
          <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-900 text-blue-600">
            <Mail size={18} />
          </div>

          <div className="overflow-hidden">
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
              Email address
            </p>

            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">
              {email ?? "No email found"}
            </p>
          </div>
        </div>

        {/* RESEND BUTTON */}
        <button
          onClick={handleResend}
          disabled={isLoading || !email}
          className="w-full flex items-center justify-center gap-3 py-3 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <RefreshCw size={18} />
          )}
          Resend verification email
        </button>

        {/* BACK LINK */}
        <Link
          to="/login"
          className="flex items-center justify-center gap-2 text-sm font-semibold text-slate-400 hover:text-blue-600 transition"
        >
          <ArrowLeft size={16} />
          Back to login
        </Link>
      </div>
    </div>
  );
};

export default VerifyNotice;