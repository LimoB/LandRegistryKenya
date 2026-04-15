import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useVerifyEmailQuery } from "../features/auth/authApi";
import { ShieldCheck, Loader2, ArrowRight, CheckCircle, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

interface ApiError {
  data?: { message?: string; error?: string };
}

const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const { data, isLoading, isError, error } = useVerifyEmailQuery(token || "", { skip: !token });

  useEffect(() => {
    if (data) toast.success("Identity Verified!");
  }, [data]);

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-white rounded-[3rem] p-12 shadow-2xl border border-slate-100 text-center space-y-8">
        <div className="inline-flex p-5 bg-blue-50 rounded-[2rem] text-blue-600">
          <ShieldCheck size={40} />
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Loader2 className="mx-auto animate-spin text-blue-600" size={40} />
            <h2 className="text-2xl font-bold text-slate-900">Verifying Identity...</h2>
          </div>
        ) : isError ? (
          <div className="space-y-6">
            <div className="flex justify-center text-red-500"><AlertCircle size={60} /></div>
            <h2 className="text-2xl font-bold text-slate-900">Verification Failed</h2>
            <p className="text-slate-500 text-sm">
              {(error as ApiError).data?.message || (error as ApiError).data?.error || "Link expired."}
            </p>
            <button onClick={() => navigate("/login")} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold">Back to Sign In</button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-center text-green-500"><CheckCircle size={60} /></div>
            <h2 className="text-2xl font-bold text-slate-900">Success!</h2>
            <p className="text-slate-500 text-sm">Identity verified. Access to the National Land Registry is now active.</p>
            <button onClick={() => navigate("/login")} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2">
              Proceed to Login <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;