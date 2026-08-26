import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, Menu, X, Calendar, Award, Bell, ShieldCheck, LogOut, LayoutDashboard } from "lucide-react";

function Navbar() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch {
      setUser(null);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  const dashboardPath = user?.role === "ADMIN" ? "/admin-dashboard" : "/student-dashboard";

  return (
    <nav className="w-full bg-white/95 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <img
            src="/logo.svg"
            alt="CampusConnect Logo"
            className="w-10 h-10 object-contain group-hover:scale-105 transition"
          />
          <div>
            <span className="text-xl font-extrabold text-slate-900 tracking-tight">
              Campus<span className="text-blue-600">Connect</span>
            </span>
            <span className="hidden sm:inline-block text-[10px] text-gray-400 font-semibold uppercase tracking-wider block -mt-1">
              Event & Activity Hub
            </span>
          </div>
        </Link>

        {/* DESKTOP NAV LINKS */}
        <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-gray-600">
          <Link to="/" className="hover:text-blue-600 transition">
            Home
          </Link>
          <Link to="/student-events" className="hover:text-blue-600 transition flex items-center gap-1.5">
            <Calendar size={15} />
            Events
          </Link>
          <Link to="/calendar" className="hover:text-blue-600 transition">
            Calendar
          </Link>
          <Link to="/announcements" className="hover:text-blue-600 transition flex items-center gap-1.5">
            <Bell size={15} />
            Notices
          </Link>
          <Link to="/verify-certificate" className="hover:text-blue-600 transition flex items-center gap-1.5 text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            <ShieldCheck size={15} />
            Verify Certificate
          </Link>
        </div>

        {/* AUTH BUTTONS */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                to={dashboardPath}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition"
              >
                <LayoutDashboard size={15} />
                Dashboard ({user.role})
              </Link>
              <button
                onClick={handleLogout}
                title="Logout"
                className="p-2.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-gray-700 hover:text-blue-600 font-bold text-xs px-4 py-2.5 rounded-xl transition"
              >
                Sign In
              </Link>
              <Link
                to="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition"
              >
                Register Free
              </Link>
            </div>
          )}
        </div>

        {/* MOBILE MENU TOGGLE */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-gray-600 hover:text-gray-900 p-2 rounded-lg"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 px-6 py-4 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold text-gray-700 hover:text-blue-600 py-2"
          >
            Home
          </Link>
          <Link
            to="/student-events"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold text-gray-700 hover:text-blue-600 py-2"
          >
            College Events
          </Link>
          <Link
            to="/calendar"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold text-gray-700 hover:text-blue-600 py-2"
          >
            Calendar Schedule
          </Link>
          <Link
            to="/announcements"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold text-gray-700 hover:text-blue-600 py-2"
          >
            Campus Notices
          </Link>
          <Link
            to="/verify-certificate"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold text-blue-600 py-2"
          >
            Verify Certificate
          </Link>

          <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
            {user ? (
              <>
                <Link
                  to={dashboardPath}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center bg-blue-600 text-white font-bold py-2.5 rounded-xl text-xs"
                >
                  Go to {user.role === "ADMIN" ? "Admin" : "Student"} Dashboard
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-center bg-gray-100 text-gray-700 font-bold py-2.5 rounded-xl text-xs"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center bg-blue-600 text-white font-bold py-2.5 rounded-xl text-xs"
              >
                Sign In / Register
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;