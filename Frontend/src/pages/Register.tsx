import React, { useState } from "react";
import { useRegisterMutation } from "../features/auth/authApi";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setTempEmail } from "../app/slices/authSlice";
import toast from "react-hot-toast";
import { ethers } from "ethers";

// Icons
import {
  User,
  Mail,
  Wallet,
  Lock,
  ArrowRight,
  Loader2,
  FileDigit,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

/* ================================
   TYPES
================================ */
interface ApiError {
  data?: {
    message?: string;
  };
  message?: string;
}

interface InputFieldProps {
  icon: React.ReactNode;
  type?: React.HTMLInputTypeAttribute;
  name: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isMono?: boolean;
  rightElement?: React.ReactNode;
}

const Register: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    idNumber: "",
    walletAddress: "",
    password: "",
    role: "citizen" as const,
  });

  const [register, { isLoading }] = useRegisterMutation();

  /* ================================
     HANDLE CHANGE
  =================================*/
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  /* ================================
     WALLET CONNECT
  =================================*/
  const handleFetchWallet = async () => {
    if (!window.ethereum) {
      toast.error("Install MetaMask first");
      return;
    }

    const loading = toast.loading("Connecting wallet...");

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);

      if (accounts.length > 0) {
        setForm((prev) => ({
          ...prev,
          walletAddress: accounts[0],
        }));

        toast.success("Wallet connected!", { id: loading });
      }
    } catch {
      toast.error("Wallet connection failed", { id: loading });
    }
  };

  /* ================================
     VALIDATION
  =================================*/
  const validate = () => {
    if (
      !form.fullName ||
      !form.email ||
      !form.idNumber ||
      !form.walletAddress ||
      !form.password
    ) {
      toast.error("All fields are required");
      return false;
    }

    if (!ethers.isAddress(form.walletAddress)) {
      toast.error("Invalid wallet address");
      return false;
    }

    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }

    return true;
  };

  /* ================================
     SUBMIT
  =================================*/
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const loading = toast.loading("Creating account...");

    try {
      const res = await register(form).unwrap();

      dispatch(setTempEmail(form.email));

      toast.success(res.message || "Account created successfully", {
        id: loading,
      });

      navigate("/verify-email");
    } catch (err: unknown) {
      const error = err as ApiError;

      toast.error(
        error?.data?.message || error?.message || "Registration failed",
        { id: loading }
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
              Secure Registration
            </div>

            <h2 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
              Create your <span className="text-blue-600">Account</span>
            </h2>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              Register to access the National Land Registry system
            </p>
          </header>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-5">

            <InputField
              icon={<User size={18} />}
              name="fullName"
              placeholder="Full Name"
              value={form.fullName}
              onChange={handleChange}
            />

            <InputField
              icon={<Mail size={18} />}
              name="email"
              type="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
            />

            <InputField
              icon={<FileDigit size={18} />}
              name="idNumber"
              placeholder="ID Number"
              value={form.idNumber}
              onChange={handleChange}
            />

            <InputField
              icon={<Wallet size={18} />}
              name="walletAddress"
              placeholder="Wallet Address"
              value={form.walletAddress}
              onChange={handleChange}
              isMono
              rightElement={
                <button
                  type="button"
                  onClick={handleFetchWallet}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition"
                >
                  <RefreshCw size={16} />
                </button>
              }
            />

            <InputField
              icon={<Lock size={18} />}
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
            />

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
                  Create Account <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* FOOTER */}
          <footer className="text-center space-y-2">
            <p className="text-xs text-slate-500">
              Already have an account?
            </p>

            <Link
              to="/login"
              className="text-blue-600 font-semibold hover:underline"
            >
              Sign in here
            </Link>
          </footer>

        </div>
      </div>

      {/* RIGHT SIDE (MATCH LOGIN STYLE) */}
      <section className="hidden lg:flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700 text-white relative overflow-hidden">

        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle,_white_1px,_transparent_1px)] bg-[length:20px_20px]" />

        <div className="relative z-10 max-w-md text-center space-y-6 p-10">

          <div className="mx-auto w-fit p-6 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20">
            <ShieldCheck size={64} />
          </div>

          <h3 className="text-3xl font-bold">
            National Land Registry
          </h3>

          <p className="text-sm text-blue-100">
            Secure identity-based land registration system powered by blockchain
          </p>

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
  isMono = false,
  rightElement,
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
      className={`w-full pl-14 pr-12 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-white ${
        isMono ? "font-mono text-xs" : ""
      }`}
      required
    />

    {rightElement}
  </div>
);

export default Register;