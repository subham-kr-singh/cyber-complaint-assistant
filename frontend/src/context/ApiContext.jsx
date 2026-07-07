import axios from "axios";

// Single source of truth for the backend base URL.
// In local dev (no VITE_API_URL set) the Vite proxy forwards /api → http://localhost:5000/api.
// In production set VITE_API_URL to your deployed backend URL (e.g. https://your-app.onrender.com/api).
const BASE_URL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: false,
});

// Attach the JWT token (if present) to every outgoing request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global response handling: auto-logout on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ---------- Grouped API calls (matches backend routes 1:1) ----------

export const authApi = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  getMe: () => api.get("/auth/me"),
};

export const complaintApi = {
  start: () => api.post("/complaints/start"),
  answer: (id, payload) => api.post(`/complaints/${id}/answer`, payload),
  get: (id) => api.get(`/complaints/${id}`),
  list: () => api.get("/complaints"),
  update: (id, payload) => api.patch(`/complaints/${id}`, payload),
  remove: (id) => api.delete(`/complaints/${id}`),
  classify: (id) => api.post(`/complaints/${id}/classify`),
  submit: (id) => api.post(`/complaints/${id}/submit`),
  getSummary: (id) => api.get(`/complaints/${id}/summary`),
  // Returns a URL string; uses the raw BASE_URL so the browser can open it directly
  getPdfUrl: (id) =>
    `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/complaints/${id}/pdf`,
  getStatus: (id) => api.get(`/complaints/${id}/status`),
  updateStatus: (id, status) => api.patch(`/complaints/${id}/status`, { status }),
};

export const evidenceApi = {
  upload: (complaintId, file) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post(`/complaints/${complaintId}/evidence`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  list: (complaintId) => api.get(`/complaints/${complaintId}/evidence`),
  remove: (complaintId, fileId) =>
    api.delete(`/complaints/${complaintId}/evidence/${fileId}`),
};

export const routingApi = {
  getAuthority: (crimeType) =>
    api.get(`/routing/authority`, { params: { crimeType } }),
  listCategories: () => api.get("/routing/categories"),
};

export default api;
