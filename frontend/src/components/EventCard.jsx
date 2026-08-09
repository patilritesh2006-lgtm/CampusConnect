function EventCard({ event, onDelete }) {
  const eventDate = event.eventDate || event.event_date;

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      {/* EVENT TITLE */}
      <h2 className="text-xl font-bold text-gray-800">
        {event.title}
      </h2>

      {/* DESCRIPTION */}
      <p className="mt-3 text-gray-600">
        {event.description || "No description available."}
      </p>

      {/* VENUE */}
      <p className="mt-4 text-gray-700">
        <strong>Venue:</strong> {event.venue}
      </p>

      {/* DATE */}
      <p className="mt-2 text-gray-700">
        <strong>Date:</strong>{" "}
        {eventDate
          ? new Date(eventDate).toLocaleDateString()
          : "Not available"}
      </p>

      {/* STATUS */}
      <p className="mt-2 text-gray-700">
        <strong>Status:</strong>{" "}
        {event.status || "UPCOMING"}
      </p>

      {/* DELETE */}
      <button
        onClick={() => onDelete(event.id)}
        className="mt-5 bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg transition"
      >
        Delete
      </button>
    </div>
  );
}

export default EventCard;