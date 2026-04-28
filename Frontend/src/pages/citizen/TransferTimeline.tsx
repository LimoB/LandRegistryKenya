import React, { useMemo } from "react";
import {
  CheckCircle2,
  Clock,
  Landmark,
  FileSearch,
  XCircle,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";

/* ================= TYPES ================= */
interface TransferTimelineData {
  status:
    | "pending"
    | "payment_pending"
    | "paid"
    | "completed"
    | "rejected"
    | string;

  blockchainStatus?:
    | "pending"
    | "processing"
    | "submitted"
    | "confirmed"
    | "failed"
    | string;

  createdAt: string | Date;
}

interface TimelineProps {
  transfer: TransferTimelineData;
}

/* ================= COMPONENT ================= */
const TransferTimeline: React.FC<TimelineProps> = ({ transfer }) => {
  /* =========================================================
     🔍 DEBUG: FULL STATE SNAPSHOT
  ========================================================= */
  console.groupCollapsed(
    `%c[Timeline] Transfer Debug`,
    "color:#4f46e5;font-weight:bold;"
  );

  console.log("Status:", transfer.status);
  console.log("Blockchain Status:", transfer.blockchainStatus);
  console.log("Created At:", transfer.createdAt);

  console.groupEnd();

  /* =========================================================
     🔥 COMPUTE STEPS (MEMOIZED)
  ========================================================= */
  const steps = useMemo(() => {
    /* =========================================================
       🔥 STEP ENGINE (WITH TRACE LOGS)
    ========================================================= */
    const getStepStatus = (
      step: "review" | "payment" | "blockchain"
    ): "completed" | "current" | "pending" | "failed" => {
      const { status, blockchainStatus } = transfer;

      let result: "completed" | "current" | "pending" | "failed" =
        "pending";

      switch (step) {
        case "review":
          if (status === "pending") result = "current";
          else if (
            ["payment_pending", "paid", "completed"].includes(status)
          )
            result = "completed";
          break;

        case "payment":
          if (status === "payment_pending") result = "current";
          else if (["paid", "completed"].includes(status))
            result = "completed";
          break;

        case "blockchain":
          // ❌ FAILURE FIRST
          if (blockchainStatus === "failed") {
            result = "failed";
            break;
          }

          // ⏳ ACTIVE STATES
          if (
            blockchainStatus === "pending" ||
            blockchainStatus === "processing" ||
            blockchainStatus === "submitted" ||
            (status === "paid" && !blockchainStatus)
          ) {
            result = "current";
            break;
          }

          // ✅ DONE
          if (
            blockchainStatus === "confirmed" ||
            status === "completed"
          ) {
            result = "completed";
            break;
          }

          break;
      }

      console.log(
        `%c[Step Engine] ${step.toUpperCase()} → ${result}`,
        "color:#0ea5e9;font-weight:bold;"
      );

      return result;
    };

    const computed = [
      {
        key: "init",
        label: "Request Initiated",
        status: "completed",
        date: transfer.createdAt,
        description: "Buyer submitted transfer request.",
      },
      {
        key: "review",
        label: "Officer Review",
        status: getStepStatus("review"),
        description:
          "Land officer verifies ownership, documents, and registry integrity.",
      },
      {
        key: "payment",
        label: "Payment",
        status: getStepStatus("payment"),
        description:
          "Buyer completes payment via M-Pesa or Stripe.",
      },
      {
        key: "blockchain",
        label: "Blockchain Transfer",
        status: getStepStatus("blockchain"),
        description:
          "System executes smart contract and updates ownership.",
      },
    ];

    console.table(
      computed.map((s) => ({
        step: s.key,
        status: s.status,
      }))
    );

    return computed;
  }, [transfer]);

  /* =========================================================
     🎨 UI HELPERS
  ========================================================= */
  const renderIcon = (status: string) => {
    if (status === "completed") return <CheckCircle2 size={16} />;
    if (status === "current")
      return <Loader2 size={16} className="animate-spin" />;
    if (status === "failed") return <XCircle size={16} />;
    return <Clock size={16} />;
  };

  const getColor = (status: string) => {
    if (status === "completed") return "bg-green-500 text-white";
    if (status === "current")
      return "bg-indigo-600 text-white ring-4 ring-indigo-100";
    if (status === "failed")
      return "bg-red-500 text-white ring-4 ring-red-100";
    return "bg-slate-200 text-slate-400";
  };

  /* =========================================================
     ❌ REJECTED STATE
  ========================================================= */
  if (transfer.status === "rejected") {
    console.warn("[Timeline] Transfer rejected");

    return (
      <div className="bg-white rounded-3xl border border-red-100 p-8 shadow-sm">
        <h2 className="text-xl font-black text-red-700 mb-6 flex items-center gap-3">
          <XCircle size={22} />
          Transfer Rejected
        </h2>

        <div className="p-6 bg-red-50 border border-red-100 rounded-2xl">
          <p className="text-sm font-bold text-red-800">
            This transfer request was rejected by the land officer.
          </p>
        </div>
      </div>
    );
  }

  /* =========================================================
     🟢 MAIN UI
  ========================================================= */
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
      <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
        <FileSearch className="text-indigo-600" size={24} />
        Transfer Progress
      </h2>

      <div className="relative space-y-10">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-100" />

        {steps.map((step) => (
          <div key={step.key} className="relative pl-12">
            <div
              className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center border-4 border-white shadow-sm z-10 transition-all duration-500 ${getColor(
                step.status
              )}`}
            >
              {renderIcon(step.status)}
            </div>

            <div>
              <h3
                className={`text-sm font-black uppercase tracking-wide ${
                  step.status === "pending"
                    ? "text-slate-400"
                    : "text-slate-900"
                }`}
              >
                {step.label}
              </h3>

              {step.date && (
                <p className="text-[10px] font-bold text-indigo-500 mt-0.5">
                  {format(new Date(step.date), "MMM dd, yyyy • HH:mm")}
                </p>
              )}

              <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-sm">
                {step.description}
              </p>

              {/* 🔥 FAILURE MESSAGE */}
              {step.key === "blockchain" &&
                transfer.blockchainStatus === "failed" && (
                  <p className="text-xs text-red-600 mt-2 font-semibold">
                    Blockchain transfer failed. Retry will re-submit transaction.
                  </p>
                )}
            </div>
          </div>
        ))}
      </div>

      {/* =========================================================
         ✅ COMPLETED
      ========================================================= */}
      {(transfer.status === "completed" ||
        transfer.blockchainStatus === "confirmed") && (
        <div className="mt-12 p-6 bg-green-50 border border-green-100 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-green-600 shadow-sm">
            <Landmark size={24} />
          </div>
          <div>
            <h4 className="text-sm font-black text-green-900">
              Ownership Updated
            </h4>
            <p className="text-[11px] text-green-700 font-medium">
              Blockchain transaction confirmed. New digital title issued.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransferTimeline;