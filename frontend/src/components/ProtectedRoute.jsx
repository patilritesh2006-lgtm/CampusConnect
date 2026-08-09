import React from "react";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem("token");
  const userString = localStorage.getItem("user");

  let user = {};

  try {
    user = JSON.parse(userString || "{}");
  } catch (error) {
    console.error("User data error:", error);
  }

  // ==========================================
  // NOT LOGGED IN
  // ==========================================
  if (!token || !user.id) {
    return <Navigate to="/login" replace />;
  }

  // ==========================================
  // ROLE CHECK
  // ==========================================
  if (role && user.role !== role) {
    if (user.role === "ADMIN") {
      return <Navigate to="/admin-dashboard" replace />;
    }

    if (user.role === "STUDENT") {
      return <Navigate to="/student-dashboard" replace />;
    }

    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;