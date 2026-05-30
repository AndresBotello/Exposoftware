import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import logo from '../../assets/Logo-unicesar.png';
import AdminSidebar from '../../components/Layout/AdminSidebar';
import * as AuthService from '../../Services/AuthService';
import {
  obtenerEstudiantePorId,
  actualizarEstudiante,
  activarEstudiante,
  desactivarEstudiante
} from '../../Services/StudentAdminService';
import { obtenerTodosProgramas } from '../../Services/AcademicService';

/**
 * Componente para editar la información académica de un estudiante
 * Solo permite editar: programa, semestre, período y año de ingreso
 */
const EditStudent = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [activando, setActivando] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [estudiante, setEstudiante] = useState(null);
  const [programas, setProgramas] = useState([]);
  
  // Datos del formulario
  const [formData, setFormData] = useState({
    codigo_programa: '',
    semestre: 1,
    periodo: '',
    anio_ingreso: new Date().getFullYear(),
    correo: ''
  });

  // Cargar datos del usuario autenticado
  useEffect(() => {
    const user = AuthService.getUserData();
    if (user) {
      setUserData(user);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
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

  const cargarDatos = async () => {
    try {
      setCargando(true);
      setError(null);
      
      // Cargar estudiante y programas en paralelo
      const [resultadoEstudiante, resultadoProgramas] = await Promise.all([
        obtenerEstudiantePorId(studentId),
        obtenerTodosProgramas()
      ]);
      
      const datosEstudiante = resultadoEstudiante.data;
      setEstudiante(datosEstudiante);
      
      const listaProgr = Array.isArray(resultadoProgramas) ? resultadoProgramas : resultadoProgramas.data || [];
      setProgramas(listaProgr);
      
      // Llenar el formulario con los datos actuales
      setFormData({
        codigo_programa: datosEstudiante.codigo_programa || '',
        semestre: datosEstudiante.semestre || 1,
        periodo: datosEstudiante.periodo || '',
        anio_ingreso: datosEstudiante.anio_ingreso || new Date().getFullYear(),
        correo: datosEstudiante.usuario?.correo || ''
      });
    } catch (err) {
      setError(err.message || 'Error al cargar los datos del estudiante');
    } finally {
      setCargando(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'semestre' || name === 'anio_ingreso' 
        ? parseInt(value) 
        : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones
    if (!formData.codigo_programa) {
      setError('Por favor seleccione un programa');
      return;
    }
    
    if (formData.semestre < 1 || formData.semestre > 10) {
      setError('El semestre debe estar entre 1 y 10');
      return;
    }
    
    if (!formData.periodo) {
      setError('Por favor ingrese el período académico');
      return;
    }

    // Validar formato de correo si fue ingresado
    if (formData.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
      setError('Por favor ingrese un correo electrónico válido');
      return;
    }

    try {
      setGuardando(true);
      setError(null);
      setSuccess('');

      // Payload estructurado: el backend espera { perfil: {...}, usuario: {...} }
      const correoOriginal = estudiante?.usuario?.correo || '';
      const payload = {
        perfil: {
          codigo_programa: formData.codigo_programa,
          semestre: formData.semestre,
          periodo: formData.periodo,
          anio_ingreso: formData.anio_ingreso,
        },
        // Solo incluir 'usuario' si el correo cambió (no enviar campos vacíos)
        ...(formData.correo !== correoOriginal && {
          usuario: { correo: formData.correo },
        }),
      };

      await actualizarEstudiante(studentId, payload);

      setSuccess('✅ Estudiante actualizado exitosamente');

      // Redirigir después de 1.5 segundos
      setTimeout(() => {
        navigate(`/admin/estudiantes/${studentId}`);
      }, 1500);
    } catch (err) {
      let msg = err.message || 'Error al actualizar el estudiante';
      // El backend devuelve 500 con IntegrityError si el correo ya está usado
      // por otro usuario. Lo traducimos a un mensaje claro para el admin.
      const lower = msg.toLowerCase();
      if (lower.includes('integrity') || lower.includes('unique') || lower.includes('duplicate')) {
        msg = '⚠ Ese correo ya está registrado por otro usuario. Usa uno diferente.';
      }
      setError(msg);
    } finally {
      setGuardando(false);
    }
  };

  const cancelar = () => {
    navigate(`/admin/estudiantes/${studentId}`);
  };

  const handleActivarDesactivar = async () => {
    try {
      setActivando(true);
      setError(null);
      setSuccess('');

      const estaActivo = estudiante?.activo;

      if (estaActivo) {
        await desactivarEstudiante(studentId);
        setSuccess('✅ Estudiante desactivado exitosamente');
      } else {
        await activarEstudiante(studentId);
        setSuccess('✅ Estudiante activado exitosamente');
      }

      // Recargar datos del estudiante
      setTimeout(() => {
        cargarDatos();
      }, 1000);
    } catch (err) {
      setError(err.message || 'Error al cambiar el estado del estudiante');
    } finally {
      setActivando(false);
    }
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
              <p className="text-gray-600 mt-4">Cargando datos del estudiante...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !estudiante) {
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
            <span>{error}</span>
          </div>
          <button
            onClick={cancelar}
            className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
          >
            <span className="flex items-center gap-2">
              <i className="pi pi-arrow-left"></i>
              Volver
            </span>
          </button>
        </div>
      </div>
    );
  }

  const nombreCompleto = estudiante?.usuario 
    ? `${estudiante.usuario.primer_nombre || ''} ${estudiante.usuario.segundo_nombre || ''} ${estudiante.usuario.primer_apellido || ''} ${estudiante.usuario.segundo_apellido || ''}`.trim() || estudiante.usuario.nombre_completo || 'Estudiante'
    : 'Estudiante';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <AdminSidebar userName={getUserName()} userRole="Administrador" />

          {/* Main Content */}
          <main className="lg:col-span-3">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold text-gray-900">Editar Estudiante</h2>
                <div className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${
                  estudiante?.activo
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${estudiante?.activo ? 'bg-green-600' : 'bg-red-600'}`}></span>
                  {estudiante?.activo ? 'Activo' : 'Inactivo'}
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Editando información académica de: <strong>{nombreCompleto}</strong>
              </p>
            </div>

            {/* Mensajes */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <strong className="font-bold">Error: </strong>
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                {success}
              </div>
            )}

            {/* Formulario */}
            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
                {/* Programa */}
                <div>
                  <label htmlFor="codigo_programa" className="block text-sm font-medium text-gray-700 mb-2">
                    Programa Académico <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="codigo_programa"
                    name="codigo_programa"
                    value={formData.codigo_programa}
                    onChange={handleChange}
                    required
                    disabled={guardando}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all disabled:bg-gray-100"
                  >
                    <option value="">Seleccione un programa</option>
                    {programas.map(programa => (
                      <option key={programa.codigo} value={programa.codigo}>
                        {programa.nombre} - {programa.nivel}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    Programa actual: {estudiante?.programa?.nombre || 'Sin programa'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Semestre */}
                  <div>
                    <label htmlFor="semestre" className="block text-sm font-medium text-gray-700 mb-2">
                      Semestre Actual <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="semestre"
                      name="semestre"
                      value={formData.semestre}
                      onChange={handleChange}
                      min="1"
                      max="10"
                      required
                      disabled={guardando}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all disabled:bg-gray-100"
                    />
                  </div>

                  {/* Período */}
                  <div>
                    <label htmlFor="periodo" className="block text-sm font-medium text-gray-700 mb-2">
                      Período Académico <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="periodo"
                      name="periodo"
                      value={formData.periodo}
                      onChange={handleChange}
                      placeholder="Ej: 2024-1, 2024-2"
                      required
                      disabled={guardando}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all disabled:bg-gray-100"
                    />
                    <p className="mt-1 text-xs text-gray-500">Formato: AAAA-P</p>
                  </div>

                  {/* Año de Ingreso */}
                  <div>
                    <label htmlFor="anio_ingreso" className="block text-sm font-medium text-gray-700 mb-2">
                      Año de Ingreso <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="anio_ingreso"
                      name="anio_ingreso"
                      value={formData.anio_ingreso}
                      onChange={handleChange}
                      min="2000"
                      max={new Date().getFullYear()}
                      required
                      disabled={guardando}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all disabled:bg-gray-100"
                    />
                  </div>

                  {/* Correo Electrónico */}
                  <div className="md:col-span-2">
                    <label htmlFor="correo" className="block text-sm font-medium text-gray-700 mb-2">
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      id="correo"
                      name="correo"
                      value={formData.correo}
                      onChange={handleChange}
                      placeholder="estudiante@unicesar.edu.co"
                      disabled={guardando}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all disabled:bg-gray-100"
                    />
                    <p className="mt-1 text-xs text-amber-600">
                      ⚠ Al cambiar el correo, el estudiante deberá usar el nuevo para iniciar sesión.
                    </p>
                  </div>
                </div>

                {/* Botones */}
                <div className="flex gap-3 justify-between pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleActivarDesactivar}
                    disabled={activando || guardando}
                    className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      estudiante?.activo
                        ? 'bg-red-50 text-red-700 border border-red-300 hover:bg-red-100 disabled:opacity-50'
                        : 'bg-green-50 text-green-700 border border-green-300 hover:bg-green-100 disabled:opacity-50'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {activando ? (
                        <>
                          <span className="animate-spin inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full"></span>
                          {estudiante?.activo ? 'Desactivando...' : 'Activando...'}
                        </>
                      ) : (
                        <>
                          <i className={`pi ${estudiante?.activo ? 'pi-ban' : 'pi-check'}`}></i>
                          {estudiante?.activo ? 'Desactivar Estudiante' : 'Activar Estudiante'}
                        </>
                      )}
                    </span>
                  </button>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={cancelar}
                      disabled={guardando || activando}
                      className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50"
                    >
                      <span className="flex items-center gap-2">
                        <i className="pi pi-times"></i>
                        Cancelar
                      </span>
                    </button>
                    <button
                      type="submit"
                      disabled={guardando || activando}
                      className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        guardando || activando
                          ? 'bg-gray-400 cursor-not-allowed text-white'
                          : 'bg-teal-600 text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {guardando ? (
                          <>
                            <span className="animate-spin inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full"></span>
                            Guardando...
                          </>
                        ) : (
                          <>
                            <i className="pi pi-save"></i>
                            Guardar Cambios
                          </>
                        )}
                      </span>
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Información adicional */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <i className="pi pi-info-circle"></i>
                Información
              </h3>
              <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
                <li>Solo se pueden editar los datos académicos del estudiante</li>
                <li>Para modificar datos personales, contacte al administrador del sistema</li>
                <li>Los cambios se aplicarán inmediatamente</li>
              </ul>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default EditStudent;
