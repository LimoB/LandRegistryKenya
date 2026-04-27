import React from "react";
import { useNavigate } from "react-router-dom";
import { useGetPendingTransfersQuery } from "../../features/transfers/transferApi";
import { Clock, Eye, MapPin, CheckCircle2, AlertCircle } from "lucide-react";

/**
 * 1. Define strict interfaces to resolve TS(2339) and ESLint any warnings
 */
interface LandAsset {
  lrNumber: string;
  landType?: string;
}

interface UserParty {
  fullName: string;
}

interface TransferRequest {
  id: number;
  createdAt: string;
  land: LandAsset;
  seller: UserParty;
  buyer: UserParty;
}

// This matches your backend response: { success: boolean, data: [] }
interface PendingTransfersResponse {
  success: boolean;
  data: TransferRequest[];
  count?: number;
}

const TransferApprovals: React.FC = () => {
  const navigate = useNavigate();
  
  // 2. Cast the hook result to our response interface
  const { data, isLoading, isError, refetch } = useGetPendingTransfersQuery() as {
    data: PendingTransfersResponse | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };

  // Extract the array safely
  const pendingRequests = data?.data || [];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 font-bold animate-pulse">Syncing Pending Queue...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 text-center bg-white rounded-3xl border border-slate-100 shadow-xl">
        <div className="inline-flex p-4 bg-red-50 text-red-600 rounded-full mb-4">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Connection Error</h2>
        <p className="text-slate-500 mt-2 text-sm">Failed to fetch the land registry queue. Please check your credentials.</p>
        <button 
          onClick={() => refetch()} 
          className="mt-6 px-6 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold active:scale-95 transition-transform"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Pending Approvals</h1>
          <p className="text-sm text-slate-500 font-medium">Verify and authorize incoming land title transfer requests</p>
        </div>
        
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-100 rounded-2xl">
          <div className="p-1.5 bg-amber-500 text-white rounded-lg animate-pulse">
            <Clock size={14} />
          </div>
          <span className="text-xs font-black text-amber-700 uppercase tracking-wider">
            {pendingRequests.length} Requests Awaiting Verification
          </span>
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-[0.15em]">
                <th className="px-8 py-5">Land Reference</th>
                <th className="px-8 py-5">Transfer Parties</th>
                <th className="px-8 py-5">Submission Date</th>
                <th className="px-8 py-5 text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pendingRequests.map((request: TransferRequest) => (
                <tr key={request.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                        <MapPin size={20} />
                      </div>
                      <div>
                        <div className="font-black text-slate-900 tracking-tight">{request.land.lrNumber}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {request.land.landType || "Agricultural"}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-8 py-6">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black text-slate-300 uppercase w-10 text-right">Seller</span>
                        <span className="text-xs font-bold text-slate-700">{request.seller.fullName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black text-slate-300 uppercase w-10 text-right">Buyer</span>
                        <span className="text-xs font-bold text-slate-700">{request.buyer.fullName}</span>
                      </div>
                    </div>
                  </td>

                  <td className="px-8 py-6">
                    <div className="text-sm font-bold text-slate-600 italic">
                      {new Date(request.createdAt).toLocaleDateString('en-KE', { 
                        day: '2-digit', 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </div>
                  </td>

                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={() => navigate(`/officer/transfers/${request.id}`)}
                      className="inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-100 transition-all active:scale-95"
                    >
                      <Eye size={14} /> Review Request
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* EMPTY STATE */}
        {pendingRequests.length === 0 && (
          <div className="py-24 text-center bg-white">
            <div className="inline-flex p-6 bg-slate-50 text-slate-200 rounded-full mb-4">
              <CheckCircle2 size={48} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Registry is Clear</h3>
            <p className="text-slate-400 text-sm max-w-xs mx-auto mt-2">
              All land transfer requests have been processed. New submissions will appear here automatically.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransferApprovals;