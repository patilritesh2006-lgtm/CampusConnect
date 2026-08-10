import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = "http://localhost:5000/api/registrations";

function MyRegistrations() {
  const navigate = useNavigate();

  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  // ==============================
  // GET USER
  // ==============================

  const userString = localStorage.getItem("user");

  let user = {};

  try {
    user = JSON.parse(userString || "{}");
  } catch (error) {
    console.error("User data error:", error);
  }

  // ==============================
  // FETCH MY REGISTRATIONS
  // ==============================

  const fetchRegistrations = async () => {
    try {
      setLoading(true);

      if (!user.id) {
        alert("Please login again.");
        navigate("/login");
        return;
      }

      const response = await axios.get(
        `${API}/${user.id}`
      );

      console.log(
        "MY REGISTRATIONS RESPONSE:",
        response.data
      );

      if (response.data.success) {
        setRegistrations(
          response.data.registrations || []
        );
      }
    } catch (error) {
      console.error(
        "FETCH REGISTRATIONS ERROR:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to load registrations."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // LOAD ON PAGE OPEN
  // ==============================

  useEffect(() => {
    fetchRegistrations();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">

      {/* ==============================
          NAVBAR
      ============================== */}

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

      {/* ==============================
          MAIN
      ============================== */}

      <main className="p-8">

        <div className="max-w-7xl mx-auto">

          {/* HEADER */}

          <div className="mb-8">

            <h1 className="text-4xl font-bold text-gray-800">
              My Registrations
            </h1>

            <p className="text-gray-600 mt-2">
              View the events you have registered for.
            </p>

          </div>

          {/* ==============================
              LOADING
          ============================== */}

          {loading && (
            <div className="bg-white rounded-xl shadow-md p-10 text-center">

              <p className="text-gray-600">
                Loading registrations...
              </p>

            </div>
          )}

          {/* ==============================
              NO REGISTRATIONS
          ============================== */}

          {!loading &&
            registrations.length === 0 && (
              <div className="bg-white rounded-xl shadow-md p-10 text-center">

                <div className="text-5xl mb-4">
                  📝
                </div>

                <h2 className="text-2xl font-bold text-gray-800">
                  No Registrations Yet
                </h2>

                <p className="text-gray-600 mt-2">
                  You have not registered for any
                  events yet.
                </p>

                <button
                  onClick={() =>
                    navigate("/student-events")
                  }
                  className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
                >
                  Browse Events
                </button>

              </div>
            )}

          {/* ==============================
              REGISTRATIONS
          ============================== */}

          {!loading &&
            registrations.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {registrations.map((registration) => {

                  const event =
                    registration.event ||
                    registration;

                  const eventDate =
                    event.eventDate ||
                    event.event_date;

                  return (
                    <div
                      key={registration.id}
                      className="bg-white rounded-xl shadow-md p-6"
                    >

                      <div className="text-4xl mb-4">
                        📅
                      </div>

                      <h2 className="text-2xl font-bold text-gray-800">
                        {event.title ||
                          "Event"}
                      </h2>

                      <p className="text-gray-600 mt-3">
                        {event.description ||
                          "No description available."}
                      </p>

                      <div className="mt-5 space-y-2 text-gray-700">

                        <p>
                          <strong>
                            📍 Venue:
                          </strong>{" "}
                          {event.venue ||
                            "Not available"}
                        </p>

                        <p>
                          <strong>
                            📅 Date:
                          </strong>{" "}
                          {eventDate
                            ? new Date(
                                eventDate
                              ).toLocaleDateString()
                            : "Not available"}
                        </p>

                        <p>
                          <strong>
                            Status:
                          </strong>{" "}
                          {event.status ||
                            "UPCOMING"}
                        </p>

                      </div>

                      <div className="mt-6">

                        <span className="inline-block bg-green-100 text-green-700 px-4 py-2 rounded-lg font-semibold">
                          ✅ Registered
                        </span>

                      </div>

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

export default MyRegistrations;