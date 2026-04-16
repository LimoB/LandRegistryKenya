import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useLoginMutation } from "../features/auth/authApi";
import { useAppDispatch } from "../app/hooks";
import { setTempEmail } from "../app/slices/authSlice";
import toast from "react-hot-toast";

// Icons
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

/* ================================
   TYPES
================================ */
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

  /* ================================
     INPUT CHANGE
  =================================*/
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  /* ================================
     VALIDATION
  =================================*/
  const validateForm = () => {
    if (!formData.email || !formData.password) {
      toast.error("Email and password are required");
      return false;
    }
    return true;
  };

  /* ================================
     SUBMIT
  =================================*/
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const loadingToast = toast.loading("Verifying credentials...");

    try {
      const res = await login({
        email: formData.email,
        password: formData.password,
      }).unwrap();

      const firstName =
        (res.user?.fullName || "User").trim().split(/\s+/)[0];

      toast.success(`Welcome back, ${firstName}!`, {
        id: loadingToast,
      });

      /* ======================
         ROLE ROUTING
      ====================== */
      const role = res.user?.role;

      if (role === "admin") navigate("/admin/dashboard");
      else if (role === "land_officer") navigate("/officer/dashboard");
      else navigate("/citizen/dashboard");
    } catch (err: unknown) {
      const error = err as ApiError;

      if (error.status === 403) {
        dispatch(setTempEmail(formData.email));
        toast.error("Account not verified", { id: loadingToast });
        navigate("/verify-email");
        return;
      }

      toast.error(
        error?.data?.message ||
          error?.data?.error ||
          error?.message ||
          "Login failed",
        { id: loadingToast }
      );
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 font-sans">

      {/* LEFT SIDE */}
      <div className="flex items-center justify-center p-6 md:p-12 lg:p-20">

        <div className="w-full max-w-md space-y-10">

          {/* HEADER */}
          <header className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full text-[10px] font-bold uppercase text-blue-600">
              <ShieldCheck size={12} />
              Secure Access Portal
            </div>

            <h2 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
              Log in to your <span className="text-blue-600">Portal</span>
            </h2>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              Access your secure land registry dashboard
            </p>
          </header>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* EMAIL */}
            <InputField
              icon={<Mail size={18} />}
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange}
            />

            {/* PASSWORD */}
            <div className="relative group">

              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                <Lock size={18} />
              </div>

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                className="w-full pl-14 pr-14 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-white"
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* OPTIONS */}
            <div className="flex items-center justify-between text-xs">

              <label className="flex items-center gap-2 text-slate-500 cursor-pointer">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600"
                />
                Remember me
              </label>

              <Link
                to="/forgot-password"
                className="text-blue-600 hover:underline font-medium"
              >
                Forgot password?
              </Link>

            </div>

            {/* BUTTON */}
            <button
              disabled={isLoading}
              type="submit"
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-sm uppercase tracking-widest shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-3 h-14 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Sign In <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* FOOTER */}
          <footer className="text-center space-y-2">
            <p className="text-xs text-slate-500">
              Don’t have an account?
            </p>

            <Link
              to="/register"
              className="text-blue-600 font-semibold hover:underline"
            >
              Create account
            </Link>
          </footer>

        </div>
      </div>

      {/* RIGHT SIDE */}
      <section className="hidden lg:flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700 text-white relative overflow-hidden">

        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[length:20px_20px]" />

        <div className="relative z-10 max-w-md text-center space-y-6 p-10">

          <div className="mx-auto w-fit p-6 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20">
            <Fingerprint size={64} />
          </div>

          <h3 className="text-3xl font-bold">
            National Land Registry
          </h3>

          <p className="text-sm text-blue-100">
            Secure, transparent, and tamper-proof land ownership system.
          </p>

          <div className="flex items-start gap-3 text-xs bg-white/10 p-4 rounded-2xl border border-white/10">
            <Info size={16} />
            <p>All login attempts are monitored for security compliance.</p>
          </div>

        </div>
      </section>
    </div>
  );
};

/* ================================
   INPUT COMPONENT
================================ */
const InputField: React.FC<InputFieldProps> = ({
  icon,
  type = "text",
  name,
  placeholder,
  value,
  onChange,
}) => (
  <div className="relative group">

    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
      {icon}
    </div>

    <input
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full pl-14 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-white"
      required
    />
  </div>
);

export default Login;