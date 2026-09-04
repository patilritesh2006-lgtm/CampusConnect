import { useState, useEffect } from "react";
import api from "../api/api";
import AppNavbar from "../components/AppNavbar";
import Footer from "../components/Footer";
import {
  TrendingUp,
  Award,
  Users,
  Calendar,
  ShieldCheck,
  Sparkles,
  AlertTriangle,
  Building2,
  PieChart,
  ArrowUpRight,
  ShieldAlert,
  Flame,
} from "lucide-react";

export default function InstitutionalIntelligence() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIntelligence();
  }, []);

  const fetchIntelligence = async () => {
    try {
      setLoading(true);
      const res = await api.get("/intelligence");
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error("Intelligence fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <AppNavbar role="ADMIN" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-slate-600 font-medium">Computing Campus Intelligence KPIs...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const { commandCenter, departments, insights } = data || {};

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      <AppNavbar role="ADMIN" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* COMMAND CENTER HEADER */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden border border-slate-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={18} className="text-indigo-400" />
                <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-widest">
                  Executive Intelligence System
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Campus Command Center</h1>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">
                Real-time institutional engagement, attendance integrity, and AI retention intelligence.
              </p>
            </div>
          </div>

          {/* COMMAND CENTER TILES */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-slate-800 text-xs">
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
              <span className="text-slate-400 font-medium block">Active Campus Events</span>
              <p className="text-2xl font-black text-white mt-1">
                {commandCenter?.activeEvents || 0}
              </p>
              <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">Of {commandCenter?.totalEvents || 0} Total</span>
            </div>

            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
              <span className="text-slate-400 font-medium block">Attendance Rate</span>
              <p className="text-2xl font-black text-emerald-400 mt-1">
                {commandCenter?.overallAttendanceRate || 0}%
              </p>
              <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">{commandCenter?.totalAttended} Verified Check-Ins</span>
            </div>

            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
              <span className="text-slate-400 font-medium block">Verifiable Credentials</span>
              <p className="text-2xl font-black text-purple-400 mt-1">
                {commandCenter?.totalCredentials || 0}
              </p>
              <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">Cryptographically Signed</span>
            </div>

            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
              <span className="text-slate-400 font-medium block">Attendance Alerts</span>
              <p className="text-2xl font-black text-rose-400 mt-1">
                {commandCenter?.fraudAlertsCount || 0}
              </p>
              <span className="text-[10px] text-rose-300 font-mono mt-0.5 block">High Risk Anomaly Flags</span>
            </div>
          </div>
        </div>

        {/* AI TREND INSIGHTS */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">AI Institutional Insights & Recommendations</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {insights?.map((ins, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {ins.type}
                  </span>
                  <ArrowUpRight size={14} className="text-slate-400" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">{ins.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{ins.summary}</p>
              </div>
            ))}
          </div>
        </section>

        {/* DEPARTMENT ENGAGEMENT MATRIX */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">Academic Department Participation Ranking</h2>
            <p className="text-xs text-slate-500">Real-time attendance rates and student engagement across faculties.</p>
          </div>

          <div className="space-y-4">
            {departments?.map((dept, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-slate-800 text-sm">{dept.department}</span>
                  </div>
                  <span className="font-extrabold text-blue-600 text-sm">{dept.attendanceRate}% Attendance</span>
                </div>

                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(5, dept.attendanceRate)}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>{dept.studentsCount} Active Students</span>
                  <span>{dept.attendedCount} / {dept.registrationsCount} Event Check-Ins</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}