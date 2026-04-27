import React, { useState } from "react";
import { useRegisterMutation } from "../features/auth/authApi";
import { useNavigate, Link } from "react-router-dom";
import { useAppDispatch } from "../app/hooks";
import { setLoginPendingVerification } from "../features/auth/authSlice";
import toast from "react-hot-toast";
import { ethers } from "ethers";

import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

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

    const toastId = toast.loading("Connecting wallet...");

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);

      if (accounts?.length) {
        // Normalize to lowercase to match backend logic
        const address = accounts[0].toLowerCase();
        setForm((prev) => ({
          ...prev,
          walletAddress: address,
        }));

        toast.success("Wallet connected", { id: toastId });
      } else {
        toast.error("No wallet found", { id: toastId });
      }
    } catch (err) {
      console.error("Wallet connection error:", err);
      toast.error("Wallet connection failed", { id: toastId });
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
      toast.error("Invalid wallet address format");
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

    const toastId = toast.loading("Creating account...");

    try {
      // Backend returns { success, message, data: User }
      const res = await register(form).unwrap();

      // Store email in state for the resend-verification feature on the next page
      dispatch(setLoginPendingVerification(form.email));

      toast.success(res.message || "Account created successfully", {
        id: toastId,
      });

      console.log("Registration successful for:", res.data.email);
      navigate("/verify-email");
    } catch (err: unknown) {
      console.error("Registration error:", err);
      
      const error = err as FetchBaseQueryError & {
        data?: { message?: string; error?: string };
      };

      const errorMessage =
        error?.data?.message || 
        error?.data?.error || 
        "Registration failed";

      toast.error(errorMessage, { id: toastId });
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-bg text-text">
      {/* LEFT SIDE */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm space-y-8">
          {/* HEADER */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-full bg-primary/10 text-primary uppercase font-bold tracking-widest">
              <ShieldCheck size={12} />
              Account Registration
            </div>

            <h2 className="text-2xl font-semibold tracking-tight">
              Create your account
            </h2>

            <p className="text-xs text-text/50">
              Join the Kenyan digital land management system
            </p>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
              icon={<User size={16} />}
              name="fullName"
              placeholder="Full Name"
              value={form.fullName}
              onChange={handleChange}
            />

            <InputField
              icon={<Mail size={16} />}
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
            />

            <InputField
              icon={<FileDigit size={16} />}
              name="idNumber"
              placeholder="National ID Number"
              value={form.idNumber}
              onChange={handleChange}
            />

            <InputField
              icon={<Wallet size={16} />}
              name="walletAddress"
              placeholder="Web3 Wallet Address"
              value={form.walletAddress}
              onChange={handleChange}
              isMono
              rightElement={
                <button
                  type="button"
                  onClick={handleFetchWallet}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors"
                  title="Fetch from MetaMask"
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
              className="w-full py-2.5 text-sm font-semibold rounded-lg bg-primary text-white flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-primary/20"
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  Register Account <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          {/* FOOTER */}
          <div className="text-center text-xs text-text/50">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-bold hover:underline">
              Sign in here
            </Link>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-blue-700 to-emerald-600 text-white relative">
        <div className="max-w-xs text-center space-y-6 relative z-10">
          <div className="mx-auto w-16 h-16 flex items-center justify-center bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
            <ShieldCheck size={40} />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold tracking-tight">
              Secure Land Registry
            </h3>
            <p className="text-xs text-white/80 leading-relaxed">
              Experience a transparent and tamper-proof ecosystem for managing property deeds and land transfers.
            </p>
          </div>

          <div className="p-4 bg-black/10 rounded-xl border border-white/5 text-[11px] text-left">
            <p className="opacity-70">
              Note: Registration requires a valid Web3 wallet address for on-chain identity verification and title deed minting.
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
  isMono = false,
  rightElement,
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
      className={`w-full pl-10 pr-10 py-2.5 text-sm rounded-lg bg-card border border-border/40 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
        isMono ? "font-mono text-[11px]" : ""
      }`}
      required
    />

    {rightElement}
  </div>
);

export default Register;