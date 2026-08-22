import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = "http://localhost:5000/api";

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

    if (!formData.email.trim() || !formData.password) {
      alert("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);

      console.log("========== LOGIN START ==========");
      console.log("Email:", formData.email.trim());
      console.log("Selected role:", role);

      const response = await axios.post(
        `${API}/auth/login`,
        {
          email: formData.email.trim(),
          password: formData.password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
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
      console.log("Database role:", loggedInUser?.role);

      if (!token || !loggedInUser) {
        alert("Login response is missing user or token.");
        return;
      }

      const userRole = String(
        loggedInUser.role || ""
      ).toUpperCase();

      // Check selected role against database role
      if (role !== userRole) {
        alert(
          `You selected ${role}, but this account is ${userRole}.`
        );
        return;
      }

      // Clear old login data
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Save new login data
      localStorage.setItem("token", token);
      localStorage.setItem(
        "user",
        JSON.stringify(loggedInUser)
      );

      console.log(
        "Token saved:",
        localStorage.getItem("token")
      );

      console.log(
        "User saved:",
        localStorage.getItem("user")
      );

      // Verify localStorage
      const savedToken = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");

      if (!savedToken || !savedUser) {
        alert("Unable to save login information.");
        return;
      }

      console.log("========== LOGIN SUCCESS ==========");

      // Redirect ADMIN
      if (userRole === "ADMIN") {
        console.log("Redirecting to /admin-dashboard");

        navigate("/admin-dashboard", {
          replace: true,
        });

        return;
      }

      // Redirect STUDENT
      if (userRole === "STUDENT") {
        console.log("Redirecting to /student-dashboard");

        navigate("/student-dashboard", {
          replace: true,
        });

        return;
      }

      alert(`Unknown user role: ${userRole}`);

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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        <p className="text-center mt-5 text-gray-500 text-sm">
          Select Student or Admin before logging in.
        </p>

      </div>

    </div>
  );
}

export default Login;