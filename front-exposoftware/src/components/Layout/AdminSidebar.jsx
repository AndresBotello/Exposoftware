import { Link, useLocation } from "react-router-dom";
import { memo } from "react";

/**
 * Sidebar para el panel de administración
 * @param {Object} props - Propiedades del componente
 * @param {string} props.userName - Nombre del usuario administrador (opcional, default: "Carlos Mendoza")
 * @param {string} props.userRole - Rol del usuario (opcional, default: "Administrador")
 */
const AdminSidebar = memo(({ userName = "Carlos Mendoza", userRole = "Administrador" }) => {
  const location = useLocation();

  // Función para determinar si un link está activo
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Configuración de los enlaces del sidebar
  const menuItems = [
    {
      to: "/admin/dash",
      icon: "pi-home",
      label: "Dashboard Admin"
    },
    {
      to: "/admin/crear-materia",
      icon: "pi-book",
      label: "Gestión de Materias"
    },
    {
      to: "/admin/crear-grupo",
      icon: "pi-users",
      label: "Gestión de Grupos"
    },
    {
      to: "/admin/crear-profesor",
      icon: "pi-user-plus",
      label: "Gestión de Profesores"
    },
    {
      to: "/admin/crear-invitado-egresado",
      icon: "pi-users",
      label: "Gestión de Invitados y Egresados"
    },
    {
      to: "/admin/estudiantes",
      icon: "pi-graduation-cap",
      label: "Gestión de Estudiantes"
    },
    {
      to: "/admin/lineas-investigacion",
      icon: "pi-lightbulb",
      label: "Gestión de Líneas de Investigación"
    },
    {
      to: "/admin/asistencia",
      icon: "pi-qrcode",
      label: "Registro de Asistencia"
    },
    {
      to: "/admin/eventos-asistencias",
      icon: "pi-chart-bar",
      label: "Reporte de Eventos y Asistencias"
    },
    {
      to: "/admin/crear-facultad",
      icon: "pi-building",
      label: "Gestión de Facultades"
    },
    {
      to: "/admin/crear-programa",
      icon: "pi-book",
      label: "Gestión de Programas"
    },
    {
      to: "/admin/registrar-eventos",
      icon: "pi-calendar",
      label: "Gestión de Eventos"
    },
    {
      to: "/admin/gestionar-eventos",
      icon: "pi-calendar-plus",
      label: "Administrar Eventos"
    },
    {
      to: "/admin/registro-eventos-anual",
      icon: "pi-folder",
      label: "Registro de Eventos por Año"
    },
    {
      to: "/admin/certificados",
      icon: "pi-file-pdf",
      label: "Gestión de Certificados"
    },
    {
      to: "/admin/proyectos",
      icon: "pi-briefcase",
      label: "Gestión de Proyectos"
    },
    // {
    //   to: "/admin/profile",
    //   icon: "pi-cog",
    //   label: "Configuración de Perfil"
    // }
  ];

  return (
    <aside className="lg:col-span-1">
      {/* Navigation Menu */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive(item.to)
                  ? "bg-teal-50 text-green-700"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <i className={`pi ${item.icon} text-base`}></i>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* User Info Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mt-4">
        <div className="text-center">
          <h3 className="font-semibold text-gray-900">{userRole}</h3>
          <p className="text-sm text-gray-500">{userName}</p>
        </div>
      </div>
    </aside>
  );
});

AdminSidebar.displayName = 'AdminSidebar';

export default AdminSidebar;
