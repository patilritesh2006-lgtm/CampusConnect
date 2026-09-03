import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/api";
import AppNavbar from "../components/AppNavbar";
import Footer from "../components/Footer";
import {
  ShieldCheck,
  Award,
  Zap,
  Flame,
  CheckCircle2,
  Share2,
  ExternalLink,
  Lock,
  Globe,
  Compass,
  FileCheck,
  Building2,
  Calendar,
  Users,
  Copy,
  Check,
  QrCode,
  Sparkles,
} from "lucide-react";

export default function CampusPassport() {
  const { username } = useParams();
  const [passport, setPassport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("skills"); // skills, achievements, credentials, clubs
  const [showShareModal, setShowShareModal] = useState(false);

  // Authenticated user state
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isOwner = !username || username === currentUser.username;

  useEffect(() => {
    fetchPassport();
  }, [username]);

  const fetchPassport = async () => {
    try {
      setLoading(true);
      setError("");
      const endpoint = isOwner ? "/passport/me" : `/passport/${username}`;
      const res = await api.get(endpoint);
      if (res.data.success) {
        setPassport(res.data.passport);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load Campus Passport."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const getRarityBadge = (rarity) => {
    switch (rarity) {
      case "LEGENDARY":
        return "bg-amber-500/10 text-amber-600 border-amber-500/30";
      case "EPIC":
        return "bg-purple-500/10 text-purple-600 border-purple-500/30";
      case "RARE":
        return "bg-blue-500/10 text-blue-600 border-blue-500/30";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getProficiencyColor = (proficiency) => {
    switch (proficiency) {
      case "EXPERT":
        return "bg-emerald-500 text-white";
      case "ADVANCED":
        return "bg-blue-600 text-white";
      case "INTERMEDIATE":
        return "bg-indigo-500 text-white";
      default:
        return "bg-slate-400 text-white";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <AppNavbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-slate-600 font-medium">Verifying Campus Passport...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !passport) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <AppNavbar />
        <div className="flex-1 max-w-xl mx-auto p-6 flex items-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200 text-center w-full">
            <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
              <Lock size={26} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Passport Unavailable</h2>
            <p className="text-slate-600 text-sm mb-6">{error || "The requested student passport could not be found."}</p>
            <Link
              to="/student-dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const { identity, gamification, skills, achievements, credentials, clubs, recentEvents } = passport;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      <AppNavbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* TOP PASSPORT HEADER CARD */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl shadow-2xl p-6 sm:p-8 relative overflow-hidden mb-8 border border-slate-800">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            {/* Identity & Avatar */}
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 p-1 shadow-lg shrink-0">
                <div className="w-full h-full bg-slate-900 rounded-xl flex items-center justify-center text-3xl font-extrabold text-white">
                  {identity.fullName?.charAt(0) || "S"}
                </div>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{identity.fullName}</h1>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <ShieldCheck size={14} /> Verified by CampusConnect
                  </span>
                </div>

                <p className="text-slate-300 text-sm flex items-center gap-2">
                  <Building2 size={15} className="text-slate-400" />
                  {identity.department || "Academic Department"} • {identity.institution}
                </p>

                {identity.bio && (
                  <p className="text-slate-400 text-xs sm:text-sm mt-2 max-w-xl leading-relaxed">
                    {identity.bio}
                  </p>
                )}
              </div>
            </div>

            {/* Actions & QR Share */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <button
                onClick={handleCopyLink}
                className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md transition"
              >
                {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                {copied ? "Link Copied!" : "Copy Passport Link"}
              </button>

              <Link
                to={`/verify/student/${identity.username || "student"}`}
                target="_blank"
                className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-lg transition shadow-blue-500/20"
              >
                <ExternalLink size={16} /> Recruiter View
              </Link>
            </div>
          </div>

          {/* KEY PASSPORT METRICS BANNER */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-slate-700/60 text-xs">
            <div className="bg-white/5 backdrop-blur-sm p-3.5 rounded-2xl border border-white/10">
              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                <Zap size={14} className="text-amber-400" /> Level & XP
              </span>
              <p className="text-lg font-extrabold text-white mt-1">
                Level {gamification.level} <span className="text-xs font-normal text-slate-400">({gamification.xp} XP)</span>
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm p-3.5 rounded-2xl border border-white/10">
              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                <Flame size={14} className="text-orange-400" /> Activity Streak
              </span>
              <p className="text-lg font-extrabold text-white mt-1">
                {gamification.streakDays} Days
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm p-3.5 rounded-2xl border border-white/10">
              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                <Calendar size={14} className="text-blue-400" /> Events Attended
              </span>
              <p className="text-lg font-extrabold text-white mt-1">
                {gamification.totalEventsAttended} Verified
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm p-3.5 rounded-2xl border border-white/10">
              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                <Award size={14} className="text-purple-400" /> Credentials
              </span>
              <p className="text-lg font-extrabold text-white mt-1">
                {gamification.totalCredentialsEarned} Certified
              </p>
            </div>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex items-center gap-2 border-b border-slate-200 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab("skills")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition ${
              activeTab === "skills"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Compass size={16} /> Verified Skills ({skills.length})
          </button>

          <button
            onClick={() => setActiveTab("achievements")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition ${
              activeTab === "achievements"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Award size={16} /> Achievements ({achievements.length})
          </button>

          <button
            onClick={() => setActiveTab("credentials")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition ${
              activeTab === "credentials"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <FileCheck size={16} /> Verifiable Credentials ({credentials.length})
          </button>

          <button
            onClick={() => setActiveTab("clubs")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition ${
              activeTab === "clubs"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Users size={16} /> Clubs & Leadership ({clubs.length})
          </button>
        </div>

        {/* TAB 1: VERIFIED SKILLS GRAPH */}
        {activeTab === "skills" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Evidence-Backed Competency Matrix</h3>
                <p className="text-xs text-slate-500">Every skill score is computed from verified workshops, credentials, and hackathons.</p>
              </div>
              <Link to="/skills" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
                Full Skill Graph <ExternalLink size={13} />
              </Link>
            </div>

            {skills.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
                <Compass className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600 text-sm">No skill evidence recorded yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {skills.map((skill, idx) => (
                  <div key={idx} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{skill.name}</h4>
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{skill.category}</span>
                      </div>
                      <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg ${getProficiencyColor(skill.proficiency)}`}>
                        {skill.proficiency} • {skill.score}%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 rounded-full h-2 mb-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${skill.score}%` }}
                      ></div>
                    </div>

                    {/* Evidence summary */}
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <CheckCircle2 size={13} className="text-emerald-500" />
                      {skill.evidenceCount} verified evidence items from campus events
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ACHIEVEMENTS */}
        {activeTab === "achievements" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.length === 0 ? (
              <div className="col-span-full bg-white rounded-2xl p-8 text-center border border-slate-200">
                <Award className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600 text-sm">No achievements unlocked yet. Attend events to earn your first badge!</p>
              </div>
            ) : (
              achievements.map((ach, idx) => (
                <div key={idx} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      🏆
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getRarityBadge(ach.rarity)}`}>
                      {ach.rarity}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{ach.name}</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{ach.description}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="font-semibold text-amber-600 flex items-center gap-1">
                      <Zap size={13} /> +{ach.xpReward} XP Awarded
                    </span>
                    <span>{new Date(ach.unlockedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: CREDENTIALS */}
        {activeTab === "credentials" && (
          <div className="space-y-4">
            {credentials.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
                <FileCheck className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600 text-sm">No verifiable credentials issued yet.</p>
              </div>
            ) : (
              credentials.map((cred, idx) => (
                <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-slate-900">{cred.title}</h4>
                      <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                        Cryptographically Valid
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{cred.description}</p>
                    <p className="text-[11px] text-slate-400 font-mono">ID: {cred.credentialId} • Issued: {new Date(cred.issueDate).toLocaleDateString()}</p>
                  </div>

                  <div className="flex items-center gap-2.5 w-full md:w-auto">
                    <Link
                      to={`/verify/credential/${cred.credentialId}`}
                      className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition"
                    >
                      <ExternalLink size={14} /> Verify Proof
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 4: CLUBS */}
        {activeTab === "clubs" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {clubs.length === 0 ? (
              <div className="col-span-full bg-white rounded-2xl p-8 text-center border border-slate-200">
                <Users className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600 text-sm">Not currently a member of any campus club.</p>
                <Link to="/clubs" className="text-xs font-bold text-blue-600 hover:underline mt-2 inline-block">
                  Discover Campus Clubs →
                </Link>
              </div>
            ) : (
              clubs.map((c, idx) => (
                <div key={idx} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <Users size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{c.clubName}</h4>
                      <p className="text-xs text-slate-400">{c.category} • Joined {new Date(c.joinedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
                    {c.role}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}