import { useEffect, useState } from "react";
import API from "../api/api";
import AppNavbar from "../components/AppNavbar";
import { User, Lock, Sparkles } from "lucide-react";

export default function StudentProfile() {
  const [profile, setProfile] = useState({});
  const [achievements, setAchievements] = useState({
    totalRegistered: 0,
    totalAttended: 0,
    totalCertificates: 0,
    attendanceRate: 0,
    badges: [],
  });
  const [loading, setLoading] = useState(true);

  const [editData, setEditData] = useState({ fullName: "", department: "", year: "" });
  const [editLoading, setEditLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");

  const [passData, setPassData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [passLoading, setPassLoading] = useState(false);
  const [passMsg, setPassMsg] = useState("");
  const [passError, setPassError] = useState("");

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await API.get("/users/profile");
      if (res.data.success) {
        setProfile(res.data.profile || {});
        setAchievements(res.data.achievements || {});
        setEditData({
          fullName: res.data.profile.fullName || "",
          department: res.data.profile.department || "",
          year: res.data.profile.year || "",
        });
      }
    } catch (err) {
      console.error("Profile fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setEditLoading(true);
      setProfileMsg("");
      const res = await API.put("/users/profile", editData);
      if (res.data.success) {
        setProfileMsg("Profile updated successfully!");
        setProfile((prev) => ({ ...prev, ...res.data.user }));
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        localStorage.setItem("user", JSON.stringify({ ...user, ...res.data.user }));
      }
    } catch (err) {
      setProfileMsg("Failed to update profile: " + (err.response?.data?.message || err.message));
    } finally {
      setEditLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassMsg("");
    setPassError("");

    if (passData.newPassword !== passData.confirmPassword) {
      setPassError("New passwords do not match.");
      return;
    }

    try {
      setPassLoading(true);
      const res = await API.put("/users/change-password", {
        currentPassword: passData.currentPassword,
        newPassword: passData.newPassword,
      });
      if (res.data.success) {
        setPassMsg("Password changed successfully!");
        setPassData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      }
    } catch (err) {
      setPassError(err.response?.data?.message || "Failed to change password.");
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <AppNavbar role={profile.role} />

      <main className="p-6 md:p-8 flex-1">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 flex items-center justify-between border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-2xl font-bold shadow-md">
                {profile.fullName ? profile.fullName[0].toUpperCase() : "U"}
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{profile.fullName || "Student Profile"}</h1>
                <p className="text-gray-500 text-sm">{profile.email} • {profile.department || "General"} (Year {profile.year || 1})</p>
              </div>
            </div>

            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full uppercase">
              {profile.role || "STUDENT"}
            </span>
          </div>

          <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-3xl shadow-xl p-6 md:p-8 text-white">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles size={16} />
              Achievements & Activity Badges
            </div>
            <h2 className="text-2xl font-extrabold">Student Activity Scoreboard</h2>
            <p className="text-blue-200 text-sm mt-1">Unlock badges by registering, attending campus events, and earning certificates.</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                <p className="text-xs text-blue-200">Registered Events</p>
                <h3 className="text-3xl font-black mt-1">{achievements.totalRegistered}</h3>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                <p className="text-xs text-blue-200">Events Attended</p>
                <h3 className="text-3xl font-black mt-1 text-green-400">{achievements.totalAttended}</h3>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                <p className="text-xs text-blue-200">Certificates Earned</p>
                <h3 className="text-3xl font-black mt-1 text-amber-400">{achievements.totalCertificates}</h3>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                <p className="text-xs text-blue-200">Attendance Rate</p>
                <h3 className="text-3xl font-black mt-1">{achievements.attendanceRate}%</h3>
              </div>
            </div>

            <div className="mt-8">
              <h4 className="text-xs font-bold uppercase tracking-wider text-blue-300 mb-3">Earned Badges</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {achievements.badges?.map((badge) => (
                  <div
                    key={badge.id}
                    className={"p-4 rounded-2xl border text-center transition flex flex-col items-center justify-between " + (badge.unlocked ? "bg-white/15 border-amber-400/50 shadow-lg text-white" : "bg-white/5 border-white/5 text-gray-400 opacity-50")}
                  >
                    <div className="text-3xl mb-2">{badge.icon}</div>
                    <div>
                      <p className="font-bold text-xs">{badge.title}</p>
                      <p className="text-[10px] mt-1 text-blue-200/80 leading-tight">{badge.description}</p>
                    </div>
                    <span
                      className={"mt-3 text-[10px] font-bold px-2 py-0.5 rounded-full " + (badge.unlocked ? "bg-amber-400 text-gray-900" : "bg-white/10 text-gray-400")}
                    >
                      {badge.unlocked ? "Unlocked ✓" : "Locked 🔒"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
              <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                <User size={18} className="text-blue-600" />
                Edit Profile Information
              </h3>

              {profileMsg && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-700 text-xs rounded-xl font-medium">
                  {profileMsg}
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editData.fullName}
                    onChange={(e) => setEditData({ ...editData, fullName: e.target.value })}
                    className="w-full p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Department</label>
                  <input
                    type="text"
                    value={editData.department}
                    onChange={(e) => setEditData({ ...editData, department: e.target.value })}
                    placeholder="e.g. Computer Engineering"
                    className="w-full p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Year of Study</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={editData.year}
                    onChange={(e) => setEditData({ ...editData, year: e.target.value })}
                    placeholder="e.g. 3"
                    className="w-full p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={editLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl text-sm transition"
                >
                  {editLoading ? "Updating..." : "Save Profile"}
                </button>
              </form>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
              <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                <Lock size={18} className="text-blue-600" />
                Change Account Password
              </h3>

              {passMsg && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-xs rounded-xl font-medium">
                  {passMsg}
                </div>
              )}

              {passError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
                  {passError}
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Current Password</label>
                  <input
                    type="password"
                    value={passData.currentPassword}
                    onChange={(e) => setPassData({ ...passData, currentPassword: e.target.value })}
                    className="w-full p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">New Password</label>
                  <input
                    type="password"
                    value={passData.newPassword}
                    onChange={(e) => setPassData({ ...passData, newPassword: e.target.value })}
                    placeholder="Minimum 6 characters"
                    className="w-full p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={passData.confirmPassword}
                    onChange={(e) => setPassData({ ...passData, confirmPassword: e.target.value })}
                    className="w-full p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={passLoading}
                  className="w-full bg-gray-900 hover:bg-black text-white font-semibold py-2.5 rounded-xl text-sm transition"
                >
                  {passLoading ? "Updating..." : "Update Password"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}