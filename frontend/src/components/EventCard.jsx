function EventCard({ event, onDelete }) {
  return (
    <div className="bg-white shadow-lg rounded-xl p-5">

      <h2 className="text-xl font-bold">
        {event.title}
      </h2>

      <p className="mt-2 text-gray-600">
        {event.description}
      </p>

      <p className="mt-3">
        <strong>Venue:</strong> {event.venue}
      </p>

      <p>
        <strong>Date:</strong>{" "}
        {new Date(event.event_date).toLocaleDateString()}
      </p>

      <button
        onClick={() => onDelete(event.id)}
        className="mt-5 bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg"
      >
        Delete
      </button>

    </div>
  );
}

export default EventCard;