import { Navigate } from "react-router-dom";

function parseStoredUser(userString) {
  try {
    return JSON.parse(userString || "null");
  } catch (error) {
    console.error("Invalid user data:", error);
    return null;
  }
}

function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem("token");
  const userString = localStorage.getItem("user");
  const user = parseStoredUser(userString);

  // No token or user
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Normalize roles
  const userRole = String(user.role || "").toUpperCase();
  const requiredRole = String(role || "").toUpperCase();

  console.log("========== PROTECTED ROUTE ==========");
  console.log("User:", user);
  console.log("User role:", userRole);
  console.log("Required role:", requiredRole);

  // Role mismatch
  if (requiredRole && userRole !== requiredRole) {
    console.log("ROLE MISMATCH");

    if (userRole === "ADMIN") {
      return <Navigate to="/admin-dashboard" replace />;
    }

    if (userRole === "STUDENT") {
      return <Navigate to="/student-dashboard" replace />;
    }

    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;