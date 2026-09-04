import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import {
  Bot,
  Send,
  X,
  Sparkles,
  ExternalLink,
  Zap,
  Rocket,
} from "lucide-react";

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "👋 Hi! I am your AI Campus Copilot 2.0. I can perform instant event registrations, audit your internship readiness, and calculate your verified skill graph. What would you like to do?",
      suggestedActions: [
        { label: "📊 Internship Readiness Audit", query: "What am I missing to become internship-ready?" },
        { label: "📅 Top Events This Week", query: "What events should I attend this week?" },
        { label: "🎯 My Verified Skills", query: "What skills am I developing?" },
      ],
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && typeof messagesEndRef.current?.scrollIntoView === "function") {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = async (messageText) => {
    const query = messageText || input;
    if (!query.trim() || loading) return;

    const userMsg = { role: "user", content: query };
    setMessages((prev) => [...prev, userMsg]);
    if (!messageText) setInput("");
    setLoading(true);

    try {
      const res = await api.post("/ai/copilot", { message: query });
      if (res.data.success) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: res.data.reply,
            suggestedActions: res.data.suggestedActions || [],
          },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an issue connecting to the campus intelligence registry. Please try again.",
          suggestedActions: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:scale-105 text-white rounded-full shadow-2xl transition duration-300 font-bold text-xs"
        >
          <Sparkles size={16} className="animate-pulse" />
          <span>AI Campus Copilot</span>
        </button>
      )}

      {/* Copilot Chat Drawer */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[92vw] sm:w-[440px] h-[600px] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold">
                <Bot size={18} />
              </div>
              <div>
                <h4 className="font-extrabold text-sm flex items-center gap-1.5">
                  AI Campus Copilot 2.0 <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                </h4>
                <p className="text-[10px] text-slate-400">Context-Aware Academic Intelligence & Actions</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[90%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-br-none shadow-md shadow-blue-500/10 font-medium"
                      : "bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-xs whitespace-pre-line font-normal"
                  }`}
                >
                  {msg.content}
                </div>

                {/* Suggested Action Links / Prompts */}
                {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 max-w-[90%]">
                    {msg.suggestedActions.map((act, aIdx) =>
                      act.link ? (
                        <Link
                          key={aIdx}
                          to={act.link}
                          onClick={() => setIsOpen(false)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-blue-50 border border-blue-200 text-blue-600 rounded-lg text-[11px] font-bold shadow-xs transition"
                        >
                          {act.label} <ExternalLink size={11} />
                        </Link>
                      ) : (
                        <button
                          key={aIdx}
                          onClick={() => handleSend(act.query || act.label)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold transition"
                        >
                          {act.label}
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-slate-400 bg-white p-3 rounded-2xl border border-slate-200 w-fit">
                <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span>Copilot is querying campus intelligence registry...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask Copilot or say 'Register me for #1'..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs text-slate-800 font-medium"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition disabled:opacity-40"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}