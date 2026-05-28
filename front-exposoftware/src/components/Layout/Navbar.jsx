import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiLogIn, FiMenu, FiX, FiLogOut } from "react-icons/fi";
import { useAuth } from "../../contexts/AuthContext";
import logo from "../../assets/Logo-unicesar.png";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isGuest = user?.rol === 'invitado' && isAuthenticated();
  const hideLoginButton =
    location.pathname === "/login" || location.pathname === "/register";

  const handleLogout = async () => {
    await logout();
    navigate("/");
    closeMenu();
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white text-black px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center shadow-md relative">
      
      {/* Logo + Nombre clickeable */}
      <Link 
        to="/" 
        className="flex items-center gap-2 sm:gap-3 cursor-pointer z-50"
        onClick={closeMenu}
      >
        <img src={logo} alt="Logo Unicesar" className="w-12 sm:w-14 lg:w-16 h-auto" />
        <div>
          <h1 className="text-lg sm:text-xl font-bold">Expo-software</h1>
          <p className="text-xs sm:text-sm text-gray-600">Universidad Popular del Cesar</p>
        </div>
      </Link>

      {/* Menú para desktop */}
      <ul className="hidden md:flex items-center gap-6 lg:gap-8 text-base font-medium">
        {/* Si es invitado, solo mostrar "Inicio" */}
        {isGuest ? (
          <>
            <li>
              <Link to="/" className="hover:text-green-700 transition duration-300">Inicio</Link>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-red-700 transition duration-300"
              >
                <FiLogOut size={18} />
                Salir
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/" className="hover:text-green-700 transition duration-300">Inicio</Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-green-700 transition duration-300">Acerca de</Link>
            </li>

            {/* Ocultar este botón en login/register */}
            {!hideLoginButton && (
              <li>
                <Link
                  to="/login"
                  className="bg-green-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-green-700 transition duration-300"
                >
                  <FiLogIn size={18} />
                  Iniciar Sesión
                </Link>
              </li>
            )}
          </>
        )}
      </ul>

      {/* Botón menú hamburguesa para móvil */}
      <button 
        className="md:hidden text-2xl z-50 p-2 hover:bg-gray-100 rounded-lg transition duration-300"
        onClick={toggleMenu}
        aria-label="Abrir menú"
      >
        {isMenuOpen ? <FiX /> : <FiMenu />}
      </button>

      {/* Menú móvil mejorado - Dropdown elegante */}
      <div className={`
        absolute top-full left-0 w-full bg-white shadow-lg border-t border-gray-200
        md:hidden transform transition-all duration-300 ease-in-out z-40
        ${isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}
      `}>
        <div className="container mx-auto px-4 py-6">
          <ul className="flex flex-col gap-4">
            {/* Si es invitado, solo mostrar Inicio y Salir */}
            {isGuest ? (
              <>
                <li>
                  <Link
                    to="/"
                    className="block py-3 px-4 hover:bg-green-50 hover:text-green-700 rounded-lg transition duration-300 font-medium"
                    onClick={closeMenu}
                  >
                    Inicio
                  </Link>
                </li>
                <li className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={handleLogout}
                    className="w-full bg-red-600 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-red-700 transition duration-300 font-medium"
                  >
                    <FiLogOut size={20} />
                    Salir
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link
                    to="/"
                    className="block py-3 px-4 hover:bg-green-50 hover:text-green-700 rounded-lg transition duration-300 font-medium"
                    onClick={closeMenu}
                  >
                    Inicio
                  </Link>
                </li>
                <li>
                  <Link
                    to="/about"
                    className="block py-3 px-4 hover:bg-green-50 hover:text-green-700 rounded-lg transition duration-300 font-medium"
                    onClick={closeMenu}
                  >
                    Acerca de
                  </Link>
                </li>

                {/* Ocultar este botón en login/register */}
                {!hideLoginButton && (
                  <li className="mt-4 pt-4 border-t border-gray-200">
                    <Link
                      to="/login"
                      className="bg-green-600 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-green-700 transition duration-300 font-medium"
                      onClick={closeMenu}
                    >
                      <FiLogIn size={20} />
                      Iniciar Sesión
                    </Link>
                  </li>
                )}
              </>
            )}
          </ul>
        </div>
      </div>

      {/* Overlay para cerrar menú al hacer clic fuera (solo cuando el menú está abierto) */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-30 z-30 md:hidden"
          onClick={closeMenu}
        ></div>
      )}
    </nav>
  );
}