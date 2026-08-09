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

    if (!formData.title.trim()) {
      alert("Please enter event title.");
      return;
    }

    if (!formData.venue.trim()) {
      alert("Please enter event venue.");
      return;
    }

    if (!formData.event_date) {
      alert("Please select event date.");
      return;
    }

    onCreate(formData);

    setFormData({
      title: "",
      description: "",
      venue: "",
      event_date: "",
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Create New Event
      </h2>

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        {/* TITLE */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Event Title
          </label>

          <input
            type="text"
            name="title"
            placeholder="Enter event title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* DESCRIPTION */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Description
          </label>

          <textarea
            name="description"
            placeholder="Enter event description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* VENUE */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Venue
          </label>

          <input
            type="text"
            name="venue"
            placeholder="Enter event venue"
            value={formData.venue}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* DATE */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Event Date
          </label>

          <input
            type="date"
            name="event_date"
            value={formData.event_date}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* SUBMIT */}
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg p-3 transition"
        >
          Create Event
        </button>
      </form>
    </div>
  );
}

export default EventForm;