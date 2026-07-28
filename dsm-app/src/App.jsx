import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ConfigProvider, Spin } from "antd";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import "./App.css";
import { lazy, Suspense } from "react";
const LoginStep1 = lazy(() => import("./pages/LoginStep1"));
const LoginStep2 = lazy(() => import("./pages/LoginStep2"));

const ModuleMenu = lazy(() => import("./pages/ModuleMenu"));

const MenuPage = lazy(() => import("./pages/MenuPage"));
const DashboardLayout = lazy(() => import("./components/DashboardLayout"));
const StaffPage = lazy(() => import("./pages/staff/StaffPage"));

const PageFallback = () => (
  <div className="min-h-[40vh] flex items-center justify-center">
    <Spin size="large" />
  </div>
);

function App() {
  return (
    <ConfigProvider
      theme={{ token: { colorPrimary: "#7c3aed", borderRadius: 8 } }}
    >
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-right" reverseOrder={false} />
          <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginStep1 />} />
            <Route path="/login/password" element={<LoginStep2 />} />

            <Route path="*" element={<Navigate to="/login" replace />} />

            <Route
              path="/modules"
              element={
                <ProtectedRoute>
                  <ModuleMenu />
                </ProtectedRoute>
              }
            />

            <Route
              path="/app/:moduleShortName"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<MenuPage />} />

              <Route path="page" element={<MenuPage />} />

              {/* Staff Category / Group / Grade CRUD (tabbed) */}
              <Route path="staff" element={<StaffPage />} />
            </Route>
          </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;
