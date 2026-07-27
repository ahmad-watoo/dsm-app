import axios from "axios";

// Dev mein empty rakho — Vite proxy /api ko target server pe forward kar dega
// Production build mein isse real URL se replace karna hoga (ya server-side proxy chahiye hoga)
const BASE_URL = import.meta.env.DEV ? "" : import.meta.env.VITE_API_BASE_URL;

// const BASE_URL = import.meta.env.VITE_APIBASE_URL;

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("dsm_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
