import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { InvitadoRoute } from "../components/ProtectedRoute";

const GuestDashboard = lazy(() => import("../pages/Guest/Dashboard"));
const GuestProfile = lazy(() => import("../pages/Guest/Profile"));
const GuestProjects = lazy(() => import("../pages/Guest/Proyects"));

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
  </div>
);

/**
 * GuestRoutes - Rutas protegidas para invitados
 * 
 * Todas las rutas requieren autenticación con rol "invitado"
 * 
 * Rutas disponibles:
 * - /guest/dashboard - Panel principal del invitado
 * - /guest/profile - Perfil del invitado
 * - /guest/proyectos - Proyectos accesibles para el invitado
 */
export default function GuestRoutes() {
  return (
    <Routes>
      {/* 🏠 Dashboard principal */}
      <Route
        path="dashboard"
        element={
          <InvitadoRoute>
            <Suspense fallback={<LoadingFallback />}>
              <GuestDashboard />
            </Suspense>
          </InvitadoRoute>
        }
      />

      {/* 👤 Perfil del invitado */}
      <Route
        path="profile"
        element={
          <InvitadoRoute>
            <Suspense fallback={<LoadingFallback />}>
              <GuestProfile />
            </Suspense>
          </InvitadoRoute>
        }
      />

      {/* 📂 Proyectos accesibles */}
      <Route
        path="proyectos"
        element={
          <InvitadoRoute>
            <Suspense fallback={<LoadingFallback />}>
              <GuestProjects />
            </Suspense>
          </InvitadoRoute>
        }
      />
      
      {/* Redirección por defecto al dashboard */}
      <Route path="*" element={<Navigate to="/guest/dashboard" replace />} />
    </Routes>
  );
}
