import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/Layout/AdminSidebar';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { AdminHeader, AdminPageHeader } from '../../components/Admin/AdminComponents';
import { obtenerEstudiantes, buscarEstudiantes, filtrarPorEstado, activarEstudiante, desactivarEstudiante } from '../../Services/StudentAdminService';
import { obtenerTodosProgramas } from '../../Services/AcademicService';
import StudentsContent from './StudentsContent';

const StudentList = () => {
  const navigate = useNavigate();
  const { getUserName, getUserInitials, handleLogout } = useAdminAuth();
  const [estudiantes, setEstudiantes] = useState([]);
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

  useEffect(() => { cargarEstudiantes(); }, []);

  // Filtrado derivado (antes: efecto + setState, que provocaba un render extra en cada cambio)
  const estudiantesFiltrados = useMemo(() => {
    let resultado = [...estudiantes];
    if (busqueda.trim()) resultado = buscarEstudiantes(busqueda, resultado, programas);
    return filtrarPorEstado(filtroEstado, resultado);
  }, [busqueda, filtroEstado, estudiantes, programas]);

  // Al cambiar filtros o recargar la lista se vuelve a la primera página (igual que antes)
  useEffect(() => { setPaginaActual(1); }, [busqueda, filtroEstado, estudiantes, programas]);

  const resumen = useMemo(() => {
    const activos = filtrarPorEstado('activo', estudiantes).length;
    const inactivos = filtrarPorEstado('inactivo', estudiantes).length;
    return { total: estudiantes.length, activos, inactivos };
  }, [estudiantes]);

  const cargarEstudiantes = async () => {
    try {
      setCargando(true);
      setError(null);
      const [resultadoEstudiantes, resultadoProgramas] = await Promise.all([obtenerEstudiantes(), obtenerTodosProgramas()]);
      const listaEstudiantes = Array.isArray(resultadoEstudiantes.data) ? resultadoEstudiantes.data : (resultadoEstudiantes.data?.estudiantes || []);
      setEstudiantes(listaEstudiantes);
      setProgramas(resultadoProgramas);
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
  const paginaAnterior = () => setPaginaActual((prev) => Math.max(prev - 1, 1));
  const paginaSiguiente = () => setPaginaActual((prev) => Math.min(prev + 1, totalPaginas));

  const totalPaginas = Math.ceil(estudiantesFiltrados.length / estudiantesPorPagina) || 1;
  const indexUltimoEstudiante = paginaActual * estudiantesPorPagina;
  const indexPrimerEstudiante = indexUltimoEstudiante - estudiantesPorPagina;
  const estudiantesActuales = estudiantesFiltrados.slice(indexPrimerEstudiante, indexUltimoEstudiante);

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader userName={getUserName()} userInitials={getUserInitials()} onLogout={handleLogout} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <AdminSidebar userName={getUserName()} userRole="Administrador" />

          <main className="lg:col-span-3">
            <AdminPageHeader
              icon="pi-users"
              title="Gestión de Estudiantes"
              subtitle="Administra los estudiantes registrados en el sistema"
            />

            {!cargando && estudiantes.length > 0 && (
              <div className="mb-6 grid grid-cols-3 gap-4">
                {[
                  { label: 'Total', valor: resumen.total, icono: 'pi-users', caja: 'from-blue-50 to-blue-100 border-blue-200 text-blue-900', chip: 'from-blue-500 to-blue-600' },
                  { label: 'Activos', valor: resumen.activos, icono: 'pi-check-circle', caja: 'from-emerald-50 to-emerald-100 border-emerald-200 text-emerald-900', chip: 'from-emerald-500 to-emerald-600' },
                  { label: 'Inactivos', valor: resumen.inactivos, icono: 'pi-lock', caja: 'from-red-50 to-red-100 border-red-200 text-red-900', chip: 'from-red-500 to-red-600' },
                ].map((t) => (
                  <div key={t.label} className={`flex items-center justify-between rounded-xl border bg-gradient-to-br ${t.caja} p-4 shadow-sm`}>
                    <div>
                      <p className="text-xs font-medium opacity-80">{t.label}</p>
                      <p className="text-2xl font-bold">{t.valor}</p>
                    </div>
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${t.chip} shadow`}>
                      <i className={`pi ${t.icono} text-white`}></i>
                    </div>
                  </div>
                ))}
              </div>
            )}

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
              paginaAnterior={paginaAnterior}
              paginaSiguiente={paginaSiguiente}
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