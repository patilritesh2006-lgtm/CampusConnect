import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import EventForm from "../components/EventForm";
import EventCard from "../components/EventCard";

const API = "http://localhost:5000/api/events";

function AdminDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState({});
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  // ======================================================
  // LOAD USER
  // ======================================================
  useEffect(() => {
    const userString = localStorage.getItem("user");

    try {
      const savedUser = JSON.parse(userString || "{}");
      setUser(savedUser);
    } catch (error) {
      console.error("User data error:", error);
      setUser({});
    }
  }, []);

  // ======================================================
  // LOAD EVENTS
  // ======================================================
  const fetchEvents = async () => {
    try {
      setLoading(true);

      console.log("========== FETCH EVENTS ==========");

      const response = await axios.get(API);

      console.log("EVENT RESPONSE:", response.data);

      if (response.data.success) {
        setEvents(response.data.events || []);
      }
    } catch (error) {
      console.error("FETCH EVENTS ERROR:", error);

      alert(
        error.response?.data?.message ||
          "Failed to load events."
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // FETCH EVENTS ON PAGE LOAD
  // ======================================================
  useEffect(() => {
    fetchEvents();
  }, []);

  // ======================================================
  // CREATE EVENT
  // ======================================================
  const handleCreateEvent = async (formData) => {
    try {
      setCreating(true);

      console.log("========== CREATE EVENT ==========");
      console.log("FORM DATA:", formData);

      const response = await axios.post(API, {
        title: formData.title,
        description: formData.description,
        venue: formData.venue,
        event_date: formData.event_date,
      });

      console.log("CREATE RESPONSE:", response.data);

      if (response.data.success) {
        alert("Event created successfully! 🎉");

        await fetchEvents();
      }
    } catch (error) {
      console.error("CREATE EVENT ERROR:", error);

      alert(
        error.response?.data?.message ||
          "Failed to create event."
      );
    } finally {
      setCreating(false);
    }
  };

  // ======================================================
  // DELETE EVENT
  // ======================================================
  const handleDeleteEvent = async (eventId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this event?"
    );

    if (!confirmed) {
      return;
    }

    try {
      console.log("========== DELETE EVENT ==========");
      console.log("Event ID:", eventId);

      const response = await axios.delete(
        `${API}/${eventId}`
      );

      console.log("DELETE RESPONSE:", response.data);

      if (response.data.success) {
        alert("Event deleted successfully.");

        setEvents((previousEvents) =>
          previousEvents.filter(
            (event) => event.id !== eventId
          )
        );
      }
    } catch (error) {
      console.error("DELETE EVENT ERROR:", error);

      alert(
        error.response?.data?.message ||
          "Failed to delete event."
      );
    }
  };

  // ======================================================
  // LOGOUT
  // ======================================================
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  // ======================================================
  // PAGE
  // ======================================================
  return (
    <div className="min-h-screen bg-gray-100">
      {/* ==================================================
          NAVBAR
      ================================================== */}
      <nav className="bg-white shadow-md px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-600">
          CampusConnect
        </h1>

        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg"
        >
          Logout
        </button>
      </nav>

      {/* ==================================================
          MAIN
      ================================================== */}
      <main className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* HEADER */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800">
              Admin Dashboard
            </h1>

            <p className="text-gray-600 mt-2">
              Welcome, {user.fullName || "Administrator"} 👋
            </p>
          </div>

          {/* ==================================================
              ADMIN INFORMATION
          ================================================== */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              Admin Information
            </h2>

            <p className="mb-2">
              <strong>Name:</strong>{" "}
              {user.fullName || "Administrator"}
            </p>

            <p className="mb-2">
              <strong>Email:</strong>{" "}
              {user.email || "Not available"}
            </p>

            <p>
              <strong>Role:</strong>{" "}
              {user.role || "ADMIN"}
            </p>
          </div>

          {/* ==================================================
              CREATE EVENT
          ================================================== */}
          <div className="mb-10">
            {creating && (
              <div className="mb-4 bg-blue-100 text-blue-700 p-4 rounded-lg">
                Creating event...
              </div>
            )}

            <EventForm
              onCreate={handleCreateEvent}
            />
          </div>

          {/* ==================================================
              EVENTS
          ================================================== */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-800">
                  Manage Events
                </h2>

                <p className="text-gray-600 mt-1">
                  Total Events: {events.length}
                </p>
              </div>

              <button
                onClick={fetchEvents}
                className="bg-gray-800 hover:bg-gray-900 text-white px-5 py-2 rounded-lg"
              >
                Refresh
              </button>
            </div>

            {/* LOADING */}
            {loading ? (
              <div className="bg-white rounded-xl shadow-md p-10 text-center">
                <p className="text-gray-600">
                  Loading events...
                </p>
              </div>
            ) : events.length === 0 ? (
              /* NO EVENTS */
              <div className="bg-white rounded-xl shadow-md p-10 text-center">
                <div className="text-5xl mb-4">
                  📅
                </div>

                <h3 className="text-xl font-bold text-gray-800">
                  No Events Yet
                </h3>

                <p className="text-gray-600 mt-2">
                  Create your first college event using
                  the form above.
                </p>
              </div>
            ) : (
              /* EVENTS LIST */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onDelete={handleDeleteEvent}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;