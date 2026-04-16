import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useVerifyEmailMutation } from "../features/auth/authApi";
import {
  ShieldCheck,
  Loader2,
  ArrowRight,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

/* ============================================================
   TYPES
============================================================ */
interface ApiError {
  data?: {
    message?: string;
    error?: string;
  };
}

const VerifyEmail: React.FC = () => {
  const navigate = useNavigate();

  const [verifyEmail, { isLoading, isError, error, isSuccess }] =
    useVerifyEmailMutation();

  const [otp, setOtp] = useState("");

  // prevents duplicate toast on re-render
  const hasNotifiedRef = useRef(false);

  /* ============================================================
     AUTO-TRIGGER
  ============================================================ */
  useEffect(() => {
    const storedEmail = localStorage.getItem("tempEmail");
    if (!storedEmail) return;

    if (hasNotifiedRef.current) return;
    hasNotifiedRef.current = true;

    toast.success("Check your email for verification code");
  }, []);

  /* ============================================================
     SUBMIT OTP
  ============================================================ */
  const handleVerify = async () => {
    if (!otp || otp.length !== 6) {
      toast.error("Enter 6-digit code");
      return;
    }

    const loading = toast.loading("Verifying account...");

    try {
      await verifyEmail({ token: otp }).unwrap();

      toast.success("Account verified successfully", { id: loading });

      localStorage.removeItem("tempEmail");

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch {
      // no unused vars → ESLint clean
      toast.error("Verification failed", { id: loading });
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-white rounded-[3rem] p-10 shadow-2xl border border-slate-100 text-center space-y-8">

        {/* ICON */}
        <div className="inline-flex p-5 bg-blue-50 rounded-[2rem] text-blue-600">
          <ShieldCheck size={40} />
        </div>

        {/* TITLE */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Verify Your Email
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Enter the 6-digit code sent to your email
          </p>
        </div>

        {/* OTP INPUT */}
        <input
          type="text"
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
          placeholder="Enter 6-digit code"
          className="w-full text-center tracking-[0.5em] text-xl font-bold p-4 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* BUTTON */}
        <button
          onClick={handleVerify}
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {isLoading ? (
            <Loader2 className="animate-spin" />
          ) : (
            <>
              Verify Account <ArrowRight size={18} />
            </>
          )}
        </button>

        {/* ERROR */}
        {isError && (
          <div className="text-red-500 text-sm flex items-center justify-center gap-2">
            <AlertCircle size={16} />
            {(error as ApiError)?.data?.message ||
              (error as ApiError)?.data?.error ||
              "Invalid or expired code"}
          </div>
        )}

        {/* SUCCESS */}
        {isSuccess && (
          <div className="text-green-500 text-sm flex items-center justify-center gap-2">
            <CheckCircle size={16} />
            Verified successfully! Redirecting...
          </div>
        )}

        {/* BACK */}
        <button
          onClick={() => navigate("/login")}
          className="text-sm text-slate-500 hover:text-blue-600"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default VerifyEmail;