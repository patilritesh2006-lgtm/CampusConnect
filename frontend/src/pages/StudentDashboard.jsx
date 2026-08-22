import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/api";
import AppNavbar from "../components/AppNavbar";
import { Calendar, ClipboardList, Award, Megaphone, User, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";

function StudentDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState({});
  const [stats, setStats] = useState({
    registeredCount: 0,
    upcomingCount: 0,
    certificatesCount: 0,
  });
  const [recentAnnouncements, setRecentAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadStudentData = async (userId) => {
    try {
      setLoading(true);

      const [regRes, eventRes, certRes, annRes] = await Promise.all([
        API.get(`/registrations/${userId}`),
        API.get("/events"),
        API.get("/certificates/my"),
        API.get("/announcements"),
      ]);

      const registeredCount = regRes.data.success ? (regRes.data.registrations || []).length : 0;
      const totalEvents = eventRes.data.success ? (eventRes.data.events || []).length : 0;
      const certCount = certRes.data.success ? (certRes.data.certificates || []).length : 0;
      const announcements = annRes.data.success ? (annRes.data.announcements || []).slice(0, 3) : [];

      setStats({
        registeredCount,
        upcomingCount: totalEvents,
        certificatesCount: certCount,
      });
      setRecentAnnouncements(announcements);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const userString = localStorage.getItem("user");
    try {
      const savedUser = JSON.parse(userString || "{}");
      setUser(savedUser);

      if (savedUser.id) {
        loadStudentData(savedUser.id);
      }
    } catch (error) {
      console.error("User data error:", error);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <AppNavbar role="STUDENT" />

      <main className="p-6 md:p-8 flex-1">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* WELCOME BANNER */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 rounded-3xl shadow-xl p-6 md:p-8 text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-blue-200 text-xs font-bold uppercase tracking-wider mb-2">
                  <Sparkles size={16} />
                  Student Activity Hub
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold">
                  Welcome back, {user.fullName || "Student"}! 🎓
                </h1>
                <p className="text-blue-100 mt-2 max-w-xl text-sm leading-relaxed">
                  Participate in college hackathons, workshops, track attendance, and claim verified digital certificates.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => navigate("/student-events")}
                  className="bg-white text-blue-700 font-bold px-5 py-3 rounded-2xl shadow hover:bg-blue-50 transition text-sm flex items-center gap-1.5"
                >
                  Browse Events <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* USER CARD & STATS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-blue-600">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                  {user.fullName ? user.fullName[0].toUpperCase() : "S"}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-gray-800 text-sm truncate">{user.fullName || "Student"}</h3>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
              <div className="text-xs text-gray-600 border-t pt-2 flex justify-between">
                <span>{user.department || "General"}</span>
                <span className="font-semibold">{user.year ? `Year ${user.year}` : ""}</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-indigo-600">
              <p className="text-gray-500 text-xs font-semibold uppercase">Available Events</p>
              <h2 className="text-3xl font-black text-gray-800 mt-1">
                {loading ? "..." : stats.upcomingCount}
              </h2>
              <p className="text-xs text-gray-400 mt-2">Open for registration</p>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-green-600">
              <p className="text-gray-500 text-xs font-semibold uppercase">My Registrations</p>
              <h2 className="text-3xl font-black text-green-700 mt-1">
                {loading ? "..." : stats.registeredCount}
              </h2>
              <p className="text-xs text-gray-400 mt-2">Active participations</p>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-amber-500">
              <p className="text-gray-500 text-xs font-semibold uppercase">Certificates Earned</p>
              <h2 className="text-3xl font-black text-amber-600 mt-1">
                {loading ? "..." : stats.certificatesCount}
              </h2>
              <p className="text-xs text-gray-400 mt-2">Verified credentials</p>
            </div>
          </div>

          {/* QUICK ACCESS ACTION CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* EVENTS */}
            <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col justify-between hover:shadow-xl transition border border-gray-100 group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 mb-4 group-hover:scale-105 transition">
                  <Calendar size={24} />
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-1">Campus Events</h2>
                <p className="text-gray-600 text-xs leading-relaxed">
                  Discover upcoming workshops, guest lectures, hackathons, and cultural festivals.
                </p>
              </div>
              <button
                onClick={() => navigate("/student-events")}
                className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition text-xs shadow-sm"
              >
                Explore Events
              </button>
            </div>

            {/* CERTIFICATES */}
            <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col justify-between hover:shadow-xl transition border border-gray-100 group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 mb-4 group-hover:scale-105 transition">
                  <Award size={24} />
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-1">My Certificates</h2>
                <p className="text-gray-600 text-xs leading-relaxed">
                  View and print official verified certificates of completion with QR authentication.
                </p>
              </div>
              <button
                onClick={() => navigate("/student-certificates")}
                className="mt-6 w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2.5 rounded-xl transition text-xs shadow-sm"
              >
                View Certificates
              </button>
            </div>

            {/* ACHIEVEMENTS & PROFILE */}
            <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col justify-between hover:shadow-xl transition border border-gray-100 group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600 mb-4 group-hover:scale-105 transition">
                  <Sparkles size={24} />
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-1">Profile & Badges</h2>
                <p className="text-gray-600 text-xs leading-relaxed">
                  Check your activity scoreboard, attendance rate %, unlocked badges, and edit your profile.
                </p>
              </div>
              <button
                onClick={() => navigate("/student-profile")}
                className="mt-6 w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 rounded-xl transition text-xs shadow-sm"
              >
                View Badges & Profile
              </button>
            </div>
          </div>

          {/* RECENT ANNOUNCEMENTS */}
          {recentAnnouncements.length > 0 && (
            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                  <Megaphone size={18} className="text-purple-600" />
                  Recent Campus Notices
                </h3>
                <Link to="/announcements" className="text-xs font-semibold text-purple-600 hover:underline">
                  View All →
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recentAnnouncements.map((a) => (
                  <div key={a.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-xs space-y-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 uppercase">
                      {a.category}
                    </span>
                    <h4 className="font-bold text-gray-900 line-clamp-1 mt-1">{a.title}</h4>
                    <p className="text-gray-600 line-clamp-2">{a.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default StudentDashboard;
