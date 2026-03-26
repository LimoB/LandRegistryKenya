import React, { useState } from "react";
import { useRegisterMutation } from "../features/auth/authApi";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

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
  ShieldAlert,
  ChevronDown
} from "lucide-react";

const Register: React.FC = () => {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    idNumber: "",
    walletAddress: "",
    password: "",
    role: "citizen" as "admin" | "land_officer" | "citizen",
  });
  
  const [register, { isLoading }] = useRegisterMutation();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateWallet = (address: string) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateWallet(form.walletAddress)) {
      toast.error("Invalid Wallet: Address must start with 0x...");
      return;
    }

    const loadingToast = toast.loading("Syncing with Ledger Node...");

    try {
      await register(form).unwrap();
      toast.success("Identity Provisioned!", { id: loadingToast });
      navigate("/login");
    } catch (err: any) {
      const msg = err.data?.message || "Registration rejected.";
      toast.error(msg, { id: loadingToast });
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#fafafa] dark:bg-slate-950 font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* --- Left Side: Soft UI Form --- */}
      <div className="flex items-center justify-center p-6 md:p-12 lg:p-20 relative overflow-hidden">
        {/* Soft Ambient Glows */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-100/50 dark:bg-blue-900/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="w-full max-w-xl space-y-10 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          
          <header className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-950/30 border border-blue-100/50 dark:border-blue-800/50 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">
              <Shield size={12} strokeWidth={3} />
              Identity Provisioning
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 dark:text-white">
              Create <span className="text-blue-600 drop-shadow-sm">Identity.</span>
            </h2>
            <p className="text-[12px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-[0.1em]">
              Authorized Node Access • National Land Registry
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Full Name */}
              <InputField 
                icon={<User size={18} />} 
                name="fullName" 
                placeholder="Full Legal Name" 
                value={form.fullName} 
                onChange={handleChange} 
              />
              
              {/* Email */}
              <InputField 
                icon={<Mail size={18} />} 
                type="email"
                name="email" 
                placeholder="Official Email" 
                value={form.email} 
                onChange={handleChange} 
              />

              {/* ID Number */}
              <InputField 
                icon={<FileDigit size={18} />} 
                name="idNumber" 
                placeholder="ID / Passport No." 
                value={form.idNumber} 
                onChange={handleChange} 
              />

              {/* Role Selector */}
              <div className="relative group">
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full px-5 py-4 bg-white dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200/60 dark:border-slate-800 rounded-3xl text-[11px] font-bold uppercase tracking-widest outline-none focus:ring-4 ring-blue-500/5 transition-all dark:text-white appearance-none cursor-pointer shadow-sm group-hover:border-blue-400/50"
                >
                  <option value="citizen">Citizen</option>
                  <option value="land_officer">Land Officer</option>
                  <option value="admin">Administrator</option>
                </select>
                <ChevronDown size={14} className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-blue-500 transition-colors" />
              </div>
            </div>

            {/* Wallet Address */}
            <InputField 
                icon={<Wallet size={18} />} 
                name="walletAddress" 
                placeholder="Blockchain Wallet Address (0x...)" 
                value={form.walletAddress} 
                onChange={handleChange} 
                isMono
            />

            {/* Password */}
            <InputField 
                icon={<Lock size={18} />} 
                type="password"
                name="password" 
                placeholder="Master Access Key" 
                value={form.password} 
                onChange={handleChange} 
            />

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-900 dark:bg-blue-600 text-white py-4.5 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-blue-900/10 hover:shadow-blue-600/30 hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-70 group mt-8 h-14"
            >
              {isLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  Verify & Register
                  <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                </>
              )}
            </button>
          </form>

          <footer className="pt-10 border-t border-slate-100 dark:border-slate-900/50 flex flex-col items-center gap-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Already have an ID?
            </p>
            <Link to="/login" className="text-blue-600 hover:text-blue-500 transition-all font-black text-xs uppercase tracking-widest hover:tracking-[0.2em]">
              Return to Portal
            </Link>
          </footer>
        </div>
      </div>

      {/* --- Right Side: The "Liquid" Visual Panel --- */}
      <section className="hidden lg:flex bg-blue-600 items-center justify-center relative overflow-hidden m-4 rounded-[3rem] shadow-2xl">
        {/* Animated Liquid Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700">
            <div className="absolute top-0 -right-20 w-[500px] h-[500px] bg-blue-400/20 blur-[100px] rounded-full animate-pulse" />
            <div className="absolute bottom-0 -left-20 w-[500px] h-[500px] bg-indigo-900/30 blur-[100px] rounded-full" />
        </div>
        
        <div className="relative z-10 p-16 text-white space-y-12 max-w-xl text-center lg:text-left">
          <div className="inline-flex p-1 bg-white/10 backdrop-blur-2xl rounded-[3rem] border border-white/20 shadow-2xl">
             <div className="p-7 bg-white/10 rounded-[2.8rem]">
                <Fingerprint size={64} strokeWidth={1} className="text-blue-50" />
             </div>
          </div>
          
          <div className="space-y-8">
            <h3 className="text-5xl font-black tracking-tighter uppercase leading-[0.85] italic drop-shadow-lg">
              Immutable <br /> <span className="text-blue-200">Ownership.</span>
            </h3>
            
            <div className="space-y-4">
               <InfoItem icon={<CheckCircle2 size={16} />} text="Cryptographic Identity Proof" />
               <InfoItem icon={<ShieldAlert size={16} />} text="Non-Custodial Asset Wallet" />
               <InfoItem icon={<Lock size={16} />} text="Multi-Sig Protocol Support" />
            </div>

            <div className="p-8 bg-blue-950/30 rounded-[2.5rem] border border-white/5 backdrop-blur-xl mt-12 transition-all hover:bg-blue-950/40">
                <p className="text-[11px] font-bold text-blue-100/80 uppercase tracking-widest leading-loose">
                    <span className="text-white font-black block mb-2 text-xs">Registry Node Protocol:</span>
                    Data entries are permanent. Your wallet address acts as your 
                    <span className="text-white"> Sovereign Key</span>. Ensure accuracy before 
                    broadcasting to the mainnet.
                </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// --- Reusable Sub-Components for Clean Code ---

const InputField = ({ icon, type = "text", name, placeholder, value, onChange, isMono = false }: any) => (
  <div className="relative group">
    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors pointer-events-none">
        {icon}
    </div>
    <input 
      name={name}
      type={type} 
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full pl-14 pr-6 py-4 bg-white dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200/60 dark:border-slate-800 rounded-3xl text-[13px] font-bold outline-none focus:ring-4 ring-blue-500/5 focus:border-blue-500/50 transition-all dark:text-white shadow-sm placeholder:text-slate-400/80 group-hover:border-blue-400/30 ${isMono ? 'font-mono text-xs' : ''}`}
      required
    />
  </div>
);

const InfoItem = ({ icon, text }: { icon: React.ReactNode, text: string }) => (
    <div className="flex items-center gap-4 text-white font-black text-[12px] uppercase tracking-[0.2em] group cursor-default">
        <span className="bg-white/10 p-2.5 rounded-2xl border border-white/10 shadow-lg group-hover:scale-110 transition-transform">{icon}</span>
        {text}
    </div>
);

export default Register;