import { useEffect, useState } from "react";
import API from "../api/api";
import AppNavbar from "../components/AppNavbar";
import { Megaphone, Plus, Trash2, X } from "lucide-react";

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "GENERAL",
    priority: "NORMAL",
  });
  const [submitting, setSubmitting] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user.role === "ADMIN";

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await API.get("/announcements");
      if (res.data.success) {
        setAnnouncements(res.data.announcements || []);
      }
    } catch (err) {
      console.error("Fetch announcements error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await API.post("/announcements", formData);
      if (res.data.success) {
        setAnnouncements([res.data.announcement, ...announcements]);
        setShowCreateModal(false);
        setFormData({ title: "", content: "", category: "GENERAL", priority: "NORMAL" });
        alert("Announcement published and broadcasted to students!");
      }
    } catch (err) {
      alert("Failed to publish: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this notice?")) return;
    try {
      await API.delete("/announcements/" + id);
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      alert("Failed to delete announcement.");
    }
  };

  const filtered = announcements.filter((a) =>
    categoryFilter === "ALL" ? true : a.category === categoryFilter
  );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <AppNavbar role={user.role} />

      <main className="p-6 md:p-8 flex-1">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border border-gray-100">
            <div>
              <div className="flex items-center gap-2 text-purple-600 font-semibold text-sm mb-1">
                <Megaphone size={18} />
                Notice Board
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Campus Announcements</h1>
              <p className="text-gray-600 text-sm mt-1">
                Official notices, deadline reminders, schedule updates, and competition broadcasts.
              </p>
            </div>

            {isAdmin && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm shadow-md transition"
              >
                <Plus size={16} />
                Publish Notice
              </button>
            )}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {["ALL", "GENERAL", "IMPORTANT", "EVENT", "WORKSHOP", "COMPETITION"].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={"px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition " + (categoryFilter === cat ? "bg-purple-600 text-white shadow-sm" : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200")}
              >
                {cat}
              </button>
            ))}
          </div>

          {loading && (
            <div className="bg-white rounded-2xl shadow-md p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-600 border-t-transparent mb-3"></div>
              <p className="text-gray-600">Loading notices...</p>
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="bg-white rounded-2xl shadow-md p-12 text-center border border-gray-100">
              <div className="text-4xl mb-3">📢</div>
              <h3 className="text-xl font-bold text-gray-800">No Announcements Found</h3>
              <p className="text-gray-500 text-sm mt-1">There are no active notices matching your filter.</p>
            </div>
          )}

          {!loading && filtered.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  className={"bg-white rounded-2xl shadow-md p-6 border flex flex-col justify-between hover:shadow-lg transition " + (item.priority === "URGENT" ? "border-red-300 bg-red-50/20" : item.priority === "HIGH" ? "border-amber-300 bg-amber-50/20" : "border-gray-100")}
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span
                        className={"text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase " + (item.priority === "URGENT" ? "bg-red-100 text-red-700" : item.priority === "HIGH" ? "bg-amber-100 text-amber-700" : "bg-purple-100 text-purple-700")}
                      >
                        {item.priority === "URGENT" ? "🚨 Urgent" : item.priority === "HIGH" ? "⚠️ High Priority" : item.category}
                      </span>

                      <span className="text-[11px] text-gray-400">
                        {new Date(item.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>
                    <p className="text-gray-700 text-sm mt-2 leading-relaxed whitespace-pre-line">{item.content}</p>
                  </div>

                  {isAdmin && (
                    <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1 font-semibold transition"
                      >
                        <Trash2 size={14} /> Delete Notice
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Megaphone size={18} className="text-purple-600" />
                Publish Campus Notice
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Notice Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Hackathon Registration Extended"
                  className="w-full p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2.5 border rounded-xl text-sm bg-white"
                  >
                    <option value="GENERAL">General</option>
                    <option value="IMPORTANT">Important</option>
                    <option value="EVENT">Event</option>
                    <option value="WORKSHOP">Workshop</option>
                    <option value="COMPETITION">Competition</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full p-2.5 border rounded-xl text-sm bg-white"
                  >
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent 🚨</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Notice Content *</label>
                <textarea
                  rows={4}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Write the full announcement message here..."
                  className="w-full p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-purple-500"
                  required
                ></textarea>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 rounded-xl text-xs transition shadow-md"
                >
                  {submitting ? "Publishing..." : "Broadcast Notice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}