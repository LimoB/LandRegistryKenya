import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useLoginMutation } from "../features/auth/authApi";
import { useAppDispatch } from "../app/hooks";
import { setCredentials, setTempEmail } from "../app/slices/authSlice";
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
  Info
} from "lucide-react";

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
}

const Login: React.FC = () => {
  const [formData, setFormData] = useState({ email: "", password: "", rememberMe: false });
  const [showPassword, setShowPassword] = useState(false);
  
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading("Verifying credentials...");
    
    try {
      const res = await login({ email: formData.email, password: formData.password }).unwrap();
      dispatch(setCredentials(res));
      
      const firstName = (res.user?.fullName || "User").trim().split(/\s+/)[0];
      toast.success(`Welcome back, ${firstName}!`, { id: loadingToast, icon: '👋' });

      // Role-Based Routing
      const role = res.user?.role;
      if (role === 'admin') navigate("/admin/dashboard");
      else if (role === 'land_officer') navigate("/officer/dashboard");
      else navigate("/citizen/dashboard");

    } catch (err: unknown) {
      const error = err as ApiError;
      
      // ✅ Handle Unverified Account (Backend returns 403)
      if (error.status === 403) {
        dispatch(setTempEmail(formData.email));
        toast.error("Account not verified. Redirecting...", { id: loadingToast });
        navigate("/verify-notice");
        return;
      }

      const msg = error.data?.message || error.data?.error || "Login failed. Please try again.";
      toast.error(msg, { id: loadingToast });
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#fafafa] dark:bg-slate-950 font-sans">
      <div className="flex items-center justify-center p-6 md:p-12 lg:p-20 relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-100/50 dark:bg-blue-900/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="w-full max-w-md space-y-10 relative z-10">
          <header className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 rounded-full text-[10px] font-bold uppercase tracking-wider text-blue-600">
              <ShieldCheck size={12} /> Secure Access
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
              Log in to your <span className="text-blue-600">Portal.</span>
            </h2>
          </header>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <InputField icon={<Mail size={18} />} type="email" name="email" placeholder="Enter your email" value={formData.email} onChange={handleInputChange} />
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors pointer-events-none z-10">
                  <Lock size={18} />
                </div>
                <input 
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  className="w-full pl-14 pr-14 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-white"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 z-20">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-bold px-2">
              <label className="flex items-center gap-2 text-slate-500 cursor-pointer hover:text-slate-700">
                <input type="checkbox" name="rememberMe" checked={formData.rememberMe} onChange={handleInputChange} className="w-4 h-4 rounded border-slate-300 text-blue-600" />
                Remember me
              </label>
              <Link to="/forgot-password" size-xs className="text-blue-600">Forgot Password?</Link>
            </div>

            <button disabled={isLoading} type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-sm uppercase tracking-widest shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-3 h-14">
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : <>Sign In <ArrowRight size={18} /></>}
            </button>
          </form>

          <footer className="pt-10 border-t border-slate-100 dark:border-slate-800 flex flex-col items-center gap-2">
            <p className="text-xs text-slate-500">Don't have an account yet?</p>
            <Link to="/register" className="text-blue-600 font-bold text-sm hover:underline">Apply for Citizen Access</Link>
          </footer>
        </div>
      </div>

      <section className="hidden lg:flex bg-blue-600 items-center justify-center relative m-4 rounded-[3rem] shadow-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-700 to-indigo-800" />
        <div className="relative z-10 p-12 space-y-10 max-w-lg text-white">
          <div className="p-10 bg-white/10 backdrop-blur-xl rounded-[3rem] border border-white/20 inline-block">
             <Fingerprint size={80} strokeWidth={1.5} className="text-blue-50" />
          </div>
          <div className="space-y-4">
            <h3 className="text-4xl font-bold">National Land <br /> Registry</h3>
            <p className="text-sm font-medium text-blue-100/80 leading-relaxed">Secure digital portal for title management and property verification.</p>
          </div>
          <div className="p-6 bg-blue-900/30 rounded-3xl border border-white/5 flex gap-3 items-start">
             <Info size={18} className="shrink-0 mt-1 text-blue-200" />
             <p className="text-xs text-blue-100"><strong>Notice:</strong> This is a restricted government portal. All access attempts are logged.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

const InputField: React.FC<InputFieldProps> = ({ icon, type = "text", name, placeholder, value, onChange }) => (
  <div className="relative group">
    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors z-10"> {icon} </div>
    <input name={name} type={type} value={value} onChange={onChange} placeholder={placeholder} className="w-full pl-14 pr-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20" required />
  </div>
);

export default Login;