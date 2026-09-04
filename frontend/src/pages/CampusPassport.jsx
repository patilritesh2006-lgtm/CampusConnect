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
  Settings,
  X,
  Printer,
  Clock,
  Briefcase,
  Star,
} from "lucide-react";

export default function CampusPassport() {
  const { username } = useParams();
  const [passport, setPassport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("experience"); // experience, skills, achievements, credentials, clubs
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [privacyForm, setPrivacyForm] = useState({
    portfolioPublic: true,
    privacyShowSkills: true,
    privacyShowCertificates: true,
    privacyShowAchievements: true,
    privacyShowEvents: true,
    privacyShowEmail: false,
  });
  const [savingPrivacy, setSavingPrivacy] = useState(false);

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
        if (res.data.passport.privacySettings) {
          setPrivacyForm(res.data.passport.privacySettings);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load Campus Passport.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/verify/student/${passport?.identity?.username || username || ""}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSavePrivacy = async (e) => {
    e.preventDefault();
    try {
      setSavingPrivacy(true);
      const res = await api.put("/passport/privacy", privacyForm);
      if (res.data.success) {
        setShowPrivacyModal(false);
        fetchPassport();
      }
    } catch (err) {
      alert("Failed to update privacy settings.");
    } finally {
      setSavingPrivacy(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case "WINNER":
        return "bg-amber-500/15 text-amber-700 border-amber-500/30";
      case "SPEAKER":
        return "bg-purple-500/15 text-purple-700 border-purple-500/30";
      case "ORGANIZER":
      case "COORDINATOR":
        return "bg-blue-500/15 text-blue-700 border-blue-500/30";
      case "VOLUNTEER":
        return "bg-emerald-500/15 text-emerald-700 border-emerald-500/30";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <AppNavbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-slate-600 font-medium">Verifying Campus Passport Registry...</p>
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
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-200 text-center w-full">
            <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
              <Lock size={26} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Passport Unavailable</h2>
            <p className="text-slate-600 text-sm mb-6">{error || "This student passport is either private or unavailable."}</p>
            <Link
              to="/student-dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 transition"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const { identity, gamification, skills, achievements, credentials, clubs, verifiedExperience } = passport;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between print:bg-white print:p-0">
      <div className="print:hidden">
        <AppNavbar />
      </div>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* TOP FLAGSHIP PASSPORT CARD */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white rounded-3xl shadow-2xl p-6 sm:p-8 relative overflow-hidden mb-8 border border-slate-800">
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
                    <ShieldCheck size={14} /> Verified Campus Passport
                  </span>
                </div>

                <p className="text-slate-300 text-xs sm:text-sm flex items-center gap-2">
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

            {/* Actions: Recruiter Link & Privacy Settings */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto print:hidden">
              {isOwner && (
                <button
                  onClick={() => setShowPrivacyModal(true)}
                  className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md transition"
                  title="Privacy Settings"
                >
                  <Settings size={16} />
                </button>
              )}

              <button
                onClick={handlePrint}
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md transition"
                title="Download / Print Profile"
              >
                <Printer size={16} />
              </button>

              <button
                onClick={handleCopyLink}
                className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md transition"
              >
                {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                {copied ? "Link Copied!" : "Recruiter Link"}
              </button>

              <Link
                to={`/verify/student/${identity.username || "student"}`}
                target="_blank"
                className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-lg transition shadow-blue-500/20"
              >
                <ExternalLink size={16} /> Public View
              </Link>
            </div>
          </div>

          {/* KEY METRICS SUMMARY BAR */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-8 pt-6 border-t border-slate-700/60 text-xs">
            <div className="bg-white/5 backdrop-blur-sm p-3.5 rounded-2xl border border-white/10">
              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                <Star size={14} className="text-amber-400" /> Engagement Score
              </span>
              <p className="text-xl font-extrabold text-white mt-1">
                {gamification.engagementScore}<span className="text-xs font-normal text-slate-400">/100</span>
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm p-3.5 rounded-2xl border border-white/10">
              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                <Zap size={14} className="text-blue-400" /> Rank & XP
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
                <Clock size={14} className="text-emerald-400" /> Verified Hours
              </span>
              <p className="text-lg font-extrabold text-white mt-1">
                {gamification.totalContributionHours} Hours
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
        <div className="flex items-center gap-2 border-b border-slate-200 mb-6 overflow-x-auto pb-2 print:hidden">
          <button
            onClick={() => setActiveTab("experience")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition ${
              activeTab === "experience"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Briefcase size={16} /> Verified Experience ({verifiedExperience?.length || 0})
          </button>

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
            <FileCheck size={16} /> Credentials ({credentials.length})
          </button>
        </div>

        {/* TAB 1: VERIFIED EXPERIENCE TIMELINE */}
        {activeTab === "experience" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Verified Campus Experience Timeline</h3>
                <p className="text-xs text-slate-500">Documented student involvement backed by cryptographic QR attendance records.</p>
              </div>
            </div>

            {(!verifiedExperience || verifiedExperience.length === 0) ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-slate-200">
                <Briefcase className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600 text-sm">No verified event contributions recorded yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {verifiedExperience.map((exp, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">{exp.eventTitle}</h4>
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${getRoleBadge(exp.role)}`}>
                          {exp.role}
                        </span>
                        <span className="text-emerald-700 bg-emerald-50 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 border border-emerald-200">
                          <CheckCircle2 size={11} /> Attendance Verified
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 flex items-center gap-3">
                        <span>📍 {exp.venue}</span>
                        <span>📅 {new Date(exp.eventDate).toLocaleDateString()}</span>
                        <span>⏱️ {exp.contributionHours} Verified Hours</span>
                      </p>
                    </div>

                    {exp.certificateCode && (
                      <Link
                        to={`/verify-certificate/${exp.certificateCode}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
                      >
                        <FileCheck size={13} /> Cert #{exp.certificateCode.slice(-6)}
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: VERIFIED SKILLS GRAPH */}
        {activeTab === "skills" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Evidence-Backed Competency Matrix</h3>
                <p className="text-xs text-slate-500">Calculated transparently from workshops, hackathons, and certifications.</p>
              </div>
              <Link to="/skills" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
                Full Skill Graph <ExternalLink size={13} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {skills.map((skill, idx) => (
                <div key={idx} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{skill.name}</h4>
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{skill.category}</span>
                    </div>
                    <span className="text-xs font-extrabold text-blue-600">{skill.proficiency} • {skill.score}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full" style={{ width: `${skill.score}%` }}></div>
                  </div>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1">
                    <CheckCircle2 size={12} className="text-emerald-500" />
                    {skill.confidenceText}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: ACHIEVEMENTS */}
        {activeTab === "achievements" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((ach, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">🏆</div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">{ach.rarity}</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">{ach.name}</h4>
                <p className="text-xs text-slate-500">{ach.description}</p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="font-semibold text-amber-600 flex items-center gap-1"><Zap size={13} /> +{ach.xpReward} XP</span>
                  <span>{new Date(ach.unlockedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: CREDENTIALS */}
        {activeTab === "credentials" && (
          <div className="space-y-4">
            {credentials.map((cred, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-bold text-slate-900">{cred.title}</h4>
                    <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">VALID</span>
                  </div>
                  <p className="text-xs text-slate-500">{cred.description}</p>
                  <p className="text-[11px] text-slate-400 font-mono">ID: {cred.credentialId} • Issued: {new Date(cred.issueDate).toLocaleDateString()}</p>
                </div>
                <Link
                  to={`/verify/credential/${cred.credentialId}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition"
                >
                  <ExternalLink size={13} /> Verify Proof
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* PRIVACY SETTINGS MODAL */}
        {showPrivacyModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                <h3 className="text-base font-bold text-slate-900">Campus Passport Privacy Controls</h3>
                <button onClick={() => setShowPrivacyModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSavePrivacy} className="space-y-3.5 text-xs">
                <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <div>
                    <span className="font-bold text-slate-800 block">Public Recruiter Visibility</span>
                    <span className="text-[11px] text-slate-500">Allow employers to view your verified passport</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacyForm.portfolioPublic}
                    onChange={(e) => setPrivacyForm({ ...privacyForm, portfolioPublic: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <div>
                    <span className="font-bold text-slate-800 block">Show Verified Skills</span>
                    <span className="text-[11px] text-slate-500">Display competency matrix & evidence</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacyForm.privacyShowSkills}
                    onChange={(e) => setPrivacyForm({ ...privacyForm, privacyShowSkills: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <div>
                    <span className="font-bold text-slate-800 block">Show Verified Credentials</span>
                    <span className="text-[11px] text-slate-500">Display cryptographically signed certificates</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacyForm.privacyShowCertificates}
                    onChange={(e) => setPrivacyForm({ ...privacyForm, privacyShowCertificates: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <div>
                    <span className="font-bold text-slate-800 block">Show Verified Experience</span>
                    <span className="text-[11px] text-slate-500">Display events, volunteer hours & hackathons</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacyForm.privacyShowEvents}
                    onChange={(e) => setPrivacyForm({ ...privacyForm, privacyShowEvents: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <div>
                    <span className="font-bold text-slate-800 block">Show Email to Recruiters</span>
                    <span className="text-[11px] text-slate-500">Allow recruiters to see contact email</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacyForm.privacyShowEmail}
                    onChange={(e) => setPrivacyForm({ ...privacyForm, privacyShowEmail: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </label>

                <div className="pt-4 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowPrivacyModal(false)}
                    className="px-4 py-2 text-slate-600 font-semibold text-xs hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingPrivacy}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition"
                  >
                    {savingPrivacy ? "Saving..." : "Save Preferences"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}