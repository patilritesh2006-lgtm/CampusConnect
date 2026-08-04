import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = "http://localhost:5000/api/events";

function AdminDashboard() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    venue: "",
    event_date: "",
  });

  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalRegistrations: 0,
  });

  const [students, setStudents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // ---------------- Protect Route ----------------
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (!token || !storedUser) {
      navigate("/login");
      return;
    }

    if (storedUser.role !== "admin") {
      navigate("/student-dashboard");
      return;
    }

    fetchEvents();
    fetchStats();
  }, [navigate]);

  // ---------------- Logout ----------------
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // ---------------- Load Events ----------------
  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(API, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setEvents(Array.isArray(res.data.events) ? res.data.events : []);
    } catch (err) {
      console.error(err);
      setEvents([]);
    }
  };

  // ---------------- Dashboard Stats ----------------
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(`${API}/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // ---------------- Create Event ----------------
  const createEvent = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      await axios.post(API, form, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("✅ Event Created Successfully");

      setForm({
        title: "",
        description: "",
        venue: "",
        event_date: "",
      });

      fetchEvents();
      fetchStats();
    } catch (err) {
      console.error(err);
      alert("❌ Failed to create event");
    }

    setLoading(false);
  };

    // ---------------- Delete Event ----------------
  const deleteEvent = async (id) => {
    if (!window.confirm("Delete this event?")) return;

    try {
      const token = localStorage.getItem("token");

      await axios.delete(`${API}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchEvents();
      fetchStats();
    } catch (err) {
      console.error(err);
      alert("Failed to delete event");
    }
  };

  // ---------------- View Registered Students ----------------
  const viewStudents = async (eventId, eventTitle) => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(`${API}/${eventId}/students`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setStudents(res.data.students || []);
      setSelectedEvent(eventTitle);
      setShowModal(true);
    } catch (err) {
      console.error(err);
      alert("Failed to load students");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Navbar */}
      <nav className="bg-blue-600 text-white px-8 py-4 flex justify-between items-center shadow">

        <h1 className="text-2xl font-bold">
          CampusConnect Admin
        </h1>

        <button
          onClick={handleLogout}
          className="bg-white text-blue-600 px-5 py-2 rounded-lg hover:bg-gray-200"
        >
          Logout
        </button>

      </nav>

      <div className="max-w-7xl mx-auto p-8">

        <h1 className="text-4xl font-bold text-center mb-8">
          Admin Dashboard
        </h1>

        {/* Dashboard Cards */}

        <div className="grid md:grid-cols-2 gap-6 mb-10">

          <div className="bg-white rounded-xl shadow-lg p-6">

            <h2 className="text-gray-500 text-lg">
              Total Events
            </h2>

            <p className="text-4xl font-bold text-blue-600 mt-2">
              {stats.totalEvents}
            </p>

          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">

            <h2 className="text-gray-500 text-lg">
              Total Registrations
            </h2>

            <p className="text-4xl font-bold text-green-600 mt-2">
              {stats.totalRegistrations}
            </p>

          </div>

        </div>

        {/* Create Event Form */}

        <div className="bg-white rounded-xl shadow-lg p-6 mb-10">

          <h2 className="text-2xl font-bold mb-5">
            Create New Event
          </h2>

          <form
            onSubmit={createEvent}
            className="space-y-4"
          >

            <input
              type="text"
              placeholder="Event Title"
              value={form.title}
              onChange={(e) =>
                setForm({
                  ...form,
                  title: e.target.value,
                })
              }
              className="w-full border rounded-lg p-3"
              required
            />

            <textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) =>
                setForm({
                  ...form,
                  description: e.target.value,
                })
              }
              className="w-full border rounded-lg p-3"
            />

            <input
              type="text"
              placeholder="Venue"
              value={form.venue}
              onChange={(e) =>
                setForm({
                  ...form,
                  venue: e.target.value,
                })
              }
              className="w-full border rounded-lg p-3"
            />

            <input
              type="date"
              value={form.event_date}
              onChange={(e) =>
                setForm({
                  ...form,
                  event_date: e.target.value,
                })
              }
              className="w-full border rounded-lg p-3"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
            >
              {loading ? "Creating..." : "Create Event"}
            </button>

          </form>

        </div>

               {/* Events List */}
        <div>

          <h2 className="text-3xl font-bold mb-6">
            All Events
          </h2>

          {events.length === 0 ? (

            <div className="bg-white rounded-xl shadow-lg p-8 text-center">

              <h3 className="text-2xl font-semibold">
                No Events Available
              </h3>

            </div>

          ) : (

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

              {events.map((event) => (

                <div
                  key={event.id}
                  className="bg-white rounded-xl shadow-lg p-6"
                >

                  <h3 className="text-2xl font-bold text-blue-600">
                    {event.title}
                  </h3>

                  <p className="text-gray-600 mt-3">
                    {event.description || "No description"}
                  </p>

                  <div className="mt-4 space-y-2">

                    <p>
                      📍 <strong>Venue:</strong> {event.venue || "Not specified"}
                    </p>

                    <p>
                      📅 <strong>Date:</strong>{" "}
                      {new Date(event.event_date).toLocaleDateString()}
                    </p>

                    <p className="font-semibold text-green-600">
                      👥 Registrations: {event.registrationCount}
                    </p>

                  </div>

                  <div className="flex gap-3 mt-6">

                    <button
                      onClick={() =>
                        viewStudents(event.id, event.title)
                      }
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg"
                    >
                      View Students
                    </button>

                    <button
                      onClick={() => deleteEvent(event.id)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg"
                    >
                      Delete
                    </button>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

      </div>

      {/* Students Modal */}

      {showModal && (

        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">

          <div className="bg-white rounded-xl w-full max-w-2xl p-6">

            <div className="flex justify-between items-center mb-5">

              <h2 className="text-2xl font-bold">
                {selectedEvent}
              </h2>

              <button
                onClick={() => setShowModal(false)}
                className="text-red-600 font-bold text-xl"
              >
                ✕
              </button>

            </div>

            {students.length === 0 ? (

              <p>No students registered.</p>

            ) : (

              <table className="w-full border">

                <thead>

                  <tr className="bg-gray-100">

                    <th className="border p-3">Name</th>
                    <th className="border p-3">Email</th>
                    <th className="border p-3">Department</th>
                    <th className="border p-3">Year</th>

                  </tr>

                </thead>

                <tbody>

                  {students.map((student) => (

                    <tr key={student.id}>

                      <td className="border p-3">
                        {student.full_name}
                      </td>

                      <td className="border p-3">
                        {student.email}
                      </td>

                      <td className="border p-3">
                        {student.department || "-"}
                      </td>

                      <td className="border p-3">
                        {student.year || "-"}
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            )}

          </div>

        </div>

      )}

    </div>
  );
}

export default AdminDashboard;