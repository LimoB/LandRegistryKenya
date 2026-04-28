import React from "react";
import { useNavigate } from "react-router-dom";
import { useGetPendingTransfersQuery, type TransferRequest } from "../../features/transfers/transferApi";
import { Clock, Eye, MapPin, CheckCircle2, AlertCircle } from "lucide-react";

const TransferApprovals: React.FC = () => {
  const navigate = useNavigate();

  const {
    data: pendingRequests = [],
    isLoading,
    isError,
    refetch,
  } = useGetPendingTransfersQuery(undefined, {
    pollingInterval: 5000, // 🔁 auto-refresh queue
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  /* ================= LOADING ================= */
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 font-bold animate-pulse">
          Syncing Pending Queue...
        </p>
      </div>
    );
  }

  /* ================= ERROR ================= */
  if (isError) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 text-center bg-white rounded-3xl border border-slate-100 shadow-xl">
        <div className="inline-flex p-4 bg-red-50 text-red-600 rounded-full mb-4">
          <AlertCircle size={32} />
        </div>

        <h2 className="text-xl font-bold text-slate-900">
          Connection Error
        </h2>

        <p className="text-slate-500 mt-2 text-sm">
          Failed to fetch the registry queue.
        </p>

        <button
          onClick={() => refetch()}
          className="mt-6 px-6 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold active:scale-95 transition-transform"
        >
          Retry
        </button>
      </div>
    );
  }

  /* ================= MAIN ================= */
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Pending Approvals
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Verify and authorize land transfers
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-100 rounded-2xl">
          <div className="p-1.5 bg-amber-500 text-white rounded-lg animate-pulse">
            <Clock size={14} />
          </div>
          <span className="text-xs font-black text-amber-700 uppercase tracking-wider">
            {pendingRequests.length} Pending
          </span>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-[0.15em]">
                <th className="px-8 py-5">Land</th>
                <th className="px-8 py-5">Parties</th>
                <th className="px-8 py-5">Date</th>
                <th className="px-8 py-5 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {pendingRequests.map((request: TransferRequest) => (
                <tr
                  key={request.id}
                  className="hover:bg-slate-50 transition group"
                >
                  {/* LAND */}
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition">
                        <MapPin size={20} />
                      </div>
                      <div>
                        <div className="font-black text-slate-900">
                          {request.land?.lrNumber || `#${request.landId}`}
                        </div>
                        <div className="text-[10px] text-slate-400 uppercase">
                          {request.land?.county || "Kenya"}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* PARTIES */}
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-700">
                        Seller: {request.seller?.fullName}
                      </p>
                      <p className="text-xs font-bold text-slate-700">
                        Buyer: {request.buyer?.fullName}
                      </p>
                    </div>
                  </td>

                  {/* DATE */}
                  <td className="px-8 py-6">
                    <p className="text-sm font-bold text-slate-600">
                      {new Date(request.createdAt).toLocaleDateString("en-KE", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </td>

                  {/* ACTION */}
                  <td className="px-8 py-6 text-right">
                    <button
                      onClick={() =>
                        navigate(`/officer/transfers/${request.id}`)
                      }
                      className="inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 transition active:scale-95"
                    >
                      <Eye size={14} />
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* EMPTY */}
        {pendingRequests.length === 0 && (
          <div className="py-24 text-center">
            <div className="inline-flex p-6 bg-slate-50 text-slate-200 rounded-full mb-4">
              <CheckCircle2 size={48} />
            </div>

            <h3 className="text-lg font-bold text-slate-900">
              No Pending Requests
            </h3>

            <p className="text-slate-400 text-sm mt-2">
              All transfers are processed.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransferApprovals;