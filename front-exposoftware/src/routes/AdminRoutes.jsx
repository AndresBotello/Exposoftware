import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AdminRoute } from "../components/ProtectedRoute";

// Dashboard y perfil
const AdminDashboard = lazy(() => import("../pages/Admin/Dashboard"));
const AdminProfile = lazy(() => import("../pages/Admin/Profile"));

// Gestión de estudiantes
const ManageStudents = lazy(() => import("../pages/Admin/ManageStudents"));
const StudentDetails = lazy(() => import("../pages/Admin/StudentDetails"));
const EditStudent = lazy(() => import("../pages/Admin/EditStudent"));

// Gestión académica
const CrearGrupo = lazy(() => import("../pages/Admin/CreateGroup"));
const CrearMateria = lazy(() => import("../pages/Admin/CreateSubject"));
const CrearProfesor = lazy(() => import("../pages/Admin/CreateTeacher"));
const CrearInvitadoYEgresado = lazy(() => import("../pages/Admin/CreateGuestAndGraduate"));
const LineasInvestigacion = lazy(() => import("../pages/Admin/CreateLines"));
const CrearFacultad = lazy(() => import("../pages/Admin/CrearFacultades"));
const CrearPrograma = lazy(() => import("../pages/Admin/CreatePrograms"));

// Gestión de eventos
const RegistrarEventos = lazy(() => import("../pages/Admin/RegisterEvent"));
const GestionarEventos = lazy(() => import("../pages/Admin/ManageEvents"));
const GestionAsistencia = lazy(() => import("../pages/Admin/AttendanceAdmin"));
const EventsAttendance = lazy(() => import("../pages/Admin/EventsAttendance"));

// Registro de eventos por año
const EventLog = lazy(() => import("../pages/Admin/EventLog"));

// Otros
const GestionCertificados = lazy(() => import("../pages/Admin/GestionCertificados"));
const GestionProyectos = lazy(() => import("../pages/Admin/GestionProyectos"));

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
  </div>
);

/**
 * AdminRoutes - Rutas protegidas para administradores
 * 
 * Todas las rutas requieren autenticación con rol "admin"
 * 
 * Categorías:
 * - Dashboard y perfil
 * - Gestión de estudiantes
 * - Gestión académica (grupos, materias, profesores, programas, facultades)
 * - Investigación (líneas de investigación)
 * - Eventos y asistencia
 * - Certificados y proyectos
 */
export default function AdminRoutes() {
  return (
    <Routes>
      {/* 🏠 DASHBOARD Y PERFIL */}
      <Route
        path="dashboard"
        element={
          <AdminRoute>
            <Suspense fallback={<LoadingFallback />}>
              <AdminDashboard />
            </Suspense>
          </AdminRoute>
        }
      />

      <Route
        path="dash"
        element={
          <AdminRoute>
            <Suspense fallback={<LoadingFallback />}>
              <AdminDashboard />
            </Suspense>
          </AdminRoute>
        }
      />

      <Route
        path="profile"
        element={
          <AdminRoute>
            <Suspense fallback={<LoadingFallback />}>
              <AdminProfile />
            </Suspense>
          </AdminRoute>
        }
      />

      {/* 👥 GESTIÓN DE ESTUDIANTES */}
      <Route
        path="estudiantes"
        element={
          <AdminRoute>
            <Suspense fallback={<LoadingFallback />}>
              <ManageStudents />
            </Suspense>
          </AdminRoute>
        }
      />

      <Route
        path="estudiantes/:studentId"
        element={
          <AdminRoute>
            <Suspense fallback={<LoadingFallback />}>
              <StudentDetails />
            </Suspense>
          </AdminRoute>
        }
      />

      <Route
        path="estudiantes/:studentId/editar"
        element={
          <AdminRoute>
            <Suspense fallback={<LoadingFallback />}>
              <EditStudent />
            </Suspense>
          </AdminRoute>
        }
      />

      {/* 📚 GESTIÓN ACADÉMICA - Grupos y Materias */}
      <Route
        path="crear-grupo"
        element={
          <AdminRoute>
            <Suspense fallback={<LoadingFallback />}>
              <CrearGrupo />
            </Suspense>
          </AdminRoute>
        }
      />

      <Route
        path="crear-materia"
        element={
          <AdminRoute>
            <Suspense fallback={<LoadingFallback />}>
              <CrearMateria />
            </Suspense>
          </AdminRoute>
        }
      />

      <Route
        path="crear-profesor"
        element={
          <AdminRoute>
            <Suspense fallback={<LoadingFallback />}>
              <CrearProfesor />
            </Suspense>
          </AdminRoute>
        }
      />

      <Route
        path="crear-invitado-egresado"
        element={
          <AdminRoute>
            <Suspense fallback={<LoadingFallback />}>
              <CrearInvitadoYEgresado />
            </Suspense>
          </AdminRoute>
        }
      />

      {/* 🏛️ GESTIÓN DE FACULTADES Y PROGRAMAS */}

      <Route
        path="crear-facultad"
        element={
          <AdminRoute>
            <Suspense fallback={<LoadingFallback />}>
              <CrearFacultad />
            </Suspense>
          </AdminRoute>
        }
      />

      <Route
        path="crear-programa"
        element={
          <AdminRoute>
            <Suspense fallback={<LoadingFallback />}>
              <CrearPrograma />
            </Suspense>
          </AdminRoute>
        }
      />

      {/* 🔬 LÍNEAS DE INVESTIGACIÓN */}
      <Route
        path="lineas-investigacion"
        element={
          <AdminRoute>
            <Suspense fallback={<LoadingFallback />}>
              <LineasInvestigacion />
            </Suspense>
          </AdminRoute>
        }
      />

      {/* 📅 GESTIÓN DE EVENTOS */}
      <Route
        path="registrar-eventos"
        element={
          <AdminRoute>
            <Suspense fallback={<LoadingFallback />}>
              <RegistrarEventos />
            </Suspense>
          </AdminRoute>
        }
      />

      <Route
        path="gestionar-eventos"
        element={
          <AdminRoute>
            <Suspense fallback={<LoadingFallback />}>
              <GestionarEventos />
            </Suspense>
          </AdminRoute>
        }
      />

      <Route
        path="asistencia"
        element={
          <AdminRoute>
            <Suspense fallback={<LoadingFallback />}>
              <GestionAsistencia />
            </Suspense>
          </AdminRoute>
        }
      />

      <Route
        path="eventos-asistencias"
        element={
          <AdminRoute>
            <Suspense fallback={<LoadingFallback />}>
              <EventsAttendance />
            </Suspense>
          </AdminRoute>
        }
      />

      {/* 📋 REGISTRO DE EVENTOS POR AÑO */}
      <Route
        path="registro-eventos-anual"
        element={
          <AdminRoute>
            <Suspense fallback={<LoadingFallback />}>
              <EventLog />
            </Suspense>
          </AdminRoute>
        }
      />

      {/* 📜 CERTIFICADOS Y PROYECTOS */}
      <Route
        path="certificados"
        element={
          <AdminRoute>
            <Suspense fallback={<LoadingFallback />}>
              <GestionCertificados />
            </Suspense>
          </AdminRoute>
        }
      />

      <Route
        path="proyectos"
        element={
          <AdminRoute>
            <Suspense fallback={<LoadingFallback />}>
              <GestionProyectos />
            </Suspense>
          </AdminRoute>
        }
      />

      {/* Redirección por defecto al dashboard */}
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
}
