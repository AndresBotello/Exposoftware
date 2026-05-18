import { Link, useLocation } from "react-router-dom";
export default function StudentSidebar({ activeTab, setActiveTab, user, getInitials, getFullName }) {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;
  const getNavStyle = (path) => isActive(path)
    ? { backgroundColor: 'rgba(12, 183, 106, 0.1)', color: 'rgba(12, 183, 106, 1)' }
    : { color: '#374151' };

  return (
    <aside className="lg:col-span-1">
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <nav className="space-y-1">
          <Link to="/student/dashboard" className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors" style={getNavStyle("/student/dashboard")}><i className="pi pi-home"></i>Dashboard</Link>
          <Link to="/student/proyectos" className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors" style={getNavStyle("/student/proyectos")}><i className="pi pi-book"></i>Mis Proyectos</Link>
          <Link to="/student/profile" className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors" style={getNavStyle("/student/profile")}><i className="pi pi-cog"></i>Configuración</Link>
        </nav>
      </div>
      <Link to="/student/register-project" className="w-full inline-block text-center text-white py-3 rounded-lg font-semibold mt-4 animate-pulse hover:animate-none" style={{ backgroundColor: 'rgba(12, 183, 106, 1)' }}><i className="pi pi-plus-circle"></i> Postular</Link>
      <div className="bg-white rounded-lg border border-gray-200 p-4 mt-4 text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: 'rgba(12, 183, 106, 0.1)' }}><span className="font-bold text-2xl" style={{ color: 'rgba(12, 183, 106, 1)' }}>{getInitials()}</span></div>
        <h3 className="font-semibold text-gray-900">{getFullName()}</h3><p className="text-sm text-gray-500">{user?.rol}</p>
      </div>
    </aside>
  );
}
