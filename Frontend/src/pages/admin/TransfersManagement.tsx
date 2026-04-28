import React, { useState } from "react";
import {
  useGetPendingTransfersQuery,
  useApproveTransferMutation,
  useRejectTransferMutation,
  useRetryBlockchainMutation,
  type TransferRequest,
} from "../../features/transfers/transferApi";

import {
//   ArrowRightLeft,
//   Search,
//   TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle2,
//   ArrowRight,
  Download,
//   Filter,
  XCircle,
  RefreshCw,
} from "lucide-react";

const TransfersManagement: React.FC = () => {
  const { data: transfers, isLoading } = useGetPendingTransfersQuery();

  const [approveTransfer] = useApproveTransferMutation();
  const [rejectTransfer] = useRejectTransferMutation();
  const [retryBlockchain] = useRetryBlockchainMutation();

  const [searchTerm, setSearchTerm] = useState("");

  /* ======================
     HANDLERS
  ====================== */

  const handleApprove = async (id: number) => {
    await approveTransfer(id);
  };

  const handleReject = async (id: number) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;

    await rejectTransfer({ id, reason });
  };

  const handleRetryBlockchain = async (id: number) => {
    await retryBlockchain(id);
  };

  /* ======================
     FILTER
  ====================== */
  const filteredTransfers =
    transfers?.filter((tx) =>
      tx.mpesaReceiptCode?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  /* ======================
     STATS
  ====================== */
  const totalVolume =
    transfers?.reduce(
      (acc, curr) => acc + Number(curr.land.priceInKsh || 0),
      0
    ) || 0;

  const pendingCount =
    transfers?.filter((t) => t.status === "pending").length || 0;

  /* ======================
     STATUS UI
  ====================== */
  const renderStatus = (tx: TransferRequest) => {
    if (tx.status === "completed") {
      return (
        <div className="flex items-center gap-1.5 text-emerald-500 font-black text-[9px] uppercase">
          <CheckCircle2 size={12} /> Completed
        </div>
      );
    }

    if (tx.status === "rejected") {
      return (
        <div className="flex items-center gap-1.5 text-red-500 font-black text-[9px] uppercase">
          <XCircle size={12} /> Rejected
        </div>
      );
    }

    return (
      <div className="flex items-center gap-1.5 text-amber-500 font-black text-[9px] uppercase">
        <Clock size={12} /> {tx.status}
      </div>
    );
  };

  /* ======================
     UI
  ====================== */

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-700">

      {/* METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-950 p-8 rounded-[2.5rem] border shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase">Total Volume</p>
          <p className="text-3xl font-black">KES {totalVolume.toLocaleString()}</p>
        </div>

        <div className="bg-white dark:bg-slate-950 p-8 rounded-[2.5rem] border shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase">Pending</p>
          <p className="text-3xl font-black text-blue-600">{pendingCount}</p>
        </div>

        <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white">
          <button className="flex justify-between w-full">
            Export CSV <Download size={18} />
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white dark:bg-slate-950 rounded-[2.5rem] overflow-hidden border">
        <div className="p-6 flex justify-between">
          <h2 className="font-black">Transfer Registry</h2>

          <input
            type="text"
            placeholder="Search M-Pesa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 rounded-xl bg-slate-100"
          />
        </div>

        <table className="w-full">
          <thead>
            <tr className="text-xs uppercase text-slate-400">
              <th className="p-4">ID</th>
              <th>Flow</th>
              <th>M-Pesa</th>
              <th>Land</th>
              <th>Status</th>
              <th className="text-right pr-6">Actions</th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="text-center p-10">
                  Loading...
                </td>
              </tr>
            ) : (
              filteredTransfers.map((tx) => (
                <tr key={tx.id} className="border-t">
                  <td className="p-4 font-black">#{tx.id}</td>

                  <td>
                    {tx.seller.fullName} → {tx.buyer.fullName}
                  </td>

                  <td className="font-mono text-xs">
                    {tx.mpesaReceiptCode || "-"}
                  </td>

                  <td>LR: {tx.land.lrNumber}</td>

                  <td>{renderStatus(tx)}</td>

                  <td className="text-right pr-6">
                    <div className="flex justify-end gap-2">

                      {/* APPROVE */}
                      {tx.status === "pending" && (
                        <button
                          onClick={() => handleApprove(tx.id)}
                          className="text-green-600"
                          title="Approve"
                        >
                          <CheckCircle2 size={18} />
                        </button>
                      )}

                      {/* REJECT */}
                      {tx.status === "pending" && (
                        <button
                          onClick={() => handleReject(tx.id)}
                          className="text-red-500"
                          title="Reject"
                        >
                          <XCircle size={18} />
                        </button>
                      )}

                      {/* RETRY BLOCKCHAIN */}
                      {tx.blockchainStatus === "failed" && (
                        <button
                          onClick={() => handleRetryBlockchain(tx.id)}
                          className="text-blue-600"
                          title="Retry Blockchain"
                        >
                          <RefreshCw size={18} />
                        </button>
                      )}

                      {/* VIEW ONLY */}
                      <button title="View">
                        <AlertCircle size={18} />
                      </button>

                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransfersManagement;