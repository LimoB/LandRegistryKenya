import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRegisterLandMutation } from "../../features/lands/landApi";
import Button from "../../components/Button";

import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Maximize,
  ArrowRight,
  Trash2,
  Info,
} from "lucide-react";

/* ================================
   TYPES
================================ */
type LandType = "agricultural" | "residential" | "commercial" | "industrial";

interface FormState {
  lrNumber: string;
  county: string;
  constituency: string;
  sizeInAcres: string;
  landType: LandType;
}

/* ================================
   MAIN COMPONENT
================================ */
const RegisterLand: React.FC = () => {
  const navigate = useNavigate();
  const [registerLand, { isLoading, isSuccess, error }] =
    useRegisterLandMutation();

  const [formData, setFormData] = useState<FormState>({
    lrNumber: "",
    county: "",
    constituency: "",
    sizeInAcres: "",
    landType: "agricultural",
  });

  const [file, setFile] = useState<File | null>(null);

  const handleChange = <K extends keyof FormState>(
    key: K,
    value: FormState[K]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };
  
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!file) {
    alert("Please upload a title deed PDF");
    return;
  }

  try {
    await registerLand({
      lrNumber: formData.lrNumber,
      county: formData.county,
      constituency: formData.constituency,
      sizeInAcres: parseFloat(formData.sizeInAcres),
      landType: formData.landType,
      document: file, // ✅ just pass file
    }).unwrap();

    setTimeout(() => navigate("/citizen/my-lands"), 2000);

  } catch (err) {
    console.error("Submission failed:", err);
  }
};

  if (isSuccess) return <SuccessState />;

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* PAGE HEADER */}
      <div className="bg-blue-600 rounded-2xl p-8 text-white shadow-lg shadow-blue-100">
        <h1 className="text-3xl font-extrabold">Register New Property</h1>
        <p className="text-blue-100 mt-2 flex items-center gap-2">
          <Info size={16} />
          Please provide accurate details as per your Title Deed.
        </p>
      </div>

      {/* MAIN FORM */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: FORM FIELDS */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* SECTION 1: LOCATION */}
          <section className="p-8 border border-slate-100 rounded-3xl bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <MapPin size={20} />
              </div>
              <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm">
                Location Details
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <InputField
                  label="LR Number (Title Number)"
                  placeholder="e.g. NAIROBI/BLOCK12/345"
                  value={formData.lrNumber}
                  onChange={(v) => handleChange("lrNumber", v)}
                />
              </div>

              <InputField
                label="County"
                placeholder="e.g. Nairobi"
                value={formData.county}
                onChange={(v) => handleChange("county", v)}
              />

              <InputField
                label="Constituency"
                placeholder="e.g. Westlands"
                value={formData.constituency}
                onChange={(v) => handleChange("constituency", v)}
              />
            </div>
          </section>

          {/* SECTION 2: LAND SPECS */}
          <section className="p-8 border border-slate-100 rounded-3xl bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <Maximize size={20} />
              </div>
              <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm">
                Property Specifications
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Total Size (Acres)"
                type="number"
                placeholder="0.5"
                value={formData.sizeInAcres}
                onChange={(v) => handleChange("sizeInAcres", v)}
              />

              <div className="flex flex-col">
                <label className="text-xs font-bold text-slate-500 mb-2 ml-1">
                  Land Use Type
                </label>
                <select
                  value={formData.landType}
                  onChange={(e) => handleChange("landType", e.target.value as LandType)}
                  className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50 font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                >
                  <option value="agricultural">Agricultural (Farming)</option>
                  <option value="residential">Residential (Housing)</option>
                  <option value="commercial">Commercial (Business)</option>
                  <option value="industrial">Industrial (Factory)</option>
                </select>
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: UPLOAD & SUBMIT */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-8 border border-slate-100 rounded-3xl bg-white shadow-sm flex flex-col sticky top-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <FileText size={20} />
              </div>
              <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm">
                Proof of Ownership
              </h3>
            </div>

            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Upload a scanned copy of your original <strong>Title Deed</strong> (PDF format only).
            </p>

            <div
              className={`relative border-2 border-dashed rounded-2xl p-8 transition-all flex flex-col items-center justify-center text-center ${
                file 
                ? "border-emerald-500 bg-emerald-50/30" 
                : "border-slate-200 hover:border-blue-400 bg-slate-50"
              }`}
            >
              <input
                type="file"
                accept=".pdf"
                hidden
                id="file-upload"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />

              {file ? (
                <div className="animate-in zoom-in duration-300">
                  <div className="p-3 bg-white rounded-full shadow-sm inline-block mb-3">
                    <FileText className="text-emerald-500" size={32} />
                  </div>
                  <p className="text-sm font-bold text-slate-700 truncate max-w-[150px]">
                    {file.name}
                  </p>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="mt-4 flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-700 transition-colors mx-auto"
                  >
                    <Trash2 size={14} />
                    Remove and Change
                  </button>
                </div>
              ) : (
                <label htmlFor="file-upload" className="cursor-pointer group">
                  <div className="p-4 bg-white rounded-full shadow-sm inline-block mb-3 group-hover:scale-110 transition-transform">
                    <Upload size={32} className="text-slate-400 group-hover:text-blue-500" />
                  </div>
                  <p className="text-sm font-bold text-slate-600">Select PDF Document</p>
                  <p className="text-[10px] text-slate-400 mt-1 uppercase">Max size: 5MB</p>
                </label>
              )}
            </div>

            {/* ERROR DISPLAY */}
            {error && (
              <div className="mt-6 p-4 bg-red-50 rounded-xl flex items-start gap-3 text-red-600 border border-red-100">
                <AlertCircle size={18} className="shrink-0" />
                <span className="text-xs font-medium leading-relaxed">
                  There was an error saving your land. Please check your connection and try again.
                </span>
              </div>
            )}

            {/* ACTION BUTTON */}
            <Button
              type="submit"
              disabled={isLoading || !file}
              className={`mt-8 w-full py-4 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
                isLoading 
                ? "bg-slate-200 text-slate-500" 
                : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-200"
              }`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Register Property
                  <ArrowRight size={18} />
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

/* ================================
   INPUT COMPONENT
================================ */
interface InputProps {
  label: string;
  value: string;
  placeholder?: string;
  type?: string;
  onChange: (value: string) => void;
}

const InputField: React.FC<InputProps> = ({
  label,
  value,
  placeholder,
  type = "text",
  onChange,
}) => {
  return (
    <div className="flex flex-col">
      <label className="text-xs font-bold text-slate-500 mb-2 ml-1">{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-3.5 border border-slate-200 rounded-xl bg-slate-50 placeholder:text-slate-300 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-medium"
      />
    </div>
  );
};

/* ================================
   SUCCESS STATE UI
================================ */
const SuccessState = () => (
  <div className="max-w-md mx-auto text-center py-24 px-6 space-y-6 animate-in zoom-in duration-500">
    <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
      <CheckCircle2 size={48} />
    </div>
    <div className="space-y-2">
      <h2 className="text-3xl font-black text-slate-800">All Set!</h2>
      <p className="text-slate-500 leading-relaxed">
        Your property registration has been submitted. Our officers will verify the document and update your status shortly.
      </p>
    </div>
    <div className="inline-flex items-center gap-3 text-blue-600 font-bold bg-blue-50 px-6 py-3 rounded-full">
      <span>Redirecting to your portfolio</span>
      <div className="flex gap-1">
        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" />
        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]" />
        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]" />
      </div>
    </div>
  </div>
);

export default RegisterLand;