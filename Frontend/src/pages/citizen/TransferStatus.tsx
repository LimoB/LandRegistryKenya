import React, { useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetTransferByIdQuery } from "../../features/transfers/transferApi";
import { ShieldAlert, ArrowLeft } from "lucide-react";

import TransferTimeline from "./TransferTimeline";
import TransferSidebar from "./TransferSidebar";

const TransferStatus: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const transferId = Number(id);

  /* =========================================================
     QUERY
  ========================================================= */
  const {
    data: transfer,
    isLoading,
    isError,
    refetch,
  } = useGetTransferByIdQuery(transferId, {
    skip: !transferId || isNaN(transferId),
    pollingInterval: 0,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  /* =========================================================
     POLLING DECISION (FIXED)
  ========================================================= */
  const shouldPoll = useMemo(() => {
    if (!transfer) {
      console.log("[Polling] No transfer yet → polling ON");
      return true;
    }

    console.log("[Polling Check]", {
      status: transfer.status,
      blockchainStatus: transfer.blockchainStatus,
    });

    // STOP only when truly finished
    if (transfer.status === "completed") {
      console.log("[Polling] STOP → transfer completed");
      return false;
    }

    if (transfer.status === "rejected") {
      console.log("[Polling] STOP → transfer rejected");
      return false;
    }

    // KEEP polling in ALL other states (including failed)
    console.log("[Polling] CONTINUE");
    return true;

  }, [transfer]);

  /* =========================================================
     MANUAL POLLING LOOP
  ========================================================= */
  useEffect(() => {
    if (!shouldPoll) return;

    console.log("[Polling] Interval started");

    const interval = setInterval(() => {
      console.log("[Polling] Refetch triggered");
      refetch();
    }, 5000);

    return () => {
      console.log("[Polling] Interval cleared");
      clearInterval(interval);
    };
  }, [shouldPoll, refetch]);

  /* =========================================================
     DEBUG LOGS
  ========================================================= */
  useEffect(() => {
    if (id) {
      console.log(
        `%c [Registry] %c Tracking Transfer ID: ${id}`,
        "background: #4f46e5; color: white; padding:2px 6px; border-radius:4px;",
        "color: #4f46e5; font-weight: bold;"
      );
    }
  }, [id]);

  /* =========================================================
     STRIPE RETURN
  ========================================================= */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");

    if (sessionId) {
      console.log("[Stripe] Returned with session:", sessionId);
      refetch();
    }
  }, [refetch]);

  /* =========================================================
     WATCH STATE CHANGES (CRITICAL DEBUG)
  ========================================================= */
  useEffect(() => {
    if (!transfer) return;

    console.log("[Transfer Update]", {
      id: transfer.id,
      status: transfer.status,
      blockchainStatus: transfer.blockchainStatus,
      txHash: transfer.blockchainTxHash,
    });

    if (transfer.blockchainStatus === "failed") {
      console.warn("[UI] Blockchain FAILED → user can retry");
    }

    if (transfer.blockchainStatus === "submitted") {
      console.log("[UI] Blockchain TX submitted, waiting for confirmation...");
    }

    if (transfer.status === "completed") {
      console.log("[UI] Transfer FULLY COMPLETED");
    }

  }, [transfer]);

  /* =========================================================
     LOADING
  ========================================================= */
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 font-medium animate-pulse">
          Syncing Transfer Registry...
        </p>
      </div>
    );
  }

  /* =========================================================
     ERROR
  ========================================================= */
  if (isError || !transfer) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 text-center bg-white rounded-3xl border border-slate-100 shadow-xl">
        <div className="inline-flex p-4 bg-red-50 text-red-600 rounded-full mb-4">
          <ShieldAlert size={32} />
        </div>

        <h2 className="text-xl font-bold text-slate-900">
          Transfer Not Found
        </h2>

        <p className="text-slate-500 mt-2 text-sm">
          Record might be archived or ID is invalid.
        </p>

        <button
          onClick={() => navigate(-1)}
          className="mt-6 px-6 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold active:scale-95 transition-transform"
        >
          Go Back
        </button>
      </div>
    );
  }

  /* =========================================================
     UI
  ========================================================= */
  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <div className="p-2 bg-white rounded-lg border border-slate-200 group-hover:border-indigo-200 transition-all">
            <ArrowLeft size={16} />
          </div>
          <span className="text-sm font-bold uppercase tracking-wider">
            Back
          </span>
        </button>

        <div className="flex items-center gap-2 px-4 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full">
          <div className="w-2 h-2 bg-indigo-600 rounded-full animate-ping" />
          <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">
            Live Registry
          </span>
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="lg:col-span-2">
          <TransferTimeline transfer={transfer} />
        </div>

        <div>
          <TransferSidebar transfer={transfer} />
        </div>

      </div>
    </div>
  );
};

export default TransferStatus;