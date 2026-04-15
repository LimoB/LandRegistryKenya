import React, { useState } from "react";
import { useRegisterMutation } from "../features/auth/authApi";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { ethers } from "ethers";

// Icons
import { 
  User, 
  Mail, 
  Shield, 
  Wallet, 
  Lock, 
  ArrowRight, 
  Fingerprint, 
  CheckCircle2,
  Loader2,
  FileDigit,
  Info,
  RefreshCw
} from "lucide-react";

// --- Types & Interfaces ---

interface InputFieldProps {
  icon: React.ReactNode;
  type?: string;
  name: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isMono?: boolean;
  rightElement?: React.ReactNode;
}

interface ApiError {
  data?: {
    message?: string;
  };
  message?: string;
}

const Register: React.FC = () => {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    idNumber: "",
    walletAddress: "",
    password: "",
    role: "citizen" as const, 
  });
  
  const [register, { isLoading }] = useRegisterMutation();
  const navigate = useNavigate();

  const handleFetchWallet = async () => {
    if (!window.ethereum) {
      toast.error("Please install MetaMask to continue.");
      return;
    }

    const syncToast = toast.loading("Connecting to your wallet...");
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      
      if (accounts.length > 0) {
        setForm(prev => ({ ...prev, walletAddress: accounts[0] }));
        toast.success("Wallet connected!", { id: syncToast });
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_err) {
      // Prefixed with underscore to satisfy ESLint
      toast.error("Failed to connect wallet.", { id: syncToast });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateWallet = (address: string) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateWallet(form.walletAddress)) {
      toast.error("Please enter a valid wallet address (starting with 0x).");
      return;
    }

    const loadingToast = toast.loading("Creating your account...");

    try {
      await register(form).unwrap();
      toast.success("Account created successfully!", { id: loadingToast });
      navigate("/login");
    } catch (err: unknown) {
      const error = err as ApiError;
      const msg = error.data?.message || error.message || "Something went wrong.";
      toast.error(msg, { id: loadingToast });
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#fafafa] dark:bg-slate-950 font-sans">
      
      {/* --- Left Side: Form --- */}
      <div className="flex items-center justify-center p-6 md:p-12 lg:p-20 relative overflow-hidden">
        <div className="w-full max-w-xl space-y-10 relative z-10">
          
          <header className="space-y-4 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 rounded-full text-[10px] font-bold uppercase tracking-wider text-blue-600">
              <Shield size={12} />
              Secure Registration
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
              Join the <span className="text-blue-600">Registry.</span>
            </h2>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Register your account to manage your land titles securely on the blockchain.
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField 
                icon={<User size={18} />} 
                name="fullName" 
                placeholder="Full Name (as on ID)" 
                value={form.fullName} 
                onChange={handleChange} 
              />
              
              <InputField 
                icon={<Mail size={18} />} 
                type="email"
                name="email" 
                placeholder="Email Address" 
                value={form.email} 
                onChange={handleChange} 
              />
            </div>

            <InputField 
                icon={<FileDigit size={18} />} 
                name="idNumber" 
                placeholder="ID or Passport Number" 
                value={form.idNumber} 
                onChange={handleChange} 
            />

            <InputField 
                icon={<Wallet size={18} />} 
                name="walletAddress" 
                placeholder="Wallet Address (0x...)" 
                value={form.walletAddress} 
                onChange={handleChange} 
                isMono
                rightElement={
                  <button 
                    type="button" 
                    onClick={handleFetchWallet}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"
                    title="Get from MetaMask"
                  >
                    <RefreshCw size={16} />
                  </button>
                }
            />

            <InputField 
                icon={<Lock size={18} />} 
                type="password"
                name="password" 
                placeholder="Create a Strong Password" 
                value={form.password} 
                onChange={handleChange} 
            />

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-sm uppercase tracking-widest shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-3 disabled:opacity-70 group mt-8 h-14"
            >
              {isLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  Create My Account
                  <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                </>
              )}
            </button>
          </form>

          <footer className="pt-10 border-t border-slate-100 dark:border-slate-800 flex flex-col items-center gap-2">
            <p className="text-xs text-slate-500">Already have an account?</p>
            <Link to="/login" className="text-blue-600 hover:underline font-bold text-sm">
              Log in here
            </Link>
          </footer>
        </div>
      </div>

      {/* --- Right Side: Info Panel --- */}
      <section className="hidden lg:flex bg-blue-600 items-center justify-center relative m-4 rounded-[3rem] shadow-2xl overflow-hidden">
        <div className="relative z-10 p-16 text-white space-y-8 max-w-xl">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-3xl flex items-center justify-center border border-white/20">
            <Fingerprint size={48} strokeWidth={1.5} />
          </div>
          
          <div className="space-y-6">
            <h3 className="text-4xl font-bold leading-tight">
              Simple. Secure. <br /> Permanent.
            </h3>
            
            <div className="space-y-4">
               <div className="flex items-center gap-4 text-sm font-medium">
                  <CheckCircle2 size={20} className="text-blue-200" />
                  Your identity is verified and protected
               </div>
               <div className="flex items-center gap-4 text-sm font-medium">
                  <CheckCircle2 size={20} className="text-blue-200" />
                  You own your land records via your wallet
               </div>
               <div className="flex items-center gap-4 text-sm font-medium">
                  <CheckCircle2 size={20} className="text-blue-200" />
                  Fast, digital, and paperless process
               </div>
            </div>

            <div className="p-6 bg-blue-700/50 rounded-3xl border border-white/10 mt-8">
                <div className="flex gap-3 items-start">
                    <Info size={20} className="shrink-0 mt-0.5" />
                    <p className="text-sm leading-relaxed">
                        <strong>Quick Tip:</strong> Your wallet address is like your digital signature. Make sure it's correct before you sign up!
                    </p>
                </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// --- Reusable Input Component ---

const InputField: React.FC<InputFieldProps> = ({ icon, type = "text", name, placeholder, value, onChange, isMono = false, rightElement }) => (
  <div className="relative group w-full">
    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors pointer-events-none z-20">
        {icon}
    </div>
    <input 
      name={name}
      type={type} 
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full pl-14 pr-12 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-white ${isMono ? 'font-mono text-xs' : ''}`}
      required
    />
    {rightElement}
  </div>
);

export default Register;