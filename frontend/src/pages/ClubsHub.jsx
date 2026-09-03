import { useState, useEffect } from "react";
import api from "../api/api";
import AppNavbar from "../components/AppNavbar";
import Footer from "../components/Footer";
import {
  Users,
  Plus,
  Compass,
  Calendar,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  Shield,
  Layers,
} from "lucide-react";

export default function ClubsHub() {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    try {
      setLoading(true);
      const res = await api.get("/clubs");
      if (res.data.success) {
        setClubs(res.data.clubs);
      }
    } catch (err) {
      console.error("Error loading clubs:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleJoin = async (club) => {
    try {
      setActionLoading(club.id);
      if (club.isMember) {
        await api.post(`/clubs/${club.id}/leave`);
      } else {
        await api.post(`/clubs/${club.id}/join`);
      }
      fetchClubs();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update membership.");
    } finally {
      setActionLoading(null);
    }
  };

  const categories = ["ALL", "TECHNICAL", "CULTURAL", "SPORTS", "SOCIAL", "ENTREPRENEURSHIP"];

  const filteredClubs = clubs.filter((c) => {
    if (selectedCategory === "ALL") return true;
    return c.category === selectedCategory;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      <AppNavbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* HEADER */}
        <div className="mb-8">
          <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 inline-block mb-2">
            Campus Communities
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Clubs & Student Societies
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Join student organizations, attend exclusive workshops, and build leadership credentials for your Campus Passport.
          </p>
        </div>

        {/* CATEGORY BAR */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                selectedCategory === cat
                  ? "bg-slate-900 text-white shadow-md"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* CLUBS GRID */}
        {loading ? (
          <div className="text-center py-20">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-slate-500 text-sm">Discovering student clubs...</p>
          </div>
        ) : filteredClubs.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
            <Users className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">No clubs in this category</h3>
            <p className="text-slate-500 text-xs mt-1">Check back soon for new club registrations.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClubs.map((club) => (
              <div
                key={club.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-extrabold text-lg shadow-md shadow-blue-500/20">
                      {club.code?.slice(0, 3) || "CLB"}
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 uppercase tracking-wider">
                      {club.category}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900">{club.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {club.description}
                  </p>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-semibold">
                      <Users size={13} className="text-blue-600" /> {club.memberCount} Members
                    </span>
                    <span className="flex items-center gap-1 font-semibold">
                      <Calendar size={13} className="text-indigo-600" /> {club.eventCount} Events
                    </span>
                  </div>

                  <button
                    onClick={() => handleToggleJoin(club)}
                    disabled={actionLoading === club.id}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      club.isMember
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
                        : "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
                    }`}
                  >
                    {actionLoading === club.id ? (
                      "Updating..."
                    ) : club.isMember ? (
                      <>
                        <CheckCircle2 size={14} /> Member ({club.myRole || "MEMBER"})
                      </>
                    ) : (
                      <>
                        <Plus size={14} /> Join Community
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}