import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/api";
import { ArrowLeft, Lock, Mail, User, BookOpen, GraduationCap } from "lucide-react";

function Login() {
  const navigate = useNavigate();

  const [mode, setMode] = useState("LOGIN"); // "LOGIN" | "REGISTER"
  const [role, setRole] = useState("STUDENT"); // "STUDENT" | "ADMIN"

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    department: "",
    year: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleChange = (e) => {
    setErrorMsg("");
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!formData.email.trim() || !formData.password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await API.post("/auth/login", {
        email: formData.email.trim(),
        password: formData.password,
      });

      if (!response.data.success) {
        setErrorMsg(response.data.message || "Invalid credentials.");
        return;
      }

      const loggedInUser = response.data.user;
      const token = response.data.token;

      if (!token || !loggedInUser) {
        setErrorMsg("Authentication failed. Missing token or user record.");
        return;
      }

      const userRole = String(loggedInUser.role || "").toUpperCase();

      // Check selected role against database role
      if (role !== userRole) {
        setErrorMsg(
          `You selected "${role}", but this account is registered as "${userRole}". Please switch the role selector above.`
        );
        return;
      }

      // Clear old login data
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Save new login data
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(loggedInUser));

      // Redirect
      if (userRole === "ADMIN") {
        navigate("/admin-dashboard", { replace: true });
        return;
      }

      if (userRole === "STUDENT") {
        navigate("/student-dashboard", { replace: true });
        return;
      }

      setErrorMsg(`Unknown user role: ${userRole}`);
    } catch (error) {
      console.error("LOGIN ERROR:", error);
      setErrorMsg(
        error.response?.data?.message ||
          "Login failed. Please verify your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!formData.fullName.trim() || !formData.email.trim() || !formData.password) {
      setErrorMsg("Full Name, Email and Password are required.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        department: formData.department.trim() || undefined,
        year: formData.year ? parseInt(formData.year, 10) : undefined,
        role: "STUDENT",
      };

      const response = await API.post("/auth/register", payload);

      if (response.data.success) {
        setSuccessMsg("Account created successfully! Please log in below.");
        setMode("LOGIN");
        setRole("STUDENT");
        setFormData({
          ...formData,
          password: "",
        });
      } else {
        setErrorMsg(response.data.message || "Registration failed.");
      }
    } catch (error) {
      console.error("REGISTER ERROR:", error);
      setErrorMsg(
        error.response?.data?.message ||
          "Failed to register. This email may already be in use."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-12">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md border border-gray-100">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 mb-4 transition">
            <ArrowLeft size={16} />
            Back to Home
          </Link>
          <h1 className="text-3xl font-extrabold text-blue-600 tracking-tight">CampusConnect</h1>
          <p className="text-gray-500 text-sm mt-1">
            {mode === "LOGIN" ? "Sign in to manage or explore campus events" : "Create your student account"}
          </p>
        </div>

        {/* MODE SWITCHER */}
        <div className="flex border-b border-gray-200 mb-6 text-sm font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode("LOGIN");
              setErrorMsg("");
            }}
            className={`flex-1 py-3 text-center border-b-2 transition ${
              mode === "LOGIN"
                ? "border-blue-600 text-blue-600 font-bold"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            Sign In
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("REGISTER");
              setRole("STUDENT");
              setErrorMsg("");
            }}
            className={`flex-1 py-3 text-center border-b-2 transition ${
              mode === "REGISTER"
                ? "border-blue-600 text-blue-600 font-bold"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            Register Student
          </button>
        </div>

        {/* FEEDBACK BANNERS */}
        {errorMsg && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl font-medium">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-5 p-3.5 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl font-medium">
            {successMsg}
          </div>
        )}

        {/* LOGIN FORM */}
        {mode === "LOGIN" ? (
          <div>
            {/* ROLE SELECTION */}
            <div className="flex gap-3 mb-5">
              <button
                type="button"
                onClick={() => setRole("STUDENT")}
                className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition ${
                  role === "STUDENT"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Student
              </button>

              <button
                type="button"
                onClick={() => setRole("ADMIN")}
                className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition ${
                  role === "ADMIN"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Administrator
              </button>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3.5 top-3.5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={role === "ADMIN" ? "admin@campusconnect.com" : "student@college.edu"}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3.5 top-3.5 text-gray-400" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 rounded-xl font-semibold text-sm shadow-md transition"
              >
                {loading ? "Signing in..." : `Sign in as ${role === "ADMIN" ? "Admin" : "Student"}`}
              </button>
            </form>
          </div>
        ) : (
          /* REGISTRATION FORM */
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Full Name *
              </label>
              <div className="relative">
                <User size={18} className="absolute left-3.5 top-3.5 text-gray-400" />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g. John Doe"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Email Address *
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-3.5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. student@college.edu"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Password *
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-3.5 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Department
                </label>
                <div className="relative">
                  <BookOpen size={18} className="absolute left-3.5 top-3.5 text-gray-400" />
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    placeholder="e.g. CS / IT"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Year
                </label>
                <div className="relative">
                  <GraduationCap size={18} className="absolute left-3.5 top-3.5 text-gray-400" />
                  <input
                    type="number"
                    name="year"
                    min="1"
                    max="6"
                    value={formData.year}
                    onChange={handleChange}
                    placeholder="e.g. 3"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 rounded-xl font-semibold text-sm shadow-md transition"
            >
              {loading ? "Creating account..." : "Complete Registration"}
            </button>
          </form>
        )}

        <div className="text-center mt-6 text-xs text-gray-400">
          CampusConnect Platform � College Event Management System
        </div>
      </div>
    </div>
  );
}

export default Login;
