import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRegisterLandMutation } from "../../features/lands/landApi";
import Button from "../../components/Button";
import { 
  PlusCircle, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  MapPin, 
  Maximize,
  ArrowRight
} from "lucide-react";

const RegisterLand: React.FC = () => {
  const navigate = useNavigate();
  const [registerLand, { isLoading, isSuccess, error }] = useRegisterLandMutation();
  
  // Form State
  const [formData, setFormData] = useState({
    lrNumber: "",
    county: "",
    constituency: "",
    sizeInAcres: "",
    landType: "agricultural" as const,
  });
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    try {
      await registerLand({
        ...formData,
        sizeInAcres: parseFloat(formData.sizeInAcres),
        document: file,
      }).unwrap();
      
      // Navigate to "My Properties" after a short delay on success
      setTimeout(() => navigate("/citizen/my-lands"), 3000);
    } catch (err) {
      console.error("Registration failed:", err);
    }
  };

  if (isSuccess) return <SuccessState />;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Register New Land
        </h1>
        <p className="text-slate-500 font-medium mt-1">
          Submit your property details for blockchain minting and ministry verification.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Side: Text Details */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl space-y-5">
            <h3 className="text-xs font-black uppercase tracking-widest text-blue-600 flex items-center gap-2">
              <MapPin size={14} /> Property Location
            </h3>
            
            <div className="space-y-4">
              <InputField 
                label="LR Number (Title Number)"
                placeholder="e.g. NAI/KAM/1234"
                value={formData.lrNumber}
                onChange={(v: any) => setFormData({...formData, lrNumber: v})}
              />
              <div className="grid grid-cols-2 gap-4">
                <InputField 
                  label="County"
                  placeholder="e.g. Nairobi"
                  value={formData.county}
                  onChange={(v: any) => setFormData({...formData, county: v})}
                />
                <InputField 
                  label="Constituency"
                  placeholder="e.g. Kasarani"
                  value={formData.constituency}
                  onChange={(v: any) => setFormData({...formData, constituency: v})}
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl space-y-5">
            <h3 className="text-xs font-black uppercase tracking-widest text-blue-600 flex items-center gap-2">
              <Maximize size={14} /> Land Specifications
            </h3>
            
            <div className="space-y-4">
              <InputField 
                label="Size (Acres)"
                type="number"
                placeholder="0.00"
                value={formData.sizeInAcres}
                onChange={(v: any) => setFormData({...formData, sizeInAcres: v})}
              />
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5 ml-1">Land Use Type</label>
                <select 
                  className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-200 outline-none ring-1 ring-slate-100 dark:ring-slate-800 focus:ring-2 focus:ring-blue-500 transition-all"
                  value={formData.landType}
                  onChange={(e) => setFormData({...formData, landType: e.target.value as any})}
                >
                  <option value="agricultural">Agricultural</option>
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                  <option value="industrial">Industrial</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: File Upload */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl h-full flex flex-col">
            <h3 className="text-xs font-black uppercase tracking-widest text-blue-600 flex items-center gap-2 mb-5">
              <FileText size={14} /> Title Deed (PDF)
            </h3>
            
            <div 
              className={`flex-1 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-8 transition-all ${
                file ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-slate-200 dark:border-slate-800 hover:border-blue-500/50'
              }`}
            >
              <input 
                type="file" 
                id="doc-upload"
                hidden 
                accept=".pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              
              {file ? (
                <div className="text-center space-y-3">
                   <div className="w-16 h-16 bg-emerald-500 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                      <FileText size={32} />
                   </div>
                   <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate max-w-[200px]">{file.name}</p>
                   <button 
                    type="button"
                    onClick={() => setFile(null)}
                    className="text-[10px] font-black uppercase text-red-500 hover:underline"
                   >
                    Remove File
                   </button>
                </div>
              ) : (
                <label htmlFor="doc-upload" className="text-center cursor-pointer group">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 rounded-2xl flex items-center justify-center mx-auto transition-all mb-4">
                    <Upload size={32} />
                  </div>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Click to upload PDF</p>
                  <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tighter">Max file size: 10MB</p>
                </label>
              )}
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-500">
                <AlertCircle size={16} />
                <p className="text-[10px] font-bold uppercase">Submission Failed. Check inputs.</p>
              </div>
            )}

            <Button 
              type="submit"
              disabled={isLoading || !file}
              className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-black uppercase tracking-[0.15em] flex items-center justify-center gap-3 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/20"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <PlusCircle size={20} />
                  Submit to Registry
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

/* --- Minimalist Components --- */

const InputField = ({ label, placeholder, value, onChange, type = "text" }: any) => (
  <div>
    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5 ml-1 tracking-widest">{label}</label>
    <input 
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required
      className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-200 outline-none ring-1 ring-slate-100 dark:ring-slate-800 focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700"
    />
  </div>
);

const SuccessState = () => (
  <div className="flex flex-col items-center justify-center py-20 animate-in zoom-in-95 duration-500 text-center">
    <div className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/40 mb-6">
      <CheckCircle2 size={48} />
    </div>
    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Application Submitted!</h2>
    <p className="text-slate-500 font-medium max-w-sm mt-2">
      Your land details have been uploaded to IPFS and a verification request has been sent to the Land Officer.
    </p>
    <div className="mt-8 flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest animate-pulse">
      Redirecting to portfolio <ArrowRight size={14} />
    </div>
  </div>
);

export default RegisterLand;