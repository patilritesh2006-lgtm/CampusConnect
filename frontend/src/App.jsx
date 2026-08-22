import { BrowserRouter, Routes, Route } from "react-router-dom";

// ======================================================
// PAGES
// ======================================================

import Home from "./pages/Home";
import Login from "./pages/Login";

import StudentDashboard from "./pages/StudentDashboard";
import StudentEvents from "./pages/StudentEvents";
import MyRegistrations from "./pages/MyRegistrations";

import AdminDashboard from "./pages/AdminDashboard";
import AdminStudents from "./pages/AdminStudents";

// ======================================================
// COMPONENTS
// ======================================================

import ProtectedRoute from "./components/ProtectedRoute";

// ======================================================
// APP
// ======================================================

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ==================================================
            HOME
        ================================================== */}

        <Route
          path="/"
          element={<Home />}
        />

        {/* ==================================================
            LOGIN
        ================================================== */}

        <Route
          path="/login"
          element={<Login />}
        />

        {/* ==================================================
            STUDENT DASHBOARD
        ================================================== */}

        <Route
          path="/student-dashboard"
          element={
            <ProtectedRoute role="STUDENT">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        {/* ==================================================
            STUDENT EVENTS
        ================================================== */}

        <Route
          path="/student-events"
          element={
            <ProtectedRoute role="STUDENT">
              <StudentEvents />
            </ProtectedRoute>
          }
        />

        {/* ==================================================
            MY REGISTRATIONS
        ================================================== */}

        <Route
          path="/my-registrations"
          element={
            <ProtectedRoute role="STUDENT">
              <MyRegistrations />
            </ProtectedRoute>
          }
        />

        {/* ==================================================
            ADMIN DASHBOARD
        ================================================== */}

        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute role="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* ==================================================
            ADMIN STUDENTS
        ================================================== */}

        <Route
          path="/admin-students"
          element={
            <ProtectedRoute role="ADMIN">
              <AdminStudents />
            </ProtectedRoute>
          }
        />

        {/* ==================================================
            FALLBACK
        ================================================== */}

        <Route
          path="*"
          element={<Home />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;