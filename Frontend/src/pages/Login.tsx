import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useLoginMutation } from "../features/auth/authApi";
import { useAppDispatch } from "../app/hooks";
import { setCredentials } from "../app/slices/authSlice";
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
  EyeOff
} from "lucide-react";

// --- Types & Interfaces ---

interface InputFieldProps {
  icon: React.ReactNode;
  type?: string;
  name: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

// Interface for the expected API Error structure
interface ApiError {
  data?: {
    message?: string;
  };
  message?: string;
}

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading("Verifying Ledger Access...");
    
    try {
      // res is automatically typed based on your useLoginMutation definition
      const res = await login({ 
        email: formData.email, 
        password: formData.password 
      }).unwrap();
      
      dispatch(setCredentials(res));
      
      // Safe access using optional chaining
      const rawName = res.user?.fullName || res.user?.name || "User";
      const firstName = rawName.trim().split(/\s+/)[0];

      toast.success(`Access Granted: Welcome back, ${firstName}`, { 
        id: loadingToast,
        icon: '🛡️' 
      });

      const routes: Record<string, string> = {
        admin: "/admin/dashboard",
        land_officer: "/officer/dashboard",
        citizen: "/citizen/dashboard"
      };

      navigate(routes[res.user.role] || "/dashboard");
    } catch (err: unknown) {
      // Cast err to our ApiError type safely
      const error = err as ApiError;
      const msg = error.data?.message || error.message || "Credential verification failed.";
      toast.error(msg, { id: loadingToast });
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#fafafa] dark:bg-slate-950 font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* --- Left Side: Form --- */}
      <div className="flex items-center justify-center p-6 md:p-12 lg:p-20 relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-100/50 dark:bg-blue-900/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="w-full max-w-md space-y-10 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          
          <header className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-950/30 border border-blue-100/50 dark:border-blue-800/50 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">
              <ShieldCheck size={12} strokeWidth={3} />
              Secure Gateway v3.0
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 dark:text-white">
              Official <span className="text-blue-600 drop-shadow-sm">Login.</span>
            </h2>
            <p className="text-[12px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-[0.1em] leading-relaxed">
              Authorized Node Access • National Land Ledger
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-5">
              <InputField 
                icon={<Mail size={18} />} 
                type="email"
                name="email"
                placeholder="Official Email Address"
                value={formData.email}
                onChange={handleInputChange}
              />

              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors pointer-events-none">
                  <Lock size={18} />
                </div>
                <input 
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Network Password"
                  className="w-full pl-14 pr-14 py-4 bg-white dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200/60 dark:border-slate-800 rounded-3xl text-[13px] font-bold outline-none focus:ring-4 ring-blue-500/5 focus:border-blue-500/50 transition-all dark:text-white shadow-sm placeholder:text-slate-400/80 group-hover:border-blue-400/30"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.15em] px-2">
              <label className="flex items-center gap-2 text-slate-400 cursor-pointer hover:text-slate-600 transition-colors">
                <input 
                  type="checkbox" 
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-800 bg-transparent text-blue-600 focus:ring-blue-500 shadow-sm" 
                />
                Trust Device
              </label>
              
              <Link 
                to="/forgot-password" 
                className="text-blue-600 hover:text-blue-500 transition-all font-black"
              >
                Recover Access
              </Link>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-900 dark:bg-blue-600 text-white py-4.5 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-blue-900/10 hover:shadow-blue-600/30 hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-70 group mt-4 h-14"
            >
              {isLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  Verify & Enter
                  <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                </>
              )}
            </button>
          </form>

          <footer className="pt-10 border-t border-slate-100 dark:border-slate-900/50 flex flex-col items-center gap-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              New identity request?
            </p>
            <Link to="/register" className="text-blue-600 hover:text-blue-500 transition-all font-black text-xs uppercase tracking-widest hover:tracking-[0.2em]">
              Apply for Account
            </Link>
          </footer>
        </div>
      </div>

      {/* --- Right Side: Visual Panel --- */}
      <section className="hidden lg:flex bg-blue-600 items-center justify-center relative overflow-hidden m-4 rounded-[3rem] shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700">
            <div className="absolute top-0 -right-20 w-[500px] h-[500px] bg-blue-400/20 blur-[100px] rounded-full animate-pulse" />
            <div className="absolute bottom-0 -left-20 w-[500px] h-[500px] bg-indigo-900/30 blur-[100px] rounded-full" />
        </div>
        
        <div className="relative z-10 p-12 text-center lg:text-left space-y-10 max-w-lg">
          <div className="relative inline-block group">
            <div className="absolute inset-0 bg-white/10 blur-3xl rounded-full scale-150"></div>
            <div className="relative inline-flex p-10 bg-white/10 backdrop-blur-2xl rounded-[3.5rem] border border-white/20 shadow-2xl transition-transform duration-1000 group-hover:rotate-6">
               <Fingerprint size={96} strokeWidth={1} className="text-blue-50" />
               <div className="absolute -top-3 -right-3 bg-emerald-500 p-3 rounded-2xl border-4 border-blue-600 shadow-xl">
                  <ShieldCheck size={24} className="text-white" />
               </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-4xl font-black tracking-tighter text-white uppercase italic leading-[0.9]">Ledger <br /> Protocol</h3>
            <p className="text-[11px] font-bold text-blue-100/80 uppercase tracking-[0.2em] leading-loose max-w-[320px]">
              Immutable Governance via <br /> Distributed Ledger Technology
            </p>
          </div>
          
          <div className="flex items-center gap-6 pt-6 justify-center lg:justify-start">
             <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></div>
                <span className="text-[9px] font-black text-blue-50 uppercase tracking-widest">Mainnet Verified</span>
             </div>
             <div className="h-4 w-px bg-white/20"></div>
             <div className="text-[9px] font-black text-blue-50 uppercase tracking-widest">Nodes: 1,402</div>
          </div>
        </div>
      </section>
    </div>
  );
};

// --- Reusable Component ---
const InputField: React.FC<InputFieldProps> = ({ icon, type = "text", name, placeholder, value, onChange }) => (
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
      className="w-full pl-14 pr-6 py-4 bg-white dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200/60 dark:border-slate-800 rounded-3xl text-[13px] font-bold outline-none focus:ring-4 ring-blue-500/5 focus:border-blue-500/50 transition-all dark:text-white shadow-sm placeholder:text-slate-400/80 group-hover:border-blue-400/30"
      required
    />
  </div>
);

export default Login;