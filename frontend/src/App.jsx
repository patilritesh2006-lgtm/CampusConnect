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
import StudentPortfolio from "./pages/StudentPortfolio";
import Leaderboard from "./pages/Leaderboard";
import AIAssistant from "./components/AIAssistant";
import CertificateVerify from "./pages/CertificateVerify";

// CampusConnect v3 Flagship Pages
import CampusPassport from "./pages/CampusPassport";
import SkillGraph from "./pages/SkillGraph";
import RecruiterVerification from "./pages/RecruiterVerification";
import CredentialDetail from "./pages/CredentialDetail";
import ClubsHub from "./pages/ClubsHub";
import AdminFraudConsole from "./pages/AdminFraudConsole";
import InstitutionalIntelligence from "./pages/InstitutionalIntelligence";

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
        <Route path="/verify/credential/:credentialId" element={<CredentialDetail />} />
        <Route path="/verify/student/:username" element={<RecruiterVerification />} />
        <Route path="/portfolio/:username" element={<StudentPortfolio />} />
        <Route path="/passport/:username" element={<CampusPassport />} />

        <Route
          path="/passport"
          element={
            <ProtectedRoute>
              <CampusPassport />
            </ProtectedRoute>
          }
        />

        <Route
          path="/skills"
          element={
            <ProtectedRoute>
              <SkillGraph />
            </ProtectedRoute>
          }
        />

        <Route
          path="/clubs"
          element={
            <ProtectedRoute>
              <ClubsHub />
            </ProtectedRoute>
          }
        />

        <Route
          path="/leaderboard"
          element={
            <ProtectedRoute>
              <Leaderboard />
            </ProtectedRoute>
          }
        />

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
          path="/events"
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
          path="/admin-fraud"
          element={
            <ProtectedRoute role="ADMIN">
              <AdminFraudConsole />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-intelligence"
          element={
            <ProtectedRoute role="ADMIN">
              <InstitutionalIntelligence />
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
      <AIAssistant />
    </BrowserRouter>
  );
}

export default App;