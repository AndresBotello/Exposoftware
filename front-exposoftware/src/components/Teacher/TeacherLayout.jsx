import { Link } from "react-router-dom";
import logo from "../../assets/Logo-unicesar.png";

const NAV_ITEMS = [
  { key: "dashboard", to: "/teacher/dashboard", icon: "pi pi-home", label: "Dashboard" },
  { key: "proyectos", to: "/teacher/proyectos", icon: "pi pi-book", label: "Proyectos Estudiantiles" },
  { key: "perfil", to: "/teacher/profile", icon: "pi pi-cog", label: "Configuración" },
];

export function TeacherHeader({ getInitials, getFullName, user, handleLogout }) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Logo Unicesar" className="w-10 h-auto" />
            <div>
              <h1 className="text-lg font-bold text-gray-900">Expo-software</h1>
              <p className="text-xs text-gray-500">Universidad Popular del Cesar</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                <span className="text-emerald-600 font-bold text-lg">{getInitials()}</span>
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900">{getFullName()}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.rol || "Docente"}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors flex items-center gap-2"
            >
              <i className="pi pi-sign-out"></i>
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export function TeacherSidebar({ activePage, getInitials, getFullName, user }) {
  return (
    <aside className="lg:col-span-1">
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.key}
              to={item.to}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activePage === item.key
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <i className={`${item.icon} text-base`}></i>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4 mt-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-emerald-600 font-bold text-2xl">{getInitials()}</span>
          </div>
          <h3 className="font-semibold text-gray-900">{getFullName()}</h3>
          <p className="text-sm text-gray-500 capitalize">{user?.rol || "Docente"}</p>
          {user?.categoria_docente && (
            <p className="text-xs text-gray-400 mt-1">
              Categoría: {user.categoria_docente}
            </p>
          )}
          {user?.codigo_programa && (
            <p className="text-xs text-gray-400">Código: {user.codigo_programa}</p>
          )}
        </div>
      </div>
    </aside>
  );
}
