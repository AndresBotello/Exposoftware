import { useNavigate } from "react-router-dom";
import logo from "../../assets/Logo-unicesar.png";

export default function StudentHeader({ user, getFullName, getInitials, logout }) {
  const navigate = useNavigate();
  const handleLogout = async () => {
    try { await logout(); navigate('/login'); } catch (error) { navigate('/login'); }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <img src={logo} alt="Logo" className="w-8 sm:w-10" />
            <div className="hidden sm:block"><h1 className="text-lg font-bold text-gray-900">Expo-software</h1><p className="text-xs text-gray-500">UPC</p></div>
            <div className="sm:hidden"><h1 className="text-sm font-bold">Expo-software</h1></div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(12, 183, 106, 0.1)' }}>
                <span className="font-bold" style={{ color: 'rgba(12, 183, 106, 1)' }}>{getInitials()}</span>
              </div>
              <div className="hidden lg:block"><p className="text-sm font-medium">{getFullName()}</p><p className="text-xs text-gray-500">{user?.rol}</p></div>
            </div>
            <button onClick={handleLogout} className="text-red-600 hover:text-red-700 flex items-center gap-2"><i className="pi pi-sign-out"></i><span className="hidden sm:inline text-sm">Cerrar</span></button>
          </div>
        </div>
      </div>
    </header>
  );
}
