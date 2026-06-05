import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Layout/Navbar";
import Footer from "./components/Layout/Footer";

import Home from "./pages/Home/Home";

import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import AsistenciaForm from "./pages/public/AttendanceForm.jsx";
import StudentDashboard from "./pages/Student/Dashboard";
import Studentprojects from "./pages/Teacher/Studentprojects";
import TeacherDashboard from "./pages/Teacher/Dashboard";
import TeacherProfile from "./pages/Teacher/Profile";
import Profile from "./pages/Student/Profile";
import RegisterProject from "./pages/Student/RegisterProject";
import MyProjects from "./pages/Student/MyProjects";
import About from "./pages/Home/About";
import AdminDashboard from "./pages/Admin/Dashboard";
import AttendanceAdmin from "./pages/Admin/AttendanceAdmin";
import AdminProfile from "./pages/Admin/Profile";
import CreateGroup from "./pages/Admin/CreateGroup";
import CreateSubject from "./pages/Admin/CreateSubject";
import CreateTeacher from "./pages/Admin/CreateTeacher";
import CreateGuestAndGraduate from "./pages/Admin/CreateGuestAndGraduate";
import AdminCreatelines from "./pages/Admin/CreateLines";
import RegisterEvent from "./pages/Admin/RegisterEvent";
import ManageEvents from "./pages/Admin/ManageEvents";
import CrearFacultades from "./pages/Admin/CrearFacultades";
import CreatePrograms from "./pages/Admin/CreatePrograms";
import GraduateDashboard from "./pages/Graduate/Dashboard";
import GraduateProfile from "./pages/Graduate/Profile";
import GraduateProjects from "./pages/Graduate/Proyects";
import GuestDashboard from "./pages/Guest/Dashboard.jsx";
import GuestProjects from "./pages/Guest/Proyects";
import GuestProfile from "./pages/Guest/Profile";
import AdminEvento from "./pages/Admin/AdminEvento";
import Home_dinamico from "./pages/Home/Home_dinamico";
import Projects from "./pages/Home/Projects";
import ManageStudents from "./pages/Admin/ManageStudents";
import StudentDetails from "./pages/Admin/StudentDetails";
import EditStudent from "./pages/Admin/EditStudent";
import Contacto from "./pages/Home/Contact";
import GestionCertificados from "./pages/Admin/GestionCertificados";
import GestionProyectos from "./pages/Admin/GestionProyectos";
import { AdminRoute, DocenteRoute, EstudianteRoute, EgresadoRoute, InvitadoRoute, EstudianteOEgresadoRoute} from "./components/ProtectedRoute";





import "primereact/resources/themes/lara-light-green/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import { Contact } from "lucide-react";



