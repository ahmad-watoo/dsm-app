import axios from "axios";
import {
  announceSessionExpired,
  readToken,
  SessionExpiredError,
} from "../utils/session";
import { isTokenExpired } from "../utils/token";

// const BASE_URL = import.meta.env.DEV ? "" : import.meta.env.VITE_APIBASE_URL;

// const BASE_URL = import.meta.env.VITE_APIBASE_URL;
const BASE_URL = import.meta.env.VITE_APIBASE_URL || "";

const api = axios.create({ baseURL: BASE_URL });

const isAuthFreeUrl = (url = "") => /\/Login\//i.test(url);

api.interceptors.request.use((config) => {
  if (isAuthFreeUrl(config.url)) {
    delete config.headers.Authorization;
    return config;
  }

  const token = readToken();
  if (!token) return config;

  if (isTokenExpired(token)) {
    announceSessionExpired("expired");
    return Promise.reject(new SessionExpiredError());
  }

  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401 && !isAuthFreeUrl(error?.config?.url)) {
      announceSessionExpired("unauthorized");
      return Promise.reject(new SessionExpiredError());
    }
    return Promise.reject(error);
  },
);

export default api;
