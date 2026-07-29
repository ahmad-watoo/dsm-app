import { createContext, useContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  announceSessionExpired,
  clearSession,
  loadStoredSession,
  onSessionExpired,
  resetSessionExpiryNotice,
  storeSession,
} from "../utils/session";
import { isTokenUsable, millisUntilExpiry } from "../utils/token";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(loadStoredSession);
  const [pendingLogin, setPendingLogin] = useState(null);

  const { user, token } = session;

  const completeLogin = (userData, authToken) => {
    resetSessionExpiryNotice();
    storeSession(userData, authToken);
    setSession({ user: userData, token: authToken });
    setPendingLogin(null);
  };

  const logout = () => {
    clearSession();
    resetSessionExpiryNotice();
    setSession({ user: null, token: null });
    setPendingLogin(null);
  };

  useEffect(
    () =>
      onSessionExpired(() => {
        setSession({ user: null, token: null });
        toast.error("Your session has expired. Please sign in again.");
      }),
    [],
  );

  useEffect(() => {
    if (!token) return;
    const remaining = millisUntilExpiry(token);
    if (remaining === null) return;
    if (remaining <= 0) {
      announceSessionExpired("expired");
      return;
    }
    const timer = setTimeout(
      () => announceSessionExpired("expired"),
      remaining,
    );
    return () => clearTimeout(timer);
  }, [token]);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: isTokenUsable(token),
      pendingLogin,
      setPendingLogin,
      completeLogin,
      logout,
    }),
    [user, token, pendingLogin],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
