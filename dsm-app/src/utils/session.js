import { isTokenExpired } from "./token";

const TOKEN_KEY = "dsm_token";
const USER_KEY = "dsm_user";

export const readToken = () => localStorage.getItem(TOKEN_KEY);

export function readUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function storeSession(user, token) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function loadStoredSession() {
  const token = readToken();
  if (!token || isTokenExpired(token)) {
    clearSession();
    return { user: null, token: null };
  }
  return { user: readUser(), token };
}

const listeners = new Set();
let alreadyAnnounced = false;

export function onSessionExpired(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function announceSessionExpired(reason = "expired") {
  clearSession();
  if (alreadyAnnounced) return;
  alreadyAnnounced = true;
  listeners.forEach((listener) => listener(reason));
}

export function resetSessionExpiryNotice() {
  alreadyAnnounced = false;
}

export class SessionExpiredError extends Error {
  constructor() {
    super("Your session has expired. Please sign in again.");
    this.name = "SessionExpiredError";
    this.isSessionExpired = true;
  }
}
