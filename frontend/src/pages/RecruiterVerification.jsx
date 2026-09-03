import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/api";
import Footer from "../components/Footer";
import {
  ShieldCheck,
  Award,
  CheckCircle2,
  FileCheck,
  Building2,
  ExternalLink,
  Lock,
  Compass,
  Zap,
  ArrowLeft,
} from "lucide-react";

export default function RecruiterVerification() {
  const { username } = useParams();
  const [passport, setPassport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPublicPassport();
  }, [username]);

  const fetchPublicPassport = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get(`/passport/${username}`);
      if (res.data.success) {
        setPassport(res.data.passport);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Candidate record not found or set to private.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-blue-500 selection:text-white">
      {/* TOP RECRUITER HEADER */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/logo-icon.png" alt="CampusConnect" className="w-9 h-9 object-contain" />
            <div>
              <span className="font-extrabold text-white text-base tracking-tight">Campus<span className="text-blue-500">Connect</span></span>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recruiter Verification Portal</span>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
              <ShieldCheck size={14} /> Official Credential Registry
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-10">
        {loading ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400 text-sm">Verifying institutional credentials...</p>
          </div>
        ) : error || !passport ? (
          <div className="max-w-md mx-auto bg-slate-800/80 rounded-3xl p-8 border border-slate-700 text-center shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-4">
              <Lock size={26} />
            </div>
            <h2 className="text-lg font-bold text-white mb-2">Verification Inactive</h2>
            <p className="text-slate-400 text-xs leading-relaxed mb-6">{error}</p>
            <Link to="/" className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition">
              <ArrowLeft size={14} /> Back to Portal
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* CANDIDATE VERIFIED HERO */}
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-1 shadow-lg shrink-0">
                    <div className="w-full h-full bg-slate-900 rounded-xl flex items-center justify-center text-3xl font-extrabold text-white">
                      {passport.identity.fullName?.charAt(0)}
                    </div>
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{passport.identity.fullName}</h1>
                      <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-0.5 rounded-full border border-emerald-500/40 flex items-center gap-1">
                        <CheckCircle2 size={13} /> Verified Student
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs sm:text-sm">
                      {passport.identity.department} • {passport.identity.institution}
                    </p>
                    {passport.identity.bio && (
                      <p className="text-slate-300 text-xs mt-2 max-w-xl leading-relaxed">{passport.identity.bio}</p>
                    )}
                  </div>
                </div>

                <div className="text-left sm:text-right bg-white/5 p-4 rounded-2xl border border-white/10 shrink-0 w-full sm:w-auto">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block">Campus Engagement Score</span>
                  <p className="text-2xl font-extrabold text-blue-400 mt-0.5">
                    Level {passport.gamification.level} <span className="text-xs font-normal text-slate-400">({passport.gamification.xp} XP)</span>
                  </p>
                  <span className="text-xs text-emerald-400 font-semibold mt-1 block">
                    ✓ {passport.gamification.totalEventsAttended} Verified Events
                  </span>
                </div>
              </div>
            </div>

            {/* VERIFIED SKILLS GRID */}
            <div>
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Compass className="text-blue-400" size={20} /> Verified Competency Matrix
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {passport.skills.map((skill, idx) => (
                  <div key={idx} className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/80 shadow-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-white">{skill.name}</h3>
                      <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        {skill.proficiency} • {skill.score}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full" style={{ width: `${skill.score}%` }}></div>
                    </div>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1">
                      <CheckCircle2 size={12} className="text-emerald-400" />
                      {skill.evidenceCount} verified campus evidence sources
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* VERIFIED CREDENTIALS */}
            <div>
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <FileCheck className="text-purple-400" size={20} /> Cryptographically Certified Credentials
              </h2>
              <div className="space-y-3">
                {passport.credentials.map((cred, idx) => (
                  <div key={idx} className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-bold text-white">{cred.title}</h4>
                        <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                          VALID PROOF
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{cred.description}</p>
                      <p className="text-[11px] font-mono text-slate-500 mt-1">
                        Credential ID: {cred.credentialId} • Issued: {new Date(cred.issueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Link
                      to={`/verify/credential/${cred.credentialId}`}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shrink-0 shadow-md shadow-blue-600/20"
                    >
                      <ExternalLink size={13} /> View Registry Proof
                    </Link>
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