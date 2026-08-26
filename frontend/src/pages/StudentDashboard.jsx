import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/api";
import AppNavbar from "../components/AppNavbar";
import QRScannerModal from "../components/QRScannerModal";
import {
  Calendar,
  Award,
  Megaphone,
  Sparkles,
  ArrowRight,
  QrCode,
  Trophy,
  Flame,
  Bot,
  ExternalLink,
  CheckCircle2,
  Share2,
} from "lucide-react";

function StudentDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState({});
  const [stats, setStats] = useState({
    registeredCount: 0,
    upcomingCount: 0,
    certificatesCount: 0,
  });
  const [recommendations, setRecommendations] = useState([]);
  const [recentAnnouncements, setRecentAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  const loadStudentData = async (userId) => {
    try {
      setLoading(true);

      const [regRes, eventRes, certRes, annRes, recRes, meRes] =
        await Promise.all([
          API.get(`/registrations/${userId}`),
          API.get("/events"),
          API.get("/certificates/my-certificates").catch(() => ({ data: { certificates: [] } })),
          API.get("/announcements"),
          API.get("/ai/recommendations").catch(() => ({ data: { recommendations: [] } })),
          API.get("/auth/me").catch(() => ({ data: { user: {} } })),
        ]);

      const registeredCount = regRes.data.success
        ? (regRes.data.registrations || []).length
        : 0;
      const totalEvents = eventRes.data.success
        ? (eventRes.data.events || []).length
        : 0;
      const certCount = certRes.data.success
        ? (certRes.data.certificates || []).length
        : 0;
      const announcements = annRes.data.success
        ? (annRes.data.announcements || []).slice(0, 3)
        : [];
      const recs = recRes.data.success ? (recRes.data.recommendations || []).slice(0, 3) : [];

      if (meRes.data.success && meRes.data.user) {
        setUser(meRes.data.user);
        localStorage.setItem("user", JSON.stringify(meRes.data.user));
      }

      setStats({
        registeredCount,
        upcomingCount: totalEvents,
        certificatesCount: certCount,
      });
      setRecentAnnouncements(announcements);
      setRecommendations(recs);
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

  const currentXP = user.xp || 0;
  const currentLevel = user.level || 1;
  const xpInCurrentLevel = currentXP % 100;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AppNavbar role="STUDENT" />

      <main className="p-4 sm:p-6 md:p-8 flex-1 max-w-7xl mx-auto w-full space-y-6">
        {/* STUDENT HERO BANNER */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 rounded-3xl shadow-xl p-6 sm:p-8 text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left z-10">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="bg-white/20 backdrop-blur-md text-white text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1">
                <Sparkles size={14} className="text-amber-300" /> Student Dashboard 2.0
              </span>
              <span className="bg-amber-400 text-amber-950 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                <Flame size={14} /> Level {currentLevel} • {currentXP} XP
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Welcome back, {user.fullName || "Student"}! 🎓
            </h1>
            <p className="text-blue-100 text-sm max-w-xl leading-relaxed">
              Explore hackathons, scan QR codes for live check-ins, unlock verified credentials, and level up your student portfolio.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 z-10">
            <button
              onClick={() => setIsQRModalOpen(true)}
              className="bg-amber-400 hover:bg-amber-500 text-amber-950 font-extrabold px-5 py-3 rounded-2xl shadow-lg transition flex items-center gap-2 text-sm hover:scale-105"
            >
              <QrCode size={18} />
              Scan Check-In QR
            </button>

            <Link
              to="/student-events"
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold px-5 py-3 rounded-2xl transition flex items-center gap-2 text-sm"
            >
              Browse Events <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* GAMIFICATION XP PROGRESS BAR */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-md flex-shrink-0">
              <Trophy size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-gray-900 text-base">Gamification Progress</h3>
                <span className="text-xs bg-purple-100 text-purple-700 font-bold px-2.5 py-0.5 rounded-full">
                  Level {currentLevel}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {100 - xpInCurrentLevel} XP needed to reach Level {currentLevel + 1}
              </p>
            </div>
          </div>

          <div className="flex-1 max-w-md w-full space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-gray-700">
              <span>Current Progress</span>
              <span>{xpInCurrentLevel} / 100 XP</span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${xpInCurrentLevel}%` }}
              ></div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <Link
              to="/leaderboard"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2.5 rounded-xl border border-blue-100 flex items-center gap-1.5 transition"
            >
              View Leaderboard <ArrowRight size={14} />
            </Link>
            {user.username && (
              <Link
                to={`/portfolio/${user.username}`}
                target="_blank"
                className="text-xs font-bold text-purple-600 hover:text-purple-700 bg-purple-50 px-4 py-2.5 rounded-xl border border-purple-100 flex items-center gap-1.5 transition"
              >
                Public Portfolio <ExternalLink size={14} />
              </Link>
            )}
          </div>
        </div>

        {/* STATS METRIC CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white rounded-3xl shadow-sm p-6 border border-gray-200 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-extrabold text-xl">
              {user.fullName ? user.fullName[0].toUpperCase() : "S"}
            </div>
            <div className="min-w-0">
              <h4 className="font-extrabold text-gray-900 text-sm truncate">{user.fullName || "Student"}</h4>
              <p className="text-xs text-gray-500 truncate">{user.department || "General"}</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm p-6 border border-gray-200">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Available Events</p>
            <h2 className="text-3xl font-black text-gray-900 mt-1">
              {loading ? "..." : stats.upcomingCount}
            </h2>
            <p className="text-xs text-gray-400 mt-1">Open on campus</p>
          </div>

          <div className="bg-white rounded-3xl shadow-sm p-6 border border-gray-200">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">My Registrations</p>
            <h2 className="text-3xl font-black text-blue-600 mt-1">
              {loading ? "..." : stats.registeredCount}
            </h2>
            <p className="text-xs text-gray-400 mt-1">Active participations</p>
          </div>

          <div className="bg-white rounded-3xl shadow-sm p-6 border border-gray-200">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Verified Certificates</p>
            <h2 className="text-3xl font-black text-amber-500 mt-1">
              {loading ? "..." : stats.certificatesCount}
            </h2>
            <p className="text-xs text-gray-400 mt-1">Credentials earned</p>
          </div>
        </div>

        {/* AI RECOMMENDED EVENTS (Phase 8) */}
        {recommendations.length > 0 && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Bot size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900 text-base">AI Personalized Recommendations</h3>
                  <p className="text-xs text-gray-500">Curated based on your department, skills, and past activities</p>
                </div>
              </div>
              <Link to="/student-events" className="text-xs font-bold text-purple-600 hover:underline">
                Explore All →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recommendations.map((event) => (
                <div
                  key={event.id}
                  className="p-5 rounded-2xl bg-gradient-to-b from-purple-50/50 to-white border border-purple-100 hover:border-purple-300 transition flex flex-col justify-between space-y-4 shadow-sm"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 uppercase">
                        {event.category}
                      </span>
                      <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        {event.matchScore}% Match
                      </span>
                    </div>
                    <h4 className="font-bold text-gray-900 text-sm">{event.title}</h4>
                    <p className="text-xs text-purple-600 font-semibold">{event.matchReason}</p>
                    <p className="text-xs text-gray-500">{new Date(event.eventDate).toLocaleDateString()} • {event.venue}</p>
                  </div>

                  <Link
                    to="/student-events"
                    className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl text-center transition"
                  >
                    View Details & Register
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* QUICK ACCESS ACTION CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl shadow-sm p-6 flex flex-col justify-between hover:shadow-lg transition border border-gray-200 group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-105 transition">
                <Calendar size={24} />
              </div>
              <h2 className="text-xl font-extrabold text-gray-900 mb-1">Campus Events</h2>
              <p className="text-gray-500 text-xs leading-relaxed">
                Discover upcoming hackathons, guest seminars, conferences, and technical workshops.
              </p>
            </div>
            <Link
              to="/student-events"
              className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition text-xs text-center shadow-sm"
            >
              Explore Events
            </Link>
          </div>

          <div className="bg-white rounded-3xl shadow-sm p-6 flex flex-col justify-between hover:shadow-lg transition border border-gray-200 group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-105 transition">
                <Award size={24} />
              </div>
              <h2 className="text-xl font-extrabold text-gray-900 mb-1">Verified Certificates</h2>
              <p className="text-gray-500 text-xs leading-relaxed">
                View, print, and share official verifiable digital certificates with QR authentication.
              </p>
            </div>
            <Link
              to="/student-certificates"
              className="mt-6 w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 rounded-xl transition text-xs text-center shadow-sm"
            >
              View Certificates
            </Link>
          </div>

          <div className="bg-white rounded-3xl shadow-sm p-6 flex flex-col justify-between hover:shadow-lg transition border border-gray-200 group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-105 transition">
                <Sparkles size={24} />
              </div>
              <h2 className="text-xl font-extrabold text-gray-900 mb-1">Profile & Achievements</h2>
              <p className="text-gray-500 text-xs leading-relaxed">
                Check your activity scoreboard, attendance rate %, unlocked badges, and edit your skills.
              </p>
            </div>
            <Link
              to="/student-profile"
              className="mt-6 w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 rounded-xl transition text-xs text-center shadow-sm"
            >
              View Profile & Badges
            </Link>
          </div>
        </div>

        {/* RECENT ANNOUNCEMENTS */}
        {recentAnnouncements.length > 0 && (
          <div className="bg-white rounded-3xl shadow-sm p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-extrabold text-gray-900 text-base flex items-center gap-2">
                <Megaphone size={18} className="text-purple-600" />
                Recent Campus Notices
              </h3>
              <Link to="/announcements" className="text-xs font-bold text-purple-600 hover:underline">
                View All →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentAnnouncements.map((a) => (
                <div key={a.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-xs space-y-1.5">
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 uppercase">
                    {a.category}
                  </span>
                  <h4 className="font-bold text-gray-900 line-clamp-1 mt-1">{a.title}</h4>
                  <p className="text-gray-500 line-clamp-2">{a.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* IN-APP QR SCANNER MODAL */}
      <QRScannerModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        onCheckInSuccess={() => {
          if (user.id) loadStudentData(user.id);
        }}
      />
    </div>
  );
}

export default StudentDashboard;
