import React, { useEffect, useRef, useState } from "react";
import { useResetPasswordMutation } from "../features/auth/authApi";
import toast from "react-hot-toast";
import { Loader2, RefreshCw } from "lucide-react";

const VerifyResetCode: React.FC = () => {
  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
  const [password, setPassword] = useState<string>("");
  const [timer, setTimer] = useState<number>(60);

  // ✅ FIXED TYPING FOR REFS
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  /* =========================
     COUNTDOWN TIMER
  ========================= */
  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  /* =========================
     HANDLE INPUT
  ========================= */
  const handleChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }

    if (newCode.every((digit) => digit !== "") && password) {
      handleSubmit(newCode.join(""));
    }
  };

  /* =========================
     BACKSPACE NAVIGATION
  ========================= */
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  /* =========================
     SUBMIT OTP
  ========================= */
  const handleSubmit = async (finalCode?: string) => {
    const otp = finalCode || code.join("");

    if (otp.length !== 6) {
      toast.error("Enter 6-digit code");
      return;
    }

    if (!password || password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      const res = await resetPassword({
        token: otp,
        newPassword: password,
      }).unwrap();

      toast.success(res.message || "Password reset successful");

      setCode(["", "", "", "", "", ""]);
      setPassword("");
    } catch (err: unknown) {
      // ✅ FIXED: no any
      let message = "Invalid or expired code";

      if (typeof err === "object" && err !== null && "data" in err) {
        const e = err as {
          data?: { error?: string; message?: string };
        };

        message = e.data?.error || e.data?.message || message;
      }

      toast.error(message);
    }
  };

  /* =========================
     RESEND CODE
  ========================= */
  const handleResend = async () => {
    if (timer > 0) return;

    toast.success("New code sent (connect API here)");
    setTimer(60);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-6">

      <div className="w-full max-w-md space-y-6">

        <h1 className="text-2xl font-bold text-center">
          Verify Reset Code
        </h1>

        <p className="text-center text-slate-400 text-sm">
          Enter the 6-digit code sent to your email
        </p>

        {/* OTP INPUT */}
        <div className="flex justify-center gap-2">
          {code.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputsRef.current[index] = el;
              }}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="w-12 h-12 text-center text-xl font-bold rounded-lg bg-slate-800 border border-slate-700 focus:border-blue-500 outline-none"
            />
          ))}
        </div>

        {/* PASSWORD */}
        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700"
        />

        {/* SUBMIT */}
        <button
          onClick={() => handleSubmit()}
          disabled={isLoading}
          className="w-full bg-blue-600 py-3 rounded-lg font-bold flex justify-center items-center gap-2"
        >
          {isLoading ? (
            <Loader2 className="animate-spin" />
          ) : (
            "Reset Password"
          )}
        </button>

        {/* TIMER + RESEND */}
        <div className="text-center text-sm text-slate-400 space-y-2">

          {timer > 0 ? (
            <p>Resend code in {timer}s</p>
          ) : (
            <button
              onClick={handleResend}
              className="flex items-center gap-2 mx-auto text-blue-400"
            >
              <RefreshCw size={14} />
              Resend Code
            </button>
          )}

        </div>

      </div>

    </div>
  );
};

export default VerifyResetCode;