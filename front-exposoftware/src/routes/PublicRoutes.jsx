import { Routes, Route, Navigate } from "react-router-dom";
import Home from "../pages/Home/Home";
import About from "../pages/Home/About";
import Home_dinamico from "../pages/Home/Home_dinamico";
import Contacto from "../pages/Home/Contact";
import Projects from "../pages/Home/Projects";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import AsistenciaForm from "../pages/public/AttendanceForm.jsx";
import PublicProjects from "../pages/Guest/PublicProjects";

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
      <Route index element={<Home />} />
      <Route path="home" element={<Home />} />
      
      {/* ℹ️ Páginas informativas */}
      <Route path="about" element={<About />} />
      <Route path="contact" element={<Contacto />} />
      <Route path="home-dinamico" element={<Home_dinamico />} />
      
      {/* 🔐 Autenticación */}
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />
      
      {/* 📂 Proyectos públicos */}
      <Route path="projects" element={<Projects />} />
      
      {/* 👁️ Vista pública de proyectos para invitados */}
      <Route path="invited" element={<PublicProjects />} />

      {/* ✅ Registro de asistencia (accesible públicamente) */}
      <Route path="asistencia/registrar/:id_evento" element={<AsistenciaForm />} />
      
      {/* Ruta por defecto - redirige al home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
