import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import AppNavbar from "../components/AppNavbar";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, MapPin, X } from "lucide-react";

export default function CalendarView() {
  const [events, setEvents] = useState([]);
  const [registeredIds, setRegisteredIds] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filter, setFilter] = useState("ALL");
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const loadData = async () => {
    try {
      const [eventsRes, regRes] = await Promise.all([
        API.get("/events"),
        user.id ? API.get("/registrations/" + user.id) : Promise.resolve({ data: { registrations: [] } }),
      ]);

      if (eventsRes.data.success) {
        setEvents(eventsRes.data.events || []);
      }
      if (regRes.data.success) {
        setRegisteredIds((regRes.data.registrations || []).map((r) => r.eventId));
      }
    } catch (err) {
      console.error("Calendar data error:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const today = () => setCurrentDate(new Date());

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const eventsByDate = {};
  events.forEach((e) => {
    const rawDate = e.eventDate || e.event_date;
    if (!rawDate) return;
    const d = new Date(rawDate);
    const key = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
    if (!eventsByDate[key]) eventsByDate[key] = [];
    eventsByDate[key].push(e);
  });

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <AppNavbar role={user.role} />

      <main className="p-6 md:p-8 flex-1">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <CalendarIcon size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {monthNames[month]} {year}
                </h1>
                <p className="text-xs text-gray-500">Interactive Campus Event Schedule</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setFilter("ALL")}
                className={"px-3 py-1.5 rounded-xl text-xs font-semibold transition " + (filter === "ALL" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700")}
              >
                All Events
              </button>
              <button
                onClick={() => setFilter("REGISTERED")}
                className={"px-3 py-1.5 rounded-xl text-xs font-semibold transition " + (filter === "REGISTERED" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700")}
              >
                My Registered Events
              </button>

              <div className="flex items-center gap-1 border-l pl-2 ml-2">
                <button
                  onClick={prevMonth}
                  className="p-2 rounded-xl hover:bg-gray-100 text-gray-700 transition"
                  title="Previous Month"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={today}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
                >
                  Today
                </button>
                <button
                  onClick={nextMonth}
                  className="p-2 rounded-xl hover:bg-gray-100 text-gray-700 transition"
                  title="Next Month"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
            <div className="grid grid-cols-7 bg-gray-50 border-b text-center text-xs font-bold text-gray-600 uppercase py-3">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-gray-100 text-sm">
              {Array.from({ length: firstDayIndex }).map((_, i) => (
                <div key={"empty-" + i} className="h-28 bg-gray-50/50 p-2"></div>
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const dayKey = year + "-" + String(month + 1).padStart(2, "0") + "-" + String(dayNum).padStart(2, "0");
                const dayEvents = (eventsByDate[dayKey] || []).filter((e) =>
                  filter === "REGISTERED" ? registeredIds.includes(e.id) : true
                );

                const isToday =
                  new Date().toDateString() === new Date(year, month, dayNum).toDateString();

                return (
                  <div
                    key={"day-" + dayNum}
                    className={"h-28 p-2 flex flex-col justify-between hover:bg-blue-50/30 transition " + (isToday ? "bg-blue-50/40" : "")}
                  >
                    <div className="flex justify-between items-center">
                      <span
                        className={"text-xs font-bold " + (isToday ? "w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center" : "text-gray-700")}
                      >
                        {dayNum}
                      </span>
                      {dayEvents.length > 0 && (
                        <span className="text-[10px] font-semibold text-blue-600 bg-blue-100 px-1.5 py-0.2 rounded-full">
                          {dayEvents.length}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 overflow-y-auto max-h-16">
                      {dayEvents.slice(0, 2).map((ev) => (
                        <div
                          key={ev.id}
                          onClick={() => setSelectedEvent(ev)}
                          className={"text-[10px] p-1 rounded font-semibold truncate cursor-pointer transition " + (registeredIds.includes(ev.id) ? "bg-green-100 text-green-800 hover:bg-green-200" : "bg-blue-100 text-blue-800 hover:bg-blue-200")}
                          title={ev.title}
                        >
                          {ev.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <span className="text-[9px] text-gray-400 font-semibold block">
                          +{dayEvents.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-start">
              <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-full uppercase">
                {selectedEvent.status || "UPCOMING"}
              </span>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <h3 className="text-xl font-bold text-gray-900">{selectedEvent.title}</h3>
            <p className="text-xs text-gray-600">{selectedEvent.description || "No details available."}</p>

            <div className="p-3 bg-gray-50 rounded-xl space-y-2 text-xs text-gray-700">
              <p className="flex items-center gap-2">
                <MapPin size={14} className="text-gray-400" />
                <strong>Venue:</strong> {selectedEvent.venue}
              </p>
              <p className="flex items-center gap-2">
                <CalendarIcon size={14} className="text-gray-400" />
                <strong>Date:</strong>{" "}
                {new Date(selectedEvent.eventDate).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setSelectedEvent(null);
                  navigate("/student-events");
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl text-xs transition"
              >
                View on Events Page
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}