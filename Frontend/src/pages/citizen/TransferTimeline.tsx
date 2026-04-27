import React from "react";
import { CheckCircle2, Clock, Landmark, FileSearch } from "lucide-react";
import { format } from "date-fns";

// 1. Define the interface to match your data structure
interface TransferTimelineData {
  status: "pending" | "payment_pending" | "paid" | "completed" | string;
  createdAt: string | Date;
}

interface TimelineProps {
  transfer: TransferTimelineData; // 2. Swap 'any' for the new interface
}

const TransferTimeline: React.FC<TimelineProps> = ({ transfer }) => {
  // Helpful log to see state transitions in the browser console
  console.log(`[Timeline] Current transfer status: %c${transfer.status}`, "color: #4f46e5; font-weight: bold;");

  const steps = [
    { 
      label: "Initiated", 
      status: "completed", 
      date: transfer.createdAt 
    },
    { 
      label: "Officer Review", 
      status: ["pending"].includes(transfer.status) ? "current" : "completed",
      description: "Land Officer verifying documentation and LR authenticity."
    },
    { 
      label: "Payment", 
      status: transfer.status === "payment_pending" ? "current" : (["paid", "completed"].includes(transfer.status) ? "completed" : "pending"),
      description: "M-Pesa or Stripe settlement of statutory fees."
    },
    { 
      label: "Blockchain Minting", 
      status: transfer.status === "paid" ? "current" : (transfer.status === "completed" ? "completed" : "pending"),
      description: "Updating the distributed ledger and issuing new Digital Title."
    },
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
      <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
        <FileSearch className="text-indigo-600" size={24} />
        Transfer Progress
      </h2>

      <div className="relative space-y-8">
        {/* Timeline Vertical Line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-100" />

        {steps.map((step, idx) => (
          <div key={idx} className="relative pl-12">
            <div className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center border-4 border-white shadow-sm z-10 transition-all duration-500 ${
              step.status === 'completed' ? 'bg-green-500 text-white' : 
              step.status === 'current' ? 'bg-indigo-600 text-white ring-4 ring-indigo-100' : 'bg-slate-200 text-slate-400'
            }`}>
              {step.status === 'completed' ? <CheckCircle2 size={16} /> : <Clock size={16} />}
            </div>
            
            <div>
              <h3 className={`text-sm font-black uppercase tracking-wide ${step.status === 'pending' ? 'text-slate-400' : 'text-slate-900'}`}>
                {step.label}
              </h3>
              {step.date && (
                <p className="text-[10px] font-bold text-indigo-500 mt-0.5">
                  {format(new Date(step.date), "MMM dd, yyyy • HH:mm")}
                </p>
              )}
              <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-sm">
                {step.description || "The initial request has been logged in the system."}
              </p>
            </div>
          </div>
        ))}
      </div>

      {transfer.status === "completed" && (
        <div className="mt-12 p-6 bg-green-50 border border-green-100 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-green-600 shadow-sm">
            <Landmark size={24} />
          </div>
          <div>
            <h4 className="text-sm font-black text-green-900">Finalized on Blockchain</h4>
            <p className="text-[11px] text-green-700 font-medium">New ownership title has been successfully minted.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransferTimeline;