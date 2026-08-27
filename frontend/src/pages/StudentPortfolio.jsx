import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../api/api";
import {
  Award,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Globe,
  Code2,
  Share2,
  ShieldCheck,
  Sparkles,
  Trophy,
} from "lucide-react";

export default function StudentPortfolio() {
  const { username } = useParams();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPortfolio = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get(`/users/portfolio/${username}`);
      if (res.data.success) {
        setPortfolio(res.data.portfolio);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load student portfolio."
      );
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-4">
          <ShieldCheck size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Portfolio Not Available</h2>
        <p className="text-slate-500 max-w-md mb-6">{error || "This portfolio does not exist or is set to private."}</p>
        <Link to="/" className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl text-sm hover:bg-blue-700 transition">
          Return to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-slate-100">
      {/* Top Banner Navigation */}
      <nav className="border-b border-slate-700/50 bg-slate-900/60 backdrop-blur-md px-6 py-4 flex justify-between items-center max-w-6xl mx-auto">
        <Link to="/" className="flex items-center gap-2 group">
          <img src="/logo-icon.png" alt="CampusConnect" className="w-8 h-8 object-contain" />
          <span className="font-bold text-white text-lg tracking-tight">
            Campus<span className="text-blue-400">Connect</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full flex items-center gap-1 font-semibold">
            <CheckCircle2 size={13} /> Verified Student Portfolio
          </span>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12 space-y-10">
        {/* Header Profile Card */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10 text-center md:text-left">
            <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 p-1 flex items-center justify-center shadow-lg">
              <div className="w-full h-full bg-slate-900 rounded-[22px] flex items-center justify-center text-4xl font-extrabold text-blue-400">
                {portfolio.fullName.charAt(0)}
              </div>
            </div>

            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <h1 className="text-3xl font-extrabold text-white">{portfolio.fullName}</h1>
                <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold px-3 py-1 rounded-full">
                  Level {portfolio.level} ({portfolio.xp} XP)
                </span>
              </div>

              <p className="text-slate-400 text-sm font-medium">
                {portfolio.department} {portfolio.year ? `• Year ${portfolio.year}` : ""}
              </p>

              <p className="text-slate-300 text-sm leading-relaxed max-w-2xl">
                {portfolio.bio}
              </p>

              {/* Social Links */}
              <div className="flex items-center justify-center md:justify-start gap-3 pt-2">
                {portfolio.githubUrl && (
                  <a href={portfolio.githubUrl} target="_blank" rel="noreferrer" className="p-2 bg-slate-700/60 hover:bg-slate-700 rounded-xl text-slate-300 transition" title="GitHub">
                    <Code2 size={18} />
                  </a>
                )}
                {portfolio.linkedinUrl && (
                  <a href={portfolio.linkedinUrl} target="_blank" rel="noreferrer" className="p-2 bg-slate-700/60 hover:bg-slate-700 rounded-xl text-slate-300 transition" title="LinkedIn">
                    <Share2 size={18} />
                  </a>
                )}
                {portfolio.websiteUrl && (
                  <a href={portfolio.websiteUrl} target="_blank" rel="noreferrer" className="p-2 bg-slate-700/60 hover:bg-slate-700 rounded-xl text-slate-300 transition" title="Website">
                    <Globe size={18} />
                  </a>
                )}
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
              <div className="bg-slate-900/60 border border-slate-700/50 p-4 rounded-2xl text-center">
                <p className="text-2xl font-extrabold text-blue-400">{portfolio.totalEventsAttended}</p>
                <p className="text-[11px] text-slate-400 uppercase font-semibold mt-0.5">Events Attended</p>
              </div>
              <div className="bg-slate-900/60 border border-slate-700/50 p-4 rounded-2xl text-center">
                <p className="text-2xl font-extrabold text-amber-400">{portfolio.totalCertificatesEarned}</p>
                <p className="text-[11px] text-slate-400 uppercase font-semibold mt-0.5">Certificates</p>
              </div>
            </div>
          </div>
        </div>

        {/* Skills Section */}
        {portfolio.skills && portfolio.skills.length > 0 && (
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-3xl p-8 backdrop-blur-xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Sparkles size={18} className="text-blue-400" />
              Verified Skills & Technical Competencies
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {portfolio.skills.map((skill, i) => (
                <span key={i} className="bg-slate-900/80 border border-slate-700 text-slate-200 text-xs font-semibold px-3.5 py-1.5 rounded-xl">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Gamification Badges */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-3xl p-8 backdrop-blur-xl">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Trophy size={18} className="text-amber-400" />
            Campus Achievement Badges
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {portfolio.badges.map((b) => (
              <div
                key={b.id}
                className={`p-4 rounded-2xl border text-center transition ${
                  b.unlocked
                    ? "bg-slate-900/80 border-amber-500/30 text-slate-200"
                    : "bg-slate-900/30 border-slate-800 text-slate-600 opacity-60"
                }`}
              >
                <div className="text-3xl mb-2">{b.icon}</div>
                <h4 className="text-xs font-bold mb-1">{b.name}</h4>
                <p className="text-[10px] text-slate-400 line-clamp-2">{b.description}</p>
                <span className={`inline-block text-[9px] font-bold mt-2 px-2 py-0.5 rounded-full ${
                  b.unlocked ? "bg-amber-400/20 text-amber-300" : "bg-slate-800 text-slate-500"
                }`}>
                  {b.unlocked ? "Unlocked" : "Locked"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Verified Certificates */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-3xl p-8 backdrop-blur-xl">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Award size={18} className="text-blue-400" />
            Verified Participation Certificates ({portfolio.certificates.length})
          </h3>

          {portfolio.certificates.length === 0 ? (
            <p className="text-slate-400 text-sm">No certificates published yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {portfolio.certificates.map((cert) => (
                <div key={cert.id} className="bg-slate-900/80 border border-slate-700/80 p-5 rounded-2xl hover:border-blue-500/50 transition flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                      {cert.event.category}
                    </span>
                    <h4 className="text-base font-bold text-white mt-2">{cert.event.title}</h4>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                      <Calendar size={13} /> Issued {new Date(cert.issueDate).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <span className="font-mono text-xs text-slate-400 font-bold">{cert.certificateCode}</span>
                    <Link
                      to={`/verify-certificate/${cert.certificateCode}`}
                      className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold"
                    >
                      Verify Authenticity <ExternalLink size={12} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
