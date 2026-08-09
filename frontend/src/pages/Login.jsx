import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Login() {
  const navigate = useNavigate();

  const [role, setRole] = useState("student");

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

    setLoading(true);

    console.log("=================================");
    console.log("LOGIN START");
    console.log("Selected role:", role);
    console.log("Email:", formData.email);
    console.log("=================================");

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email: formData.email,
          password: formData.password,
        }
      );

      console.log("LOGIN RESPONSE:", response.data);

      if (!response.data.success) {
        alert(response.data.message || "Login failed.");
        setLoading(false);
        return;
      }

      const user = response.data.user;
      const token = response.data.token;

      console.log("TOKEN RECEIVED:", !!token);
      console.log("USER:", user);
      console.log("USER ROLE:", user.role);

      // Convert role to uppercase
      const userRole = String(user.role).toUpperCase();

      // Check selected login type
      if (role === "student" && userRole !== "STUDENT") {
        alert("This account is not a Student account.");
        setLoading(false);
        return;
      }

      if (role === "admin" && userRole !== "ADMIN") {
        alert("This account is not an Admin account.");
        setLoading(false);
        return;
      }

      // Save token
      localStorage.setItem("token", token);

      // Save user
      localStorage.setItem("user", JSON.stringify(user));

      console.log("SAVED TOKEN:", localStorage.getItem("token"));
      console.log("SAVED USER:", localStorage.getItem("user"));

      // Redirect
      if (userRole === "ADMIN") {
        console.log("➡️ Going to Admin Dashboard");
        navigate("/admin-dashboard", { replace: true });
      } else {
        console.log("➡️ Going to Student Dashboard");
        navigate("/student-dashboard", { replace: true });
      }
    } catch (error) {
      console.error("LOGIN ERROR:", error);

      alert(
        error.response?.data?.message ||
          "Login Failed. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md">

        {/* TITLE */}
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">
          CampusConnect
        </h1>

        <h2 className="text-xl font-semibold text-center mb-5">
          Login
        </h2>

        {/* ROLE SELECTION */}
        <div className="flex gap-4 mb-5">

          <button
            type="button"
            onClick={() => setRole("student")}
            className={`w-1/2 py-3 rounded-lg ${
              role === "student"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-black"
            }`}
          >
            Student
          </button>

          <button
            type="button"
            onClick={() => setRole("admin")}
            className={`w-1/2 py-3 rounded-lg ${
              role === "admin"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-black"
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
            className="w-full border border-gray-400 p-3 rounded-lg mb-4"
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
            className="w-full border border-gray-400 p-3 rounded-lg mb-5"
            required
          />

          {/* LOGIN BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white py-3 rounded-lg ${
              loading
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        <p className="text-center mt-5 text-gray-600">
          New student? Register here
        </p>

      </div>
    </div>
  );
}

export default Login;