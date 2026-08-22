import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Automatically attach JWT token to every API request
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 token expiration and network errors
API.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      const currentPath = window.location.pathname;
      if (currentPath !== "/login" && currentPath !== "/") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default API;