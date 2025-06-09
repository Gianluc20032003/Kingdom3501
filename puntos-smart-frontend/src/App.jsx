import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";

// Componentes de páginas
import LoginPage from "./pages/auth/LoginPage";
import Dashboard from "./pages/Dashboard";
import FortalezasPage from "./pages/modules/FortalezasPage";
import MovilizacionPage from "./pages/modules/MovilizacionPage";
import KvKPage from "./pages/modules/KvKPage";
import MGEPage from "./pages/modules/MGEPage";
import AOOPage from "./pages/modules/AOOPage";
import AdminPage from "./pages/modules/AdminPage";
import AOOAdminPage from "./pages/admin/AOOAdminPage";

// Componente de loading
import LoadingSpinner from "./components/ui/LoadingSpinner";

// Componente para rutas protegidas
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading, isAuthenticated, isAdmin } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Componente para rutas públicas (solo accesibles sin autenticación)
const PublicRoute = ({ children }) => {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  const { loading } = useAuth();

  // Mostrar loading mientras se valida la autenticación
  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Routes>
        {/* Rutas públicas */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />

        {/* Rutas protegidas */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/fortalezas"
          element={
            <ProtectedRoute>
              <FortalezasPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/movilizacion"
          element={
            <ProtectedRoute>
              <MovilizacionPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/kvk"
          element={
            <ProtectedRoute>
              <KvKPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/mge"
          element={
            <ProtectedRoute>
              <MGEPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/aoo"
          element={
            <ProtectedRoute>
              <AOOPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-aoo"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AOOAdminPage />
            </ProtectedRoute>
          }
        />

        {/* Redirecciones */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  );
}

export default App;
