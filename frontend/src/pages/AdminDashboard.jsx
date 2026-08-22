import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/api";
import AppNavbar from "../components/AppNavbar";
import { Plus, Users, Award, BarChart3, Megaphone, Calendar, Sparkles, RefreshCw } from "lucide-react";

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
    category: "Workshop",
    capacity: 100,
    status: "UPCOMING",
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
  // FETCH EVENTS
  // ======================================================

  const fetchEvents = async () => {
    try {
      setLoading(true);

      const response = await API.get("/events");

      if (response.data.success) {
        setEvents(response.data.events || []);
      }
    } catch (error) {
      console.error("FETCH EVENTS ERROR:", error);
      alert(error.response?.data?.message || "Failed to load events.");
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
      const response = await API.get("/events/stats");

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
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchStats();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (
        !formData.title?.trim() ||
        !formData.venue?.trim() ||
        !formData.event_date
      ) {
        alert("Please fill all required fields (title, venue, event date).");
        return;
      }

      let response;

      if (editingEventId) {
        response = await API.put(`/events/${editingEventId}`, formData);
      } else {
        response = await API.post("/events", formData);
      }

      if (response.data.success) {
        alert(
          editingEventId
            ? "Event updated successfully!"
            : "Event created and broadcasted to students successfully!"
        );

        setFormData({
          title: "",
          description: "",
          venue: "",
          event_date: "",
          category: "Workshop",
          capacity: 100,
          status: "UPCOMING",
        });

        setEditingEventId(null);
        setShowForm(false);

        await fetchEvents();
        await fetchStats();
      }
    } catch (error) {
      console.error("SAVE EVENT ERROR:", error);
      alert(error.response?.data?.message || "Failed to save event.");
    }
  };

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
      category: event.category || "Workshop",
      capacity: event.capacity || 100,
      status: event.status || "UPCOMING",
    });

    setEditingEventId(event.id);
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (eventId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this event? This will also remove any student registrations for this event."
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await API.delete(`/events/${eventId}`);

      if (response.data.success) {
        alert("Event deleted successfully!");
        await fetchEvents();
        await fetchStats();
      }
    } catch (error) {
      console.error("DELETE EVENT ERROR:", error);
      alert(error.response?.data?.message || "Failed to delete event.");
    }
  };

  const handleCancel = () => {
    setFormData({
      title: "",
      description: "",
      venue: "",
      event_date: "",
      category: "Workshop",
      capacity: 100,
      status: "UPCOMING",
    });

    setEditingEventId(null);
    setShowForm(false);
  };

  const handleRefresh = async () => {
    await fetchEvents();
    await fetchStats();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <AppNavbar role="ADMIN" />

      <main className="p-6 md:p-8 flex-1">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 text-purple-600 font-semibold text-xs uppercase tracking-wider mb-1">
                <Sparkles size={16} />
                Administrator Workspace
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
                Admin Control Center
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Welcome back, {user.fullName || "Administrator"} 👋 • College Event Management System
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-4 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-1.5 shadow-sm transition"
              >
                <RefreshCw size={14} /> Refresh Data
              </button>
            </div>
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

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {/* CREATE EVENT */}
            <button
              onClick={() => {
                setEditingEventId(null);
                setFormData({
                  title: "",
                  description: "",
                  venue: "",
                  event_date: "",
                  category: "Workshop",
                  capacity: 100,
                  status: "UPCOMING",
                });
                setShowForm(true);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl p-5 text-left shadow-md transition flex flex-col justify-between"
            >
              <div className="text-2xl mb-2">➕</div>
              <div>
                <h2 className="text-sm font-bold">Create Event</h2>
                <p className="text-[11px] text-blue-100 mt-0.5">New college event</p>
              </div>
            </button>

            {/* STUDENTS & ATTENDANCE */}
            <button
              onClick={() => navigate("/admin-students")}
              className="bg-white hover:bg-gray-50 text-gray-800 rounded-2xl p-5 text-left shadow-md border border-gray-100 transition flex flex-col justify-between"
            >
              <div className="text-2xl mb-2">👨‍🎓</div>
              <div>
                <h2 className="text-sm font-bold">Students & Roster</h2>
                <p className="text-[11px] text-gray-500 mt-0.5">Manage students</p>
              </div>
            </button>

            {/* CERTIFICATES REGISTRY */}
            <button
              onClick={() => navigate("/admin-certificates")}
              className="bg-white hover:bg-gray-50 text-gray-800 rounded-2xl p-5 text-left shadow-md border border-gray-100 transition flex flex-col justify-between"
            >
              <div className="text-2xl mb-2">📜</div>
              <div>
                <h2 className="text-sm font-bold">Certificates</h2>
                <p className="text-[11px] text-gray-500 mt-0.5">Issued credentials</p>
              </div>
            </button>

            {/* ANALYTICS */}
            <button
              onClick={() => navigate("/admin-analytics")}
              className="bg-white hover:bg-gray-50 text-gray-800 rounded-2xl p-5 text-left shadow-md border border-gray-100 transition flex flex-col justify-between"
            >
              <div className="text-2xl mb-2">📊</div>
              <div>
                <h2 className="text-sm font-bold">Analytics</h2>
                <p className="text-[11px] text-gray-500 mt-0.5">Stats & reports</p>
              </div>
            </button>

            {/* ANNOUNCEMENTS */}
            <button
              onClick={() => navigate("/announcements")}
              className="bg-white hover:bg-gray-50 text-gray-800 rounded-2xl p-5 text-left shadow-md border border-gray-100 transition flex flex-col justify-between"
            >
              <div className="text-2xl mb-2">📢</div>
              <div>
                <h2 className="text-sm font-bold">Notice Board</h2>
                <p className="text-[11px] text-gray-500 mt-0.5">Publish alerts</p>
              </div>
            </button>

            {/* CALENDAR */}
            <button
              onClick={() => navigate("/calendar")}
              className="bg-white hover:bg-gray-50 text-gray-800 rounded-2xl p-5 text-left shadow-md border border-gray-100 transition flex flex-col justify-between"
            >
              <div className="text-2xl mb-2">📅</div>
              <div>
                <h2 className="text-sm font-bold">Calendar</h2>
                <p className="text-[11px] text-gray-500 mt-0.5">Schedule grid</p>
              </div>
            </button>
          </div>

          {/* ==================================================
              CREATE / EDIT FORM
          ================================================== */}

          {showForm && (
            <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-extrabold text-gray-900">
                  {editingEventId ? "Edit Event Details" : "Create New College Event"}
                </h2>
                <button
                  onClick={handleCancel}
                  className="text-gray-400 hover:text-gray-700 text-xl font-bold p-1 rounded-lg"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. Annual Hackathon 2026"
                    className="w-full border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter event overview, agenda, prerequisites..."
                    rows="3"
                    className="w-full border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Venue *
                    </label>
                    <input
                      type="text"
                      name="venue"
                      value={formData.venue}
                      onChange={handleChange}
                      placeholder="e.g. Main Auditorium"
                      className="w-full border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Event Date *
                    </label>
                    <input
                      type="date"
                      name="event_date"
                      value={formData.event_date}
                      onChange={handleChange}
                      className="w-full border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="Workshop">Workshop</option>
                      <option value="Hackathon">Hackathon</option>
                      <option value="Seminar">Seminar</option>
                      <option value="Cultural">Cultural</option>
                      <option value="Sports">Sports</option>
                      <option value="Conference">Conference</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Capacity (Max Seats)
                    </label>
                    <input
                      type="number"
                      name="capacity"
                      min="1"
                      value={formData.capacity}
                      onChange={handleChange}
                      className="w-full border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="UPCOMING">Upcoming</option>
                      <option value="ONGOING">Ongoing</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl text-sm shadow-md transition"
                  >
                    {editingEventId ? "Update Event" : "Create & Broadcast Event"}
                  </button>

                  <button
                    type="button"
                    onClick={handleCancel}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-xl text-sm transition"
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
                      className="bg-white rounded-2xl shadow-md p-6 flex flex-col justify-between hover:shadow-xl transition border border-gray-100"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <span className="bg-blue-100 text-blue-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                            {event.category || "Workshop"}
                          </span>

                          <span className="bg-gray-100 text-gray-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                            {event.status || "UPCOMING"}
                          </span>
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 line-clamp-1">
                          {event.title}
                        </h3>

                        <p className="text-gray-600 text-xs mt-2 line-clamp-2">
                          {event.description || "No description available."}
                        </p>

                        <div className="mt-4 space-y-1.5 text-xs text-gray-600 border-t pt-3">
                          <p>
                            <strong>Venue:</strong> {event.venue}
                          </p>

                          <p>
                            <strong>Date:</strong>{" "}
                            {eventDate
                              ? new Date(eventDate).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })
                              : "TBA"}
                          </p>

                          <p>
                            <strong>Capacity:</strong> {event.capacity || 100} seats
                          </p>

                          <p>
                            <strong>Registrations:</strong>{" "}
                            <span className="font-semibold text-blue-600">
                              {event.registrations?.length || 0}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* ACTIONS */}
                      <div className="mt-6 pt-3 border-t flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() =>
                            navigate(`/admin-dashboard/events/${event.id}/students`)
                          }
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-3 rounded-xl text-xs text-center transition shadow-sm"
                        >
                          Attendance & Students
                        </button>

                        <button
                          onClick={() => handleEdit(event)}
                          className="bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-3 rounded-xl text-xs text-center transition"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(event.id)}
                          className="bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-2 px-3 rounded-xl text-xs text-center transition"
                        >
                          Delete
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