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
  RefreshCw,
  Search,
  User,
  Calendar,
  Layers,
  ShieldCheck,
} from "lucide-react";

export default function AdminFraudConsole() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterLevel, setFilterLevel] = useState("");
  const [filterStatus, setFilterStatus] = useState("PENDING");
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchIncidents();
  }, [filterLevel, filterStatus]);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterLevel) params.riskLevel = filterLevel;
      if (filterStatus) params.reviewStatus = filterStatus;

      const res = await api.get("/fraud/alerts", { params });
      if (res.data.success) {
        setIncidents(res.data.incidents);
      }
    } catch (err) {
      console.error("Fraud fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (incidentId, newStatus) => {
    try {
      setProcessingId(incidentId);
      const res = await api.post("/fraud/resolve", {
        incidentId,
        reviewStatus: newStatus,
      });
      if (res.data.success) {
        fetchIncidents();
      }
    } catch (err) {
      alert("Failed to update incident resolution.");
    } finally {
      setProcessingId(null);
    }
  };

  const getRiskBadge = (level, score) => {
    if (level === "HIGH" || score >= 70) {
      return "bg-rose-500/10 text-rose-600 border-rose-500/30";
    }
    if (level === "MEDIUM" || score >= 45) {
      return "bg-amber-500/10 text-amber-600 border-amber-500/30";
    }
    return "bg-emerald-500/10 text-emerald-600 border-emerald-500/30";
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <AppNavbar role="ADMIN" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Header Hero */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-1">
              <ShieldAlert className="text-rose-400" size={24} />
              <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-widest">
                Attendance Integrity Engine
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Attendance Fraud & Risk Console
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm">
              Deterministic multi-factor risk detection: QR replay, proxy check-in attempts, and rapid failure bursts.
            </p>
          </div>

          <button
            onClick={fetchIncidents}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition border border-slate-700 disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh Alerts
          </button>
        </div>

        {/* Filter Controls */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs font-medium">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-slate-500 font-bold flex items-center gap-1.5">
              <Filter size={14} /> Filter Risk:
            </span>

            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-semibold focus:outline-none"
            >
              <option value="">All Severity Levels</option>
              <option value="HIGH">High Risk (Score 70+)</option>
              <option value="MEDIUM">Medium Risk (Score 45–69)</option>
              <option value="LOW">Low Risk</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-semibold focus:outline-none"
            >
              <option value="PENDING">Pending Review</option>
              <option value="APPROVED">Approved / Overridden</option>
              <option value="CONFIRMED_FRAUD">Confirmed Fraud</option>
              <option value="DISMISSED">Dismissed Flags</option>
              <option value="">All Statuses</option>
            </select>
          </div>

          <span className="text-slate-400 font-mono">Showing {incidents.length} flagged incidents</span>
        </div>

        {/* Incident List */}
        {loading ? (
          <div className="text-center py-16 space-y-3">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-medium text-slate-500">Querying anomaly logs from database...</p>
          </div>
        ) : incidents.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
              <CheckCircle2 size={28} />
            </div>
            <h3 className="text-base font-bold text-slate-900">Zero Flagged Incidents in Queue</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              All campus check-ins are verified and compliant with time-based rotating QR policies.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {incidents.map((incident) => (
              <div
                key={incident.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[10px] font-mono font-extrabold px-2.5 py-0.5 rounded-full border ${getRiskBadge(
                        incident.riskLevel,
                        incident.riskScore
                      )}`}
                    >
                      Risk Score: {incident.riskScore}/100 • {incident.riskLevel}
                    </span>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      Status: {incident.reviewStatus}
                    </span>

                    <span className="text-[10px] text-slate-400 font-mono">
                      Logged {new Date(incident.createdAt).toLocaleTimeString()} • {new Date(incident.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <User size={14} className="text-slate-400" />
                      {incident.user?.fullName} ({incident.user?.department || "Student"})
                    </h4>
                    <p className="text-xs font-semibold text-slate-600 mt-0.5">
                      Event: <span className="text-slate-900">{incident.event?.title}</span>
                    </p>
                  </div>

                  <p className="text-xs text-rose-700 bg-rose-50 p-2.5 rounded-xl border border-rose-100 font-medium">
                    ⚠️ {incident.reason}
                  </p>

                  {incident.riskFactors && incident.riskFactors.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {incident.riskFactors.map((f, fIdx) => (
                        <span key={fIdx} className="text-[9px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                          +{f}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto shrink-0 pt-2 lg:pt-0">
                  <button
                    onClick={() => handleResolve(incident.id, "APPROVED")}
                    disabled={processingId === incident.id}
                    className="flex-1 lg:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-xs"
                    title="Approve & Mark Attendance"
                  >
                    <CheckCircle2 size={14} /> Approve & Check-In
                  </button>

                  <button
                    onClick={() => handleResolve(incident.id, "CONFIRMED_FRAUD")}
                    disabled={processingId === incident.id}
                    className="flex-1 lg:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition shadow-xs"
                    title="Confirm Fraud & Disallow"
                  >
                    <XCircle size={14} /> Confirm Fraud
                  </button>

                  <button
                    onClick={() => handleResolve(incident.id, "DISMISSED")}
                    disabled={processingId === incident.id}
                    className="flex-1 lg:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
                    title="Dismiss Notification"
                  >
                    Dismiss
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