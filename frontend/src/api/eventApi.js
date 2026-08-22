import API from "./api";

// ======================================================
// CREATE EVENT
// ======================================================

export const createEvent = async (eventData) => {
  const response = await API.post("/events", eventData);
  return response.data;
};

// ======================================================
// GET ALL EVENTS
// ======================================================

export const getEvents = async () => {
  const response = await API.get("/events");
  return response.data;
};

// ======================================================
// GET SINGLE EVENT
// ======================================================

export const getEventById = async (id) => {
  const response = await API.get(`/events/${id}`);
  return response.data;
};

// ======================================================
// UPDATE EVENT
// ======================================================

export const updateEvent = async (id, eventData) => {
  const response = await API.put(`/events/${id}`, eventData);
  return response.data;
};

// ======================================================
// DELETE EVENT
// ======================================================

export const deleteEvent = async (id) => {
  const response = await API.delete(`/events/${id}`);
  return response.data;
};