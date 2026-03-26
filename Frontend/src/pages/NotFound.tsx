import React from "react";
import { useNavigate } from "react-router-dom";
import { FileQuestion, ArrowLeft, Home } from "lucide-react";
import Button from "../components/Button";

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      {/* Visual Illustration */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-blue-100 rounded-full blur-3xl opacity-50 scale-150 animate-pulse"></div>
        <div className="relative bg-white p-8 rounded-3xl shadow-xl shadow-slate-200 border border-slate-100">
          <FileQuestion size={80} className="text-blue-600 animate-bounce" />
        </div>
      </div>

      {/* Text Content */}
      <h1 className="text-6xl font-black text-slate-900 mb-2 tracking-tighter">404</h1>
      <h2 className="text-2xl font-bold text-slate-800 mb-4">Parcel Not Found</h2>
      <p className="text-slate-500 max-w-md mb-10 leading-relaxed">
        The page or land record you are looking for doesn't exist or has been 
        moved to a different section of the registry.
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
        <Button 
          variant="outline" 
          onClick={() => navigate(-1)} 
          className="flex-1 gap-2"
        >
          <ArrowLeft size={18} />
          Go Back
        </Button>
        <Button 
          onClick={() => navigate("/")} 
          className="flex-1 gap-2"
        >
          <Home size={18} />
          Dashboard
        </Button>
      </div>

      {/* Footer Info */}
      <div className="mt-16 pt-8 border-t border-slate-200 w-full max-w-xs">
        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">
          Ministry of Lands • Digital Registry
        </p>
      </div>
    </div>
  );
};

export default NotFound;