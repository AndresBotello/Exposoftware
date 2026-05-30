import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";

const Home = lazy(() => import("../pages/Home/Home"));
const About = lazy(() => import("../pages/Home/About"));
const Home_dinamico = lazy(() => import("../pages/Home/Home_dinamico"));
const Contacto = lazy(() => import("../pages/Home/Contact"));
const Projects = lazy(() => import("../pages/Home/Projects"));
const Login = lazy(() => import("../pages/Auth/Login"));
const Register = lazy(() => import("../pages/Auth/Register"));
const VerifyEmail = lazy(() => import("../pages/Auth/VerifyEmail"));
const RecuperarPassword = lazy(() => import("../pages/Auth/RecuperarPassword"));
const RestablecerPassword = lazy(() => import("../pages/Auth/RestablecerPassword"));
const AsistenciaForm = lazy(() => import("../pages/public/AttendanceForm.jsx"));
const InvitedPage = lazy(() => import("../pages/public/InvitedPage"));
const ProjectCalificacion = lazy(() => import("../pages/ProjectCalificacion"));

// Componente de carga
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
  </div>
);

/**
 * PublicRoutes - Rutas accesibles sin autenticación
 * 
 * Incluye:
 * - Página principal y de información (Home, About, Contact)
 * - Autenticación (Login, Register)
 * - Visualización de proyectos públicos
 * - Registro de asistencia a eventos
 */
export default function PublicRoutes() {
  return (
    <Routes>
      {/* 🏠 Página principal */}
      <Route index element={<Suspense fallback={<LoadingFallback />}><Home /></Suspense>} />
      <Route path="home" element={<Suspense fallback={<LoadingFallback />}><Home /></Suspense>} />

      {/* ℹ️ Páginas informativas */}
      <Route path="about" element={<Suspense fallback={<LoadingFallback />}><About /></Suspense>} />
      <Route path="contact" element={<Suspense fallback={<LoadingFallback />}><Contacto /></Suspense>} />
      <Route path="home-dinamico" element={<Suspense fallback={<LoadingFallback />}><Home_dinamico /></Suspense>} />

      {/* 🔐 Autenticación */}
      <Route path="login" element={<Suspense fallback={<LoadingFallback />}><Login /></Suspense>} />
      <Route path="register" element={<Suspense fallback={<LoadingFallback />}><Register /></Suspense>} />
      <Route path="verificar-cuenta" element={<Suspense fallback={<LoadingFallback />}><VerifyEmail /></Suspense>} />
      <Route path="recuperar-password" element={<Suspense fallback={<LoadingFallback />}><RecuperarPassword /></Suspense>} />
      <Route path="restablecer-password" element={<Suspense fallback={<LoadingFallback />}><RestablecerPassword /></Suspense>} />

      {/* 📂 Proyectos públicos */}
      <Route path="projects" element={<Suspense fallback={<LoadingFallback />}><Projects /></Suspense>} />

      {/* 👁️ Vista pública de proyectos para invitados */}
      <Route path="invited" element={<Suspense fallback={<LoadingFallback />}><InvitedPage /></Suspense>} />
      <Route path="invited/:eventoId" element={<Suspense fallback={<LoadingFallback />}><InvitedPage /></Suspense>} />

      {/* ✅ Registro de asistencia (accesible públicamente) */}
      <Route path="asistencia/registrar/:id_evento" element={<Suspense fallback={<LoadingFallback />}><AsistenciaForm /></Suspense>} />

      {/* ⭐ Calificación de proyectos por QR (accesible públicamente) */}
      <Route path="proyectos/:id_proyecto/calificar" element={<Suspense fallback={<LoadingFallback />}><ProjectCalificacion /></Suspense>} />

      {/* Ruta por defecto - redirige al home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
