import axios from "axios";

const API = "http://localhost:5000/api";

// Create Event
export const createEvent = async (eventData) => {
  const response = await axios.post(`${API}/events`, eventData);
  return response.data;
};

// Get All Events
export const getEvents = async () => {
  const response = await axios.get(`${API}/events`);
  return response.data;
};

// Delete Event
export const deleteEvent = async (id) => {
  const response = await axios.delete(`${API}/events/${id}`);
  return response.data;
};