import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../api/api";
import AppNavbar from "../components/AppNavbar";
import {
  Trophy,
  Medal,
  Award,
  Crown,
  Sparkles,
  Flame,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const res = await API.get("/users/leaderboard");
      if (res.data.success) {
        setLeaderboard(res.data.leaderboard);
      }
    } catch (err) {
      console.error("Leaderboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getRankBadge = (rank) => {
    if (rank === 1) {
      return (
        <div className="w-9 h-9 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center font-extrabold shadow-md">
          <Crown size={20} />
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="w-9 h-9 rounded-2xl bg-slate-300 text-slate-900 flex items-center justify-center font-extrabold shadow-sm">
          <Medal size={20} />
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="w-9 h-9 rounded-2xl bg-amber-700 text-amber-100 flex items-center justify-center font-extrabold shadow-sm">
          <Medal size={20} />
        </div>
      );
    }
    return (
      <div className="w-9 h-9 rounded-2xl bg-gray-100 text-gray-600 flex items-center justify-center font-bold text-sm">
        #{rank}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AppNavbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 space-y-6">
        {/* Header Hero Banner */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left z-10">
            <span className="bg-white/20 backdrop-blur-md text-white text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1">
              <Flame size={14} className="text-amber-400" /> Campus Activity Rankings
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight">Campus XP Leaderboard</h1>
            <p className="text-blue-100 text-sm max-w-xl">
              Earn XP and level up by scanning QR at event check-ins (+50 XP), receiving verified certificates (+100 XP), and sharing event feedback (+25 XP).
            </p>
          </div>

          <div className="flex items-center gap-3 z-10">
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center">
              <Trophy size={28} className="text-amber-300 mx-auto mb-1" />
              <p className="text-xs font-bold uppercase tracking-wider">Top Achievers</p>
            </div>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-12 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <p>No student activity recorded on the leaderboard yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              <div className="grid grid-cols-12 px-6 py-3.5 bg-gray-50 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                <span className="col-span-1 text-center">Rank</span>
                <span className="col-span-6 sm:col-span-5">Student</span>
                <span className="hidden sm:block sm:col-span-3">Department</span>
                <span className="col-span-5 sm:col-span-3 text-right">XP & Level</span>
              </div>

              {leaderboard.map((student) => (
                <div
                  key={student.id}
                  className="grid grid-cols-12 px-6 py-4 items-center hover:bg-blue-50/40 transition"
                >
                  <div className="col-span-1 flex justify-center">
                    {getRankBadge(student.rank)}
                  </div>

                  <div className="col-span-6 sm:col-span-5 flex items-center gap-3 pl-2 sm:pl-0">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-extrabold text-sm shadow-sm">
                      {student.fullName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 leading-tight">
                        {student.fullName}
                      </h4>
                      {student.username && (
                        <Link
                          to={`/portfolio/${student.username}`}
                          className="text-[11px] text-blue-600 hover:underline flex items-center gap-0.5 mt-0.5"
                        >
                          @{student.username} <ExternalLink size={10} />
                        </Link>
                      )}
                    </div>
                  </div>

                  <div className="hidden sm:block sm:col-span-3">
                    <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-lg">
                      {student.department}
                    </span>
                  </div>

                  <div className="col-span-5 sm:col-span-3 text-right">
                    <span className="text-sm font-extrabold text-blue-600 block">
                      {student.xp} XP
                    </span>
                    <span className="text-[11px] text-gray-500 font-semibold">
                      Level {student.level} • {student.attendedCount} attended
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
