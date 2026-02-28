import { Routes, Route, Navigate } from "react-router-dom";
import { AdminRoute } from "../components/ProtectedRoute";

// Dashboard y perfil
import AdminDashboard from "../pages/Admin/Dashboard";
import AdminProfile from "../pages/Admin/Profile";

// Gestión de estudiantes
import ManageStudents from "../pages/Admin/ManageStudents";
import StudentDetails from "../pages/Admin/StudentDetails";
import EditStudent from "../pages/Admin/EditStudent";

// Gestión académica
import CrearGrupo from "../pages/Admin/CreateGroup";
import CrearMateria from "../pages/Admin/CreateSubject";
import CrearProfesor from "../pages/Admin/CreateTeacher";
import LineasInvestigacion from "../pages/Admin/CreateLines";
import CrearFacultad from "../pages/Admin/CrearFacultades";
import CrearPrograma from "../pages/Admin/CreatePrograms";
//import GestionProgramas from "../pages/Admin/GestionProgramas";
//import GestionFacultades from "../pages/Admin/GestionFacultades";

// Gestión de eventos
import RegistrarEventos from "../pages/Admin/RegisterEvent";
import GestionarEventos from "../pages/Admin/ManageEvents";
//import Evento from "../pages/Admin/Evento";
import GestionAsistencia from "../pages/Admin/AttendanceAdmin";
import EventsAttendance from "../pages/Admin/EventsAttendance";

// Registro de eventos por año
import EventLog from "../pages/Admin/EventLog";

// Otros
import GestionCertificados from "../pages/Admin/GestionCertificados";
import GestionProyectos from "../pages/Admin/GestionProyectos";

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
            <AdminDashboard />
          </AdminRoute>
        } 
      />
      
      <Route 
        path="dash" 
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } 
      />
      
      <Route 
        path="profile" 
        element={
          <AdminRoute>
            <AdminProfile />
          </AdminRoute>
        } 
      />

      {/* 👥 GESTIÓN DE ESTUDIANTES */}
      <Route 
        path="estudiantes" 
        element={
          <AdminRoute>
            <ManageStudents />
          </AdminRoute>
        } 
      />
      
      <Route 
        path="estudiantes/:studentId" 
        element={
          <AdminRoute>
            <StudentDetails />
          </AdminRoute>
        } 
      />
      
      <Route 
        path="estudiantes/:studentId/editar" 
        element={
          <AdminRoute>
            <EditStudent />
          </AdminRoute>
        } 
      />

      {/* 📚 GESTIÓN ACADÉMICA - Grupos y Materias */}
      <Route 
        path="crear-grupo" 
        element={
          <AdminRoute>
            <CrearGrupo />
          </AdminRoute>
        } 
      />
      
      <Route 
        path="crear-materia" 
        element={
          <AdminRoute>
            <CrearMateria />
          </AdminRoute>
        } 
      />
      
      <Route 
        path="crear-profesor" 
        element={
          <AdminRoute>
            <CrearProfesor />
          </AdminRoute>
        } 
      />

      {/* 🏛️ GESTIÓN DE FACULTADES Y PROGRAMAS */}
            
      <Route 
        path="crear-facultad" 
        element={
          <AdminRoute>
            <CrearFacultad />
          </AdminRoute>
        } 
      />
      
      <Route 
        path="crear-programa" 
        element={
          <AdminRoute>
            <CrearPrograma />
          </AdminRoute>
        } 
      />

      {/* 🔬 LÍNEAS DE INVESTIGACIÓN */}
      <Route 
        path="lineas-investigacion" 
        element={
          <AdminRoute>
            <LineasInvestigacion />
          </AdminRoute>
        } 
      />

      {/* 📅 GESTIÓN DE EVENTOS */}
      <Route 
        path="registrar-eventos" 
        element={
          <AdminRoute>
            <RegistrarEventos />
          </AdminRoute>
        } 
      />
      
      <Route 
        path="gestionar-eventos" 
        element={
          <AdminRoute>
            <GestionarEventos />
          </AdminRoute>
        } 
      />
   
      <Route 
        path="asistencia" 
        element={
          <AdminRoute>
            <GestionAsistencia/>
          </AdminRoute>
        } 
      />

      <Route 
        path="eventos-asistencias" 
        element={
          <AdminRoute>
            <EventsAttendance/>
          </AdminRoute>
        } 
      />

      {/* � REGISTRO DE EVENTOS POR AÑO */}
      <Route 
        path="registro-eventos-anual" 
        element={
          <AdminRoute>
            <EventLog />
          </AdminRoute>
        } 
      />

      {/* �📜 CERTIFICADOS Y PROYECTOS */}
      <Route 
        path="certificados" 
        element={
          <AdminRoute>
            <GestionCertificados />
          </AdminRoute>
        } 
      />
      
      <Route 
        path="proyectos" 
        element={
          <AdminRoute>
            <GestionProyectos />
          </AdminRoute>
        } 
      />

      {/* Redirección por defecto al dashboard */}
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
}
