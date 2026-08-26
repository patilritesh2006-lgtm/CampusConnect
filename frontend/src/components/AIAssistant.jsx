import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../api/api";
import {
  Bot,
  X,
  Send,
  Sparkles,
  MessageSquare,
  ExternalLink,
  ChevronRight,
} from "lucide-react";

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "👋 Hi! I am your CampusConnect AI Assistant. Ask me about upcoming events, hackathons, your certificates, or attendance status!",
      suggestedLinks: [],
    },
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setLoading(true);

    try {
      const res = await API.post("/ai/assistant", { message: userText });
      if (res.data.success) {
        setMessages((prev) => [
          ...prev,
          {
            sender: "ai",
            text: res.data.reply,
            suggestedLinks: res.data.suggestedLinks || [],
          },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "I encountered an error looking up campus records. Please try again.",
          suggestedLinks: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-3.5 rounded-full shadow-2xl transition hover:scale-105 border-2 border-white/20 group"
        >
          <div className="relative">
            <Bot size={22} className="animate-bounce" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full"></span>
          </div>
          <span className="font-bold text-sm">Ask Campus AI</span>
        </button>
      )}

      {/* Chat Drawer Window */}
      {isOpen && (
        <div className="bg-white w-[360px] sm:w-[420px] h-[540px] rounded-3xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-4 text-white flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                <Bot size={20} />
              </div>
              <div>
                <h4 className="font-extrabold text-sm flex items-center gap-1.5">
                  Campus AI Assistant <Sparkles size={14} className="text-amber-300" />
                </h4>
                <p className="text-[11px] text-blue-100 font-medium">Instant Campus Intelligence</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-white/20 rounded-xl transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50 text-sm">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${
                  m.sender === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl whitespace-pre-line leading-relaxed ${
                    m.sender === "user"
                      ? "bg-blue-600 text-white rounded-br-none shadow-sm"
                      : "bg-white text-slate-800 border border-gray-200 rounded-bl-none shadow-sm"
                  }`}
                >
                  {m.text}
                </div>

                {/* Quick Link Recommendations */}
                {m.suggestedLinks && m.suggestedLinks.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {m.suggestedLinks.map((link, lIdx) => (
                      <Link
                        key={lIdx}
                        to={link.url}
                        onClick={() => setIsOpen(false)}
                        className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1 transition"
                      >
                        {link.label} <ChevronRight size={12} />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-gray-500 bg-white p-3 rounded-2xl border border-gray-200 w-fit">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></span>
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse delay-75"></span>
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse delay-150"></span>
                </div>
                <span>Scanning campus events...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="px-4 py-2 bg-white border-t border-gray-100 flex gap-1.5 overflow-x-auto text-[11px] font-semibold text-gray-600 scrollbar-none">
            <button
              onClick={() => {
                setInput("What hackathons are happening?");
              }}
              className="bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-lg whitespace-nowrap transition"
            >
              🚀 Hackathons
            </button>
            <button
              onClick={() => {
                setInput("How many certificates do I have?");
              }}
              className="bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-lg whitespace-nowrap transition"
            >
              📜 My Certificates
            </button>
            <button
              onClick={() => {
                setInput("What is my attendance rate?");
              }}
              className="bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-lg whitespace-nowrap transition"
            >
              📊 Attendance
            </button>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-200 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about campus events..."
              className="flex-1 px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl transition"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