function App() {
  const location = useLocation();

  const hideNavbarOn = [
    "/student/dashboard",
    "/student/profile",
    "/student/proyectos",
    "/student/asistencia",
    "/student/register-project",
    "/teacher/dashboard",
    "/teacher/profile",
    "/teacher/proyectos",
    "/admin/dashboard",
    "/admin/dash",
    "/admin/asistencia",
    "/admin/profile",
    "/admin/crear-grupo",
    "/admin/crear-materia",
    "/admin/crear-profesor",
    "/admin/crear-invitado-egresado",
    "/admin/lineas-investigacion",
    "/admin/registrar-eventos",
    "/admin/gestionar-eventos",
    "/admin/facultades",
    "/admin/crear-facultad",
    "/admin/crear-programa",
    "/admin/programas",
    "/admin/estudiantes",
    "/admin/certificados",
    "/admin/proyectos",
    "/graduate/dashboard",
    "/graduate/profile",
    "/graduate/proyectos",
    "/graduate/register-project",
    "/guest/dashboard",
    "/guest/profile",
    "/guest/proyectos",
    "/home-dinamico",
    "/admin/evento",
    "/invited",
    "/ranking"

  ];

  // Verificar si la ruta actual debe ocultar el Navbar
  const shouldHideNavbar = () => {
    // Verificar rutas exactas
    if (hideNavbarOn.includes(location.pathname)) {
      return true;
    }

    // Verificar patrones dinámicos
    if (location.pathname.startsWith('/admin/estudiantes/')) {
      return true;
    }

    return false;
  };

  return (
    <div className="flex flex-col min-h-screen">
      {!shouldHideNavbar() && <Navbar />}
      <main className="flex-1">
        <Routes>
          {/* Página principal */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/home-dinamico" element={<Home_dinamico />} />
          <Route path="/contact" element={<Contacto />} />

          {/* Autenticación */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/projects" element={<Projects />} />

          {/* ✅ Estudiantes - RUTAS PROTEGIDAS */}
          <Route path="/student/dashboard" element={<EstudianteRoute><StudentDashboard /></EstudianteRoute>} />
          <Route path="/student/proyectos" element={<EstudianteRoute><MyProjects /></EstudianteRoute>} />
          <Route path="/student/profile" element={<EstudianteRoute><Profile /></EstudianteRoute>} />

          {/* ✅ Registro de Proyectos - Permite ESTUDIANTES Y EGRESADOS */}
          <Route path="/student/register-project" element={<EstudianteOEgresadoRoute><RegisterProject /></EstudianteOEgresadoRoute>} />
          <Route path="/graduate/register-project" element={<EstudianteOEgresadoRoute><RegisterProject /></EstudianteOEgresadoRoute>} />

          {/* ✅ Profesores - RUTAS PROTEGIDAS */}
          <Route path="/teacher/dashboard" element={<DocenteRoute><TeacherDashboard /></DocenteRoute>} />
          <Route path="/teacher/proyectos" element={<DocenteRoute><Studentprojects /></DocenteRoute>} />
          <Route path="/teacher/profile" element={<DocenteRoute><TeacherProfile /></DocenteRoute>} />

          {/* ✅ Administrador - RUTAS PROTEGIDAS */}
          <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/dash" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/profile" element={<AdminRoute><AdminProfile /></AdminRoute>} />
          <Route path="/admin/crear-grupo" element={<AdminRoute><CreateGroup /></AdminRoute>} />
          <Route path="/admin/crear-materia" element={<AdminRoute><CreateSubject /></AdminRoute>} />
          <Route path="/admin/crear-profesor" element={<AdminRoute><CreateTeacher /></AdminRoute>} />
          <Route path="/admin/crear-invitado-egresado" element={<AdminRoute><CreateGuestAndGraduate /></AdminRoute>} />
          <Route path="/admin/lineas-investigacion" element={<AdminRoute><AdminCreatelines /></AdminRoute>} />
          <Route path="/admin/registrar-eventos" element={<AdminRoute><RegisterEvent /></AdminRoute>} />
          <Route path="/admin/gestionar-eventos" element={<AdminRoute><ManageEvents /></AdminRoute>} />
          <Route path="/admin/crear-facultad" element={<AdminRoute><CrearFacultades /></AdminRoute>} />
          <Route path="/admin/crear-programa" element={<AdminRoute><CreatePrograms /></AdminRoute>} />
          <Route path="/admin/estudiantes" element={<AdminRoute><ManageStudents /></AdminRoute>} />
          <Route path="/admin/estudiantes/:studentId" element={<AdminRoute><StudentDetails /></AdminRoute>} />
          <Route path="/admin/estudiantes/:studentId/editar" element={<AdminRoute><EditStudent /></AdminRoute>} />
          <Route path="/admin/asistencia" element={<AdminRoute><AttendanceAdmin /></AdminRoute>} />
          <Route path="/admin/certificados" element={<AdminRoute><GestionCertificados /></AdminRoute>} />
          <Route path="/admin/proyectos" element={<AdminRoute><GestionProyectos /></AdminRoute>} />

          {/* ✅ Egresados - RUTAS PROTEGIDAS */}
          <Route path="/graduate/dashboard" element={<EgresadoRoute><GraduateDashboard /></EgresadoRoute>} />
          <Route path="/graduate/profile" element={<EgresadoRoute><GraduateProfile /></EgresadoRoute>} />
          <Route path="/graduate/proyectos" element={<EgresadoRoute><GraduateProjects /></EgresadoRoute>} />
          {/* Nota: /graduate/register-project está definido arriba con EstudianteOEgresadoRoute */}

          {/* ✅ Invitados - RUTAS PROTEGIDAS */}
          <Route path="/guest/dashboard" element={<InvitadoRoute><GuestDashboard /></InvitadoRoute>} />
          <Route path="/guest/profile" element={<InvitadoRoute><GuestProfile /></InvitadoRoute>} />
          <Route path="/guest/proyectos" element={<InvitadoRoute><GuestProjects /></InvitadoRoute>} />

          {/* Registro de Asistencia */}
          {/* <Route path="/asistencia" element={<AsistenciaForm />} /> */}
          <Route path="/asistencia/registrar/:id_evento" element={<AsistenciaForm />} />


          <Route
            path="*"
            element={
              <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-emerald-400 via-green-500 to-teal-500">
                <div className="text-center px-8 bg-white rounded-2xl shadow-2xl p-12 max-w-md">
                  <div className="text-8xl mb-4 animate-bounce">🔍</div>
                  <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
                  <p className="text-xl text-gray-600 mb-6">
                    ¡Ups! Parece que te perdiste
                  </p>
                  <a
                    href="/"
                    className="inline-block px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-full font-semibold hover:scale-105 transition-transform"
                  >
                    Ir al inicio
                  </a>
                </div>
              </div>
            }
          ></Route>
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;