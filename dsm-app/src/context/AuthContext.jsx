import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const s = localStorage.getItem("dsm_user");
    return s ? JSON.parse(s) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("dsm_token"));
  const [pendingLogin, setPendingLogin] = useState(null);

  const completeLogin = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem("dsm_user", JSON.stringify(userData));
    localStorage.setItem("dsm_token", authToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("dsm_user");
    localStorage.removeItem("dsm_token");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        pendingLogin,
        setPendingLogin,
        completeLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
