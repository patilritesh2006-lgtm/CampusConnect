import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/api";
import Footer from "../components/Footer";
import {
  ShieldCheck,
  Award,
  CheckCircle2,
  Lock,
  Building2,
  Calendar,
  ExternalLink,
  Zap,
  Briefcase,
  Printer,
  Compass,
  FileCheck,
} from "lucide-react";

export default function RecruiterVerification() {
  const { username } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRecruiterProfile();
  }, [username]);

  const fetchRecruiterProfile = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get(`/passport/${username}`);
      if (res.data.success) {
        setData(res.data.passport);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Candidate profile not found or private.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case "WINNER":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "SPEAKER":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "ORGANIZER":
      case "COORDINATOR":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "VOLUNTEER":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-400 font-mono text-sm">Querying Cryptographic Academic Registry...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-between text-white p-6">
        <div className="max-w-md mx-auto my-auto bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl">
          <Lock className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-white mb-2">Candidate Record Unavailable</h2>
          <p className="text-slate-400 text-xs leading-relaxed mb-6">{error || "This student record is set to private."}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition"
          >
            Go to Homepage
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const { identity, gamification, skills, achievements, credentials, verifiedExperience } = data;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-blue-500 selection:text-white print:bg-white print:text-black">
      {/* Header bar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-30 px-6 py-4 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
            C
          </div>
          <div>
            <span className="font-extrabold text-sm tracking-tight text-white block">CampusConnect</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Recruiter Verification Portal</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 transition"
          >
            <Printer size={14} /> Download Verified Report
          </button>
        </div>
      </header>

      <main className="max-w-5xl w-full mx-auto px-4 sm:px-6 py-10 space-y-8">
        {/* CANDIDATE HEADER HERO */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl print:border-slate-300">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 p-1 shrink-0">
                <div className="w-full h-full bg-slate-950 rounded-xl flex items-center justify-center text-3xl font-black text-white">
                  {identity.fullName?.charAt(0) || "C"}
                </div>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                  <h1 className="text-2xl font-black text-white">{identity.fullName}</h1>
                  <span className="px-3 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                    <ShieldCheck size={13} /> Institutional Attestation Valid
                  </span>
                </div>
                <p className="text-slate-400 text-xs flex items-center gap-2">
                  <Building2 size={14} className="text-slate-500" />
                  {identity.department || "Academic Major"} • {identity.institution}
                </p>
                {identity.bio && <p className="text-slate-400 text-xs mt-2 max-w-xl">{identity.bio}</p>}
              </div>
            </div>

            <div className="text-left sm:text-right bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 shrink-0">
              <span className="text-[11px] text-slate-500 font-bold block uppercase tracking-wider">Candidate Engagement</span>
              <p className="text-2xl font-black text-emerald-400 mt-0.5">
                {gamification.engagementScore}<span className="text-xs text-slate-500 font-normal">/100</span>
              </p>
              <span className="text-[10px] text-slate-400 font-mono block mt-1">Level {gamification.level} • {gamification.totalContributionHours} Verified Hours</span>
            </div>
          </div>
        </div>

        {/* VERIFIED SKILLS */}
        {skills && skills.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Compass size={18} className="text-blue-400" />
              <h3 className="text-base font-bold text-white">Verified Competency Matrix</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {skills.map((s, idx) => (
                <div key={idx} className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">{s.name}</h4>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">{s.category}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-blue-400">{s.proficiency} ({s.score}%)</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${s.score}%` }}></div>
                  </div>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1">
                    <CheckCircle2 size={12} className="text-emerald-400" />
                    {s.confidenceText || `${s.score}% verified proficiency based on ${s.evidenceCount} evidence items`}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* VERIFIED EXPERIENCE TIMELINE */}
        {verifiedExperience && verifiedExperience.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Briefcase size={18} className="text-indigo-400" />
              <h3 className="text-base font-bold text-white">Verified Campus Involvement & Roles</h3>
            </div>

            <div className="space-y-3">
              {verifiedExperience.map((exp, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-xs sm:text-sm font-bold text-white">{exp.eventTitle}</h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getRoleBadge(exp.role)}`}>
                        {exp.role}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {new Date(exp.eventDate).toLocaleDateString()} • {exp.contributionHours} Verified Contribution Hours
                    </p>
                  </div>

                  <span className="text-emerald-400 text-[11px] font-mono font-bold flex items-center gap-1 shrink-0">
                    <CheckCircle2 size={13} /> QR Verified
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* VERIFIABLE CREDENTIALS */}
        {credentials && credentials.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <FileCheck size={18} className="text-emerald-400" />
              <h3 className="text-base font-bold text-white">Cryptographic Verifiable Credentials</h3>
            </div>

            <div className="space-y-3">
              {credentials.map((cred, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-white">{cred.title}</h4>
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold px-2 py-0.5 rounded-md">VALID</span>
                    </div>
                    <p className="text-[11px] text-slate-400">{cred.description}</p>
                    <p className="text-[10px] font-mono text-slate-500">SHA-256 Hash: {cred.cryptoHash?.slice(0, 24)}...</p>
                  </div>

                  <Link
                    to={`/verify/credential/${cred.credentialId}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition shrink-0"
                  >
                    <ExternalLink size={13} /> Verify Registry
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}