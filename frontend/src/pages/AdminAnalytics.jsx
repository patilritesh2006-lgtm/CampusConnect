import { useEffect, useState } from "react";
import API from "../api/api";
import AppNavbar from "../components/AppNavbar";
import { BarChart3, Calendar, TrendingUp, Building } from "lucide-react";

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await API.get("/analytics/admin");
      if (res.data.success) {
        setAnalytics(res.data.analytics || {});
      }
    } catch (err) {
      console.error("Analytics fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const summary = analytics?.summary || {};

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <AppNavbar role="ADMIN" />

      <main className="p-6 md:p-8 flex-1">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 border border-gray-100">
            <div className="flex items-center gap-2 text-indigo-600 font-semibold text-sm mb-1">
              <BarChart3 size={18} />
              Administrative Intelligence
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Campus Analytics & Reports</h1>
            <p className="text-gray-600 text-sm mt-1">
              Real-time insights on student participation, event registrations, attendance rates, and issued certificates.
            </p>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl shadow-md p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent mb-3"></div>
              <p className="text-gray-600">Generating analytics...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                <div className="bg-white rounded-2xl shadow-md p-5 border-l-4 border-blue-600">
                  <p className="text-xs font-semibold text-gray-500 uppercase">Total Events</p>
                  <h3 className="text-2xl font-black text-gray-900 mt-1">{summary.totalEvents || 0}</h3>
                </div>

                <div className="bg-white rounded-2xl shadow-md p-5 border-l-4 border-purple-600">
                  <p className="text-xs font-semibold text-gray-500 uppercase">Total Students</p>
                  <h3 className="text-2xl font-black text-gray-900 mt-1">{summary.totalStudents || 0}</h3>
                </div>

                <div className="bg-white rounded-2xl shadow-md p-5 border-l-4 border-indigo-600">
                  <p className="text-xs font-semibold text-gray-500 uppercase">Registrations</p>
                  <h3 className="text-2xl font-black text-gray-900 mt-1">{summary.totalRegistrations || 0}</h3>
                </div>

                <div className="bg-white rounded-2xl shadow-md p-5 border-l-4 border-green-600">
                  <p className="text-xs font-semibold text-gray-500 uppercase">Attended</p>
                  <h3 className="text-2xl font-black text-green-700 mt-1">{summary.totalAttended || 0}</h3>
                </div>

                <div className="bg-white rounded-2xl shadow-md p-5 border-l-4 border-amber-500">
                  <p className="text-xs font-semibold text-gray-500 uppercase">Certificates</p>
                  <h3 className="text-2xl font-black text-amber-600 mt-1">{summary.totalCertificates || 0}</h3>
                </div>

                <div className="bg-white rounded-2xl shadow-md p-5 border-l-4 border-teal-500">
                  <p className="text-xs font-semibold text-gray-500 uppercase">Attendance Rate</p>
                  <h3 className="text-2xl font-black text-teal-700 mt-1">{summary.overallAttendanceRate || 0}%</h3>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
                  <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                    <Building size={18} className="text-blue-600" />
                    Department Student Distribution
                  </h3>

                  <div className="space-y-4">
                    {analytics?.departmentStats?.length === 0 ? (
                      <p className="text-xs text-gray-400">No department data recorded.</p>
                    ) : (
                      analytics?.departmentStats?.map((dept) => (
                        <div key={dept.department}>
                          <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1">
                            <span>{dept.department}</span>
                            <span>{dept.studentCount} students ({dept.percentage}%)</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                            <div
                              className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                              style={{ width: dept.percentage + "%" }}
                            ></div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 flex flex-col justify-between">
                  <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar size={18} className="text-indigo-600" />
                    Event Status Distribution
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl text-center">
                      <p className="text-xs font-bold text-blue-600 uppercase">Upcoming</p>
                      <h4 className="text-2xl font-black text-blue-900 mt-1">{analytics?.statusCounts?.UPCOMING || 0}</h4>
                    </div>

                    <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl text-center">
                      <p className="text-xs font-bold text-amber-600 uppercase">Ongoing</p>
                      <h4 className="text-2xl font-black text-amber-900 mt-1">{analytics?.statusCounts?.ONGOING || 0}</h4>
                    </div>

                    <div className="p-4 bg-green-50 border border-green-100 rounded-2xl text-center">
                      <p className="text-xs font-bold text-green-600 uppercase">Completed</p>
                      <h4 className="text-2xl font-black text-green-900 mt-1">{analytics?.statusCounts?.COMPLETED || 0}</h4>
                    </div>

                    <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-center">
                      <p className="text-xs font-bold text-red-600 uppercase">Cancelled</p>
                      <h4 className="text-2xl font-black text-red-900 mt-1">{analytics?.statusCounts?.CANCELLED || 0}</h4>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
                <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp size={18} className="text-amber-500" />
                  Top Most Popular Events
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b text-xs uppercase font-semibold text-gray-600">
                      <tr>
                        <th className="px-4 py-3">Event Title</th>
                        <th className="px-4 py-3">Venue</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Registrations</th>
                        <th className="px-4 py-3">Attended</th>
                        <th className="px-4 py-3">Certificates</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {analytics?.popularEvents?.map((ev) => (
                        <tr key={ev.id} className="hover:bg-gray-50 transition">
                          <td className="px-4 py-3 font-bold text-gray-900">{ev.title}</td>
                          <td className="px-4 py-3 text-gray-600">{ev.venue}</td>
                          <td className="px-4 py-3">
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                              {ev.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-semibold text-gray-900">{ev.registrationCount}</td>
                          <td className="px-4 py-3 font-semibold text-green-700">{ev.attendedCount}</td>
                          <td className="px-4 py-3 font-semibold text-amber-600">{ev.certificateCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}