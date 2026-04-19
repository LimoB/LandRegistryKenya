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
} from "lucide-react";

/* ================================
   TYPES (NO ANY HERE)
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

  /* ================================
     HANDLE INPUT CHANGE
  ================================ */
  const handleChange = <K extends keyof FormState>(
    key: K,
    value: FormState[K]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  /* ================================
     SUBMIT
  ================================ */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    try {
      await registerLand({
        ...formData,
        sizeInAcres: parseFloat(formData.sizeInAcres),
        document: file,
      }).unwrap();

      setTimeout(() => navigate("/citizen/my-lands"), 2000);
    } catch (err) {
      console.error("Failed:", err);
    }
  };

  /* ================================
     SUCCESS SCREEN
  ================================ */
  if (isSuccess) return <SuccessState />;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-black">Register Your Land</h1>
        <p className="text-slate-500 text-sm mt-1">
          Fill in correct details. This will be stored on the registry system.
        </p>
      </div>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-8"
      >

        {/* LEFT */}
        <div className="space-y-6">

          {/* LOCATION */}
          <section className="p-6 border rounded-2xl bg-white dark:bg-slate-900">
            <h3 className="text-xs font-bold flex items-center gap-2 text-blue-600 mb-4">
              <MapPin size={14} />
              Location Details
            </h3>

            <div className="space-y-4">
              <InputField
                label="LR Number"
                placeholder="e.g. NAI/KAM/1234"
                value={formData.lrNumber}
                onChange={(v) => handleChange("lrNumber", v)}
              />

              <div className="grid grid-cols-2 gap-3">
                <InputField
                  label="County"
                  placeholder="e.g. Nairobi"
                  value={formData.county}
                  onChange={(v) => handleChange("county", v)}
                />

                <InputField
                  label="Constituency"
                  placeholder="e.g. Kasarani"
                  value={formData.constituency}
                  onChange={(v) => handleChange("constituency", v)}
                />
              </div>
            </div>
          </section>

          {/* LAND INFO */}
          <section className="p-6 border rounded-2xl bg-white dark:bg-slate-900">
            <h3 className="text-xs font-bold flex items-center gap-2 text-blue-600 mb-4">
              <Maximize size={14} />
              Land Details
            </h3>

            <div className="space-y-4">
              <InputField
                label="Size (Acres)"
                type="number"
                placeholder="0.00"
                value={formData.sizeInAcres}
                onChange={(v) => handleChange("sizeInAcres", v)}
              />

              <div>
                <label className="text-xs font-bold text-slate-500">
                  Land Type
                </label>

                <select
                  value={formData.landType}
                  onChange={(e) =>
                    handleChange("landType", e.target.value as LandType)
                  }
                  className="w-full mt-1 p-3 rounded-xl border bg-slate-50 dark:bg-slate-950"
                >
                  <option value="agricultural">Agricultural</option>
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                  <option value="industrial">Industrial</option>
                </select>
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT */}
        <div className="p-6 border rounded-2xl bg-white dark:bg-slate-900 flex flex-col">

          <h3 className="text-xs font-bold flex items-center gap-2 text-blue-600 mb-4">
            <FileText size={14} />
            Upload Title Deed
          </h3>

          <div
            className={`flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 text-center ${
              file ? "border-green-500" : "border-slate-300"
            }`}
          >
            <input
              type="file"
              accept=".pdf"
              hidden
              id="file"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />

            {file ? (
              <>
                <FileText className="text-green-500" size={40} />
                <p className="text-sm mt-2 font-bold">{file.name}</p>

                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="text-xs text-red-500 mt-2"
                >
                  Remove file
                </button>
              </>
            ) : (
              <label htmlFor="file" className="cursor-pointer">
                <Upload size={40} className="text-slate-400 mx-auto" />
                <p className="text-sm mt-2">Click to upload PDF</p>
              </label>
            )}
          </div>

          {/* ERROR */}
          {error && (
            <div className="mt-4 flex items-center gap-2 text-red-500 text-xs">
              <AlertCircle size={14} />
              Something went wrong. Please try again.
            </div>
          )}

          {/* SUBMIT */}
          <Button
            type="submit"
            disabled={isLoading || !file}
            className="mt-6 w-full bg-blue-600 text-white py-3 rounded-xl font-bold"
          >
            {isLoading ? "Submitting..." : "Submit Land"}
          </Button>
        </div>
      </form>
    </div>
  );
};

/* ================================
   INPUT (NO ANY TYPE)
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
    <div>
      <label className="text-xs font-bold text-slate-500">{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full mt-1 p-3 border rounded-xl bg-slate-50 dark:bg-slate-950"
      />
    </div>
  );
};

/* ================================
   SUCCESS UI
================================ */
const SuccessState = () => (
  <div className="text-center py-20 space-y-4">
    <CheckCircle2 className="text-green-500 mx-auto" size={50} />
    <h2 className="text-2xl font-bold">Land Submitted Successfully</h2>
    <p className="text-slate-500">
      Your land is now being verified by the registry.
    </p>
    <div className="text-blue-600 text-sm flex items-center justify-center gap-2">
      Redirecting <ArrowRight size={14} />
    </div>
  </div>
);

export default RegisterLand;