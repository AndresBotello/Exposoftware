import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { EgresadoRoute, EstudianteOEgresadoRoute } from "../components/ProtectedRoute";

const GraduateDashboard = lazy(() => import("../pages/Graduate/Dashboard"));
const GraduateProfile = lazy(() => import("../pages/Graduate/Profile"));
const GraduateProjects = lazy(() => import("../pages/Graduate/Proyects"));
const RegisterProject = lazy(() => import("../pages/Student/RegisterProject"));

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
  </div>
);

/**
 * GraduateRoutes - Rutas protegidas para egresados
 * 
 * Todas las rutas requieren autenticación con rol "egresado"
 * 
 * Rutas disponibles:
 * - /graduate/dashboard - Panel principal del egresado
 * - /graduate/profile - Perfil del egresado
 * - /graduate/proyectos - Proyectos del egresado
 * - /graduate/register-project - Registrar nuevo proyecto
 */
export default function GraduateRoutes() {
  return (
    <Routes>
      {/* 🏠 Dashboard principal */}
      <Route
        path="dashboard"
        element={
          <EgresadoRoute>
            <Suspense fallback={<LoadingFallback />}>
              <GraduateDashboard />
            </Suspense>
          </EgresadoRoute>
        }
      />

      {/* 👤 Perfil del egresado */}
      <Route
        path="profile"
        element={
          <EgresadoRoute>
            <Suspense fallback={<LoadingFallback />}>
              <GraduateProfile />
            </Suspense>
          </EgresadoRoute>
        }
      />

      {/* 📂 Proyectos del egresado */}
      <Route
        path="proyectos"
        element={
          <EgresadoRoute>
            <Suspense fallback={<LoadingFallback />}>
              <GraduateProjects />
            </Suspense>
          </EgresadoRoute>
        }
      />

      {/* ➕ Registro de proyecto (estudiantes y egresados) */}
      <Route
        path="register-project"
        element={
          <EstudianteOEgresadoRoute>
            <Suspense fallback={<LoadingFallback />}>
              <RegisterProject />
            </Suspense>
          </EstudianteOEgresadoRoute>
        }
      />
      
      {/* Redirección por defecto al dashboard */}
      <Route path="*" element={<Navigate to="/graduate/dashboard" replace />} />
    </Routes>
  );
}
