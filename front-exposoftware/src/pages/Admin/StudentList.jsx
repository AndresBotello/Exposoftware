import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/Logo-unicesar.png';
import AdminSidebar from '../../components/Layout/AdminSidebar';
import * as AuthService from '../../Services/AuthService';
import { obtenerEstudiantes, buscarEstudiantes, filtrarPorEstado, activarEstudiante, desactivarEstudiante } from '../../Services/StudentAdminService';
import { obtenerTodosProgramas } from '../../Services/AcademicService';
import StudentsContent from './StudentsContent';

const StudentList = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [estudiantes, setEstudiantes] = useState([]);
  const [estudiantesFiltrados, setEstudiantesFiltrados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [paginaActual, setPaginaActual] = useState(1);
  const [estudiantesPorPagina] = useState(10);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState(null);
  const [accionPendiente, setAccionPendiente] = useState(null);
  const [programas, setProgramas] = useState([]);

  useEffect(() => {
    const user = AuthService.getUserData();
    if (user) setUserData(user);
  }, []);

  useEffect(() => { cargarEstudiantes(); }, []);

  useEffect(() => { aplicarFiltros(); }, [busqueda, filtroEstado, estudiantes, programas]);

  const getUserName = () => {
    if (!userData) return 'Administrador';
    return userData.nombre || userData.nombres || userData.correo?.split('@')[0] || 'Administrador';
  };
  const getUserInitials = () => getUserName().charAt(0).toUpperCase();

  const handleLogout = async () => {
    if (window.confirm('¿Está seguro de que desea cerrar sesión?')) {
      try { await AuthService.logout(); navigate('/login'); } catch (error) { console.error('❌ Error al cerrar sesión:', error); }
    }
  };

  const cargarEstudiantes = async () => {
    try {
      setCargando(true);
      setError(null);
      const [resultadoEstudiantes, resultadoProgramas] = await Promise.all([obtenerEstudiantes(), obtenerTodosProgramas()]);
      const listaEstudiantes = Array.isArray(resultadoEstudiantes.data) ? resultadoEstudiantes.data : (resultadoEstudiantes.data?.estudiantes || []);
      setEstudiantes(listaEstudiantes);
      setProgramas(resultadoProgramas);
      setEstudiantesFiltrados(listaEstudiantes);
    } catch (err) {
      let mensajeError = err.message || 'Error al cargar los estudiantes del servidor';
      if (err.message?.includes('interno del servidor')) {
        mensajeError += ' - Es posible que el endpoint /api/v1/admin/estudiantes no esté implementado en el backend todavía.';
      }
      setError(mensajeError);
    } finally {
      setCargando(false);
    }
  };

  const aplicarFiltros = () => {
    let resultado = [...estudiantes];
    if (busqueda.trim()) resultado = buscarEstudiantes(busqueda, resultado, programas);
    resultado = filtrarPorEstado(filtroEstado, resultado);
    setEstudiantesFiltrados(resultado);
    setPaginaActual(1);
  };

  const handleCambiarEstado = (estudiante, accion) => {
    setEstudianteSeleccionado(estudiante);
    setAccionPendiente(accion);
    setMostrarConfirmacion(true);
  };

  const confirmarCambioEstado = async () => {
    if (!estudianteSeleccionado || !accionPendiente) return;
    try {
      setCargando(true);
      if (accionPendiente === 'activar') { await activarEstudiante(estudianteSeleccionado.id_estudiante); }
      else { await desactivarEstudiante(estudianteSeleccionado.id_estudiante); }
      await cargarEstudiantes();
      setMostrarConfirmacion(false);
      setEstudianteSeleccionado(null);
      setAccionPendiente(null);
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setCargando(false);
    }
  };

  const verDetalles = (estudianteId) => navigate(`/admin/estudiantes/${estudianteId}`);
  const editarEstudiante = (estudianteId) => navigate(`/admin/estudiantes/${estudianteId}/editar`);
  const cambiarPagina = (numeroPagina) => setPaginaActual(numeroPagina);

  const indexUltimoEstudiante = paginaActual * estudiantesPorPagina;
  const indexPrimerEstudiante = indexUltimoEstudiante - estudiantesPorPagina;
  const estudiantesActuales = estudiantesFiltrados.slice(indexPrimerEstudiante, indexUltimoEstudiante);
  const totalPaginas = Math.ceil(estudiantesFiltrados.length / estudiantesPorPagina);

  return (
    <div className="min-h-screen bg-gray-50">
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
                <span className="text-sm text-gray-700 hidden sm:block">{getUserName()}</span>
                <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                  <span className="text-teal-600 font-bold text-lg">{getUserInitials()}</span>
                </div>
              </div>
              <button onClick={handleLogout} className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors flex items-center gap-2">
                <i className="pi pi-sign-out"></i>
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <AdminSidebar userName={getUserName()} userRole="Administrador" />

          <main className="lg:col-span-3">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Gestión de Estudiantes</h2>
              <p className="text-sm text-gray-600">Administra los estudiantes registrados en el sistema</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <strong className="font-bold">Error: </strong><span>{error}</span>
              </div>
            )}

            <StudentsContent
              cargando={cargando}
              estudiantes={estudiantes}
              estudiantesFiltrados={estudiantesFiltrados}
              estudiantesActuales={estudiantesActuales}
              busqueda={busqueda} setBusqueda={setBusqueda}
              filtroEstado={filtroEstado} setFiltroEstado={setFiltroEstado}
              paginaActual={paginaActual}
              totalPaginas={totalPaginas}
              indexPrimerEstudiante={indexPrimerEstudiante}
              indexUltimoEstudiante={indexUltimoEstudiante}
              cambiarPagina={cambiarPagina}
              verDetalles={verDetalles}
              editarEstudiante={editarEstudiante}
              handleCambiarEstado={handleCambiarEstado}
              programas={programas}
              mostrarConfirmacion={mostrarConfirmacion}
              estudianteSeleccionado={estudianteSeleccionado}
              accionPendiente={accionPendiente}
              confirmarCambioEstado={confirmarCambioEstado}
              setMostrarConfirmacion={setMostrarConfirmacion}
              setEstudianteSeleccionado={setEstudianteSeleccionado}
              setAccionPendiente={setAccionPendiente}
            />
          </main>
        </div>
      </div>
    </div>
  );
};

export default StudentList;
