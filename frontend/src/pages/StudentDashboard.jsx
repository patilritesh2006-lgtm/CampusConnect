import React from "react";
import { useNavigate } from "react-router-dom";

function StudentDashboard() {
  const navigate = useNavigate();

  const userString = localStorage.getItem("user");

  let user = {};

  try {
    user = JSON.parse(userString || "{}");
  } catch (error) {
    console.error("User data error:", error);
  }

  console.log("========== STUDENT DASHBOARD ==========");
  console.log("Student dashboard loaded");
  console.log("User:", user);

  // ======================================================
  // LOGOUT
  // ======================================================
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  // ======================================================
  // VIEW EVENTS
  // ======================================================
  const handleViewEvents = () => {
    navigate("/student-events");
  };

  // ======================================================
  // MY REGISTRATIONS
  // ======================================================
  const handleMyRegistrations = () => {
    alert("My Registrations page is coming next.");
  };

  // ======================================================
  // NOTIFICATIONS
  // ======================================================
  const handleNotifications = () => {
    alert("Notifications page is coming next.");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ==================================================
          NAVBAR
      ================================================== */}
      <nav className="bg-white shadow-md px-8 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-blue-600">
            CampusConnect
          </h1>
        </div>

        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-5 py-2 rounded-lg hover:bg-red-600"
        >
          Logout
        </button>
      </nav>

      {/* ==================================================
          DASHBOARD
      ================================================== */}
      <main className="p-8">
        <div className="max-w-6xl mx-auto">

          {/* ==================================================
              HEADER
          ================================================== */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800">
              Student Dashboard
            </h1>

            <p className="text-gray-600 mt-2">
              Welcome to CampusConnect 👋
            </p>
          </div>

          {/* ==================================================
              USER CARD
          ================================================== */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Welcome, {user.fullName || "Student"}!
            </h2>

            <div className="space-y-2">
              <p>
                <strong>Email:</strong>{" "}
                {user.email || "Not available"}
              </p>

              <p>
                <strong>Role:</strong>{" "}
                {user.role || "STUDENT"}
              </p>

              <p>
                <strong>User ID:</strong>{" "}
                {user.id || "Not available"}
              </p>
            </div>
          </div>

          {/* ==================================================
              CARDS
          ================================================== */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* ==================================================
                EVENTS
            ================================================== */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="text-4xl mb-4">
                📅
              </div>

              <h2 className="text-xl font-bold mb-2">
                Events
              </h2>

              <p className="text-gray-600">
                View upcoming college events and activities.
              </p>

              <button
                onClick={handleViewEvents}
                className="mt-5 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                View Events
              </button>
            </div>

            {/* ==================================================
                MY REGISTRATIONS
            ================================================== */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="text-4xl mb-4">
                📝
              </div>

              <h2 className="text-xl font-bold mb-2">
                My Registrations
              </h2>

              <p className="text-gray-600">
                View the events you have registered for.
              </p>

              <button
                onClick={handleMyRegistrations}
                className="mt-5 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                My Registrations
              </button>
            </div>

            {/* ==================================================
                NOTIFICATIONS
            ================================================== */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="text-4xl mb-4">
                🔔
              </div>

              <h2 className="text-xl font-bold mb-2">
                Notifications
              </h2>

              <p className="text-gray-600">
                Stay updated with important campus announcements.
              </p>

              <button
                onClick={handleNotifications}
                className="mt-5 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Notifications
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

export default StudentDashboard;