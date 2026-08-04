import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function StudentDashboard() {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registeredEvents, setRegisteredEvents] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (!token || !storedUser) {
      navigate("/login");
      return;
    }

    if (storedUser.role !== "student") {
      navigate("/admin-dashboard");
      return;
    }

    setUser(storedUser);
    fetchEvents(token);
    fetchRegistrations(storedUser.id);
  }, [navigate]);

  // ================= Fetch Events =================

  const fetchEvents = async (token) => {
    try {
      const response = await fetch("http://localhost:5000/api/events", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok && Array.isArray(data.events)) {
        setEvents(data.events);
      } else {
        setEvents([]);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // ================= Fetch My Registrations =================

  const fetchRegistrations = async (userId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/registrations/${userId}`
      );

      const data = await response.json();

      if (data.success) {
        const ids = data.registrations.map((r) => r.event_id);
        setRegisteredEvents(ids);
      }
    } catch (err) {
      console.log(err);
    }
  };

  // ================= Register =================

  const registerEvent = async (eventId) => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/registrations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: user.id,
            event_id: eventId,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        alert("✅ Registration Successful");

        setRegisteredEvents([...registeredEvents, eventId]);
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.log(err);
      alert("Registration Failed");
    }
  };

  // ================= Logout =================

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Navbar */}

      <nav className="bg-blue-600 text-white px-8 py-4 flex justify-between items-center">

        <h1 className="text-2xl font-bold">
          CampusConnect
        </h1>

        <button
          onClick={handleLogout}
          className="bg-white text-blue-600 px-5 py-2 rounded-lg"
        >
          Logout
        </button>

      </nav>

      <div className="p-8">

        <div className="bg-white rounded-xl shadow-md p-6 mb-8">

          <h2 className="text-3xl font-bold">

            Welcome {user?.full_name || "Student"} 👋

          </h2>

          <p className="text-gray-600 mt-2">
            Stay updated with latest college events.
          </p>

        </div>

        <h2 className="text-2xl font-bold mb-6">
          Upcoming Events
        </h2>

        {loading ? (
          <p>Loading...</p>
        ) : events.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow">
            No Events Found
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

            {events.map((event) => (

              <div
                key={event.id}
                className="bg-white rounded-xl shadow-lg p-6"
              >

                <h2 className="text-xl font-bold text-blue-600">
                  {event.title}
                </h2>

                <p className="mt-3 text-gray-600">
                  {event.description}
                </p>

                <p className="mt-4">
                  📅{" "}
                  {new Date(event.event_date).toLocaleDateString()}
                </p>

                <p>
                  📍 {event.venue}
                </p>

                {registeredEvents.includes(event.id) ? (
                  <button
                    disabled
                    className="mt-5 w-full bg-green-600 text-white py-2 rounded-lg cursor-not-allowed"
                  >
                    Registered ✅
                  </button>
                ) : (
                  <button
                    onClick={() => registerEvent(event.id)}
                    className="mt-5 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
                  >
                    Register
                  </button>
                )}

              </div>

            ))}

          </div>
        )}
      </div>
    </div>
  );
}

export default StudentDashboard;