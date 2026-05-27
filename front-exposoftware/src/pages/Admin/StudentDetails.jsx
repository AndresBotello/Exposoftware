import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import logo from '../../assets/Logo-unicesar.png';
import AdminSidebar from '../../components/Layout/AdminSidebar';
import * as AuthService from '../../Services/AuthService';
import { obtenerEstudianteCompleto, formatearEstudiante } from '../../Services/StudentAdminService';
import { obtenerTodosProgramas } from '../../Services/AcademicService';

/**
 * Componente para mostrar los detalles completos de un estudiante
 * Incluye información personal, académica y de contacto
 */
const StudentDetails = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  
  const [estudiante, setEstudiante] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [programas, setProgramas] = useState([]);

  // Cargar datos del usuario autenticado
  useEffect(() => {
    const user = AuthService.getUserData();
    if (user) {
      setUserData(user);
    }
  }, []);

  useEffect(() => {
    cargarEstudiante();
  }, [studentId]);

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

  const cargarEstudiante = async () => {
    try {
      setCargando(true);
      setError(null);
      
      // Cargar estudiante y programas en paralelo
      const [resultadoEstudiante, resultadoProgramas] = await Promise.all([
        obtenerEstudianteCompleto(studentId),
        obtenerTodosProgramas()
      ]);
      
      setEstudiante(resultadoEstudiante.data);
      setProgramas(resultadoProgramas);
    } catch (err) {
      setError(err.message || 'Error al cargar los detalles del estudiante');
    } finally {
      setCargando(false);
    }
  };

  const volver = () => {
    navigate('/admin/estudiantes');
  };

  const editar = () => {
    navigate(`/admin/estudiantes/${studentId}/editar`);
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <img src={logo} alt="Logo Unicesar" className="w-10 h-auto" />
                <div>
                  <h1 className="text-lg font-bold text-gray-900">Expo-software </h1>
                  <p className="text-xs text-gray-500">Universidad Popular del Cesar</p>
                </div>
              </div>
            </div>
          </div>
        </header>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <div className="text-center py-12">
              <span className="animate-spin inline-block w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full"></span>
              <p className="text-gray-600 mt-4">Cargando detalles del estudiante...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !estudiante) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <img src={logo} alt="Logo Unicesar" className="w-10 h-auto" />
                <div>
                  <h1 className="text-lg font-bold text-gray-900">Expo-software 2025</h1>
                  <p className="text-xs text-gray-500">Universidad Popular del Cesar</p>
                </div>
              </div>
            </div>
          </div>
        </header>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            <strong className="font-bold">Error: </strong>
            <span>{error || 'No se encontraron detalles del estudiante'}</span>
          </div>
          <button
            onClick={volver}
            className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
          >
            <span className="flex items-center gap-2">
              <i className="pi pi-arrow-left"></i>
              Volver al listado
            </span>
          </button>
        </div>
      </div>
    );
  }

  const formateado = formatearEstudiante(estudiante, programas);
  const usuario = estudiante.usuario || {};

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <AdminSidebar userName={getUserName()} userRole="Administrador" />

          {/* Main Content */}
          <main className="lg:col-span-3">
            {/* Header con botones */}
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Detalles del Estudiante</h2>
                <p className="text-sm text-gray-600">Información completa del estudiante</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={volver}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
                >
                  <span className="flex items-center gap-2">
                    <i className="pi pi-arrow-left"></i>
                    Volver
                  </span>
                </button>
                <button
                  onClick={editar}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-all"
                >
                  <span className="flex items-center gap-2">
                    <i className="pi pi-pencil"></i>
                    Editar
                  </span>
                </button>
              </div>
            </div>

            {/* Estado del estudiante */}
            <div className="mb-6">
              <span className={`px-3 py-1.5 inline-flex text-sm font-semibold rounded-full ${
                formateado.estadoBool
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                Estado: {formateado.estado}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Información Personal */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <i className="pi pi-user text-teal-600"></i>
                  Información Personal
                </h3>
                <div className="space-y-3">
                  <InfoField label="Nombre Completo" value={formateado.nombreCompleto} />
                  <InfoField label="Identificación" value={formateado.identificacion} />
                </div>
              </div>

              {/* Información de Contacto */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <i className="pi pi-phone text-teal-600"></i>
                  Información de Contacto
                </h3>
                <div className="space-y-3">
                  <InfoField label="Email" value={formateado.email} />
                  <InfoField label="Teléfono" value={formateado.telefono} />
                </div>
              </div>

              {/* Información Académica */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <i className="pi pi-graduation-cap text-teal-600"></i>
                  Información Académica
                </h3>
                <div className="space-y-3">
                  <InfoField
                    label="Programa"
                    value={formateado.programa}
                  />
                  <InfoField
                    label="Código del Programa"
                    value={formateado.codigoPrograma || 'N/A'}
                  />
                  <InfoField
                    label="Semestre Actual"
                    value={`${formateado.semestre}°`}
                  />
                  <InfoField
                    label="Período Académico"
                    value={formateado.periodo || 'N/A'}
                  />
                  <InfoField
                    label="Año de Ingreso"
                    value={formateado.anioIngreso || 'N/A'}
                  />
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

/**
 * Componente auxiliar para mostrar un campo de información
 */
const InfoField = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>
    <span className="text-sm text-gray-900 mt-1">{value}</span>
  </div>
);

export default StudentDetails;
