import React, { useState } from "react";
import API from "../api/api";
import { QrCode, X, CheckCircle2, AlertCircle, Camera } from "lucide-react";

export default function QRScannerModal({ isOpen, onClose, onCheckInSuccess }) {
  const [qrInput, setQrInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!qrInput.trim()) return;

    setLoading(true);
    setFeedback(null);

    try {
      const parts = qrInput.trim().split(".");
      const eventId = parts[0];

      const res = await API.post("/attendance/checkin-qr", {
        eventId,
        qrToken: qrInput.trim(),
      });

      if (res.data.success) {
        setFeedback({
          type: "success",
          message: res.data.message || "Attendance recorded successfully! +50 XP awarded.",
        });
        if (onCheckInSuccess) onCheckInSuccess();
        setTimeout(() => {
          onClose();
          setFeedback(null);
          setQrInput("");
        }, 1800);
      }
    } catch (err) {
      setFeedback({
        type: "error",
        message: err.response?.data?.message || "Check-in failed. Please verify the QR token.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <QrCode size={22} />
            </div>
            <div>
              <h3 className="font-extrabold text-gray-900 text-base">Event QR Check-In</h3>
              <p className="text-xs text-gray-500">Scan or paste rotating event code</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2.5 ${
              feedback.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 size={18} className="text-green-600 flex-shrink-0" />
            ) : (
              <AlertCircle size={18} className="text-red-600 flex-shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* QR Scanner Simulator / Camera Input */}
        <div className="bg-slate-900 rounded-2xl p-6 text-center text-white space-y-3 relative overflow-hidden">
          <div className="w-20 h-20 mx-auto rounded-2xl border-2 border-dashed border-blue-400/80 flex items-center justify-center">
            <Camera size={32} className="text-blue-400 animate-pulse" />
          </div>
          <p className="text-xs text-slate-300 font-medium">
            Scan the live rotating QR code projected by the organizer on screen.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Paste or Enter Rotating QR Token
            </label>
            <input
              type="text"
              value={qrInput}
              onChange={(e) => setQrInput(e.target.value)}
              placeholder="e.g. 437d2cd7-72db...58392.a8f9b0"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || !qrInput.trim()}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm shadow-md hover:shadow-blue-500/20 transition"
          >
            {loading ? "Verifying Attendance..." : "Confirm Check-In (+50 XP)"}
          </button>
        </form>
      </div>
    </div>
  );
}
