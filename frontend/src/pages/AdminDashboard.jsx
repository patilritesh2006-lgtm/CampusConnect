import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = "http://localhost:5000/api/events";

function AdminDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState({});
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  const [stats, setStats] = useState({
    totalEvents: 0,
    totalStudents: 0,
    totalRegistrations: 0,
    upcomingEvents: 0,
  });

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    venue: "",
    event_date: "",
  });

  const [showForm, setShowForm] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);

  // ======================================================
  // LOAD ADMIN USER
  // ======================================================

  useEffect(() => {
    const userString = localStorage.getItem("user");

    try {
      const savedUser = JSON.parse(userString || "{}");
      setUser(savedUser);
    } catch (error) {
      console.error("USER DATA ERROR:", error);
      setUser({});
    }
  }, []);

  // ======================================================
  // GET AUTHORIZATION HEADER
  // ======================================================

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");

    return {
      Authorization: `Bearer ${token}`,
    };
  };

  // ======================================================
  // FETCH EVENTS
  // ======================================================

  const fetchEvents = async () => {
    try {
      setLoading(true);

      const response = await axios.get(API, {
        headers: getAuthHeaders(),
      });

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
  // FETCH ADMIN STATS
  // ======================================================

  const fetchStats = async () => {
    try {
      setStatsLoading(true);

      const response = await axios.get(`${API}/stats`, {
        headers: getAuthHeaders(),
      });

      console.log("ADMIN STATS:", response.data);

      if (response.data.success) {
        setStats(
          response.data.stats || {
            totalEvents: 0,
            totalStudents: 0,
            totalRegistrations: 0,
            upcomingEvents: 0,
          }
        );
      }
    } catch (error) {
      console.error("FETCH STATS ERROR:", error);

      alert(
        error.response?.data?.message ||
          "Failed to load dashboard statistics."
      );
    } finally {
      setStatsLoading(false);
    }
  };

  // ======================================================
  // LOAD DASHBOARD DATA
  // ======================================================

  useEffect(() => {
    fetchEvents();
    fetchStats();
  }, []);

  // ======================================================
  // FORM CHANGE
  // ======================================================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ======================================================
  // CREATE / UPDATE EVENT
  // ======================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (
        !formData.title ||
        !formData.venue ||
        !formData.event_date
      ) {
        alert("Please fill all required fields.");
        return;
      }

      let response;

      if (editingEventId) {
        response = await axios.put(
          `${API}/${editingEventId}`,
          formData,
          {
            headers: getAuthHeaders(),
          }
        );
      } else {
        response = await axios.post(API, formData, {
          headers: getAuthHeaders(),
        });
      }

      if (response.data.success) {
        alert(
          editingEventId
            ? "Event updated successfully!"
            : "Event created successfully!"
        );

        setFormData({
          title: "",
          description: "",
          venue: "",
          event_date: "",
        });

        setEditingEventId(null);
        setShowForm(false);

        await fetchEvents();
        await fetchStats();
      }
    } catch (error) {
      console.error("SAVE EVENT ERROR:", error);

      alert(
        error.response?.data?.message ||
          "Failed to save event."
      );
    }
  };

  // ======================================================
  // EDIT EVENT
  // ======================================================

  const handleEdit = (event) => {
    const eventDate = event.eventDate || event.event_date;

    let formattedDate = "";

    if (eventDate) {
      formattedDate = new Date(eventDate)
        .toISOString()
        .split("T")[0];
    }

    setFormData({
      title: event.title || "",
      description: event.description || "",
      venue: event.venue || "",
      event_date: formattedDate,
    });

    setEditingEventId(event.id);
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ======================================================
  // DELETE EVENT
  // ======================================================

  const handleDelete = async (eventId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this event?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await axios.delete(
        `${API}/${eventId}`,
        {
          headers: getAuthHeaders(),
        }
      );

      if (response.data.success) {
        alert("Event deleted successfully!");

        await fetchEvents();
        await fetchStats();
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
  // CANCEL FORM
  // ======================================================

  const handleCancel = () => {
    setFormData({
      title: "",
      description: "",
      venue: "",
      event_date: "",
    });

    setEditingEventId(null);
    setShowForm(false);
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
  // REFRESH DASHBOARD
  // ======================================================

  const handleRefresh = async () => {
    await fetchEvents();
    await fetchStats();
  };

  // ======================================================
  // UI
  // ======================================================

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

          <p className="text-sm text-gray-500">
            Admin Panel
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg transition"
        >
          Logout
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

          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">

            <div>
              <h1 className="text-4xl font-bold text-gray-800">
                Admin Dashboard
              </h1>

              <p className="text-gray-600 mt-2">
                Welcome, {user.fullName || "Administrator"} 👋
              </p>
            </div>

            <button
              onClick={handleRefresh}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-semibold transition"
            >
              Refresh Dashboard
            </button>

          </div>

          {/* ==================================================
              STATISTICS
          ================================================== */}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

            {/* TOTAL EVENTS */}

            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-600">

              <div className="flex justify-between items-start">

                <div>
                  <p className="text-gray-500 font-medium">
                    Total Events
                  </p>

                  <h2 className="text-4xl font-bold text-gray-800 mt-2">
                    {statsLoading ? "..." : stats.totalEvents}
                  </h2>
                </div>

                <div className="text-4xl">
                  📅
                </div>

              </div>

              <p className="text-sm text-gray-500 mt-4">
                All college events
              </p>

            </div>

            {/* TOTAL STUDENTS */}

            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-600">

              <div className="flex justify-between items-start">

                <div>
                  <p className="text-gray-500 font-medium">
                    Total Students
                  </p>

                  <h2 className="text-4xl font-bold text-gray-800 mt-2">
                    {statsLoading ? "..." : stats.totalStudents}
                  </h2>
                </div>

                <div className="text-4xl">
                  👨‍🎓
                </div>

              </div>

              <p className="text-sm text-gray-500 mt-4">
                Registered students
              </p>

            </div>

            {/* TOTAL REGISTRATIONS */}

            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-600">

              <div className="flex justify-between items-start">

                <div>
                  <p className="text-gray-500 font-medium">
                    Registrations
                  </p>

                  <h2 className="text-4xl font-bold text-gray-800 mt-2">
                    {statsLoading
                      ? "..."
                      : stats.totalRegistrations}
                  </h2>
                </div>

                <div className="text-4xl">
                  📝
                </div>

              </div>

              <p className="text-sm text-gray-500 mt-4">
                Event registrations
              </p>

            </div>

            {/* UPCOMING EVENTS */}

            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">

              <div className="flex justify-between items-start">

                <div>
                  <p className="text-gray-500 font-medium">
                    Upcoming Events
                  </p>

                  <h2 className="text-4xl font-bold text-gray-800 mt-2">
                    {statsLoading
                      ? "..."
                      : stats.upcomingEvents}
                  </h2>
                </div>

                <div className="text-4xl">
                  🚀
                </div>

              </div>

              <p className="text-sm text-gray-500 mt-4">
                Events coming soon
              </p>

            </div>

          </div>

          {/* ==================================================
              ADMIN INFORMATION
          ================================================== */}

          <div className="bg-white rounded-xl shadow-md p-6 mb-8">

            <h2 className="text-2xl font-semibold mb-4">
              Admin Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              <div>
                <p className="text-sm text-gray-500">
                  Name
                </p>

                <p className="font-semibold text-gray-800">
                  {user.fullName || "Administrator"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Email
                </p>

                <p className="font-semibold text-gray-800">
                  {user.email || "Not available"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Role
                </p>

                <p className="font-semibold text-blue-600">
                  {user.role || "ADMIN"}
                </p>
              </div>

            </div>

          </div>

          {/* ==================================================
              ACTION BUTTONS
          ================================================== */}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

            {/* CREATE EVENT */}

            <button
              onClick={() => {
                setEditingEventId(null);

                setFormData({
                  title: "",
                  description: "",
                  venue: "",
                  event_date: "",
                });

                setShowForm(true);

                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                });
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl p-6 text-left shadow-md transition"
            >

              <div className="text-4xl mb-3">
                ➕
              </div>

              <h2 className="text-xl font-bold">
                Create Event
              </h2>

              <p className="mt-2 text-blue-100">
                Create a new college event.
              </p>

            </button>

            {/* MANAGE EVENTS */}

            <button
              onClick={() => {
                document
                  .getElementById("events-section")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  });
              }}
              className="bg-white hover:bg-gray-50 rounded-xl p-6 text-left shadow-md transition"
            >

              <div className="text-4xl mb-3">
                📅
              </div>

              <h2 className="text-xl font-bold">
                Manage Events
              </h2>

              <p className="mt-2 text-gray-600">
                View, edit and delete events.
              </p>

            </button>

            {/* STUDENTS */}

            <button
              onClick={() => {
                alert(
                  "Student management will be added next."
                );
              }}
              className="bg-white hover:bg-gray-50 rounded-xl p-6 text-left shadow-md transition"
            >

              <div className="text-4xl mb-3">
                👨‍🎓
              </div>

              <h2 className="text-xl font-bold">
                Students
              </h2>

              <p className="mt-2 text-gray-600">
                View registered students.
              </p>

            </button>

          </div>

          {/* ==================================================
              CREATE / EDIT FORM
          ================================================== */}

          {showForm && (
            <div className="bg-white rounded-xl shadow-md p-8 mb-8">

              <div className="flex justify-between items-center mb-6">

                <h2 className="text-2xl font-bold">
                  {editingEventId
                    ? "Edit Event"
                    : "Create New Event"}
                </h2>

                <button
                  onClick={handleCancel}
                  className="text-gray-500 hover:text-gray-800 text-2xl"
                >
                  ✕
                </button>

              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >

                {/* TITLE */}

                <div>

                  <label className="block font-semibold mb-2">
                    Event Title
                  </label>

                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter event title"
                    className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />

                </div>

                {/* DESCRIPTION */}

                <div>

                  <label className="block font-semibold mb-2">
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter event description"
                    rows="4"
                    className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                </div>

                {/* VENUE */}

                <div>

                  <label className="block font-semibold mb-2">
                    Venue
                  </label>

                  <input
                    type="text"
                    name="venue"
                    value={formData.venue}
                    onChange={handleChange}
                    placeholder="Enter venue"
                    className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />

                </div>

                {/* DATE */}

                <div>

                  <label className="block font-semibold mb-2">
                    Event Date
                  </label>

                  <input
                    type="date"
                    name="event_date"
                    value={formData.event_date}
                    onChange={handleChange}
                    className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />

                </div>

                {/* BUTTONS */}

                <div className="flex gap-4">

                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
                  >
                    {editingEventId
                      ? "Update Event"
                      : "Create Event"}
                  </button>

                  <button
                    type="button"
                    onClick={handleCancel}
                    className="bg-gray-200 hover:bg-gray-300 px-6 py-3 rounded-lg"
                  >
                    Cancel
                  </button>

                </div>

              </form>

            </div>
          )}

          {/* ==================================================
              EVENTS SECTION
          ================================================== */}

          <section id="events-section">

            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">

              <div>

                <h2 className="text-3xl font-bold text-gray-800">
                  Manage Events
                </h2>

                <p className="text-gray-600 mt-1">
                  Create, edit and delete college events.
                </p>

              </div>

              <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-semibold">
                {events.length} Events
              </span>

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

                <h3 className="text-2xl font-bold">
                  No Events Yet
                </h3>

                <p className="text-gray-600 mt-2">
                  Create your first college event.
                </p>

                <button
                  onClick={() => setShowForm(true)}
                  className="mt-5 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
                >
                  Create Event
                </button>

              </div>
            )}

            {/* EVENTS */}

            {!loading && events.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {events.map((event) => {

                  const eventDate =
                    event.eventDate ||
                    event.event_date;

                  return (
                    <div
                      key={event.id}
                      className="bg-white rounded-xl shadow-md p-6"
                    >

                      <div className="text-4xl mb-4">
                        📅
                      </div>

                      <h3 className="text-2xl font-bold text-gray-800">
                        {event.title}
                      </h3>

                      <p className="text-gray-600 mt-3">
                        {event.description ||
                          "No description available."}
                      </p>

                      <div className="mt-5 space-y-2">

                        <p>
                          <strong>Venue:</strong>{" "}
                          {event.venue}
                        </p>

                        <p>
                          <strong>Date:</strong>{" "}
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

                        <p>
                          <strong>Registrations:</strong>{" "}
                          {event.registrations?.length || 0}
                        </p>

                      </div>

                      {/* ACTIONS */}

                      <div className="flex gap-3 mt-6">

                        <button
                          onClick={() =>
                            handleEdit(event)
                          }
                          className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-lg"
                        >
                          Edit
                        </button>

                        <button
  onClick={() => {
    navigate("/admin-students");
  }}
  className="bg-white hover:bg-gray-50 rounded-xl p-6 text-left shadow-md"
>
  <div className="text-4xl mb-3">
    🎓
  </div>

  <h2 className="text-xl font-bold">
    Students
  </h2>

  <p className="mt-2 text-gray-600">
    View registered students and their events.
  </p>
</button>

                      </div>

                    </div>
                  );
                })}

              </div>
            )}

          </section>

        </div>

      </main>

    </div>
  );
}

export default AdminDashboard;