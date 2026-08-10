import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = "http://localhost:5000/api/events";

function StudentEvents() {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(null);
  const [registeredEvents, setRegisteredEvents] = useState([]);

  // ======================================================
  // FETCH EVENTS
  // ======================================================
  const fetchEvents = async () => {
    try {
      setLoading(true);

      const response = await axios.get(API);

      console.log("EVENTS RESPONSE:", response.data);

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
  // FETCH USER'S EXISTING REGISTRATIONS
  // ======================================================
  const fetchMyRegistrations = async () => {
    try {
      const userString = localStorage.getItem("user");
      const user = JSON.parse(userString || "{}");

      if (!user.id) {
        return;
      }

      const response = await axios.get(
        `http://localhost:5000/api/registrations/${user.id}`
      );

      console.log(
        "MY REGISTRATIONS RESPONSE:",
        response.data
      );

      if (response.data.success) {
        const registrations =
          response.data.registrations || [];

        const eventIds = registrations.map(
          (registration) => registration.eventId
        );

        setRegisteredEvents(eventIds);
      }
    } catch (error) {
      console.error(
        "FETCH REGISTRATIONS ERROR:",
        error
      );
    }
  };

  // ======================================================
  // LOAD DATA
  // ======================================================
  useEffect(() => {
    fetchEvents();
    fetchMyRegistrations();
  }, []);

  // ======================================================
  // REGISTER FOR EVENT
  // ======================================================
  const handleRegister = async (eventId) => {
    try {
      const userString = localStorage.getItem("user");
      const user = JSON.parse(userString || "{}");

      if (!user.id) {
        alert("Please login again.");
        navigate("/login");
        return;
      }

      // Prevent duplicate click
      if (registeredEvents.includes(eventId)) {
        alert("You are already registered for this event.");
        return;
      }

      setRegistering(eventId);

      console.log("========== REGISTER EVENT ==========");
      console.log("User ID:", user.id);
      console.log("Event ID:", eventId);

      const response = await axios.post(
        `${API}/${eventId}/register`,
        {
          userId: user.id,
        }
      );

      console.log(
        "REGISTER RESPONSE:",
        response.data
      );

      if (response.data.success) {
        alert("Registered successfully! 🎉");

        // Mark event as registered
        setRegisteredEvents((previous) => [
          ...previous,
          eventId,
        ]);
      }
    } catch (error) {
      console.error(
        "REGISTER EVENT ERROR:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to register for event."
      );
    } finally {
      setRegistering(null);
    }
  };

  // ======================================================
  // RENDER
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
          onClick={() =>
            navigate("/student-dashboard")
          }
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
        >
          Back to Dashboard
        </button>

      </nav>

      {/* ==================================================
          MAIN
      ================================================== */}
      <main className="p-8">

        <div className="max-w-7xl mx-auto">

          {/* ==================================================
              HEADER
          ================================================== */}
          <div className="mb-8">

            <h1 className="text-4xl font-bold text-gray-800">
              College Events
            </h1>

            <p className="text-gray-600 mt-2">
              View upcoming events and register for them.
            </p>

          </div>

          {/* ==================================================
              LOADING
          ================================================== */}
          {loading && (
            <div className="bg-white rounded-xl shadow-md p-10 text-center">

              <p className="text-gray-600">
                Loading events...
              </p>

            </div>
          )}

          {/* ==================================================
              NO EVENTS
          ================================================== */}
          {!loading && events.length === 0 && (
            <div className="bg-white rounded-xl shadow-md p-10 text-center">

              <div className="text-5xl mb-4">
                📅
              </div>

              <h2 className="text-2xl font-bold text-gray-800">
                No Events Available
              </h2>

              <p className="text-gray-600 mt-2">
                There are currently no college events.
              </p>

            </div>
          )}

          {/* ==================================================
              EVENTS
          ================================================== */}
          {!loading && events.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

              {events.map((event) => {

                const eventDate =
                  event.eventDate ||
                  event.event_date;

                const isRegistered =
                  registeredEvents.includes(
                    event.id
                  );

                const isRegistering =
                  registering === event.id;

                return (
                  <div
                    key={event.id}
                    className="bg-white rounded-xl shadow-md p-6"
                  >

                    {/* EVENT ICON */}
                    <div className="text-4xl mb-4">
                      📅
                    </div>

                    {/* TITLE */}
                    <h2 className="text-2xl font-bold text-gray-800">
                      {event.title}
                    </h2>

                    {/* DESCRIPTION */}
                    <p className="text-gray-600 mt-3">
                      {event.description ||
                        "No description available."}
                    </p>

                    {/* EVENT DETAILS */}
                    <div className="mt-5 space-y-2 text-gray-700">

                      <p>
                        <strong>📍 Venue:</strong>{" "}
                        {event.venue}
                      </p>

                      <p>
                        <strong>📅 Date:</strong>{" "}
                        {eventDate
                          ? new Date(
                              eventDate
                            ).toLocaleDateString()
                          : "Not available"}
                      </p>

                      <p>
                        <strong>Status:</strong>{" "}
                        {event.status ||
                          "UPCOMING"}
                      </p>

                    </div>

                    {/* REGISTER BUTTON */}
                    <button
                      onClick={() =>
                        handleRegister(event.id)
                      }
                      disabled={
                        isRegistered ||
                        isRegistering
                      }
                      className={`w-full mt-6 text-white font-semibold py-3 rounded-lg ${
                        isRegistered
                          ? "bg-green-600 cursor-not-allowed"
                          : isRegistering
                          ? "bg-gray-500 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700"
                      }`}
                    >

                      {isRegistered
                        ? "✓ Registered"
                        : isRegistering
                        ? "Registering..."
                        : "Register for Event"}

                    </button>

                  </div>
                );
              })}

            </div>
          )}

        </div>

      </main>

    </div>
  );
}

export default StudentEvents;