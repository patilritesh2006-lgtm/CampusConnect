import { useState } from "react";
import api from "../api/api";
import { Sparkles, X, Check, ArrowRight } from "lucide-react";

export default function AIEventCreatorModal({ isOpen, onClose, onApplyDraft }) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedDraft, setGeneratedDraft] = useState(null);

  if (!isOpen) return null;

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    try {
      setLoading(true);
      const res = await api.post("/ai/event-draft", { prompt });
      if (res.data.success) {
        setGeneratedDraft(res.data.draft);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to generate event blueprint.");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (generatedDraft && onApplyDraft) {
      onApplyDraft(generatedDraft);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Sparkles size={16} />
            </div>
            <h3 className="text-base font-bold text-slate-900">AI Event Blueprint Creator</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        {!generatedDraft ? (
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Describe the Event You Want to Create
              </label>
              <textarea
                required
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. Create an intensive 2-hour Hands-on Machine Learning Workshop with Python and Scikit-Learn for 2nd and 3rd year students..."
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm text-slate-900 leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-600 font-semibold text-xs hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-xs font-bold rounded-xl transition shadow-md shadow-indigo-500/20 disabled:opacity-50"
              >
                {loading ? "Generating Blueprint..." : "Draft Event Blueprint"}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="bg-indigo-50/60 p-4 rounded-2xl border border-indigo-100 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-indigo-900 text-sm">{generatedDraft.title}</span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-200 text-indigo-800 text-[10px] font-bold uppercase">
                  {generatedDraft.category}
                </span>
              </div>
              <p className="text-slate-600 text-xs leading-relaxed">{generatedDraft.description}</p>
              <div className="pt-2 border-t border-indigo-100 flex flex-wrap gap-2 text-[11px] text-indigo-700">
                <span>📍 Venue: {generatedDraft.venue}</span>
                <span>👥 Suggested Capacity: {generatedDraft.capacity}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setGeneratedDraft(null)}
                className="px-4 py-2 text-slate-600 font-semibold text-xs hover:bg-slate-100 rounded-xl"
              >
                Try Again
              </button>
              <button
                onClick={handleApply}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-md shadow-emerald-500/20"
              >
                <Check size={16} /> Apply to Event Form
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}