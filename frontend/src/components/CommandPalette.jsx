import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Compass,
  Calendar,
  Users,
  Award,
  FileCheck,
  Zap,
  Sparkles,
  X,
  ArrowRight,
  Shield,
} from "lucide-react";

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const navigationItems = [
    { label: "My Campus Passport", path: "/passport", icon: Shield, category: "Identity" },
    { label: "Verified Skill Graph", path: "/skills", icon: Compass, category: "Competencies" },
    { label: "Explore Campus Events", path: "/student-events", icon: Calendar, category: "Discovery" },
    { label: "Clubs & Student Societies", path: "/clubs", icon: Users, category: "Communities" },
    { label: "Campus Leaderboard", path: "/leaderboard", icon: Zap, category: "Gamification" },
    { label: "My Registrations", path: "/my-registrations", icon: FileCheck, category: "Activity" },
    { label: "Event Calendar", path: "/calendar", icon: Calendar, category: "Schedule" },
    { label: "Campus Announcements", path: "/announcements", icon: Award, category: "News" },
  ];

  const filteredItems = navigationItems.filter((item) =>
    item.label.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (path) => {
    navigate(path);
    setIsOpen(false);
    setSearch("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-start justify-center pt-24 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
          <Search size={18} className="text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type a command or search events, skills, passport..."
            className="flex-1 text-sm bg-transparent focus:outline-none text-slate-900 placeholder:text-slate-400 font-medium"
          />
          <kbd className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-500 rounded border border-slate-200">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              No matching commands or pages found.
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(item.path)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-2xl hover:bg-slate-50 text-left transition text-xs group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold group-hover:bg-blue-600 group-hover:text-white transition">
                      <Icon size={16} />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block text-xs sm:text-sm">{item.label}</span>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider">{item.category}</span>
                    </div>
                  </div>
                  <ArrowRight size={14} className="text-slate-300 group-hover:text-blue-600 transition" />
                </button>
              );
            })
          )}
        </div>

        {/* Footer Hint */}
        <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Navigate using keyboard or mouse</span>
          <span className="font-semibold text-blue-600 flex items-center gap-1">
            <Sparkles size={12} /> CampusConnect Quick Command
          </span>
        </div>
      </div>
    </div>
  );
}