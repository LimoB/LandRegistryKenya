import React, { useState, useMemo } from "react";
import { 
  useGetMeQuery, 
  useUpdateProfileMutation 
} from "../features/users/userApi";
import { 
  User as UserIcon, Mail, Phone, ShieldCheck, Wallet, 
  FileText, Save, Fingerprint, CheckCircle2 
} from "lucide-react";
import { toast } from "react-hot-toast";

// --- TypeScript Interfaces ---
interface LandAsset {
  id: string;
  lrNumber: string;
}

interface SystemLog {
  id: string;
  actionType: string;
  createdAt: string;
}

interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  idNumber: string;
  walletAddress: string;
  role: string;
  isVerified: boolean;
  ownedLands?: LandAsset[];
  sentRequests?: unknown[];
  logs?: SystemLog[];
}

interface ApiError {
  data?: {
    message?: string;
  };
}

const Profile: React.FC = () => {
  const { data: response, isLoading, isError, refetch } = useGetMeQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  
  const user = useMemo(() => response?.data as UserProfile | undefined, [response]);
  
  const [isEditing, setIsEditing] = useState(false);

  /**
   * REFACTOR: Instead of an Effect, we derive the default values.
   * If 'user' exists, we use their data; otherwise, empty strings.
   */
  const [formData, setFormData] = useState({
    fullName: user?.fullName ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
  });

  // Track the last seen user ID to reset form when data finally loads or switches
  const [prevUserId, setPrevUserId] = useState<string | null>(null);

  /**
   * This is the "Manual Sync" pattern. 
   * It resets the form only when the user ID actually changes (e.g., after initial fetch).
   */
  if (user && user.id !== prevUserId) {
    setPrevUserId(user.id);
    setFormData({
      fullName: user.fullName ?? "",
      email: user.email ?? "",
      phone: user.phone ?? "",
    });
  }

  const handleEditToggle = () => {
    if (isEditing && user) {
      // Revert changes if cancelling
      setFormData({
        fullName: user.fullName ?? "",
        email: user.email ?? "",
        phone: user.phone ?? "",
      });
    }
    setIsEditing(!isEditing);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(formData).unwrap();
      setIsEditing(false);
      toast.success("Profile updated successfully");
      refetch();
    } catch (err: unknown) {
      const errorData = err as ApiError;
      toast.error(errorData.data?.message || "Failed to update profile");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center py-20 justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-500 mt-4 font-semibold tracking-wide">Fetching Registry Credentials...</p>
      </div>
    );
  }

  if (!user || isError) {
    return (
      <div className="p-10 text-center flex flex-col items-center gap-4">
        <div className="p-4 bg-red-50 text-red-600 rounded-full">
           <Fingerprint size={48} />
        </div>
        <p className="text-slate-600 font-medium">Identity synchronization failed. Please log in again.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-4 animate-in fade-in duration-500">
      
      {/* COVER SECTION */}
      <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="h-32 bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-700" />
        
        <div className="px-8 pb-8">
          <div className="relative -mt-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
              <div className="relative group">
                <div className="w-32 h-32 rounded-3xl border-4 border-white dark:border-slate-900 bg-slate-100 flex items-center justify-center text-indigo-600 overflow-hidden shadow-lg transition-transform group-hover:scale-[1.02]">
                  <span className="text-4xl font-black">{user.fullName?.charAt(0)}</span>
                </div>
              </div>

              <div className="text-center md:text-left space-y-1 pb-2">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{user.fullName}</h1>
                  {user.isVerified && <CheckCircle2 size={20} className="text-blue-500 fill-blue-50" />}
                </div>
                <p className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em] flex items-center justify-center md:justify-start gap-2">
                  <ShieldCheck size={14} />
                  {user.role?.replace("_", " ")}
                </p>
              </div>
            </div>

            <div className="flex justify-center md:justify-end pb-2">
               <button 
                 type="button"
                 onClick={handleEditToggle}
                 className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all transform active:scale-95 ${
                   isEditing 
                   ? "bg-slate-100 text-slate-600 hover:bg-slate-200" 
                   : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200"
                 }`}
               >
                 {isEditing ? "Discard Changes" : "Edit Profile"}
               </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SIDEBAR: IDENTITY */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mb-5 flex items-center gap-2">
              <Fingerprint size={14} className="text-indigo-500" /> Secure Identity
            </h2>
            <div className="space-y-5">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">National ID Number</p>
                <p className="text-sm font-mono font-black text-slate-900 dark:text-white mt-1">{user.idNumber}</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-2 flex items-center gap-1.5">
                  <Wallet size={12} className="text-indigo-500" /> Web3 Wallet Address
                </p>
                <p className="text-[10px] font-mono break-all text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                  {user.walletAddress}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT: FORM */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm">
            <h2 className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mb-8 flex items-center gap-2">
              <FileText size={14} className="text-indigo-500" /> Account Details
            </h2>

            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wide ml-1">Legal Full Name</label>
                  <div className="relative group">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                    <input 
                      readOnly={!isEditing}
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      className={`w-full pl-12 pr-4 py-3 text-sm rounded-xl border outline-none transition-all ${
                        isEditing 
                        ? "bg-white border-indigo-200 ring-4 ring-indigo-500/5 focus:border-indigo-500" 
                        : "bg-slate-50 border-slate-100 text-slate-600 cursor-not-allowed"
                      }`}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wide ml-1">Mobile Number</label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                    <input 
                      readOnly={!isEditing}
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="e.g. +254 7XX XXX XXX"
                      className={`w-full pl-12 pr-4 py-3 text-sm rounded-xl border outline-none transition-all ${
                        isEditing 
                        ? "bg-white border-indigo-200 ring-4 ring-indigo-500/5 focus:border-indigo-500" 
                        : "bg-slate-50 border-slate-100 text-slate-600 cursor-not-allowed"
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-wide ml-1">Primary Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                  <input 
                    readOnly={!isEditing}
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className={`w-full pl-12 pr-4 py-3 text-sm rounded-xl border outline-none transition-all ${
                      isEditing 
                      ? "bg-white border-indigo-200 ring-4 ring-indigo-500/5 focus:border-indigo-500" 
                      : "bg-slate-50 border-slate-100 text-slate-600 cursor-not-allowed"
                    }`}
                  />
                </div>
              </div>

              {isEditing && (
                <div className="pt-4 flex justify-end gap-3">
                  <button 
                    type="submit"
                    disabled={isUpdating}
                    className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-xl text-sm font-black hover:bg-green-700 shadow-lg shadow-green-100 transition-all transform active:scale-95 disabled:opacity-50"
                  >
                    <Save size={18} />
                    {isUpdating ? "Processing..." : "Commit Changes"}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;