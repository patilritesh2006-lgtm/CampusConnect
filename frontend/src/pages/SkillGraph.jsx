import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import AppNavbar from "../components/AppNavbar";
import Footer from "../components/Footer";
import {
  Compass,
  CheckCircle2,
  Plus,
  Zap,
  TrendingUp,
  Award,
  Sparkles,
  Info,
  Calendar,
  X,
  ExternalLink,
} from "lucide-react";

export default function SkillGraph() {
  const [skillData, setSkillData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSkillName, setNewSkillName] = useState("");
  const [newSourceTitle, setNewSourceTitle] = useState("");
  const [newSourceType, setNewSourceType] = useState("PROJECT");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const res = await api.get("/skills");
      if (res.data.success) {
        setSkillData(res.data);
      }
    } catch (err) {
      console.error("Error fetching skills:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvidence = async (e) => {
    e.preventDefault();
    if (!newSkillName || !newSourceTitle) return;

    try {
      setSubmitting(true);
      const res = await api.post("/skills/evidence", {
        skillName: newSkillName,
        sourceTitle: newSourceTitle,
        sourceType: newSourceType,
        weightPoints: 15,
      });
      if (res.data.success) {
        setShowAddModal(false);
        setNewSkillName("");
        setNewSourceTitle("");
        fetchSkills();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add skill evidence.");
    } finally {
      setSubmitting(false);
    }
  };

  const categories = ["ALL", "TECHNICAL", "LEADERSHIP", "DESIGN", "COMMUNICATION"];

  const filteredSkills = (skillData?.skills || []).filter((s) => {
    if (selectedCategory === "ALL") return true;
    return s.skill.category === selectedCategory;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      <AppNavbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                Verified Intelligence
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Student Skill Graph & Competencies
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              Transparent proficiency scores calculated from verified event attendance, hackathons, and certifications.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/20 transition"
          >
            <Plus size={16} /> Add Project Evidence
          </button>
        </div>

        {/* SUMMARY CARDS */}
        {skillData?.summary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 font-semibold">Total Tracked Skills</span>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">{skillData.summary.totalSkills}</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 font-semibold">Verified Skills</span>
              <p className="text-2xl font-extrabold text-emerald-600 mt-1">{skillData.summary.verifiedSkills}</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 font-semibold">Expert Competencies</span>
              <p className="text-2xl font-extrabold text-indigo-600 mt-1">{skillData.summary.expertSkills}</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 font-semibold">Total Evidence Records</span>
              <p className="text-2xl font-extrabold text-blue-600 mt-1">{skillData.summary.totalEvidenceCount}</p>
            </div>
          </div>
        )}

        {/* CATEGORY FILTER BAR */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
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

        {/* SKILL LIST */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-slate-500 text-sm">Loading Skill Graph...</p>
          </div>
        ) : filteredSkills.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <Compass className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">No skills in this category yet</h3>
            <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-sm mx-auto">
              Attend campus workshops or submit project evidence to start building your verified competency matrix.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredSkills.map((s, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">{s.skill.name}</h3>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{s.skill.category}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-blue-600">{s.score}%</span>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{s.proficiency}</p>
                  </div>
                </div>

                {/* Score Bar */}
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${s.score}%` }}
                  ></div>
                </div>

                {/* Evidence History List */}
                <div className="pt-3 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-700 block mb-2">
                    Verified Evidence ({s.evidences.length})
                  </span>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                    {s.evidences.map((ev, eIdx) => (
                      <div key={eIdx} className="bg-slate-50 rounded-xl p-2 text-xs flex items-center justify-between border border-slate-100">
                        <div className="flex items-center gap-2 truncate">
                          <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                          <span className="font-semibold text-slate-800 truncate">{ev.sourceTitle}</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 uppercase shrink-0">
                          {ev.sourceType}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ADD EVIDENCE MODAL */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                <h3 className="text-lg font-bold text-slate-900">Add Project Skill Evidence</h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddEvidence} className="space-y-4 text-xs sm:text-sm">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Skill Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Python, React, Machine Learning"
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Evidence Source Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Cloud Microservices Capstone Project"
                    value={newSourceTitle}
                    onChange={(e) => setNewSourceTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Source Type</label>
                  <select
                    value={newSourceType}
                    onChange={(e) => setNewSourceType(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 text-xs sm:text-sm"
                  >
                    <option value="PROJECT">Personal / Capstone Project</option>
                    <option value="ASSESSMENT">Technical Coding Assessment</option>
                    <option value="HACKATHON">External Hackathon</option>
                    <option value="CLUB_ROLE">Club Leadership Contribution</option>
                  </select>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-slate-600 font-semibold text-xs hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition disabled:opacity-50"
                  >
                    {submitting ? "Adding..." : "Add Evidence"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}