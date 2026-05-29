import { BrowserRouter, useLocation } from "react-router-dom";
import AppRouter from "./routes/AppRouter";
import Navbar from "./components/Layout/Navbar";
import Footer from "./components/Layout/Footer";

// Importar estilos de PrimeReact
import "primereact/resources/themes/lara-light-green/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

/**
 * NavbarWrapper - Componente que maneja la lógica de mostrar/ocultar Navbar
 */
function NavbarWrapper() {
  const location = useLocation();

  // Rutas donde el Navbar debe estar oculto
  const hideNavbarOn = [
    "/verificar-cuenta",
    "/recuperar-password",
    "/restablecer-password",
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
    "/admin/lineas-investigacion",
    "/admin/registrar-eventos",
    "/admin/gestionar-eventos",
    "/admin/facultades",
    "/admin/crear-facultad",
    "/admin/crear-programa",
    "/admin/crear-invitado-egresado",
    "/admin/programas",
    "/admin/estudiantes",
    "/admin/certificados",
    "/admin/proyectos",
    "/admin/evento",
    "/admin/eventos-asistencias",
    "/admin/registro-eventos-anual",
    "/graduate/dashboard",
    "/graduate/profile",
    "/graduate/proyectos",
    "/graduate/register-project",
    "/guest/dashboard",
    "/guest/profile",
    "/guest/proyectos",
    "/invited",
    "/home-dinamico",
  ];

  // Rutas dinámicas donde el Navbar debe estar oculto
  const hideDynamicNavbarPatterns = [
    "/proyectos/", // /proyectos/:id_proyecto/calificar
  ];

  /**
   * Verificar si el Navbar debe estar oculto
   */
  const shouldHideNavbar = () => {
    // Verificar rutas exactas
    if (hideNavbarOn.includes(location.pathname)) {
      return true;
    }

    // Verificar patrones dinámicos
    if (location.pathname.startsWith("/admin/estudiantes/")) {
      return true;
    }

    // Verificar patrones de rutas públicas dinámicas
    for (const pattern of hideDynamicNavbarPatterns) {
      if (location.pathname.startsWith(pattern)) {
        return true;
      }
    }

    return false;
  };

  return !shouldHideNavbar() ? <Navbar /> : null;
}

/**
 * App - Componente principal de la aplicación
 * 
 * Estructura:
 * - BrowserRouter: Maneja el enrutamiento
 * - NavbarWrapper: Navbar condicional según la ruta
 * - AppRouter: Sistema de rutas modular
 * - Footer: Pie de página
 */
function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        {/* Navbar condicional */}
        <NavbarWrapper />
        
        {/* Contenido principal */}
        <main className="flex-1">
          <AppRouter />
        </main>
        
        {/* Footer */}
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
