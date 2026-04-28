import React, { useMemo, useState, useEffect } from "react";
import { useGetAllPaymentsQuery, type Payment } from "../features/payment/paymentApi";
import { useAppSelector } from "../app/hooks";
import PaymentStatusBadge from "../components/PaymentStatusBadge";
import {
  CreditCard,
  Search,
  Filter,
  Download,
  ExternalLink,
  History,
  ShieldCheck,
  User
} from "lucide-react";

/* ================= EXTENDED TYPE ================= */
interface TransferRequestWithOwner {
  id: number;
  status?: string;

  // ✅ FIXED: correct ownership fields
  buyerId?: number;
  sellerId?: number;

  // ✅ FIXED: nested land object
  land?: {
    lrNumber?: string;
  };
}

interface PaymentWithOwner extends Payment {
  transferRequest?: TransferRequestWithOwner;
}

const Payments: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);

  const {
    data: payments = [],
    isLoading,
    error,
    refetch,
  } = useGetAllPaymentsQuery();

  const [search, setSearch] = useState("");

  /* ================= DEBUG ================= */
  useEffect(() => {
    console.log("🔐 Current User:", user);
  }, [user]);

  useEffect(() => {
    console.log("💰 Raw Payments from API:", payments);
  }, [payments]);

  useEffect(() => {
    if (error) console.error("❌ API ERROR:", error);
  }, [error]);

  /* ================= FILTER ================= */
  const filteredPayments = useMemo(() => {
    if (!user) {
      console.warn("⚠️ No user found");
      return [];
    }

    let result: PaymentWithOwner[] = payments as PaymentWithOwner[];

    console.log("📊 Starting filter with:", result.length);

    /* 🔐 ROLE FILTER */
    if (user.role === "citizen") {
      result = result.filter((p) => {
        const tr = p.transferRequest;

        const match =
          tr?.buyerId === user.id ||
          tr?.sellerId === user.id;

        if (!match) {
          console.log("🚫 Filtered OUT (citizen):", p.id, tr);
        } else {
          console.log("✅ INCLUDED (citizen):", p.id);
        }

        return match;
      });

      console.log("👤 Citizen filtered payments:", result.length);
    }

    if (user.role === "land_officer") {
      console.log("🏢 Land officer sees all payments");
    }

    if (user.role === "admin") {
      console.log("🛡️ Admin sees all payments");
    }

    /* 🔍 SEARCH */
    if (search.trim()) {
      const term = search.toLowerCase();
      console.log("🔎 Searching for:", term);

      result = result.filter((p) => {
        const match =
          p.transferRequest?.land?.lrNumber?.toLowerCase().includes(term) || // ✅ FIXED
          p.mpesaReceiptCode?.toLowerCase().includes(term) ||
          p.stripePaymentIntentId?.toLowerCase().includes(term) ||
          String(p.id).includes(term);

        if (!match) {
          console.log("❌ Search filtered OUT:", p.id);
        }

        return match;
      });

      console.log("🔍 After search:", result.length);
    }

    console.log("✅ Final filtered payments:", result.length);
    return result;
  }, [payments, user, search]);

  /* ================= LOADING ================= */
  if (isLoading) {
    console.log("⏳ Loading payments...");
    return (
      <div className="flex flex-col items-center py-20">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 mt-3">
          Syncing payment ledger...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border shadow-sm">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2">
            <CreditCard className="text-indigo-600" />
            Financial Ledger
          </h1>

          <p className="text-sm text-slate-500">
            {user?.role === "admin" && "System-wide financial overview"}
            {user?.role === "land_officer" && "Registry payment monitoring"}
            {user?.role === "citizen" && "Your payment history"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              console.log("🔄 Manual refetch triggered");
              refetch();
            }}
            className="p-2 border rounded-xl hover:bg-slate-50"
          >
            <History size={18} />
          </button>

          <button
            onClick={() => console.log("📤 Export clicked")}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold"
          >
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      {/* ADMIN STATS */}
      {user?.role === "admin" && (
        <div className="grid md:grid-cols-3 gap-4">
          <StatCard
            label="Total Revenue"
            value={`KES ${payments
              .filter((p) => p.paymentStatus === "completed")
              .reduce((acc, p) => acc + Number(p.amount), 0)
              .toLocaleString()}`}
          />
          <StatCard
            label="Pending"
            value={payments.filter((p) => p.paymentStatus === "pending").length}
          />
          <StatCard
            label="Completed"
            value={payments.filter((p) => p.paymentStatus === "completed").length}
          />
        </div>
      )}

      {/* SEARCH */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search transaction, LR number, receipt..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border rounded-xl"
          />
        </div>

        <button className="px-3 py-2 border rounded-lg text-xs flex items-center gap-1">
          <Filter size={14} /> Filter
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-[10px] uppercase text-slate-400">
            <tr>
              <th className="p-4">Transaction</th>
              <th className="p-4">Land</th>
              <th className="p-4">Method</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {filteredPayments.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="p-4 text-xs font-mono">
                  {p.mpesaReceiptCode ||
                    p.stripePaymentIntentId?.slice(-8) ||
                    `TR-${p.id}`}
                </td>

                {/* ✅ FIXED LR NUMBER */}
                <td className="p-4 text-xs">
                  {p.transferRequest?.land?.lrNumber || "N/A"}
                </td>

                <td className="p-4 text-xs capitalize flex items-center gap-1">
                  {p.paymentMethod === "stripe" ? <ShieldCheck size={14} /> : <User size={14} />}
                  {p.paymentMethod}
                </td>

                <td className="p-4 font-bold text-sm">
                  KES {Number(p.amount).toLocaleString()}
                </td>

                <td className="p-4">
                  <PaymentStatusBadge status={p.paymentStatus} />
                </td>

                <td className="p-4 text-right">
                  <button className="p-2 hover:text-indigo-600">
                    <ExternalLink size={16} />
                  </button>
                </td>
              </tr>
            ))}

            {filteredPayments.length === 0 && (
              <tr>
                <td colSpan={6} className="p-20 text-center text-slate-400">
                  No payments found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ================= STAT CARD ================= */
const StatCard = ({ label, value }: { label: string; value: string | number }) => (
  <div className="p-4 border rounded-xl bg-white dark:bg-slate-900">
    <p className="text-xs text-slate-400 uppercase">{label}</p>
    <p className="text-xl font-black">{value}</p>
  </div>
);

export default Payments;