import axios from "axios";

// 🌍 Base URL (env or fallback)
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1",
});

// 🔐 Attach JWT token to every request
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // ❗ Fix for CSV / file download
    if (config.responseType === "blob") {
      delete config.headers["Content-Type"];
    } else {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// 🚨 Global error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    // 🔐 Unauthorized / Forbidden → logout
    if (status === 401 || status === 403) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      alert("Session expired. Please login again.");

      window.location.href = "/";
    }

    // ❌ Server error logging
    if (status === 500) {
      console.error("Server error (500):", error.response?.data);
    }

    return Promise.reject(error);
  }
);

export default API;