import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useLoginMutation } from "../features/auth/authApi";
import { useAppDispatch } from "../app/hooks";
import { setLoginPendingVerification } from "../features/auth/authSlice";
import toast from "react-hot-toast";

import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Fingerprint,
  Loader2,
  Eye,
  EyeOff,
  Info,
} from "lucide-react";

import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

/* ================= TYPES ================= */
interface InputFieldProps {
  icon: React.ReactNode;
  type?: string;
  name: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/* ================= COMPONENT ================= */
const Login: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [login, { isLoading }] = useLoginMutation();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      toast.error("Email and password required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    console.log("Login attempt for:", formData.email);
    const toastId = toast.loading("Signing in...");

    try {
      const res = await login({
        email: formData.email,
        password: formData.password,
      }).unwrap();

      // DEBUG LOG
      console.log("Login Success Response:", res);

      // Accessing res.data because of our updated AuthResponse interface
      const user = res.data; 

      toast.success(`Welcome back, ${user.fullName.split(" ")[0]}`, {
        id: toastId,
      });

      // ROLE ROUTING
      console.log("Routing user based on role:", user.role);
      switch (user.role) {
        case "admin":
          navigate("/admin/dashboard");
          break;
        case "land_officer":
          navigate("/officer/dashboard");
          break;
        default:
          navigate("/citizen/dashboard");
      }
    } catch (err: unknown) {
      // DEBUG LOG
      console.error("Login Error Object:", err);

      const error = err as FetchBaseQueryError & {
        data?: { message?: string; error?: string; code?: string };
      };

      const status = error?.status;
      const message = error?.data?.message || error?.data?.error || "Login failed";
      const errorCode = error?.data?.code;

      console.warn(`Status: ${status} | Message: ${message} | Code: ${errorCode}`);

      // EMAIL VERIFICATION FLOW
      if (status === 403 || errorCode === "EMAIL_NOT_VERIFIED") {
        console.log("Redirecting to verification flow...");
        dispatch(setLoginPendingVerification(formData.email));
        toast.error("Please verify your account first", { id: toastId });
        navigate("/verify-email");
        return;
      }

      toast.error(message, { id: toastId });
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-bg text-text">
      {/* LEFT SIDE */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm space-y-8">
          {/* HEADER */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-full bg-primary/10 text-primary uppercase tracking-wider font-bold">
              <ShieldCheck size={12} />
              Secure Portal
            </div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Sign in to your account
            </h2>
            <p className="text-xs text-text/50">
              Kenyan Land Registry Management System
            </p>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
              icon={<Mail size={16} />}
              type="email"
              name="email"
              placeholder="Email address"
              value={formData.email}
              onChange={handleInputChange}
            />

            {/* PASSWORD */}
            <div className="relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text/40 group-focus-within:text-primary transition-colors">
                <Lock size={16} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Password"
                className="w-full pl-10 pr-10 py-2.5 text-sm rounded-lg bg-card border border-border/40 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text/40 hover:text-primary transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* OPTIONS */}
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-text/50 cursor-pointer">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="w-3.5 h-3.5 rounded border-border text-primary focus:ring-primary/20"
                />
                Remember me
              </label>
              <Link to="/forgot-password" className="text-primary hover:underline font-medium">
                Forgot password?
              </Link>
            </div>

            {/* BUTTON */}
            <button
              disabled={isLoading}
              type="submit"
              className="w-full py-2.5 text-sm font-semibold rounded-lg bg-primary text-white flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/20"
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  Sign In <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          {/* FOOTER */}
          <div className="text-center text-xs text-text/50">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="text-primary font-bold hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE (DESKTOP ONLY) */}
      <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-blue-700 to-emerald-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="max-w-xs text-center space-y-6 relative z-10">
          <div className="mx-auto w-20 h-20 flex items-center justify-center bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl">
            <Fingerprint size={48} />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold tracking-tight">
              LIMS Digital Portal
            </h3>
            <p className="text-sm text-white/80 leading-relaxed">
              Verify, transfer, and manage land ownership with blockchain transparency.
            </p>
          </div>
          <div className="flex items-start gap-3 text-left text-[11px] bg-black/20 backdrop-blur-sm p-4 rounded-xl border border-white/10">
            <Info size={18} className="shrink-0 text-emerald-300" />
            <p className="opacity-90">
              This is a secure government-monitored system. Unauthorized access attempts are logged and reported.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ================= INPUT FIELD COMPONENT ================= */
const InputField: React.FC<InputFieldProps> = ({
  icon,
  type = "text",
  name,
  placeholder,
  value,
  onChange,
}) => (
  <div className="relative group">
    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text/40 group-focus-within:text-primary transition-colors">
      {icon}
    </div>
    <input
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full pl-10 py-2.5 text-sm rounded-lg bg-card border border-border/40 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
      required
    />
  </div>
);

export default Login;