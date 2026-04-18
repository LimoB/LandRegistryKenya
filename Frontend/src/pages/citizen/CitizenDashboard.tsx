import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../app/hooks";
import { useGetLandsQuery, type Land } from "../../features/lands/landApi";
import {
  PlusCircle,
  Map as MapIcon,
  Clock,
  ChevronRight,
  ShieldCheck,
  Wallet,
  ArrowRightLeft,
} from "lucide-react";

const CitizenDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  const { data: allLands, isLoading, isError } = useGetLandsQuery();

  const [filter, setFilter] = useState<"all" | "verified" | "pending">("all");

  const myLands = useMemo(() => {
    if (!allLands || !user) return [];

    let filtered = allLands.filter((land) => land.ownerId === user.id);

    if (filter === "verified") {
      filtered = filtered.filter((l) => l.verificationStatus === "verified");
    } else if (filter === "pending") {
      filtered = filtered.filter((l) => l.verificationStatus === "pending");
    }

    return filtered;
  }, [allLands, user, filter]);

  const verifiedCount = myLands.filter(
    (l) => l.verificationStatus === "verified"
  ).length;

  const pendingCount = myLands.filter(
    (l) => l.verificationStatus === "pending"
  ).length;

  return (
    <div className="flex-1 min-h-screen bg-white dark:bg-slate-950">
      {/* HEADER */}
      <div className="px-8 py-8 border-b">
        <div className="flex justify-between items-center max-w-[1400px] mx-auto">
          <div>
            <div className="flex items-center gap-2 text-xs text-blue-600 font-bold">
              <ShieldCheck size={14} />
              Node Active
            </div>
            <h1 className="text-3xl font-black">
              Welcome,{" "}
              <span className="text-blue-600">
                {user?.fullName?.split(" ")[0]}
              </span>
            </h1>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => navigate("/citizen/register-land")}
              className="bg-blue-600 text-white px-5 py-2 rounded-xl flex items-center gap-2"
            >
              <PlusCircle size={16} /> Register
            </button>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <main className="max-w-[1400px] mx-auto px-8 py-10 space-y-10">
        {/* STATS */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatItem
            label="Total Lands"
            value={isLoading ? "--" : String(myLands.length)}
            sub={`${verifiedCount} verified`}
            icon={<MapIcon />}
          />
          <StatItem
            label="Pending"
            value={isLoading ? "--" : String(pendingCount)}
            sub="Awaiting approval"
            icon={<Clock />}
          />
          <StatItem
            label="Wallet"
            value={
              user?.walletAddress
                ? `${user.walletAddress.slice(0, 4)}...`
                : "None"
            }
            sub="Connected"
            icon={<Wallet />}
          />
        </section>

        {/* FILTER */}
        <div className="flex gap-3">
          {(["all", "verified", "pending"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-xs font-bold ${
                  filter === f
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800"
                }`}
              >
                {f.toUpperCase()}
              </button>
            ))}
        </div>

        {/* TABLE */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border">
          <table className="w-full">
            <thead className="text-xs text-slate-400">
              <tr>
                <th className="p-4">LR Number</th>
                <th>Location</th>
                <th>Size</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center p-10">
                    Loading...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={5} className="text-center p-10 text-red-500">
                    Failed to load data
                  </td>
                </tr>
              ) : myLands.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center p-10">
                    No lands found
                  </td>
                </tr>
              ) : (
                myLands.map((land) => (
                  <LandRow key={land.id} land={land} navigate={navigate} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

/* ================= COMPONENTS ================= */

const StatItem = ({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
}) => (
  <div className="p-6 border rounded-xl flex gap-4 items-center">
    {icon}
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <h2 className="text-xl font-bold">{value}</h2>
      <p className="text-xs">{sub}</p>
    </div>
  </div>
);

const LandRow = ({
  land,
  navigate,
}: {
  land: Land;
  navigate: ReturnType<typeof useNavigate>;
}) => {
  const isVerified = land.verificationStatus === "verified";

  return (
    <tr className="border-t hover:bg-slate-50 dark:hover:bg-slate-800">
      <td className="p-4 font-mono">{land.lrNumber}</td>
      <td>{land.county}</td>
      <td>{land.sizeInAcres}</td>

      <td>
        <span
          className={`px-2 py-1 rounded text-xs ${
            isVerified ? "bg-green-100 text-green-600" : "bg-yellow-100"
          }`}
        >
          {land.verificationStatus}
        </span>
      </td>

      <td className="flex gap-2 p-3">
        {isVerified && (
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

        <button className="text-slate-400">
          <ChevronRight size={16} />
        </button>
      </td>
    </tr>
  );
};

export default CitizenDashboard;