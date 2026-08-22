import { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/api";
import AppNavbar from "../components/AppNavbar";
import { Calendar, MapPin, CheckCircle, Award, Trash2 } from "lucide-react";

export default function MyRegistrations() {
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);

  const userString = localStorage.getItem("user");
  let user = {};
  try {
    user = JSON.parse(userString || "{}");
  } catch (error) {}

  const fetchRegistrations = useCallback(async () => {
    try {
      setLoading(true);
      if (!user.id) {
        navigate("/login");
        return;
      }
      const response = await API.get("/registrations/" + user.id);
      if (response.data.success) {
        setRegistrations(response.data.registrations || []);
      }
    } catch (error) {
      console.error("FETCH REGISTRATIONS ERROR:", error);
    } finally {
      setLoading(false);
    }
  }, [navigate, user.id]);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  const handleCancel = async (registrationId, eventTitle) => {
    if (!window.confirm("Are you sure you want to cancel your registration for \"" + eventTitle + "\"?")) return;
    try {
      setCancelling(registrationId);
      const res = await API.delete("/registrations/" + registrationId);
      if (res.data.success) {
        setRegistrations((prev) => prev.filter((r) => r.id !== registrationId));
        alert("Registration cancelled successfully.");
      }
    } catch (err) {
      alert("Failed to cancel registration: " + (err.response?.data?.message || err.message));
    } finally {
      setCancelling(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <AppNavbar role="STUDENT" />

      <main className="p-6 md:p-8 flex-1">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border border-gray-100">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Registrations</h1>
              <p className="text-gray-600 text-sm mt-1">
                View your confirmed event sign-ups, attendance records, and claim completion certificates.
              </p>
            </div>

            <div className="bg-blue-50 text-blue-700 font-bold px-4 py-2 rounded-xl text-sm self-start md:self-auto">
              Total: {registrations.length} Registrations
            </div>
          </div>

          {loading && (
            <div className="bg-white rounded-2xl shadow-md p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-3"></div>
              <p className="text-gray-600">Loading your registrations...</p>
            </div>
          )}

          {!loading && registrations.length === 0 && (
            <div className="bg-white rounded-2xl shadow-md p-12 text-center border border-gray-100">
              <div className="text-5xl mb-4">📝</div>
              <h2 className="text-2xl font-bold text-gray-800">No Registrations Yet</h2>
              <p className="text-gray-600 text-sm mt-2 max-w-md mx-auto">
                You haven't signed up for any campus events yet. Explore upcoming hackathons and workshops!
              </p>
              <button
                onClick={() => navigate("/student-events")}
                className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold text-sm shadow-sm transition"
              >
                Browse Campus Events
              </button>
            </div>
          )}

          {!loading && registrations.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {registrations.map((registration) => {
                const event = registration.event || {};
                const eventDate = event.eventDate || event.event_date;
                const hasCert = Boolean(registration.certificate);

                return (
                  <div
                    key={registration.id}
                    className="bg-white rounded-2xl shadow-md p-6 flex flex-col justify-between hover:shadow-xl transition border border-gray-100"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <span
                          className={"text-[11px] font-bold px-2.5 py-0.5 rounded-full " + (event.status === "ONGOING" ? "bg-amber-100 text-amber-800" : event.status === "COMPLETED" ? "bg-gray-100 text-gray-800" : "bg-blue-100 text-blue-800")}
                        >
                          {event.status || "UPCOMING"}
                        </span>

                        <span
                          className={"flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full " + (registration.attended ? "bg-green-100 text-green-800" : "bg-blue-50 text-blue-700")}
                        >
                          <CheckCircle size={13} />
                          {registration.attended ? "Attended ✓" : "Confirmed"}
                        </span>
                      </div>

                      <h2 className="text-xl font-bold text-gray-900 line-clamp-1">
                        {event.title || "Event"}
                      </h2>
                      <p className="text-gray-600 text-xs mt-2 line-clamp-2">
                        {event.description || "No description provided."}
                      </p>

                      <div className="mt-4 space-y-2 text-xs text-gray-600 border-t pt-3">
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-gray-400 shrink-0" />
                          <span className="truncate"><strong>Venue:</strong> {event.venue || "TBA"}</span>
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
                      </div>
                    </div>

                    <div className="mt-6 pt-3 border-t space-y-2">
                      {hasCert && (
                        <Link
                          to="/student-certificates"
                          className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
                        >
                          <Award size={14} />
                          View Certificate
                        </Link>
                      )}

                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-400 font-mono text-[10px]">
                          ID: {registration.id.slice(0, 8)}...
                        </span>

                        <button
                          onClick={() => handleCancel(registration.id, event.title)}
                          disabled={cancelling === registration.id || event.status === "COMPLETED"}
                          className="text-red-500 hover:text-red-700 font-semibold text-xs flex items-center gap-1 disabled:opacity-30"
                        >
                          <Trash2 size={13} />
                          {cancelling === registration.id ? "Cancelling..." : "Cancel"}
                        </button>
                      </div>
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