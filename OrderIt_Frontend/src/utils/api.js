import axios from "axios";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

const API = axios.create({
  baseURL: `${backendUrl}/api`,
});

API.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;
