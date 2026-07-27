import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ConfigProvider } from "antd";
import { AuthProvider } from "./context/AuthContext";
import "./App.css";
import { lazy } from "react";
const LoginStep1 = lazy(() => import("./pages/LoginStep1"));
const LoginStep2 = lazy(() => import("./pages/LoginStep2"));
const Dashboard = lazy(() => import("./module/dashboard"));

function App() {
  return (
    <ConfigProvider
      theme={{ token: { colorPrimary: "#7c3aed", borderRadius: 8 } }}
    >
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginStep1 />} />
            <Route path="/login/password" element={<LoginStep2 />} />
            <Route path="/modules" element={<Dashboard />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;
