import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import StudentEvents from "./pages/StudentEvents";
import MyRegistrations from "./pages/MyRegistrations";
import NotFound from "./pages/NotFound";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ================= HOME ================= */}
        <Route path="/" element={<Home />} />

        {/* ================= LOGIN ================= */}
        <Route path="/login" element={<Login />} />

        {/* ================= STUDENT DASHBOARD ================= */}
        <Route
          path="/student-dashboard"
          element={
            <ProtectedRoute>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        {/* ================= STUDENT EVENTS ================= */}
        <Route
          path="/student-events"
          element={
            <ProtectedRoute>
              <StudentEvents />
            </ProtectedRoute>
          }
        />

        {/* ================= MY REGISTRATIONS ================= */}
        <Route
          path="/my-registrations"
          element={
            <ProtectedRoute>
              <MyRegistrations />
            </ProtectedRoute>
          }
        />

        {/* ================= ADMIN DASHBOARD ================= */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* ================= 404 ================= */}
        <Route
          path="*"
          element={<NotFound />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;