import React, { useState } from "react";
import {
  useGetLandsQuery,
  useVerifyLandMutation,
} from "../../features/lands/landApi";

import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  Filter,
  Layers,
} from "lucide-react";

const LandsManagement: React.FC = () => {
  const { data: lands, isLoading } = useGetLandsQuery();
  const [verifyLand] = useVerifyLandMutation();

  const [searchTerm, setSearchTerm] = useState("");

  /* ======================
     HANDLERS
  ====================== */

  const handleFlag = async (id: number) => {
    if (
      window.confirm(
        "Flag this land for investigation? This will suspend transfers."
      )
    ) {
      try {
        await verifyLand(id).unwrap(); // ✅ FIXED
      } catch (err) {
        console.error("Failed to flag asset:", err);
      }
    }
  };

  /* ======================
     FILTER
  ====================== */

  const filteredLands = lands?.filter(
    (l) =>
      l.lrNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.county.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /* ======================
     UI
  ====================== */

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex justify-between border-b pb-6">
        <h1 className="text-2xl font-black flex gap-2 items-center">
          <Layers className="text-blue-600" /> Asset Management
        </h1>

        <div className="flex gap-2">
          <input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 rounded-xl bg-slate-100"
          />
          <button>
            <Filter size={18} />
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white dark:bg-slate-950 rounded-2xl border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-xs uppercase text-slate-400">
              <th className="p-4">LR Number</th>
              <th>Size</th>
              <th>Owner</th>
              <th>Status</th>
              <th className="text-right pr-6">Actions</th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="text-center p-10">
                  Loading...
                </td>
              </tr>
            ) : (
              filteredLands?.map((land) => (
                <tr key={land.id} className="border-t">
                  <td className="p-4 font-black">{land.lrNumber}</td>

                  <td>{land.sizeInAcres} Acres</td>

                  <td>USR_{land.ownerId}</td>

                  <td>
                    <div className="flex items-center gap-2">
                      {land.verificationStatus === "verified" ? (
                        <>
                          <CheckCircle
                            size={14}
                            className="text-emerald-500"
                          />
                          <span className="text-emerald-600 text-xs font-bold">
                            Verified
                          </span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle
                            size={14}
                            className="text-amber-500"
                          />
                          <span className="text-amber-600 text-xs font-bold">
                            Pending
                          </span>
                        </>
                      )}
                    </div>
                  </td>

                  {/* ACTIONS */}
                  <td className="text-right pr-6">
                    <button
                      onClick={() => handleFlag(land.id)}
                      className="text-amber-600 hover:text-amber-700"
                      title="Flag Land"
                    >
                      <ShieldAlert size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* FOOTER */}
      <div className="bg-amber-100 p-4 rounded-xl text-xs">
        ⚠️ All actions are logged permanently. Flagging disables transfers.
      </div>
    </div>
  );
};

export default LandsManagement;