import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import AppNavbar from "../components/AppNavbar";
import { Calendar, MapPin, Search, CheckCircle, Users, Sparkles } from "lucide-react";

function StudentEvents() {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(null);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");

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

  const fetchMyRegistrations = async () => {
    try {
      const userString = localStorage.getItem("user");
      const user = JSON.parse(userString || "{}");

      if (!user.id) return;

      const response = await API.get(`/registrations/${user.id}`);

      if (response.data.success) {
        const registrations = response.data.registrations || [];
        const eventIds = registrations.map((r) => r.eventId);
        setRegisteredEvents(eventIds);
      }
    } catch (error) {
      console.error("FETCH REGISTRATIONS ERROR:", error);
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchMyRegistrations();
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

      if (registeredEvents.includes(eventId)) {
        alert("You are already registered for this event.");
        return;
      }

      setRegistering(eventId);

      const response = await API.post(`/events/${eventId}/register`, {
        userId: user.id,
      });

      if (response.data.success) {
        alert("Registered successfully! 🎉 A notification has been sent to your inbox.");
        setRegisteredEvents((prev) => [...prev, eventId]);
      }
    } catch (error) {
      console.error("REGISTER EVENT ERROR:", error);
      alert(error.response?.data?.message || "Failed to register for event.");
    } finally {
      setRegistering(null);
    }
  };

  const categories = ["ALL", "Workshop", "Hackathon", "Seminar", "Cultural", "Sports", "Conference"];

  const filteredEvents = events.filter((event) => {
    const query = search.toLowerCase().trim();
    const matchesSearch =
      !query ||
      event.title?.toLowerCase().includes(query) ||
      event.description?.toLowerCase().includes(query) ||
      event.venue?.toLowerCase().includes(query);

    const matchesCategory =
      filterCategory === "ALL" ||
      (event.category || "Workshop").toLowerCase() === filterCategory.toLowerCase();

    const matchesStatus =
      filterStatus === "ALL" || event.status === filterStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <AppNavbar role="STUDENT" />

      <main className="p-6 md:p-8 flex-1">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* HEADER & FILTERS */}
          <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 border border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-blue-600 font-semibold text-xs uppercase tracking-wider mb-1">
                  <Sparkles size={16} />
                  Campus Discovery
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Explore College Events</h1>
                <p className="text-gray-600 text-sm mt-1">
                  Discover upcoming hackathons, tech workshops, guest seminars, and cultural festivals.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search size={18} className="absolute left-3.5 top-3 text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search events or venues..."
                    className="w-full sm:w-64 pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                  />
                </div>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs bg-white"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="UPCOMING">Upcoming</option>
                  <option value="ONGOING">Ongoing</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
            </div>

            {/* CATEGORY TABS */}
            <div className="flex gap-2 overflow-x-auto pt-4 mt-4 border-t border-gray-100 pb-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                    filterCategory === cat
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
                >
                  {cat === "ALL" ? "All Categories" : cat}
                </button>
              ))}
            </div>
          </div>

          {/* LOADING */}
          {loading && (
            <div className="bg-white rounded-2xl shadow-md p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-3"></div>
              <p className="text-gray-600 text-sm">Loading campus events...</p>
            </div>
          )}

          {/* NO EVENTS */}
          {!loading && events.length === 0 && (
            <div className="bg-white rounded-2xl shadow-md p-12 text-center border border-gray-100">
              <div className="text-5xl mb-4">📅</div>
              <h2 className="text-2xl font-bold text-gray-800">No Events Available</h2>
              <p className="text-gray-600 text-sm mt-2">There are currently no college events published.</p>
            </div>
          )}

          {/* SEARCH EMPTY */}
          {!loading && events.length > 0 && filteredEvents.length === 0 && (
            <div className="bg-white rounded-2xl shadow-md p-12 text-center border border-gray-100">
              <div className="text-5xl mb-4">🔍</div>
              <h2 className="text-2xl font-bold text-gray-800">No Matching Events</h2>
              <p className="text-gray-600 text-sm mt-2">Try adjusting your search or category filters.</p>
            </div>
          )}

          {/* EVENTS GRID */}
          {!loading && filteredEvents.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => {
                const eventDate = event.eventDate || event.event_date;
                const isRegistered = registeredEvents.includes(event.id);
                const isRegistering = registering === event.id;

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

                        <div className="flex items-center gap-2">
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            event.status === "ONGOING"
                              ? "bg-amber-100 text-amber-800"
                              : event.status === "COMPLETED"
                              ? "bg-gray-100 text-gray-800"
                              : "bg-blue-50 text-blue-700"
                          }`}>
                            {event.status || "UPCOMING"}
                          </span>

                          {isRegistered && (
                            <span className="flex items-center gap-1 text-[11px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                              <CheckCircle size={13} />
                              Registered
                            </span>
                          )}
                        </div>
                      </div>

                      <h2 className="text-xl font-bold text-gray-900 line-clamp-1">{event.title}</h2>
                      <p className="text-gray-600 text-xs mt-2 line-clamp-3 leading-relaxed">
                        {event.description || "No description provided."}
                      </p>

                      <div className="mt-4 space-y-2 text-xs text-gray-600 border-t pt-3">
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-gray-400 shrink-0" />
                          <span className="truncate"><strong>Venue:</strong> {event.venue}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-gray-400 shrink-0" />
                          <span>
                            <strong>Date:</strong>{" "}
                            {eventDate
                              ? new Date(eventDate).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })
                              : "TBA"}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Users size={14} className="text-gray-400 shrink-0" />
                          <span>
                            <strong>Capacity:</strong> {event.capacity || 100} seats
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRegister(event.id)}
                      disabled={isRegistered || isRegistering || event.status === "COMPLETED"}
                      className={`w-full mt-6 py-2.5 px-4 rounded-xl font-semibold text-xs transition shadow-sm ${
                        isRegistered
                          ? "bg-green-600 text-white cursor-default"
                          : isRegistering
                          ? "bg-gray-400 text-white cursor-not-allowed"
                          : event.status === "COMPLETED"
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                      }`}
                    >
                      {isRegistered
                        ? "✓ Registered"
                        : isRegistering
                        ? "Registering..."
                        : event.status === "COMPLETED"
                        ? "Event Concluded"
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
