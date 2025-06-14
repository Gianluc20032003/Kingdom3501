import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { TranslationProvider } from "./contexts/TranslationContext";

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
import MGEAdminPage from "./pages/admin/MGEAdminPage";
import KvkAdminPage from "./pages/admin/KvkAdminPage";
import MovilizacionAdminPage from "./pages/admin/MovilizacionAdminPage";
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
    <TranslationProvider>
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

          <Route
            path="/admin-kvk"
            element={
              <ProtectedRoute requireAdmin={true}>
                <KvkAdminPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin-mge"
            element={
              <ProtectedRoute requireAdmin={true}>
                <MGEAdminPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin-movilizacion"
            element={
              <ProtectedRoute requireAdmin={true}>
                <MovilizacionAdminPage />
              </ProtectedRoute>
            }
          />

          {/* Redirecciones */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </TranslationProvider>
  );
}

export default App;
