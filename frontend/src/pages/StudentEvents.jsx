import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = "http://localhost:5000/api/events";

function StudentEvents() {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    try {
      setLoading(true);

      const response = await axios.get(API);

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

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleRegister = async (eventId) => {
    try {
      const userString = localStorage.getItem("user");
      const user = JSON.parse(userString || "{}");

      if (!user.id) {
        alert("Please login again.");
        navigate("/login");
        return;
      }

      const response = await axios.post(
        `${API}/${eventId}/register`,
        {
          userId: user.id,
        }
      );

      if (response.data.success) {
        alert("Registered successfully! 🎉");
      }
    } catch (error) {
      console.error("REGISTER ERROR:", error);

      alert(
        error.response?.data?.message ||
          "Failed to register for event."
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* NAVBAR */}
      <nav className="bg-white shadow-md px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-600">
          CampusConnect
        </h1>

        <button
          onClick={() => navigate("/student-dashboard")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
        >
          Back to Dashboard
        </button>
      </nav>

      {/* MAIN */}
      <main className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* HEADER */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800">
              College Events
            </h1>

            <p className="text-gray-600 mt-2">
              View upcoming events and register for them.
            </p>
          </div>

          {/* LOADING */}
          {loading && (
            <div className="bg-white rounded-xl shadow-md p-10 text-center">
              <p className="text-gray-600">
                Loading events...
              </p>
            </div>
          )}

          {/* NO EVENTS */}
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

          {/* EVENTS */}
          {!loading && events.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => {
                const eventDate =
                  event.eventDate || event.event_date;

                return (
                  <div
                    key={event.id}
                    className="bg-white rounded-xl shadow-md p-6"
                  >
                    <div className="text-4xl mb-4">
                      📅
                    </div>

                    <h2 className="text-2xl font-bold text-gray-800">
                      {event.title}
                    </h2>

                    <p className="text-gray-600 mt-3">
                      {event.description ||
                        "No description available."}
                    </p>

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
                        {event.status || "UPCOMING"}
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        handleRegister(event.id)
                      }
                      className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg"
                    >
                      Register for Event
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