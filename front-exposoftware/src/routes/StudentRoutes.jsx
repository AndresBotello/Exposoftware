import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { EstudianteRoute, EstudianteOEgresadoRoute } from "../components/ProtectedRoute";

const StudentDashboard = lazy(() => import("../pages/Student/Dashboard"));
const Profile = lazy(() => import("../pages/Student/Profile"));
const MyProjects = lazy(() => import("../pages/Student/MyProjects"));
const RegisterProject = lazy(() => import("../pages/Student/RegisterProject"));

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
  </div>
);

/**
 * StudentRoutes - Rutas protegidas para estudiantes
 * 
 * Todas las rutas requieren autenticación con rol "estudiante"
 * 
 * Rutas disponibles:
 * - /student/dashboard - Panel principal del estudiante
 * - /student/profile - Perfil del estudiante
 * - /student/proyectos - Mis proyectos
 * - /student/register-project - Registrar nuevo proyecto
 */
export default function StudentRoutes() {
  return (
    <Routes>
      {/* 🏠 Dashboard principal */}
      <Route
        path="dashboard"
        element={
          <EstudianteRoute>
            <Suspense fallback={<LoadingFallback />}>
              <StudentDashboard />
            </Suspense>
          </EstudianteRoute>
        }
      />

      {/* 👤 Perfil del estudiante */}
      <Route
        path="profile"
        element={
          <EstudianteRoute>
            <Suspense fallback={<LoadingFallback />}>
              <Profile />
            </Suspense>
          </EstudianteRoute>
        }
      />

      {/* 📂 Gestión de proyectos */}
      <Route
        path="proyectos"
        element={
          <EstudianteRoute>
            <Suspense fallback={<LoadingFallback />}>
              <MyProjects />
            </Suspense>
          </EstudianteRoute>
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
      <Route path="*" element={<Navigate to="/student/dashboard" replace />} />
    </Routes>
  );
}
