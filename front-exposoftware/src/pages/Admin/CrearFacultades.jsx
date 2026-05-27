import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/Logo-unicesar.png";
import AdminSidebar from "../../components/Layout/AdminSidebar";
import * as AuthService from "../../Services/AuthService";
import * as FacultadService from "../../Services/CreateFaculty";

export default function CrearFacultades() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  
  // Cargar datos del usuario autenticado
  useEffect(() => {
    const user = AuthService.getUserData();
    if (user) {
      setUserData(user);
    }
  }, []);

  // Obtener nombre del usuario
  const getUserName = () => {
    if (!userData) return 'Administrador';
    return userData.nombre || userData.nombres || userData.correo?.split('@')[0] || 'Administrador';
  };

  const getUserInitials = () => {
    const name = getUserName();
    return name.charAt(0).toUpperCase();
  };

  // Función para cerrar sesión
  const handleLogout = async () => {
    if (window.confirm('¿Está seguro de que desea cerrar sesión?')) {
      try {
        await AuthService.logout();
        navigate('/login');
      } catch (error) {
      }
    }
  };

  // Estados para crear facultad
  const [nombreFacultad, setNombreFacultad] = useState("");
  const [cargando, setCargando] = useState(false);

  // Estados para listar facultades
  const [facultades, setFacultades] = useState([]);
  const [loadingFacultades, setLoadingFacultades] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Estados para editar
  const [editando, setEditando] = useState(null);
  const [nombreEditado, setNombreEditado] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);

  // Cargar facultades al montar el componente
  useEffect(() => {
    cargarFacultades();
  }, []);

  // Función para cargar facultades desde el backend
  const cargarFacultades = async () => {
    setLoadingFacultades(true);
    try {
      const data = await FacultadService.obtenerFacultades();
      setFacultades(data);
    } catch (error) {
      setFacultades([]);
    } finally {
      setLoadingFacultades(false);
    }
  };

  // Crear facultad
  const handleCrearFacultad = async (e) => {
    e.preventDefault();

    if (!nombreFacultad.trim()) {
      alert("Por favor ingresa el nombre de la facultad");
      return;
    }

    // Validar formato de nombre_facultad (letras, números y espacios)
    if (!/^[A-Za-záéíóúÁÉÍÓÚñÑ0-9\s\-&]{2,150}$/.test(nombreFacultad)) {
      alert("Nombre Facultad: debe tener 2-150 caracteres y contener letras, números, espacios y guiones");
      return;
    }

    setCargando(true);
    try {
      await FacultadService.crearFacultad({
        nombre_facultad: nombreFacultad.trim()
      });
      alert("✅ Facultad creada exitosamente");

      // Limpiar formulario
      setNombreFacultad("");

      // Recargar lista de facultades
      cargarFacultades();
    } catch (error) {
      alert(`❌ Error al crear facultad: ${error.message}`);
    } finally {
      setCargando(false);
    }
  };

  // Abrir modal de edición
  const handleEditarFacultad = (facultad) => {
    setEditando(facultad.id_facultad);
    setNombreEditado(facultad.nombre_facultad);
    setShowEditModal(true);
  };

  // Guardar facultad editada
  const handleGuardarEdicion = async (e) => {
    e.preventDefault();

    if (!nombreEditado.trim()) {
      alert("El nombre no puede estar vacío");
      return;
    }

    if (!/^[A-Za-záéíóúÁÉÍÓÚñÑ\s]{2,100}$/.test(nombreEditado)) {
      alert("Nombre Facultad: debe tener 2-100 caracteres y solo contener letras y espacios");
      return;
    }

    setCargando(true);
    try {
      await FacultadService.actualizarFacultad(editando, {
        nombre_facultad: nombreEditado.trim()
      });
      alert("✅ Facultad actualizada exitosamente");
      setShowEditModal(false);
      setEditando(null);
      setNombreEditado("");
      cargarFacultades();
    } catch (error) {
      alert(`❌ Error: ${error.message}`);
    } finally {
      setCargando(false);
    }
  };

  // Eliminar facultad
  const handleEliminarFacultad = async (idFacultad) => {
    if (!window.confirm("¿Está seguro de que desea eliminar esta facultad?")) {
      return;
    }

    setCargando(true);
    try {
      await FacultadService.eliminarFacultad(idFacultad);
      alert("✅ Facultad eliminada exitosamente");
      cargarFacultades();
    } catch (error) {
      alert(`❌ Error: ${error.message}`);
    } finally {
      setCargando(false);
    }
  };

  // Filtrar facultades
  const facultadesFiltradas = facultades.filter((facultad) =>
    facultad.nombre_facultad?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    facultad.id_facultad?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Logo Unicesar" className="w-10 h-auto" />
              <div>
                <h1 className="text-lg font-bold text-gray-900">Expo-software </h1>
                <p className="text-xs text-gray-500">Universidad Popular del Cesar</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-700 hidden sm:block">{getUserName()}</span>
                <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                  <span className="text-teal-600 font-bold text-lg">{getUserInitials()}</span>
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

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Sidebar */}
          <AdminSidebar userName={getUserName()} userRole="Administrador" />

          {/* Main Content */}
          <main className="lg:col-span-3">
            {/* Crear Facultad */}
            <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Crear Nueva Facultad
                </h2>
                <p className="text-sm text-gray-600">
                  Agrega nuevas facultades al sistema académico.
                </p>
              </div>

              <form onSubmit={handleCrearFacultad} className="space-y-6 max-w-2xl">
                <div>
                  <label htmlFor="nombreFacultad" className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre Facultad <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="nombreFacultad"
                    value={nombreFacultad}
                    onChange={(e) => setNombreFacultad(e.target.value)}
                    placeholder="Ej: Ingenierías y Tecnologías"
                    maxLength="150"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">2-150 caracteres: letras, números, espacios y guiones</p>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={cargando}
                    className={`w-full px-6 py-3 rounded-lg text-sm font-semibold transition-all shadow-md ${
                      cargando
                        ? 'bg-gray-400 cursor-not-allowed text-white'
                        : 'bg-teal-600 text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2'
                    }`}
                  >
                    {cargando ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                        Creando...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <i className="pi pi-plus"></i>
                        Crear Facultad
                      </span>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Lista de Facultades */}
            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Facultades Registradas</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {facultadesFiltradas.length} {facultadesFiltradas.length === 1 ? 'facultad' : 'facultades'} encontradas
                  </p>
                </div>
                
                <div className="relative w-64">
                  <input
                    type="text"
                    placeholder="Buscar facultades..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                  <i className="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                </div>
              </div>

              {loadingFacultades ? (
                <div className="text-center py-12">
                  <div className="inline-block">
                    <div className="animate-spin w-8 h-8 border-4 border-teal-300 border-t-teal-600 rounded-full"></div>
                  </div>
                  <p className="text-gray-500 mt-4">Cargando facultades...</p>
                </div>
              ) : facultadesFiltradas.length === 0 ? (
                <div className="text-center py-12">
                  <i className="pi pi-inbox text-4xl text-gray-300 mb-3 block"></i>
                  <p className="text-gray-500">No se encontraron facultades</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID Facultad
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nombre Facultad
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {facultadesFiltradas.map((facultad) => (
                        <tr key={facultad.id_facultad} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-teal-100 text-teal-800">
                              {facultad.id_facultad}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{facultad.nombre_facultad}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleEditarFacultad(facultad)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                title="Editar"
                                disabled={cargando}
                              >
                                <i className="pi pi-pencil"></i>
                              </button>
                              <button
                                onClick={() => handleEliminarFacultad(facultad.id_facultad)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="Eliminar"
                                disabled={cargando}
                              >
                                <i className="pi pi-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Modal de Edición */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Editar Facultad</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditando(null);
                  setNombreEditado("");
                }}
                className="text-gray-500 hover:text-gray-700 transition"
              >
                <i className="pi pi-times text-xl"></i>
              </button>
            </div>

            <form onSubmit={handleGuardarEdicion} className="p-6 space-y-4">
              <div>
                <label htmlFor="nombreEditado" className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre Facultad
                </label>
                <input
                  type="text"
                  id="nombreEditado"
                  value={nombreEditado}
                  onChange={(e) => setNombreEditado(e.target.value)}
                  maxLength="100"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditando(null);
                    setNombreEditado("");
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                  disabled={cargando}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium text-white transition ${
                    cargando
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-teal-600 hover:bg-teal-700'
                  }`}
                  disabled={cargando}
                >
                  {cargando ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
