import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import NotificationBell from "./NotificationBell";
import { LogOut, Menu, X } from "lucide-react";

export default function AppNavbar({ role }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const userString = localStorage.getItem("user");
  let user = {};
  try {
    user = JSON.parse(userString || "{}");
  } catch (e) {}

  const currentRole = role || user.role || "STUDENT";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const studentLinks = [
    { name: "Dashboard", path: "/student-dashboard" },
    { name: "Events", path: "/student-events" },
    { name: "My Registrations", path: "/my-registrations" },
    { name: "Certificates", path: "/student-certificates" },
    { name: "Calendar", path: "/calendar" },
    { name: "Announcements", path: "/announcements" },
  ];

  const adminLinks = [
    { name: "Dashboard", path: "/admin-dashboard" },
    { name: "Students", path: "/admin-students" },
    { name: "Certificates", path: "/admin-certificates" },
    { name: "Analytics", path: "/admin-analytics" },
    { name: "Announcements", path: "/announcements" },
    { name: "Calendar", path: "/calendar" },
  ];

  const links = currentRole === "ADMIN" ? adminLinks : studentLinks;
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-3">
            <Link to={currentRole === "ADMIN" ? "/admin-dashboard" : "/student-dashboard"} className="flex items-center gap-2 group">
              <img
                src="/logo-icon.png"
                alt="CampusConnect Logo"
                className="w-9 h-9 object-contain group-hover:scale-105 transition"
              />
              <span className="text-xl font-extrabold text-slate-900 tracking-tight hidden sm:inline">
                Campus<span className="text-blue-600">Connect</span>
              </span>
            </Link>
            <span
              className={"text-[11px] font-bold px-2 py-0.5 rounded-full " + (currentRole === "ADMIN" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700")}
            >
              {currentRole === "ADMIN" ? "Admin Portal" : "Student"}
            </span>
          </div>

          <div className="hidden lg:flex items-center space-x-1">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={"px-3 py-2 rounded-lg text-xs font-semibold transition " + (isActive(link.path) ? "bg-blue-600 text-white shadow-sm" : "text-gray-600 hover:text-blue-600 hover:bg-gray-50")}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <NotificationBell />

            <Link
              to="/student-profile"
              className={"flex items-center gap-2 p-1.5 rounded-xl border transition " + (isActive("/student-profile") ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-200 hover:bg-gray-50 text-gray-700")}
              title="View Profile & Achievements"
            >
              <div className="w-7 h-7 rounded-lg bg-gray-200 text-gray-700 flex items-center justify-center font-bold text-xs">
                {user.fullName ? user.fullName[0].toUpperCase() : "U"}
              </div>
              <span className="text-xs font-medium hidden md:inline truncate max-w-[100px]">
                {user.fullName ? user.fullName.split(" ")[0] : "Profile"}
              </span>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1 bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-600 px-3 py-2 rounded-xl text-xs font-semibold transition"
              title="Logout"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Logout</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-blue-600 rounded-lg"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white px-4 pt-2 pb-4 space-y-1">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={"block px-3 py-2 rounded-lg text-sm font-semibold transition " + (isActive(link.path) ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100")}
            >
              {link.name}
            </Link>
          ))}
          <Link
            to="/student-profile"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100"
          >
            My Profile & Badges
          </Link>
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}