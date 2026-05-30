import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { DocenteRoute } from "../components/ProtectedRoute";

const TeacherDashboard = lazy(() => import("../pages/Teacher/Dashboard"));
const TeacherProfile = lazy(() => import("../pages/Teacher/Profile"));
const Studentprojects = lazy(() => import("../pages/Teacher/Studentprojects"));

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
  </div>
);

/**
 * TeacherRoutes - Rutas protegidas para docentes
 * 
 * Todas las rutas requieren autenticación con rol "docente"
 * 
 * Rutas disponibles:
 * - /teacher/dashboard - Panel principal del docente
 * - /teacher/profile - Perfil del docente
 * - /teacher/proyectos - Proyectos de estudiantes
 */
export default function TeacherRoutes() {
  return (
    <Routes>
      {/* 🏠 Dashboard principal */}
      <Route
        path="dashboard"
        element={
          <DocenteRoute>
            <Suspense fallback={<LoadingFallback />}>
              <TeacherDashboard />
            </Suspense>
          </DocenteRoute>
        }
      />

      {/* 👤 Perfil del docente */}
      <Route
        path="profile"
        element={
          <DocenteRoute>
            <Suspense fallback={<LoadingFallback />}>
              <TeacherProfile />
            </Suspense>
          </DocenteRoute>
        }
      />

      {/* 📚 Proyectos de estudiantes */}
      <Route
        path="proyectos"
        element={
          <DocenteRoute>
            <Suspense fallback={<LoadingFallback />}>
              <Studentprojects />
            </Suspense>
          </DocenteRoute>
        }
      />
      
      {/* Redirección por defecto al dashboard */}
      <Route path="*" element={<Navigate to="/teacher/dashboard" replace />} />
    </Routes>
  );
}
