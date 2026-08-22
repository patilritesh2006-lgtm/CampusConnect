import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";

import StudentDashboard from "./pages/StudentDashboard";
import StudentEvents from "./pages/StudentEvents";
import MyRegistrations from "./pages/MyRegistrations";
import StudentCertificates from "./pages/StudentCertificates";
import StudentProfile from "./pages/StudentProfile";
import CalendarView from "./pages/CalendarView";
import Announcements from "./pages/Announcements";
import CertificateVerify from "./pages/CertificateVerify";

import AdminDashboard from "./pages/AdminDashboard";
import AdminStudents from "./pages/AdminStudents";
import AdminEventStudents from "./pages/AdminEventStudents";
import AdminCertificates from "./pages/AdminCertificates";
import AdminAnalytics from "./pages/AdminAnalytics";
import NotFound from "./pages/NotFound";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-certificate" element={<CertificateVerify />} />
        <Route path="/verify-certificate/:certificateCode" element={<CertificateVerify />} />

        <Route
          path="/calendar"
          element={
            <ProtectedRoute>
              <CalendarView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/announcements"
          element={
            <ProtectedRoute>
              <Announcements />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student-profile"
          element={
            <ProtectedRoute>
              <StudentProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student-dashboard"
          element={
            <ProtectedRoute role="STUDENT">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student-events"
          element={
            <ProtectedRoute role="STUDENT">
              <StudentEvents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-registrations"
          element={
            <ProtectedRoute role="STUDENT">
              <MyRegistrations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student-certificates"
          element={
            <ProtectedRoute role="STUDENT">
              <StudentCertificates />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute role="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-students"
          element={
            <ProtectedRoute role="ADMIN">
              <AdminStudents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-certificates"
          element={
            <ProtectedRoute role="ADMIN">
              <AdminCertificates />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-analytics"
          element={
            <ProtectedRoute role="ADMIN">
              <AdminAnalytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-dashboard/events/:eventId/students"
          element={
            <ProtectedRoute role="ADMIN">
              <AdminEventStudents />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;