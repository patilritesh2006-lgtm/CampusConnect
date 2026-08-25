import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  Calendar, 
  Bell, 
  UserCheck, 
  Award, 
  ShieldCheck, 
  BarChart3, 
  Megaphone, 
  Trophy, 
  ArrowRight,
  Search,
  CheckCircle2
} from "lucide-react";

function Features() {
  const navigate = useNavigate();
  const [quickCertCode, setQuickCertCode] = useState("");

  const handleQuickVerify = (e) => {
    e.preventDefault();
    if (!quickCertCode.trim()) return;
    navigate(`/verify-certificate/${encodeURIComponent(quickCertCode.trim().toUpperCase())}`);
  };

  const platformFeatures = [
    {
      icon: <Calendar size={28} className="text-blue-600" />,
      title: "Smart Event Discovery",
      description: "Browse hackathons, workshops, and guest lectures with category filters, capacity tracking, and one-click registration.",
      link: "/student-events",
      linkText: "Browse Events",
      badge: "Events & Hackathons",
    },
    {
      icon: <UserCheck size={28} className="text-emerald-600" />,
      title: "Live Attendance Tracking",
      description: "Mark attendance seamlessly with real-time roster sync, bulk roll-calls, and automated student notification alerts.",
      link: "/login",
      linkText: "Attendance Tools",
      badge: "Roll-Call & CSV",
    },
    {
      icon: <Award size={28} className="text-amber-600" />,
      title: "Verified Digital Certificates",
      description: "Earn cryptographic certificates with unique verification IDs, official seals, and high-resolution print/PDF templates.",
      link: "/student-certificates",
      linkText: "View Certificates",
      badge: "Tamper-Proof",
    },
    {
      icon: <ShieldCheck size={28} className="text-indigo-600" />,
      title: "Public Verification Portal",
      description: "Zero-login verification portal for employers and institutions to authenticate certificate codes instantly.",
      link: "/verify-certificate",
      linkText: "Verify Portal",
      badge: "Open Verification",
    },
    {
      icon: <Bell size={28} className="text-purple-600" />,
      title: "Real-Time In-App Alerts",
      description: "Interactive navbar bell with live unread counters notifying students of attendance, certificates, and notice updates.",
      link: "/login",
      linkText: "Notification Hub",
      badge: "Instant Sync",
    },
    {
      icon: <Trophy size={28} className="text-orange-600" />,
      title: "Gamification & Badges",
      description: "Earn Bronze, Silver, and Gold achievement badges and track your campus activity scoreboard with live attendance rates.",
      link: "/student-profile",
      linkText: "Check Achievements",
      badge: "5 Unlockable Badges",
    },
  ];

  return (
    <section className="py-20 bg-gray-50/70 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6 md:px-8 space-y-16">
        
        {/* SECTION HEADER */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-blue-600 font-bold text-xs uppercase tracking-widest bg-blue-50 px-3.5 py-1 rounded-full">
            Comprehensive Platform Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Everything Your College Needs, <br className="hidden sm:inline" />
            In One Unified System.
          </h2>
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
            CampusConnect replaces fragmented messaging groups and paper certificates with a modern, integrated campus ecosystem.
          </p>
        </div>

        {/* FEATURE GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {platformFeatures.map((feat, index) => (
            <div
              key={index}
              className="bg-white rounded-3xl p-7 shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100 shadow-sm">
                    {feat.icon}
                  </div>
                  <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                    {feat.badge}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {feat.title}
                </h3>

                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-6">
                  {feat.description}
                </p>
              </div>

              <Link
                to={feat.link}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition"
              >
                <span>{feat.linkText}</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          ))}
        </div>

        {/* QUICK CERTIFICATE VERIFICATION BANNER */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 text-xs font-bold px-3.5 py-1.5 rounded-full border border-blue-400/20">
              <ShieldCheck size={14} />
              <span>Public Credential Verification</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Have a Certificate Code? Verify It Instantly.
            </h3>

            <p className="text-gray-300 text-xs sm:text-sm max-w-xl mx-auto">
              Any student, recruiter, or faculty member can authenticate digital certificates issued by CampusConnect without creating an account.
            </p>

            <form onSubmit={handleQuickVerify} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto pt-2">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-4 top-3.5 text-gray-400" />
                <input
                  type="text"
                  value={quickCertCode}
                  onChange={(e) => setQuickCertCode(e.target.value)}
                  placeholder="e.g. CC-2026-A&RE-91D342"
                  className="w-full pl-11 pr-4 py-3 bg-white/10 text-white placeholder-gray-400 rounded-2xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400 text-xs font-mono"
                />
              </div>

              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-2xl text-xs shadow-lg transition whitespace-nowrap"
              >
                Verify Authenticity
              </button>
            </form>
          </div>
        </div>

      </div>
    </section>
  );
}

export default Features;