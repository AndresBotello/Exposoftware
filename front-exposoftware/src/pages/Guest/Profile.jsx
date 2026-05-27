import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { actualizarPerfilInvitado } from "../../Services/GuestService";
import { SECTORES } from "../../data/sectores";
import logo from "../../assets/Logo-unicesar.png";

export default function GuestProfile() {
  const location = useLocation();
  const { logout, user, getGuestProfile } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);
  const [perfil, setPerfil] = useState(null);

  const [formData, setFormData] = useState({
    identificacion: '',
    p_nombre: '',
    p_apellido: '',
    correo: '',
    telefono: '',
    nombre_empresa: '',
    id_sector: '',
    es_profesor_extranjero: false
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  useEffect(() => {
    cargarPerfil();
  }, []);

  const cargarPerfil = async () => {
    try {
      setCargando(true);
      setError(null);

      // Obtener perfil del contexto (ya fue cargado en Dashboard)
      const datos = getGuestProfile();

      if (!datos) {
        throw new Error('No se pudo obtener el perfil del invitado');
      }

      setPerfil(datos);

      // Cargar datos en el formulario
      setFormData({
        identificacion: datos.identificacion || '',
        p_nombre: datos.p_nombre || '',
        p_apellido: datos.p_apellido || '',
        correo: datos.correo || '',
        telefono: datos.telefono || '',
        nombre_empresa: datos.nombre_empresa || '',
        id_sector: datos.id_sector || '',
        es_profesor_extranjero: datos.es_profesor_extranjero || false
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm("¿Estás seguro de que deseas cerrar sesión?")) {
      logout();
      navigate("/login");
    }
  };

  const sectores = SECTORES;

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (perfil) {
      setFormData({
        identificacion: perfil.identificacion || '',
        p_nombre: perfil.p_nombre || '',
        p_apellido: perfil.p_apellido || '',
        correo: perfil.correo || '',
        telefono: perfil.telefono || '',
        nombre_empresa: perfil.nombre_empresa || '',
        id_sector: perfil.id_sector || '',
        es_profesor_extranjero: perfil.es_profesor_extranjero || false
      });
    }
  };

  const handleSave = async () => {
    try {
      setGuardando(true);
      setError(null);
      
      if (!perfil?.id_invitado) {
        throw new Error('No se pudo obtener el ID del invitado');
      }
      
      await actualizarPerfilInvitado(perfil.id_invitado, formData);
      setIsEditing(false);
      alert("Cambios guardados exitosamente");
      
      // Recargar perfil
      await cargarPerfil();
    } catch (err) {
      alert(`Error al guardar: ${err.message}`);
    } finally {
      setGuardando(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleOpenPasswordModal = () => {
    setShowPasswordModal(true);
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
  };

  const handleClosePasswordModal = () => {
    setShowPasswordModal(false);
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value
    });
  };

  const handleSavePassword = (e) => {
    e.preventDefault();
    
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      alert("Por favor completa todos los campos");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("Las contraseñas nuevas no coinciden");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      alert("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    alert("Contraseña cambiada exitosamente");
    handleClosePasswordModal();
  };

  const invitadoData = perfil || {
    nombres: formData.p_nombre || "Invitado",
    apellidos: formData.p_apellido || "Usuario",
    correo: formData.correo || "",
    rol: user?.rol || "Invitado"
  };

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

            {/* User avatar and info */}
            <div className="flex items-center gap-4">

              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-700 hidden sm:block">
                  {invitadoData.nombres} {invitadoData.apellidos}
                </span>
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold text-lg">
                    {invitadoData.nombres.charAt(0)}{invitadoData.apellidos.charAt(0)}
                  </span>
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
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <nav className="space-y-1">
                <Link 
                  to="/guest/dashboard" 
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === "/guest/dashboard"
                      ? "bg-green-50 text-green-700"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <i className="pi pi-home text-base"></i>
                  Dashboard
                </Link>
                <Link 
                  to="/guest/proyectos" 
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === "/guest/proyectos"
                      ? "bg-green-50 text-green-700"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <i className="pi pi-book text-base"></i>
                  Ver Proyectos
                </Link>
                <Link 
                  to="/guest/profile" 
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === "/guest/profile"
                      ? "bg-green-50 text-green-700"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <i className="pi pi-cog text-base"></i>
                  Configuración
                </Link>
              </nav>
            </div>
          </aside>

          {/* Main content: Form de configuración de perfil */}
          <main className="lg:col-span-3">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              {/* Estado de carga */}
              {cargando && (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
                  <p className="text-gray-600">Cargando perfil...</p>
                </div>
              )}

              {/* Error */}
              {error && !cargando && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-3">
                    <i className="pi pi-exclamation-triangle text-red-600 text-xl"></i>
                    <div>
                      <h3 className="text-sm font-semibold text-red-900">Error al cargar perfil</h3>
                      <p className="text-sm text-red-700 mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Formulario - Solo si hay datos */}
              {!cargando && perfil && (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Perfil de Invitado</h2>
                      <p className="text-sm text-gray-500">Actualiza tu información personal y de empresa.</p>
                    </div>
                    {!isEditing && (
                      <button 
                        onClick={handleEdit}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                      >
                        <i className="pi pi-pencil"></i>
                        Editar Perfil
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    {/* Información Personal */}
                    <div className="border-b pb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <i className="pi pi-user text-green-600"></i>
                        Información Personal
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Primer Nombre <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="p_nombre"
                            value={formData.p_nombre}
                            onChange={handleInputChange}
                            className={`w-full border border-gray-200 rounded-lg px-3 py-2 ${isEditing ? 'focus:outline-none focus:ring-2 focus:ring-green-500' : 'bg-gray-100'}`}
                            disabled={!isEditing}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Primer Apellido <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="p_apellido"
                            value={formData.p_apellido}
                            onChange={handleInputChange}
                            className={`w-full border border-gray-200 rounded-lg px-3 py-2 ${isEditing ? 'focus:outline-none focus:ring-2 focus:ring-green-500' : 'bg-gray-100'}`}
                            disabled={!isEditing}
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium mb-1">
                            <span className="text-red-600">Identificación (No editable)</span>
                          </label>
                          <input
                            type="text"
                            value={formData.identificacion}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-100 text-gray-500 cursor-not-allowed"
                            disabled
                          />
                        </div>
                      </div>
                    </div>

                    {/* Información de Contacto */}
                    <div className="border-b pb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <i className="pi pi-phone text-green-600"></i>
                        Información de Contacto
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Correo Electrónico <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            name="correo"
                            value={formData.correo}
                            onChange={handleInputChange}
                            className={`w-full border border-gray-200 rounded-lg px-3 py-2 ${isEditing ? 'focus:outline-none focus:ring-2 focus:ring-green-500' : 'bg-gray-100'}`}
                            disabled={!isEditing}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Teléfono <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            name="telefono"
                            value={formData.telefono}
                            onChange={handleInputChange}
                            className={`w-full border border-gray-200 rounded-lg px-3 py-2 ${isEditing ? 'focus:outline-none focus:ring-2 focus:ring-green-500' : 'bg-gray-100'}`}
                            disabled={!isEditing}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Información de Empresa */}
                    <div className="border-b pb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <i className="pi pi-building text-green-600"></i>
                        Información de Empresa
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nombre de Empresa <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="nombre_empresa"
                            value={formData.nombre_empresa}
                            onChange={handleInputChange}
                            className={`w-full border border-gray-200 rounded-lg px-3 py-2 ${isEditing ? 'focus:outline-none focus:ring-2 focus:ring-green-500' : 'bg-gray-100'}`}
                            disabled={!isEditing}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Sector <span className="text-red-500">*</span>
                          </label>
                          <select
                            name="id_sector"
                            value={formData.id_sector}
                            onChange={handleInputChange}
                            className={`w-full border border-gray-200 rounded-lg px-3 py-2 ${isEditing ? 'focus:outline-none focus:ring-2 focus:ring-green-500' : 'bg-gray-100'}`}
                            disabled={!isEditing}
                          >
                            <option value="">Seleccionar sector</option>
                            {sectores.map(sector => (
                              <option key={sector.id} value={sector.id.toString()}>
                                {sector.nombre}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="md:col-span-2">
                          <label className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              name="es_profesor_extranjero"
                              checked={formData.es_profesor_extranjero}
                              onChange={handleInputChange}
                              className={`w-4 h-4 text-green-600 rounded ${isEditing ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                              disabled={!isEditing}
                            />
                            <span className="text-sm font-medium text-gray-700">
                              Es profesor extranjero
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Botones de acción */}
                    {isEditing && (
                      <div className="pt-4 flex gap-3">
                        <button
                          onClick={handleSave}
                          disabled={guardando}
                          className="flex-1 bg-green-700 text-white py-3 rounded-lg font-semibold hover:bg-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {guardando ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                        <button
                          onClick={handleCancel}
                          disabled={guardando}
                          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Cancelar
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Modal para cambiar contraseña */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Cambiar Contraseña</h3>
              <button 
                onClick={handleClosePasswordModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <i className="pi pi-times text-xl"></i>
              </button>
            </div>

            <form onSubmit={handleSavePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña Actual <span className="text-red-500">*</span>
                </label>
                <input 
                  type="password"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nueva Contraseña <span className="text-red-500">*</span>
                </label>
                <input 
                  type="password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                  minLength={6}
                />
                <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar Nueva Contraseña <span className="text-red-500">*</span>
                </label>
                <input 
                  type="password"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={handleClosePasswordModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Guardar Contraseña
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}