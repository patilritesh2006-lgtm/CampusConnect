import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import API from "../api/api";
import AppNavbar from "../components/AppNavbar";
import { Users, Calendar, MapPin, Download, Search, CheckCircle2, XCircle, Award } from "lucide-react";

export default function AdminEventStudents() {
  const { eventId } = useParams();

  const [students, setStudents] = useState([]);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  const fetchRegisteredStudents = useCallback(async () => {
    if (!eventId) return;
    try {
      setLoading(true);
      const res = await API.get("/events/" + eventId + "/students");
      if (res.data.success) {
        setStudents(res.data.students || []);
        if (res.data.event) {
          setEvent(res.data.event);
        }
      }
    } catch (err) {
      console.error("Fetch students error:", err);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchRegisteredStudents();
  }, [fetchRegisteredStudents]);

  const handleToggleAttendance = async (studentId, currentAttended) => {
    try {
      setActionLoading(studentId);
      const res = await API.put("/attendance/" + eventId + "/user/" + studentId, {
        attended: !currentAttended,
      });
      if (res.data.success) {
        setStudents((prev) =>
          prev.map((s) =>
            s.id === studentId ? { ...s, attended: !currentAttended } : s
          )
        );
      }
    } catch (err) {
      alert("Failed to update attendance: " + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkMarkAttended = async () => {
    if (!window.confirm("Mark all registered students as Attended for this event?")) return;
    try {
      setLoading(true);
      const userIds = students.map((s) => s.id);
      const res = await API.post("/attendance/" + eventId + "/bulk", {
        userIds,
        attended: true,
      });
      if (res.data.success) {
        setStudents((prev) => prev.map((s) => ({ ...s, attended: true })));
        alert("All attendees marked as Present!");
      }
    } catch (err) {
      alert("Bulk update failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleIssueCertificate = async (studentId) => {
    try {
      setActionLoading(studentId);
      const res = await API.post("/certificates/generate", {
        eventId,
        userId: studentId,
      });
      if (res.data.success) {
        alert("Certificate issued successfully! 🏆 Code: " + res.data.certificate.certificateCode);
        setStudents((prev) =>
          prev.map((s) =>
            s.id === studentId ? { ...s, hasCertificate: true, certificateCode: res.data.certificate.certificateCode } : s
          )
        );
      }
    } catch (err) {
      alert("Certificate issue error: " + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(null);
    }
  };

  const exportToCSV = () => {
    if (!students || students.length === 0) return;
    const headers = ["Full Name", "Email", "Department", "Year", "Registration Date", "Attended", "Certificate"];
    const rows = students.map((s) => [
      '"' + (s.fullName || "") + '"',
      '"' + (s.email || "") + '"',
      '"' + (s.department || "N/A") + '"',
      '"' + (s.year ? "Year " + s.year : "N/A") + '"',
      '"' + new Date(s.registrationDate).toLocaleDateString() + '"',
      '"' + (s.attended ? "YES" : "NO") + '"',
      '"' + (s.certificateCode || "None") + '"',
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "event_" + (event?.title || eventId) + "_attendees.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = students.filter((s) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      s.fullName?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      s.department?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <AppNavbar role="ADMIN" />

      <main className="p-6 md:p-8 flex-1">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 border border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm mb-1">
                  <Users size={18} />
                  Event Attendees & Attendance Management
                </div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {event?.title ? "Attendees: " + event.title : "Registered Students"}
                </h1>
                {event && (
                  <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-600">
                    <span className="flex items-center gap-1 font-medium">
                      <MapPin size={14} className="text-gray-400" />
                      {event.venue}
                    </span>
                    <span className="flex items-center gap-1 font-medium">
                      <Calendar size={14} className="text-gray-400" />
                      {new Date(event.eventDate).toLocaleDateString()}
                    </span>
                    <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">
                      {event.status || "UPCOMING"}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleBulkMarkAttended}
                  disabled={students.length === 0}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-semibold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition shadow-sm"
                >
                  <CheckCircle2 size={14} />
                  Mark All Attended
                </button>

                <button
                  onClick={exportToCSV}
                  disabled={students.length === 0}
                  className="bg-gray-900 hover:bg-black disabled:bg-gray-300 text-white font-semibold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition shadow-sm"
                >
                  <Download size={14} />
                  Export CSV
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl shadow-md p-5 border-l-4 border-blue-600">
              <p className="text-xs font-semibold text-gray-500 uppercase">Total Registrations</p>
              <h3 className="text-2xl font-black text-gray-900 mt-1">{students.length}</h3>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-5 border-l-4 border-green-600">
              <p className="text-xs font-semibold text-gray-500 uppercase">Confirmed Attended</p>
              <h3 className="text-2xl font-black text-green-700 mt-1">
                {students.filter((s) => s.attended).length} / {students.length}
              </h3>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-4 border border-gray-100 flex items-center">
              <div className="relative w-full">
                <Search size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter student name or email..."
                  className="w-full pl-10 pr-4 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl shadow-md p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-3"></div>
              <p className="text-gray-600">Loading attendee roster...</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 border-b text-xs font-semibold text-gray-600 uppercase">
                    <tr>
                      <th className="px-6 py-4">Student</th>
                      <th className="px-6 py-4">Department / Year</th>
                      <th className="px-6 py-4">Registered Date</th>
                      <th className="px-6 py-4">Attendance Status</th>
                      <th className="px-6 py-4">Certificate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                          No students registered yet.
                        </td>
                      </tr>
                    ) : (
                      filtered.map((student) => (
                        <tr key={student.id} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-4">
                            <div className="font-semibold text-gray-900">{student.fullName}</div>
                            <div className="text-xs text-gray-500">{student.email}</div>
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            {(student.department || "General") + (student.year ? " • Year " + student.year : "")}
                          </td>
                          <td className="px-6 py-4 text-xs text-gray-500">
                            {new Date(student.registrationDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleToggleAttendance(student.id, student.attended)}
                              disabled={actionLoading === student.id}
                              className={"px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition " + (student.attended ? "bg-green-100 hover:bg-green-200 text-green-800" : "bg-gray-100 hover:bg-gray-200 text-gray-600")}
                            >
                              {student.attended ? (
                                <>
                                  <CheckCircle2 size={14} className="text-green-600" />
                                  Present
                                </>
                              ) : (
                                <>
                                  <XCircle size={14} className="text-gray-400" />
                                  Absent
                                </>
                              )}
                            </button>
                          </td>
                          <td className="px-6 py-4">
                            {student.hasCertificate ? (
                              <span className="text-xs font-mono font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg">
                                📜 {student.certificateCode}
                              </span>
                            ) : student.attended ? (
                              <button
                                onClick={() => handleIssueCertificate(student.id)}
                                disabled={actionLoading === student.id}
                                className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1 transition shadow-sm"
                              >
                                <Award size={13} />
                                Issue Certificate
                              </button>
                            ) : (
                              <span className="text-xs text-gray-400 italic">Mark attended first</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}