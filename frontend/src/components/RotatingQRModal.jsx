import React, { useState, useEffect } from "react";
import API from "../api/api";
import { QrCode, X, RefreshCw, Copy, Check, Clock } from "lucide-react";

export default function RotatingQRModal({ eventId, eventTitle, isOpen, onClose }) {
  const [qrData, setQrData] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(30);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let timer;
    if (isOpen && eventId) {
      fetchRotatingQR();
      timer = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            fetchRotatingQR();
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, eventId]);

  const fetchRotatingQR = async () => {
    try {
      const res = await API.get(`/attendance/events/${eventId}/rotating-qr`);
      if (res.data.success) {
        setQrData(res.data);
        setSecondsLeft(res.data.expiresInSeconds || 30);
      }
    } catch (err) {
      console.error("Failed to fetch rotating QR:", err);
    }
  };

  if (!isOpen) return null;

  const copyToken = () => {
    if (qrData?.qrToken) {
      navigator.clipboard.writeText(qrData.qrToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 text-white rounded-3xl max-w-lg w-full p-8 shadow-2xl space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center pb-3 border-b border-slate-800">
          <div className="text-left">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
              Live Attendance Projector
            </span>
            <h3 className="font-extrabold text-white text-lg mt-1">{eventTitle}</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl transition text-slate-400">
            <X size={20} />
          </button>
        </div>

        {/* Big Rotating QR Code Box */}
        <div className="bg-white p-6 rounded-3xl max-w-[260px] mx-auto shadow-2xl text-slate-900 space-y-3">
          <div className="w-48 h-48 mx-auto bg-slate-100 rounded-2xl flex flex-col items-center justify-center border-2 border-slate-200 p-2">
            <QrCode size={160} className="text-slate-900" />
          </div>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Scan with CampusConnect App
          </p>
        </div>

        {/* Live Countdown Clock */}
        <div className="flex items-center justify-center gap-2 text-xs font-bold text-amber-400 bg-slate-800/80 py-2 px-4 rounded-xl max-w-xs mx-auto border border-slate-700">
          <Clock size={16} className="animate-spin" />
          <span>Rotating in {secondsLeft} seconds...</span>
        </div>

        {/* Raw QR Token Copy Box */}
        <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between text-left">
          <div className="truncate mr-3">
            <p className="text-[10px] text-slate-400 uppercase font-bold">Encrypted Token</p>
            <p className="font-mono text-xs text-slate-300 truncate">{qrData?.qrToken || "Generating..."}</p>
          </div>
          <button
            onClick={copyToken}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-xl transition flex-shrink-0"
          >
            {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}
