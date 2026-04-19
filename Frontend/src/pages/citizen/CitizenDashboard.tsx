import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../app/hooks";
import { useGetLandsQuery } from "../../features/lands/landApi";

import {
  PlusCircle,
  Map as MapIcon,
  Clock,
  ChevronRight,
  ShieldCheck,
  Wallet,
  ArrowRightLeft,
} from "lucide-react";

type FilterType = "all" | "verified" | "pending";

const CitizenDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  const { data: lands = [], isLoading, isError } = useGetLandsQuery();

  const [filter, setFilter] = useState<FilterType>("all");

  /* ================= MY LANDS ================= */
  const myLands = useMemo(() => {
    if (!user) return [];

    return lands.filter((land) => {
      const isMine = land.ownerId === user.id;
      if (!isMine) return false;

      if (filter === "verified") return land.verificationStatus === "verified";
      if (filter === "pending") return land.verificationStatus === "pending";

      return true;
    });
  }, [lands, user, filter]);

  /* ================= STATS ================= */
  const stats = useMemo(() => {
    const verified = myLands.filter((l) => l.verificationStatus === "verified").length;
    const pending = myLands.filter((l) => l.verificationStatus === "pending").length;

    return {
      total: myLands.length,
      verified,
      pending,
    };
  }, [myLands]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">

      {/* HEADER */}
      <div className="border-b bg-white dark:bg-slate-900">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">

          {/* Greeting */}
          <div>
            <div className="flex items-center gap-2 text-xs text-blue-600 font-semibold">
              <ShieldCheck size={14} />
              System Online
            </div>

            <h1 className="text-2xl font-bold">
              Welcome,{" "}
              <span className="text-blue-600">
                {user?.fullName?.split(" ")[0] || "Citizen"}
              </span>
            </h1>

            <p className="text-xs text-slate-500">
              Manage your land records in one place
            </p>
          </div>

          {/* Action */}
          <button
            onClick={() => navigate("/citizen/register-land")}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:opacity-90"
          >
            <PlusCircle size={16} />
            Add Land
          </button>

        </div>
      </div>

      {/* CONTENT */}
      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">

        {/* STATS CARDS */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5">

          <StatCard
            label="My Lands"
            value={isLoading ? "..." : stats.total}
            icon={<MapIcon />}
            note={`${stats.verified} verified`}
          />

          <StatCard
            label="Pending Approval"
            value={isLoading ? "..." : stats.pending}
            icon={<Clock />}
            note="Waiting review"
          />

          <StatCard
            label="Wallet"
            value={
              user?.walletAddress
                ? `${user.walletAddress.slice(0, 6)}...`
                : "Not connected"
            }
            icon={<Wallet />}
            note="Blockchain ID"
          />

        </section>

        {/* FILTERS */}
        <div className="flex gap-2">
          {(["all", "verified", "pending"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
                filter === f
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              }`}
            >
              {f === "all"
                ? "All Lands"
                : f === "verified"
                ? "Verified"
                : "Pending"}
            </button>
          ))}
        </div>

        {/* TABLE / LIST */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border overflow-hidden">

          {isLoading ? (
            <div className="p-10 text-center text-slate-500">
              Loading your lands...
            </div>
          ) : isError ? (
            <div className="p-10 text-center text-red-500">
              Failed to load data
            </div>
          ) : myLands.length === 0 ? (
            <div className="p-10 text-center text-slate-500">
              No lands found. Add your first land.
            </div>
          ) : (
            <div className="divide-y">

              {myLands.map((land) => (
                <div
                  key={land.id}
                  className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >

                  {/* LEFT INFO */}
                  <div>
                    <p className="font-mono text-sm font-semibold">
                      {land.lrNumber}
                    </p>
                    <p className="text-xs text-slate-500">
                      {land.county} • {land.sizeInAcres} acres
                    </p>
                  </div>

                  {/* STATUS */}
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-semibold ${
                      land.verificationStatus === "verified"
                        ? "bg-green-100 text-green-700"
                        : land.verificationStatus === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {land.verificationStatus}
                  </span>

                  {/* ACTIONS */}
                  <div className="flex items-center gap-3">

                    {land.verificationStatus === "verified" && (
                      <button
                        onClick={() =>
                          navigate(`/citizen/transfer?landId=${land.id}`)
                        }
                        className="text-blue-600 text-xs flex items-center gap-1"
                      >
                        <ArrowRightLeft size={14} />
                        Transfer
                      </button>
                    )}

                    <button
                      onClick={() =>
                        navigate(`/citizen/land/${land.id}`)
                      }
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <ChevronRight size={18} />
                    </button>

                  </div>

                </div>
              ))}

            </div>
          )}

        </div>

      </main>
    </div>
  );
};

/* ================= STATS CARD ================= */
const StatCard = ({
  label,
  value,
  note,
  icon,
}: {
  label: string;
  value: string | number;
  note: string;
  icon: React.ReactNode;
}) => (
  <div className="p-5 bg-white dark:bg-slate-900 border rounded-xl flex items-center gap-4">

    <div className="text-blue-600">{icon}</div>

    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <h2 className="text-xl font-bold">{value}</h2>
      <p className="text-xs text-slate-400">{note}</p>
    </div>

  </div>
);

export default CitizenDashboard;