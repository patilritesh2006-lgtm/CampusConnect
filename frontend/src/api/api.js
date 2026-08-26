import axios from "axios";

// Dynamically determine the backend API base URL
// Automatically connects to localhost or your Wi-Fi IP (e.g. on mobile phones) or cloud URLs
const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (import.meta.env.VITE_API_BASE_URL) return import.meta.env.VITE_API_BASE_URL;
  if (typeof window !== "undefined" && window.location.hostname) {
    return `http://${window.location.hostname}:5000/api`;
  }
  return "http://localhost:5000/api";
};

const API = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true, // Send HTTP-only refresh token cookie with requests
});

// Automatically attach JWT access token to every API request
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

// Response interceptor: Silent Token Refresh on 401
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

API.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Do not attempt refresh on login or refresh endpoint failures
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/login") &&
      !originalRequest.url.includes("/auth/refresh")
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return API(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post(
          `${getBaseURL()}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        if (response.data.success && response.data.token) {
          const newToken = response.data.token;
          localStorage.setItem("token", newToken);
          if (response.data.user) {
            localStorage.setItem("user", JSON.stringify(response.data.user));
          }

          API.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
          originalRequest.headers.Authorization = `Bearer ${newToken}`;

          processQueue(null, newToken);
          return API(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        const currentPath = window.location.pathname;
        if (currentPath !== "/login" && currentPath !== "/") {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default API;