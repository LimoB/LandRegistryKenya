import React, { useEffect, useState, useCallback } from "react";
import { 
  ShieldAlert, 
  UserX, 
  MapPin, 
  Zap, 
  ShieldCheck, 
  Filter,
  type LucideIcon
} from "lucide-react";

interface FraudAlert {
  id: string;
  severity: "high" | "medium" | "low";
  type: string;
  description: string;
  targetUser: string;
  timestamp: string;
  status: "flagged" | "resolved" | "dismissed";
}

interface FraudStatProps {
  icon: LucideIcon;
  label: string;
  value: string;
  trend: string;
  color: "red" | "amber" | "indigo";
}

const FraudMonitoring: React.FC = () => {
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      // Mocking the detection logic output
      const mockAlerts: FraudAlert[] = [
        {
          id: "1",
          severity: "high",
          type: "Rapid Transfer Attempt",
          description: "Wallet 0x55...331 attempted 5 transfers in 2 minutes for LR NBI/442.",
          targetUser: "John Doe (ID: 882)",
          timestamp: new Date().toISOString(),
          status: "flagged"
        },
        {
          id: "2",
          severity: "medium",
          type: "Unusual Login Location",
          description: "Login detected from unknown IP in Eastern Europe for Admin account.",
          targetUser: "Officer Sarah (ID: 102)",
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          status: "flagged"
        }
      ];
      setAlerts(mockAlerts);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_err) {
      console.error("Critical: Failed to fetch security alerts.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  return (
    <div className="p-6 max-w-7xl mx-auto animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <div className="p-2 bg-red-600 rounded-lg text-white shadow-lg shadow-red-200 dark:shadow-none">
              <ShieldAlert size={24} />
            </div>
            Fraud & Threat Intelligence
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Heuristic-based monitoring for suspicious land registry activity.
          </p>
        </div>

        <div className="flex gap-2">
          <button className="p-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-500">
            <Filter size={18} />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-indigo-600 text-white rounded-xl text-xs font-bold hover:opacity-90 transition-all">
            <Zap size={14} />
            Run Security Scan
          </button>
        </div>
      </div>

      {/* Risk Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <FraudStat icon={ShieldAlert} label="High Risk Alerts" value="02" trend="+1 since yesterday" color="red" />
        <FraudStat icon={UserX} label="Blacklisted IPs" value="14" trend="Constant" color="amber" />
        <FraudStat icon={ShieldCheck} label="System Integrity" value="99.9%" trend="Secure" color="indigo" />
      </div>

      {/* Main Alert Feed */}
      <div className="bg-white dark:bg-[#0F1420] rounded-2xl border border-slate-100 dark:border-white/5 shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
          <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Live Security Events</h2>
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
            LIVE MONITORING
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-white/5">
          {loading ? (
            <div className="p-12 text-center text-slate-400">Analyzing traffic patterns...</div>
          ) : (
            alerts.map((alert) => (
              <div key={alert.id} className="p-6 hover:bg-slate-50 dark:hover:bg-white/2 transition-colors flex gap-6">
                <div className={`mt-1 p-3 h-fit rounded-xl ${
                  alert.severity === 'high' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'
                }`}>
                  <ShieldAlert size={20} />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">{alert.type}</h3>
                    <span className="text-[10px] font-mono text-slate-400">{new Date(alert.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{alert.description}</p>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase">
                      <UserX size={12} />
                      {alert.targetUser}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase">
                      <MapPin size={12} />
                      External IP Trace
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button className="px-3 py-1.5 bg-slate-100 dark:bg-white/5 text-[10px] font-black rounded-lg text-slate-600 dark:text-slate-300 hover:bg-red-500 hover:text-white transition-all">
                    BLOCK USER
                  </button>
                  <button className="px-3 py-1.5 border border-slate-100 dark:border-white/10 text-[10px] font-black rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white">
                    DISMISS
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const FraudStat: React.FC<FraudStatProps> = ({ icon: Icon, label, value, trend, color }) => {
  const colorMap = {
    red: "bg-red-500/10 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.1)]",
    amber: "bg-amber-500/10 text-amber-500",
    indigo: "bg-indigo-500/10 text-indigo-500",
  };

  return (
    <div className="bg-white dark:bg-[#0F1420] p-6 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${colorMap[color]}`}>
          <Icon size={20} />
        </div>
        <span className={`text-[10px] font-black px-2 py-1 rounded-md ${
          color === 'red' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500'
        }`}>
          {trend}
        </span>
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mb-1">{label}</p>
        <p className="text-3xl font-black text-slate-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
};

export default FraudMonitoring;