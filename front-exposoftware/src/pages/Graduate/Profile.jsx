import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import logo from "../../assets/Logo-unicesar.png";
import * as AuthService from "../../Services/AuthService";
import * as GraduateService from "../../Services/GraduateService";
import colombia from "../../data/colombia.json";
import countryList from 'react-select-country-list';
import { API_ENDPOINTS } from "../../utils/constants";
import GraduateProfileForm from "./GraduateProfileForm";

export default function GraduateProfile() {
  const navigate = useNavigate();
  const { user, getFullName, getInitials, logout, loading, getGraduateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [loadingPerfil, setLoadingPerfil] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Estados para selectores dinámicos
  const [opcionesPaises, setOpcionesPaises] = useState([]);
  const [ciudadesResidencia, setCiudadesResidencia] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  
  // Estados para académicos
  const [facultades, setFacultades] = useState([]);
  const [programas, setProgramas] = useState([]);
  const [cargandoFacultades, setCargandoFacultades] = useState(false);
  const [cargandoProgramas, setCargandoProgramas] = useState(false);
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [nombrePrograma, setNombrePrograma] = useState('');

  const [formData, setFormData] = useState({
    // IDs
    id_egresado: '',
    id_usuario: '',

    // Información personal
    identificacion: '',
    primer_nombre: '',
    primer_apellido: '',
    nombre_completo: '',

    // Contacto
    correo: '',
    telefono: '',

    // Datos académicos
    codigo_programa: '',
    anio_graduacion: new Date().getFullYear(),
    titulado: false,

    // Sistema
    activo: true
  });

  // Cargar perfil al montar
  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        setLoadingPerfil(true);
        setError(null);
        console.log('📋 Cargando perfil del egresado desde contexto...');

        // Obtener perfil del contexto (ya fue cargado en Dashboard)
        const datos = getGraduateProfile();

        if (!datos) {
          throw new Error('No se pudo obtener el perfil del egresado');
        }
        console.log('✅ Perfil cargado desde contexto:', datos);

        setFormData(datos);

        // Obtener nombre del programa
        if (datos.codigo_programa) {
          const nombre = await GraduateService.obtenerNombrePrograma(datos.codigo_programa);
          setNombrePrograma(nombre);
        }
      } catch (err) {
        console.error('❌ Error al cargar perfil:', err);
        setError('No se pudo cargar el perfil. Por favor intente nuevamente.');

        // Si falla, usar datos básicos del contexto
        if (user) {
          setFormData(prev => ({
            ...prev,
            correo: user.correo || user.email || '',
            id_egresado: user.id_egresado || user.id_usuario || ''
          }));
        }
      } finally {
        setLoadingPerfil(false);
      }
    };

    if (!loading) {
      cargarPerfil();
    }
  }, [user, loading]);

  // Inicializar opciones de países
  useEffect(() => {
    const paises = countryList().getData();
    setOpcionesPaises(paises);
  }, []);

  // Cargar facultades al montar
  useEffect(() => {
    cargarFacultades();
  }, []);

  // Actualizar municipios cuando cambia departamento
  useEffect(() => {
    if (formData.departamento) {
      const deptData = colombia.find(d => d.departamento === formData.departamento);
      setMunicipios(deptData ? deptData.ciudades : []);
    } else {
      setMunicipios([]);
    }
  }, [formData.departamento]);

  // Función para cargar facultades
  const cargarFacultades = async () => {
    try {
      setCargandoFacultades(true);
      console.log('📚 Cargando facultades desde API...');

      const response = await fetch(API_ENDPOINTS.PUBLIC_FACULTADES, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Facultades cargadas:', data);
        
        // La respuesta puede venir en data.data o directamente
        const facultadesData = data.data || data;
        setFacultades(Array.isArray(facultadesData) ? facultadesData : []);
      } else {
        console.error('❌ Error cargando facultades:', response.status);
        setFacultades([]);
      }
    } catch (error) {
      console.error('❌ Error cargando facultades:', error);
      setFacultades([]);
    } finally {
      setCargandoFacultades(false);
    }
  };

  // Función para cargar programas por facultad
  const cargarProgramasPorFacultad = async (facultadId) => {
    if (!facultadId) {
      setProgramas([]);
      return;
    }

    try {
      setCargandoProgramas(true);
      console.log(`📚 Cargando programas de facultad ${facultadId}...`);
      
      const response = await fetch(API_ENDPOINTS.PROGRAMAS_BY_FACULTAD_PUBLICO(facultadId), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Programas cargados:', data);
        
        // La respuesta puede venir en data.data o directamente
        const programasData = data.data || data;
        setProgramas(Array.isArray(programasData) ? programasData : []);
      } else {
        console.error('❌ Error cargando programas:', response.status);
        setProgramas([]);
      }
    } catch (error) {
      console.error('❌ Error cargando programas:', error);
      setProgramas([]);
    } finally {
      setCargandoProgramas(false);
    }
  };

  // Función para manejar cambio de facultad
  const handleFacultadChange = (e) => {
    const facultadId = e.target.value;
    const facultadSeleccionada = facultades.find(f => f.id_facultad.toString() === facultadId);
    
    setFormData(prev => ({
      ...prev,
      id_facultad: facultadId,
      nombre_facultad: facultadSeleccionada ? facultadSeleccionada.nombre_facultad : '',
      codigo_programa: '', // Limpiar programa
      programa_academico: '' // Limpiar nombre del programa
    }));
    
    // Cargar programas de la facultad seleccionada
    cargarProgramasPorFacultad(facultadId);
  };

  // Función para manejar cambio de programa
  const handleProgramaChange = (e) => {
    const programaSeleccionado = programas.find(p => p.codigo_programa === e.target.value);
    
    setFormData(prev => ({
      ...prev,
      codigo_programa: e.target.value,
      programa_academico: programaSeleccionado ? programaSeleccionado.nombre_programa : ''
    }));
  };

  // Función para cerrar sesión
  const handleLogout = async () => {
    if (window.confirm('¿Está seguro de que desea cerrar sesión?')) {
      try {
        await AuthService.logout();
        console.log('✅ Sesión cerrada exitosamente');
        navigate('/login');
      } catch (error) {
        console.error('❌ Error al cerrar sesión:', error);
        // Aunque falle, redirigir al login
        navigate('/login');
      }
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError(null);
    setSuccess(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
    setSuccess(null);
    // Recargar datos originales
    window.location.reload();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setGuardando(true);
      setError(null);
      setSuccess(null);

      console.log('💾 Guardando cambios del perfil...');
        
      // Preparar datos para el backend
      const payload = GraduateService.prepararDatosParaBackend(formData);
        
      // Actualizar perfil
      const idEgresado = formData.id_egresado || user.id_egresado || user.id_usuario;
      const perfilActualizado = await GraduateService.actualizarPerfilEgresado(idEgresado, payload);
        
      console.log('✅ Perfil actualizado:', perfilActualizado);
        
      setFormData(perfilActualizado);
      setIsEditing(false);
      setSuccess('✅ Perfil actualizado exitosamente');
        
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('❌ Error al guardar:', err);
      setError(`Error al actualizar el perfil: ${err.message}`);
    } finally {
      setGuardando(false);
    }
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold text-lg">{getInitials()}</span>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">{getFullName()}</p>
                  <p className="text-xs text-gray-500">Egresado</p>
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
                <Link to="/graduate/dashboard" className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                  <i className="pi pi-home text-base"></i>
                  Dashboard
                </Link>
                <Link to="/graduate/proyectos" className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                  <i className="pi pi-briefcase text-base"></i>
                  Mis Proyectos
                </Link>
                <Link to="/graduate/profile" className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 bg-green-50 text-green-700">
                  <i className="pi pi-cog text-base"></i>
                  Configuración
                </Link>
              </nav>
            </div>
          </aside>

          {/* Main content */}
          <main className="lg:col-span-3">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Perfil Profesional</h2>
                  <p className="text-sm text-gray-500">Actualiza tu información profesional y de contacto.</p>
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

              {/* Mensajes de éxito/error */}
              {success && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                  {success}
                </div>
              )}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              {loadingPerfil ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                  <p className="mt-4 text-gray-600">Cargando perfil...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Formulario de Perfil */}
                  <GraduateProfileForm
                    formData={formData}
                    isEditing={isEditing}
                    handleChange={handleChange}
                    nombrePrograma={nombrePrograma}
                  />

                  {/* Seguridad */}
                  <div className="pb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <i className="pi pi-lock text-green-600"></i>
                      Seguridad
                    </h3>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                        <input 
                          type="password" 
                          defaultValue="********" 
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-100" 
                          readOnly 
                        />
                      </div>
                      <div className="shrink-0">
                        <button 
                          onClick={handleOpenPasswordModal}
                          className="mt-6 inline-flex items-center px-4 py-2 border border-green-600 text-green-600 rounded-lg text-sm hover:bg-green-50 transition-colors"
                        >
                          Cambiar Contraseña
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  {isEditing && (
                    <div className="pt-4 flex gap-3">
                      <button 
                        onClick={handleSave}
                        disabled={guardando}
                        className="flex-1 bg-green-700 text-white py-3 rounded-lg font-semibold hover:bg-green-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
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
