import React, { useState } from "react";
import { useForgotPasswordMutation } from "../features/auth/authApi";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Mail,
  ArrowLeft,
  Send,
  Fingerprint,
  Loader2,
  CheckCircle,
} from "lucide-react";

interface ApiError {
  data?: {
    message?: string;
    error?: string;
  };
}

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const navigate = useNavigate();

  /* ================================
     SUBMIT EMAIL
  =================================*/
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }

    const loading = toast.loading("Sending verification code...");

    try {
      const res = await forgotPassword({ email }).unwrap();

      toast.success(res?.message || "Code sent to your email!", {
        id: loading,
      });

      setSent(true);

      // optional: store email for OTP page
      localStorage.setItem("resetEmail", email);

    } catch (err: unknown) {
      const error = err as ApiError;

      const message =
        error?.data?.message ||
        error?.data?.error ||
        "Unable to send reset code";

      toast.error(message, { id: loading });
    }
  };

  /* ================================
     GO TO OTP PAGE
  =================================*/
  const goToVerify = () => {
    navigate("/verify-reset-code");
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#fafafa] dark:bg-slate-950 font-sans">

      {/* LEFT SIDE */}
      <div className="flex items-center justify-center p-6 md:p-12 lg:p-20">
        <div className="w-full max-w-md space-y-10">

          {/* BACK */}
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-600 font-bold text-xs uppercase tracking-widest"
          >
            <ArrowLeft size={14} />
            Back to Sign In
          </Link>

          {/* HEADER */}
          <header className="space-y-4">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white">
              Recover <span className="text-blue-600">Access</span>
            </h2>

            <p className="text-sm text-slate-500">
              Enter your email to receive a secure reset code.
            </p>
          </header>

          {/* FORM OR SUCCESS STATE */}
          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* INPUT */}
              <div className="relative group">
                <Mail
                  size={18}
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600"
                />

                <input
                  type="email"
                  placeholder="Official Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              {/* BUTTON */}
              <button
                disabled={isLoading}
                type="submit"
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>
                    Send Reset Code <Send size={18} />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* =========================
               SUCCESS STATE
            ========================= */
            <div className="space-y-6 text-center">

              <CheckCircle size={60} className="mx-auto text-green-500" />

              <h3 className="text-xl font-bold">
                Check your email
              </h3>

              <p className="text-sm text-slate-500">
                We’ve sent a 6-digit verification code to:
              </p>

              <p className="font-semibold text-blue-600">
                {email}
              </p>

              <div className="space-y-3 pt-4">

                <button
                  onClick={goToVerify}
                  className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold"
                >
                  Enter Verification Code
                </button>

                <button
                  onClick={() => setSent(false)}
                  className="w-full border border-slate-300 py-3 rounded-xl text-sm"
                >
                  Use different email
                </button>

              </div>

              <p className="text-xs text-slate-400 pt-2">
                Didn’t receive email? Check spam folder
              </p>

            </div>
          )}

        </div>
      </div>

      {/* RIGHT SIDE */}
      <section className="hidden lg:flex bg-slate-900 items-center justify-center relative m-4 rounded-[3rem] overflow-hidden">

        <div className="relative z-10 p-12 text-center text-white space-y-6">

          <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10 inline-block">
            <Fingerprint size={60} className="text-blue-500" />
          </div>

          <h3 className="text-3xl font-bold">Secure Recovery</h3>

          <p className="max-w-xs mx-auto text-slate-400 text-sm">
            Only verified users can reset credentials. Every request is protected.
          </p>

        </div>
      </section>

    </div>
  );
};

export default ForgotPassword;