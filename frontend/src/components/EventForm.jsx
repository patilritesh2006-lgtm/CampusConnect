import { useState } from "react";

function EventForm({ onCreate }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    venue: "",
    event_date: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    onCreate(formData);

    setFormData({
      title: "",
      description: "",
      venue: "",
      event_date: "",
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6">
        Create New Event
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">

        <input
          type="text"
          name="title"
          placeholder="Event Title"
          value={formData.title}
          onChange={handleChange}
          required
          className="w-full border rounded-lg p-3"
        />

        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          className="w-full border rounded-lg p-3"
        />

        <input
          type="text"
          name="venue"
          placeholder="Venue"
          value={formData.venue}
          onChange={handleChange}
          className="w-full border rounded-lg p-3"
        />

        <input
          type="date"
          name="event_date"
          value={formData.event_date}
          onChange={handleChange}
          required
          className="w-full border rounded-lg p-3"
        />

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-3"
        >
          Create Event
        </button>

      </form>
    </div>
  );
}

export default EventForm;