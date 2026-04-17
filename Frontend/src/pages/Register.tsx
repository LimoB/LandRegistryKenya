import React, { useState } from "react";
import { useRegisterMutation } from "../features/auth/authApi";
import { useNavigate, Link } from "react-router-dom";
import { useAppDispatch } from "../app/hooks";
import { setLoginPendingVerification } from "../app/slices/authSlice";
import toast from "react-hot-toast";
import { ethers } from "ethers";

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

/* ================= TYPES ================= */
interface ApiError {
  status?: number;
  data?: { message?: string };
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

/* ================= COMPONENT ================= */
const Register: React.FC = () => {
  const dispatch = useAppDispatch();
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* ================= WALLET ================= */
  const handleFetchWallet = async () => {
    if (!window.ethereum) {
      toast.error("MetaMask not detected");
      return;
    }

    const loading = toast.loading("Connecting wallet...");

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);

      if (accounts?.length) {
        setForm((prev) => ({
          ...prev,
          walletAddress: accounts[0],
        }));

        toast.success("Wallet connected", { id: loading });
      }
    } catch {
      toast.error("Wallet connection failed", { id: loading });
    }
  };

  /* ================= VALIDATION ================= */
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

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const loading = toast.loading("Creating account...");

    try {
      const res = await register(form).unwrap();

      // ✅ ONLY THIS IS NEEDED (same as login flow)
      dispatch(setLoginPendingVerification(form.email));

      toast.success(res.message || "Account created", {
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
    <div className="min-h-screen grid lg:grid-cols-2 bg-bg text-text">

      {/* LEFT SIDE */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm space-y-8">

          {/* HEADER */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-full bg-primary/10 text-primary">
              <ShieldCheck size={12} />
              Create Account
            </div>

            <h2 className="text-2xl font-semibold">
              Register account
            </h2>

            <p className="text-xs text-text/50">
              Access the land registry platform
            </p>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-4">

            <InputField
              icon={<User size={16} />}
              name="fullName"
              placeholder="Full name"
              value={form.fullName}
              onChange={handleChange}
            />

            <InputField
              icon={<Mail size={16} />}
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
            />

            <InputField
              icon={<FileDigit size={16} />}
              name="idNumber"
              placeholder="ID number"
              value={form.idNumber}
              onChange={handleChange}
            />

            <InputField
              icon={<Wallet size={16} />}
              name="walletAddress"
              placeholder="Wallet address"
              value={form.walletAddress}
              onChange={handleChange}
              isMono
              rightElement={
                <button
                  type="button"
                  onClick={handleFetchWallet}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-primary/10 text-primary rounded-md hover:opacity-80"
                >
                  <RefreshCw size={14} />
                </button>
              }
            />

            <InputField
              icon={<Lock size={16} />}
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
            />

            <button
              disabled={isLoading}
              type="submit"
              className="w-full py-2.5 text-sm rounded-lg bg-primary text-white flex items-center justify-center gap-2 hover:opacity-90 transition"
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  Create Account <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          {/* FOOTER */}
          <div className="text-center text-xs text-text/50">
            Already have an account?{" "}
            <Link to="/login" className="text-primary">
              Sign in
            </Link>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-blue-600 to-emerald-500 text-white">

        <div className="max-w-xs text-center space-y-5">

          <div className="mx-auto p-4 bg-white/10 rounded-xl">
            <ShieldCheck size={40} />
          </div>

          <h3 className="text-xl font-semibold">
            Land Registry System
          </h3>

          <p className="text-xs text-white/80">
            Secure identity-based land registration powered by blockchain.
          </p>

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
  isMono = false,
  rightElement,
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
      className={`w-full pl-10 pr-10 py-2.5 text-sm rounded-lg bg-card border border-border/40 focus:outline-none focus:ring-2 focus:ring-primary/20 ${
        isMono ? "font-mono text-xs" : ""
      }`}
      required
    />

    {rightElement}
  </div>
);

export default Register;