import { Link } from "react-router-dom";
import { GraduationCap, ShieldCheck, Calendar, Bell, Award, Heart } from "lucide-react";

function Footer() {
  return (
    <footer className="bg-slate-950 text-white pt-16 pb-12 border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          
          {/* BRAND COLUMN */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <img src="/logo-icon.png" alt="CampusConnect" className="w-10 h-10 object-contain" />
              <span className="text-xl font-extrabold text-white tracking-tight">
                Campus<span className="text-blue-400">Connect</span>
              </span>
            </Link>
            
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-sm">
              The next-generation college activity management platform. Making campus events, live attendance tracking, and verified digital credentials seamless, organized, and accessible.
            </p>

            <div className="flex items-center gap-2 text-xs text-slate-400 pt-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>All Systems Operational (v2.0)</span>
            </div>
          </div>

          {/* QUICK LINKS */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">
              Explore Campus
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link to="/student-events" className="hover:text-blue-400 transition flex items-center gap-1.5">
                  <Calendar size={13} />
                  College Events
                </Link>
              </li>
              <li>
                <Link to="/calendar" className="hover:text-blue-400 transition">
                  Schedule Grid
                </Link>
              </li>
              <li>
                <Link to="/announcements" className="hover:text-blue-400 transition flex items-center gap-1.5">
                  <Bell size={13} />
                  Notice Board
                </Link>
              </li>
              <li>
                <Link to="/verify-certificate" className="hover:text-blue-400 transition flex items-center gap-1.5 text-blue-400">
                  <ShieldCheck size={13} />
                  Public Verification
                </Link>
              </li>
            </ul>
          </div>

          {/* STUDENT WORKSPACE */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">
              Student Hub
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link to="/student-dashboard" className="hover:text-blue-400 transition">
                  Student Dashboard
                </Link>
              </li>
              <li>
                <Link to="/my-registrations" className="hover:text-blue-400 transition">
                  My Registrations
                </Link>
              </li>
              <li>
                <Link to="/student-certificates" className="hover:text-blue-400 transition flex items-center gap-1.5">
                  <Award size={13} />
                  Earned Certificates
                </Link>
              </li>
              <li>
                <Link to="/student-profile" className="hover:text-blue-400 transition">
                  Profile & Badges
                </Link>
              </li>
            </ul>
          </div>

          {/* ADMIN & ACCESS */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">
              Administration
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link to="/admin-dashboard" className="hover:text-blue-400 transition">
                  Admin Control Center
                </Link>
              </li>
              <li>
                <Link to="/admin-analytics" className="hover:text-blue-400 transition">
                  Analytics & Reports
                </Link>
              </li>
              <li>
                <Link to="/admin-certificates" className="hover:text-blue-400 transition">
                  Credential Registry
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-blue-400 transition">
                  Admin Login
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* BOTTOM COPYRIGHT */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 CampusConnect. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart size={13} className="text-red-500 fill-red-500" /> for colleges and students
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;