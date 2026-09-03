import { useState, useEffect } from "react";
import api from "../api/api";
import AppNavbar from "../components/AppNavbar";
import Footer from "../components/Footer";
import {
  BarChart3,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  Building2,
  Users,
  Award,
  Calendar,
  AlertCircle,
  CheckCircle2,
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
      console.error("Error loading institutional intelligence:", err);
    } finally {
      setLoading(false);
    }
  };

  const getInsightColor = (type) => {
    switch (type) {
      case "POSITIVE":
      case "SUCCESS":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "SECURITY_ALERT":
        return "bg-red-50 text-red-800 border-red-200";
      default:
        return "bg-blue-50 text-blue-800 border-blue-200";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      <AppNavbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* HEADER */}
        <div className="mb-8">
          <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 inline-block mb-2">
            Executive Analytics
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Institutional Intelligence & AI Insights
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Real-time department retention metrics, capacity utilization benchmarks, and AI-grounded campus trends.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-slate-500 text-sm">Aggregating institutional data...</p>
          </div>
        ) : !data ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
            <BarChart3 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-600 text-sm">Failed to load institutional data.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* KPI STATS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                <span className="text-xs text-slate-500 font-semibold">Total Students</span>
                <p className="text-2xl font-extrabold text-slate-900 mt-1">{data.kpis.totalStudents}</p>
                <span className="text-[11px] text-emerald-600 font-bold">100% Enrolled</span>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                <span className="text-xs text-slate-500 font-semibold">Overall Attendance Rate</span>
                <p className="text-2xl font-extrabold text-blue-600 mt-1">{data.kpis.overallAttendanceRate}%</p>
                <span className="text-[11px] text-slate-400">{data.kpis.totalAttended} / {data.kpis.totalRegistrations} check-ins</span>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                <span className="text-xs text-slate-500 font-semibold">Credentials Certified</span>
                <p className="text-2xl font-extrabold text-purple-600 mt-1">{data.kpis.totalCredentials}</p>
                <span className="text-[11px] text-purple-600 font-bold">SHA-256 Verified</span>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                <span className="text-xs text-slate-500 font-semibold">Institutional Engagement</span>
                <p className="text-2xl font-extrabold text-emerald-600 mt-1">{data.kpis.averageEngagementScore} / 100</p>
                <span className="text-[11px] text-emerald-600 font-bold">Exceeds Benchmark</span>
              </div>
            </div>

            {/* AI GROUNDED INSIGHTS */}
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Sparkles className="text-indigo-600" size={20} /> AI Campus Trend Insights
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.insights.map((ins, idx) => (
                  <div key={idx} className={`p-5 rounded-2xl border ${getInsightColor(ins.type)} space-y-1.5`}>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold uppercase tracking-wider">{ins.title}</span>
                    </div>
                    <p className="text-xs sm:text-sm leading-relaxed font-medium">{ins.summary}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* DEPARTMENT BREAKDOWN */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                <Building2 className="text-blue-600" size={20} /> Department Engagement Breakdown
              </h2>
              <p className="text-xs text-slate-500 mb-6">Attendance rates and registration volumes across academic disciplines.</p>

              <div className="space-y-5">
                {data.departments.map((dept, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-slate-800">
                      <span>{dept.department}</span>
                      <span className="text-blue-600 font-extrabold">
                        {dept.attendanceRate}% Attendance ({dept.attendedCount}/{dept.registrationsCount} attended)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${dept.attendanceRate}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}