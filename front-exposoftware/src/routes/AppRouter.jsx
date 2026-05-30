import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { useAuth } from "../contexts/AuthContext";
import * as AuthService from "../Services/AuthService";

// Lazy load los agrupadores de rutas (evita cargar rutas privadas innecesariamente)
const PublicRoutes = lazy(() => import("./PublicRoutes"));
const AdminRoutes = lazy(() => import("./AdminRoutes"));
const StudentRoutes = lazy(() => import("./StudentRoutes"));
const TeacherRoutes = lazy(() => import("./TeacherRoutes"));
const GuestRoutes = lazy(() => import("./GuestRoutes"));
const GraduateRoutes = lazy(() => import("./GraduateRoutes"));

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
  </div>
);

/**
 * AppRouter - Router principal de la aplicación
 * 
 * Organiza las rutas en grupos según el rol del usuario:
 * - PublicRoutes: Rutas accesibles sin autenticación
 * - AdminRoutes: Rutas para administradores
 * - StudentRoutes: Rutas para estudiantes
 * - TeacherRoutes: Rutas para docentes
 * - GraduateRoutes: Rutas para egresados
 * - GuestRoutes: Rutas para invitados
 * 
 * El sistema verifica la autenticación y el rol del usuario
 * antes de permitir el acceso a rutas protegidas.
 */
export default function AppRouter() {
  const { isAuthenticated } = useAuth();
  
  const role = AuthService.getUserRole();
  //const role = getUserRole();

  return (
    <Routes>
      {/* 🌐 Rutas públicas: Home, About, Contact, Login, etc. */}
      <Route
        path="/*"
        element={
          <Suspense fallback={<LoadingFallback />}>
            <PublicRoutes />
          </Suspense>
        }
      />

      {/* 🔒 Rutas privadas según el rol */}

      {/* 👨‍💼 Admin Routes */}
      {isAuthenticated() && role === "admin" && (
        <Route
          path="/admin/*"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <AdminRoutes />
            </Suspense>
          }
        />
      )}

      {/* 🎓 Student Routes */}
      {isAuthenticated() && role === "estudiante" && (
        <Route
          path="/student/*"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <StudentRoutes />
            </Suspense>
          }
        />
      )}

      {/* 👨‍🏫 Teacher Routes */}
      {isAuthenticated() && role === "docente" && (
        <Route
          path="/teacher/*"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <TeacherRoutes />
            </Suspense>
          }
        />
      )}

      {/* 🎉 Graduate Routes */}
      {isAuthenticated() && role === "egresado" && (
        <Route
          path="/graduate/*"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <GraduateRoutes />
            </Suspense>
          }
        />
      )}

      {/* 👤 Guest Routes */}
      {isAuthenticated() && role === "invitado" && (
        <Route
          path="/guest/*"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <GuestRoutes />
            </Suspense>
          }
        />
      )}

      {/* 🚫 Si no hay coincidencias, redirigir al home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
