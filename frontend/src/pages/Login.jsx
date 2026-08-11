import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Login() {
  const navigate = useNavigate();

  const [role, setRole] = useState("STUDENT");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      console.log("========== LOGIN START ==========");
      console.log("Email:", formData.email);
      console.log("Selected role:", role);

      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email: formData.email.trim(),
          password: formData.password,
        }
      );

      console.log("LOGIN RESPONSE:", response.data);

      if (!response.data.success) {
        alert(response.data.message || "Login failed.");
        return;
      }

      const loggedInUser = response.data.user;
      const token = response.data.token;

      console.log("Logged in user:", loggedInUser);
      console.log("Database role:", loggedInUser.role);

      // Save login information
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(loggedInUser));

      // IMPORTANT:
      // Prisma returns ADMIN / STUDENT
      const userRole = String(loggedInUser.role).toUpperCase();

      // Check selected login type
      if (role !== userRole) {
        alert(
          `You selected ${role}, but this account is ${userRole}.`
        );

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        return;
      }

      // Redirect
      if (userRole === "ADMIN") {
        console.log("Redirecting to Admin Dashboard...");
        navigate("/admin-dashboard", { replace: true });
      } else if (userRole === "STUDENT") {
        console.log("Redirecting to Student Dashboard...");
        navigate("/student-dashboard", { replace: true });
      } else {
        alert("Unknown user role: " + userRole);

        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    } catch (error) {
      console.error("========== LOGIN ERROR ==========");
      console.error(error);

      console.error(
        "Server response:",
        error.response?.data
      );

      alert(
        error.response?.data?.message ||
          "Login failed. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md">

        {/* TITLE */}
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-2">
          CampusConnect
        </h1>

        <h2 className="text-xl font-semibold text-center mb-6">
          Login
        </h2>

        {/* ROLE SELECTION */}
        <div className="flex gap-4 mb-6">

          <button
            type="button"
            onClick={() => setRole("STUDENT")}
            className={`w-1/2 py-3 rounded-lg font-semibold ${
              role === "STUDENT"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Student
          </button>

          <button
            type="button"
            onClick={() => setRole("ADMIN")}
            className={`w-1/2 py-3 rounded-lg font-semibold ${
              role === "ADMIN"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Admin
          </button>

        </div>

        {/* LOGIN FORM */}
        <form onSubmit={handleLogin}>

          {/* EMAIL */}
          <label className="block mb-2 font-medium">
            Email
          </label>

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter email"
            className="w-full border border-gray-300 p-3 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          {/* PASSWORD */}
          <label className="block mb-2 font-medium">
            Password
          </label>

          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter password"
            className="w-full border border-gray-300 p-3 rounded-lg mb-5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          {/* LOGIN BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        {/* INFO */}
        <p className="text-center mt-5 text-gray-500 text-sm">
          Select Student or Admin before logging in.
        </p>

      </div>
    </div>
  );
}

export default Login;