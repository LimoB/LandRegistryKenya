import React, { useState } from "react";
import { 
  useGetMeQuery, 
  useUpdateProfileMutation 
} from "../features/users/userApi";
import { 
  User, Mail, Phone, ShieldCheck, Wallet, Map as MapIcon, 
  History, FileText, Camera, Save, Fingerprint, CheckCircle2 
} from "lucide-react";

const Profile: React.FC = () => {
  const { data: user, isLoading, isError } = useGetMeQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();

  const [isEditing, setIsEditing] = useState(false);

  // FIX: Initialize state lazily. 
  // We use the 'user' data directly if available, otherwise empty strings.
  // No useEffect is used to sync data on load anymore.
  const [formData, setFormData] = useState(() => ({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "",
  }));

  // FIX: Instead of a useEffect 'watching' for data, we sync data 
  // explicitly when the user clicks the Edit button.
  const handleEditToggle = () => {
    if (!isEditing && user) {
      // Synchronize state with current user data only when entering edit mode
      setFormData({
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    } else if (isEditing && user) {
      // Reset if cancelling
      setFormData({
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
    setIsEditing(!isEditing);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(formData).unwrap();
      setIsEditing(false);
      alert("Profile updated successfully");
    } catch (err) {
      console.error("Failed to update profile:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center py-20">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 mt-3 font-medium">Loading profile data...</p>
      </div>
    );
  }

  if (!user || isError) return <div className="p-10 text-center">Failed to load profile.</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-4">
      
      {/* TOP HEADER / COVER SECTION */}
      <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="h-32 bg-gradient-to-r from-indigo-600 to-violet-700" />
        
        <div className="px-8 pb-8">
          <div className="relative -mt-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-3xl border-4 border-white dark:border-slate-900 bg-slate-100 flex items-center justify-center text-indigo-600 overflow-hidden shadow-lg">
                  <User size={64} />
                </div>
                <button className="absolute bottom-2 right-2 p-2 bg-white rounded-xl shadow-md text-slate-600 hover:text-indigo-600 transition-all">
                  <Camera size={16} />
                </button>
              </div>

              <div className="text-center md:text-left space-y-1 pb-2">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <h1 className="text-2xl font-black text-slate-900 dark:text-white">{user.fullName}</h1>
                  {user.isVerified && <CheckCircle2 size={20} className="text-blue-500" />}
                </div>
                <p className="text-sm font-bold text-indigo-600 uppercase tracking-widest flex items-center justify-center md:justify-start gap-2">
                  <ShieldCheck size={14} />
                  {user.role?.replace("_", " ")}
                </p>
              </div>
            </div>

            <div className="flex justify-center md:justify-end pb-2">
               <button 
                 type="button"
                 onClick={handleEditToggle}
                 className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                   isEditing 
                   ? "bg-slate-100 text-slate-600 hover:bg-slate-200" 
                   : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-100"
                 }`}
               >
                 {isEditing ? "Cancel" : "Edit Profile"}
               </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: IDENTITY & WALLET */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
              <Fingerprint size={14} /> National Identity
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">ID Number</p>
                <p className="text-sm font-mono font-bold text-slate-900 dark:text-white">{user.idNumber}</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1 flex items-center gap-1">
                  <Wallet size={12} /> Registry Wallet Address
                </p>
                <p className="text-[10px] font-mono break-all text-slate-600 dark:text-slate-400 leading-relaxed">
                  {user.walletAddress}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Account Statistics</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-indigo-50 rounded-xl text-center">
                <p className="text-xl font-black text-indigo-600">{user.ownedLands?.length || 0}</p>
                <p className="text-[10px] font-bold text-indigo-400 uppercase">Lands</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl text-center">
                <p className="text-xl font-black text-slate-600">{user.sentRequests?.length || 0}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Requests</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: FORMS & DETAILS */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
              <FileText size={14} /> Personal Information
            </h2>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      disabled={!isEditing}
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-60 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 ml-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      disabled={!isEditing}
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-60 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    disabled={!isEditing}
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-60 transition-all"
                  />
                </div>
              </div>

              {isEditing && (
                <div className="pt-4 flex justify-end">
                  <button 
                    type="submit"
                    disabled={isUpdating}
                    className="flex items-center gap-2 px-8 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 shadow-md shadow-green-100 transition-all"
                  >
                    <Save size={16} />
                    {isUpdating ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              )}
            </form>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
              {user.role === "citizen" ? <MapIcon size={14} /> : <History size={14} />}
              {user.role === "citizen" ? "Property Inventory" : "Recent System Activity"}
            </h2>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {user.role === "citizen" ? (
                user.ownedLands?.slice(0, 5).map((land) => (
                  <div key={land.id} className="py-3 flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 uppercase">{land.lrNumber}</span>
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">Active Asset</span>
                  </div>
                ))
              ) : (
                user.logs?.slice(0, 5).map((log) => (
                  <div key={log.id} className="py-3 flex items-center justify-between">
                    <span className="text-xs text-slate-600 dark:text-slate-400 capitalize">{log.actionType?.replace("_", " ")}</span>
                    <span className="text-[10px] text-slate-400">{new Date(log.createdAt).toLocaleDateString()}</span>
                  </div>
                ))
              )}
              {((user.ownedLands?.length || 0) === 0 && (user.logs?.length || 0) === 0) && (
                <p className="py-10 text-center text-xs text-slate-400 italic">No recent history available</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;