import { useState, useEffect } from "react";
import api from "../api/api";
import AppNavbar from "../components/AppNavbar";
import Footer from "../components/Footer";
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Filter,
  User,
  Calendar,
  Clock,
  RefreshCw,
} from "lucide-react";

export default function AdminFraudConsole() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterLevel, setFilterLevel] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchIncidents();
  }, [filterLevel]);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/fraud/alerts${filterLevel ? `?riskLevel=${filterLevel}` : ""}`);
      if (res.data.success) {
        setIncidents(res.data.incidents);
      }
    } catch (err) {
      console.error("Error fetching fraud alerts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (incidentId, status) => {
    try {
      setActionLoading(incidentId);
      await api.post("/fraud/resolve", { incidentId, status });
      fetchIncidents();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to resolve incident.");
    } finally {
      setActionLoading(null);
    }
  };

  const getRiskBadge = (level) => {
    switch (level) {
      case "HIGH":
        return "bg-red-500/10 text-red-600 border-red-500/30";
      case "MEDIUM":
        return "bg-amber-500/10 text-amber-600 border-amber-500/30";
      default:
        return "bg-blue-500/10 text-blue-600 border-blue-500/30";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      <AppNavbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-extrabold uppercase tracking-wider text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-100 flex items-center gap-1.5">
                <ShieldAlert size={14} /> Security Intelligence
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Attendance Risk & Fraud Monitor
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              Anomaly detection logs highlighting QR replay attacks, impossible check-in timing, and rapid failed scans.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="bg-white border border-slate-200 text-xs font-bold px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Risk Levels</option>
              <option value="HIGH">High Risk</option>
              <option value="MEDIUM">Medium Risk</option>
              <option value="LOW">Low Risk</option>
            </select>

            <button
              onClick={fetchIncidents}
              className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 text-slate-600 transition"
            >
              <RefreshCw size={15} />
            </button>
          </div>
        </div>

        {/* INCIDENTS TABLE */}
        {loading ? (
          <div className="text-center py-20">
            <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-slate-500 text-sm">Scanning security events...</p>
          </div>
        ) : incidents.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">Zero Security Anomalies</h3>
            <p className="text-slate-500 text-xs mt-1">All attendance check-ins are clean and verified.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {incidents.map((incident) => (
              <div
                key={incident.id}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${getRiskBadge(incident.riskLevel)}`}>
                      {incident.riskLevel} RISK • Score {incident.riskScore}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {new Date(incident.createdAt).toLocaleTimeString()}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase">
                      Status: {incident.reviewStatus}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900">{incident.reason}</h4>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <User size={13} className="text-blue-600" /> {incident.user?.fullName} ({incident.user?.department})
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={13} className="text-indigo-600" /> {incident.event?.title}
                    </span>
                    {incident.deviceInfo && (
                      <span className="truncate max-w-xs font-mono text-[10px] text-slate-400">
                        {incident.deviceInfo}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
                  <button
                    onClick={() => handleResolve(incident.id, "DISMISSED")}
                    disabled={actionLoading === incident.id || incident.reviewStatus === "DISMISSED"}
                    className="flex-1 md:flex-initial px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition disabled:opacity-40"
                  >
                    Dismiss Flag
                  </button>
                  <button
                    onClick={() => handleResolve(incident.id, "CONFIRMED_FRAUD")}
                    disabled={actionLoading === incident.id || incident.reviewStatus === "CONFIRMED_FRAUD"}
                    className="flex-1 md:flex-initial px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition disabled:opacity-40 shadow-sm shadow-red-500/20"
                  >
                    Confirm Anomaly
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}