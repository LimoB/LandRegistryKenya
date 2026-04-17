import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useLoginMutation } from "../features/auth/authApi";
import { useAppDispatch } from "../app/hooks";
import {
  setLoginPendingVerification,
} from "../app/slices/authSlice";
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

/* ================= TYPES ================= */
interface InputFieldProps {
  icon: React.ReactNode;
  type?: string;
  name: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

interface ApiError {
  status?: number;
  data?: { message?: string; error?: string };
  message?: string;
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

    const loadingToast = toast.loading("Signing in...");

    try {
      const res = await login({
        email: formData.email,
        password: formData.password,
      }).unwrap();

      toast.success(`Welcome back, ${res.user.fullName.split(" ")[0]}`, {
        id: loadingToast,
      });

      /* =========================
         ROUTE BY ROLE
      ========================= */
      const role = res.user.role;

      if (role === "admin") navigate("/admin/dashboard");
      else if (role === "land_officer") navigate("/officer/dashboard");
      else navigate("/citizen/dashboard");

    } catch (err: unknown) {
      const error = err as ApiError;

      const status = error?.status;
      const message =
        error?.data?.message ||
        error?.data?.error ||
        error?.message ||
        "Login failed";

      /* =========================
         OTP / VERIFICATION FLOW
      ========================= */
      if (status === 403 || message.toLowerCase().includes("verify")) {
        dispatch(setLoginPendingVerification(formData.email));

        toast.error("Please verify your account first", {
          id: loadingToast,
        });

        navigate("/verify-email");
        return;
      }

      toast.error(message, { id: loadingToast });
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-bg text-text">

      {/* LEFT SIDE */}
      <div className="flex items-center justify-center px-6 py-12">

        <div className="w-full max-w-sm space-y-8">

          {/* HEADER */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-full bg-primary/10 text-primary">
              <ShieldCheck size={12} />
              Secure Login
            </div>

            <h2 className="text-2xl font-semibold">
              Sign in to your account
            </h2>

            <p className="text-xs text-text/50">
              Access your land registry dashboard
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
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text/40 group-focus-within:text-primary">
                <Lock size={16} />
              </div>

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Password"
                className="w-full pl-10 pr-10 py-2.5 text-sm rounded-lg bg-card border border-border/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text/40 hover:text-primary"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* OPTIONS */}
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-text/50">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="w-3.5 h-3.5"
                />
                Remember me
              </label>

              <Link to="/forgot-password" className="text-primary hover:underline">
                Forgot?
              </Link>
            </div>

            {/* BUTTON */}
            <button
              disabled={isLoading}
              type="submit"
              className="w-full py-2.5 text-sm rounded-lg bg-primary text-white flex items-center justify-center gap-2 hover:opacity-90 transition"
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
            No account?{" "}
            <Link to="/register" className="text-primary">
              Create one
            </Link>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-blue-600 to-emerald-500 text-white">

        <div className="max-w-xs text-center space-y-5">

          <div className="mx-auto p-4 bg-white/10 rounded-xl">
            <Fingerprint size={40} />
          </div>

          <h3 className="text-xl font-semibold">
            Land Registry System
          </h3>

          <p className="text-xs text-white/80">
            Secure and transparent land ownership platform.
          </p>

          <div className="flex items-start gap-2 text-[11px] bg-white/10 p-3 rounded-lg">
            <Info size={14} />
            All login activity is monitored for security.
          </div>
        </div>
      </div>
    </div>
  );
};

/* ================= INPUT ================= */
const InputField: React.FC<InputFieldProps> = ({
  icon,
  type = "text",
  name,
  placeholder,
  value,
  onChange,
}) => (
  <div className="relative group">
    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text/40 group-focus-within:text-primary">
      {icon}
    </div>

    <input
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full pl-10 py-2.5 text-sm rounded-lg bg-card border border-border/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
      required
    />
  </div>
);

export default Login;