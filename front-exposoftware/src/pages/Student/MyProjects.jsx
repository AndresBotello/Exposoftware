import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import * as ProjectsService from "../../Services/ProjectsService";
import * as TeacherService from "../../Services/TeacherService";
import { actualizarProyectoConArchivo } from "../../Services/ProjectsService";
import EventosService from "../../Services/EventosService";
import MisClasesService from "../../Services/MisClasesService";
import { useProjectFilters } from "../../hooks/Student/useProjectFilters";
import StudentHeader from "../../components/Student/StudentHeader";
import StudentSidebar from "../../components/Student/StudentSidebar";
import StudentLayout from "../../components/Student/StudentLayout";
import ProjectCard from "../../components/ProjectCard";
import ProjectDetailsModal from "../../components/ProjectDetailsModal";
import AddMemberModal from "../../components/Student/AddMemberModal";
import * as MisCertificadosService from "../../Services/MisCertificadosService";
import * as CertificadoService from "../../Services/CertificadoService";
import {
  EVENTO_AUTO,
  EVENTO_TODOS,
  elegirEventoActual,
  construirEventosDisponibles,
  idEvento as idEventoDe,
} from "../../utils/eventoActual";

/* ------------------------------------------------------------------ */
/* Helpers de presentación (misma lógica de estado que tenía la tabla)  */
/* ------------------------------------------------------------------ */

function estadoProyecto(p) {
  if (p.estado === "rechazado") return { clave: "reprobado", texto: "Rechazado", clases: "bg-red-100 text-red-800", icono: "pi-times-circle" };
  if (p.estado === "aprobado" || p.calificacion >= 3.0)
    return { clave: "aprobado", texto: "Aprobado", clases: "bg-green-100 text-green-800", icono: "pi-check-circle" };
  if (p.calificacion < 3.0 && p.calificacion !== null)
    return { clave: "reprobado", texto: "Reprobado", clases: "bg-red-100 text-red-800", icono: "pi-times-circle" };
  return { clave: "pendiente", texto: "Pendiente", clases: "bg-yellow-100 text-yellow-800", icono: "pi-clock" };
}

function tipoActividad(p) {
  const tipo = p.tipo_actividad || p.id_tipo_actividad;
  switch (tipo) {
    case 1: return { texto: "Proyecto", clases: "bg-blue-100 text-blue-800", icono: "pi-folder" };
    case 2: return { texto: "Taller", clases: "bg-orange-100 text-orange-800", icono: "pi-wrench" };
    case 3: return { texto: "Ponencia", clases: "bg-purple-100 text-purple-800", icono: "pi-megaphone" };
    case 4: return { texto: "Conferencia", clases: "bg-indigo-100 text-indigo-800", icono: "pi-microphone" };
    default: return { texto: "No especificado", clases: "bg-gray-100 text-gray-800", icono: "pi-question-circle" };
  }
}

function fechaProyecto(p) {
  const f = p.fecha_subida || p.created_at;
  return f ? new Date(f).toLocaleDateString("es-ES") : "Fecha no disponible";
}

export default function MyProjects() {
  const [projects, setProjects] = useState([]);
  const [loadingProjectsBase, setLoadingProjects] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [eventoInfo, setEventoInfo] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [calificacionPopular, setCalificacionPopular] = useState(null);
  const [loadingCalificacionPopular, setLoadingCalificacionPopular] = useState(false);
  const { user, getFullName, getInitials, logout, loading } = useAuth();
  const navigate = useNavigate();

  // ---- Evento: por defecto el actual (inscripciones abiertas > en curso > ...) ----
  const [eventosRaw, setEventosRaw] = useState([]);
  const [eventoElegido, setEventoElegido] = useState(EVENTO_AUTO);
  // Hasta conocer los eventos no se sabe cuál es el actual: se mantiene la carga para no mostrar datos viejos
  const [eventosCargados, setEventosCargados] = useState(false);
  const loadingProjects = loadingProjectsBase || !eventosCargados;

  useEffect(() => {
    let cancelado = false;
    (async () => {
      try {
        const lista = await EventosService.obtenerEventos();
        if (!cancelado) setEventosRaw(Array.isArray(lista) ? lista : []);
      } catch {
        if (!cancelado) setEventosRaw([]);
      } finally {
        if (!cancelado) setEventosCargados(true);
      }
    })();
    return () => {
      cancelado = true;
    };
  }, []);

  const eventosDisponibles = useMemo(
    () => construirEventosDisponibles(eventosRaw, projects),
    [eventosRaw, projects]
  );

  const eventoActualId = useMemo(() => {
    const actual = elegirEventoActual(eventosRaw);
    if (actual) return String(idEventoDe(actual));
    return eventosDisponibles.length > 0 ? eventosDisponibles[0].id : null;
  }, [eventosRaw, eventosDisponibles]);

  const eventoEfectivo = eventoElegido === EVENTO_AUTO ? eventoActualId || EVENTO_TODOS : eventoElegido;

  const projectsEvento = useMemo(
    () =>
      eventoEfectivo === EVENTO_TODOS
        ? projects
        : projects.filter((p) => String(p.id_evento) === String(eventoEfectivo)),
    [projects, eventoEfectivo]
  );

  const eventoSeleccionadoInfo = eventosDisponibles.find((e) => e.id === String(eventoEfectivo));

  const {
    searchTerm,
    setSearchTerm,
    filterMateria,
    setFilterMateria,
    filterGrupo,
    setFilterGrupo,
    materias,
    grupos,
    filteredProjects,
    clearFilters,
    hasFilters
  } = useProjectFilters(projectsEvento);

  useEffect(() => {
    const cargarMisProyectos = async () => {
      const idEstudiante = user?.id_estudiante || user?.id_usuario;

      if (!user || !idEstudiante) {
        return;
      }

      try {
        setLoadingProjects(true);
        setError(null);

        let misProyectos = await ProjectsService.obtenerMisProyectos(idEstudiante);
        setProjects(misProyectos);
      } catch (err) {
        setError(err.message || 'Error al cargar los proyectos');
      } finally {
        setLoadingProjects(false);
      }
    };

    if (!loading && user) {
      cargarMisProyectos();
    }
  }, [user?.id_estudiante, user?.id_usuario, loading]);

  const handleViewDetails = async (project) => {
    setShowModal(true);
    setEventoInfo(null);

    // Enriquecer proyecto con datos de materia, docente y grupo
    let projectEnriched = { ...project };

    if (project.id_docente_materia) {
      try {
        const detalles = await MisClasesService.obtenerDetallesDocente(project.id_docente_materia);

        if (detalles) {
          projectEnriched = {
            ...project,
            nombre_materia: detalles.nombre_materia,
            nombre_docente: detalles.nombre_docente,
            nombre_grupo: detalles.nombre_grupo,
            id_docente: detalles.id_docente,
            id_grupo: detalles.id_grupo,
            codigo_materia: detalles.codigo_materia
          };
        }
      } catch (error) {
      }
    }

    setSelectedProject(projectEnriched);

    // Cargar info del evento si existe
    if (project.id_evento) {
      try {
        const todosEventos = await EventosService.obtenerEventos();
        const evento = todosEventos.find(e => e.id_evento === project.id_evento);

        if (evento) {
          setEventoInfo(evento);
        } else {
        }
      } catch (error) {
      }
    }

    // Cargar calificación popular del proyecto
    if (project.id_proyecto) {
      setLoadingCalificacionPopular(true);
      try {
        const calificacion = await TeacherService.obtenerCalificacionPopular(project.id_proyecto);
        setCalificacionPopular(calificacion);
      } catch (error) {
        setCalificacionPopular(null);
      } finally {
        setLoadingCalificacionPopular(false);
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProject(null);
    setEventoInfo(null);
    setCalificacionPopular(null);
  };

  const handleEditProject = async (editData, archivoPDF = null) => {
    if (!selectedProject) return;

    try {
      const datosActualizacion = {
        titulo_proyecto: editData.titulo_proyecto,
        codigo_area: editData.codigo_area,
        codigo_linea: editData.codigo_linea,
        codigo_sublinea: editData.codigo_sublinea,
        id_tipo_actividad: editData.id_tipo_actividad
      };

      await actualizarProyectoConArchivo(selectedProject.id_proyecto, datosActualizacion, archivoPDF);

      const idEstudiante = user?.id_estudiante || user?.id_usuario;
      if (idEstudiante) {
        let misProyectos = await ProjectsService.obtenerMisProyectos(idEstudiante);
        setProjects(misProyectos);
      }

      closeModal();
      alert('✅ Proyecto actualizado exitosamente');
    } catch (error) {
      alert(`Error al actualizar: ${error.message}`);
    }
  };

  const handleMemberAdded = async () => {
    // Recargar los proyectos para actualizar la lista de integrantes
    const idEstudiante = user?.id_estudiante || user?.id_usuario;
    if (idEstudiante) {
      try {
        let misProyectos = await ProjectsService.obtenerMisProyectos(idEstudiante);
        setProjects(misProyectos);
      } catch (err) {
      }
    }
  };

  const handleDescargarCertificado = async (proyecto) => {
    if (!proyecto?.id_proyecto) {
      alert('❌ Error: No se encontró el ID del proyecto.');
      return;
    }

    try {

      // Obtener lista de certificados del usuario
      const certificados = await MisCertificadosService.obtenerMisCertificados();

      // Buscar el certificado del proyecto actual
      const certificadoDelProyecto = certificados.find(
        cert => cert.id_proyecto === proyecto.id_proyecto || cert.proyecto_id === proyecto.id_proyecto
      );

      if (!certificadoDelProyecto) {
        alert('⚠️ No hay certificado disponible para este proyecto. Es posible que aún no haya sido generado.');
        return;
      }


      // Descargar el certificado
      const nombreProyecto = proyecto.titulo_proyecto || 'Proyecto';
      const nombreArchivo = `Certificado_${nombreProyecto.replace(/\s+/g, '_')}.pdf`;

      await MisCertificadosService.descargarMiCertificado(
        certificadoDelProyecto.id_certificado || certificadoDelProyecto.id,
        nombreArchivo,
        certificadoDelProyecto.url_cloudinary  // Pasar URL directa de Cloudinary
      );

    } catch (error) {
      alert('❌ ' + (error.message || 'Error al descargar el certificado'));
    }
  };

  const handleDescargarTodosCertificados = async (proyecto) => {
    if (!proyecto?.id_proyecto) {
      alert('❌ Error: No se encontró el ID del proyecto.');
      return;
    }

    try {

      // Obtener lista de certificados del usuario
      const certificados = await MisCertificadosService.obtenerMisCertificados();

      if (certificados.length === 0) {
        alert('⚠️ No hay certificados disponibles para descargar.');
        return;
      }


      // Descargar todos los certificados en bucle
      for (const certificado of certificados) {
        try {
          const nombreArchivo = `Certificado_${certificado.proyecto_titulo || certificado.nombre_proyecto || 'Proyecto'}.pdf`;
          await MisCertificadosService.descargarMiCertificado(
            certificado.id_certificado || certificado.id,
            nombreArchivo
          );
        } catch (err) {
          // Continuar con el siguiente
        }
      }

    } catch (error) {
      alert('❌ ' + (error.message || 'Error al obtener los certificados'));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 rounded-full animate-spin mx-auto mb-4" style={{ borderColor: 'rgba(12, 183, 106, 1)', borderTopColor: 'transparent' }}></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  const resumen = projectsEvento.reduce(
    (acc, p) => {
      acc[estadoProyecto(p).clave] += 1;
      return acc;
    },
    { aprobado: 0, pendiente: 0, reprobado: 0 }
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      <StudentHeader user={user} getFullName={getFullName} getInitials={getInitials} logout={logout} />

      <StudentLayout>
        <StudentSidebar user={user} getInitials={getInitials} getFullName={getFullName} />

        <main className="lg:col-span-3 space-y-6">
          {/* Información del estudiante */}
          <div
            className="relative overflow-hidden border rounded-2xl p-4 sm:p-6"
            style={{ background: 'linear-gradient(to right, rgba(12, 183, 106, 0.05), rgba(12, 183, 106, 0.1))', borderColor: 'rgba(12, 183, 106, 0.3)' }}
          >
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-emerald-200/30"></div>
            <div className="relative flex items-center gap-3 sm:gap-4">
              <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-full flex items-center justify-center flex-shrink-0 shadow-md" style={{ backgroundColor: 'rgba(12, 183, 106, 1)' }}>
                <span className="text-white font-bold text-lg sm:text-xl">{getInitials()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{getFullName()}</h3>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 mt-1">
                  {user?.identificacion && (
                    <span className="flex items-center gap-1">
                      <i className="pi pi-id-card"></i>
                      <span className="truncate">{user.identificacion}</span>
                    </span>
                  )}
                  {user?.identificacion && user?.semestre && <span className="hidden sm:inline text-gray-300">•</span>}
                  {user?.semestre && (
                    <span className="flex items-center gap-1">
                      <i className="pi pi-book"></i>
                      <span>Semestre {user.semestre}</span>
                    </span>
                  )}
                </div>
              </div>
              <div className="hidden sm:block flex-shrink-0">
                <span className="inline-flex items-center gap-2 text-white px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium shadow" style={{ backgroundColor: 'rgba(12, 183, 106, 1)' }}>
                  <i className="pi pi-check-circle"></i>
                  Estudiante Activo
                </span>
              </div>
            </div>
          </div>

          {/* Título + acción principal */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                  <i className="pi pi-folder-open text-white text-xl"></i>
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Mis Proyectos</h2>
                  <p className="text-gray-600 text-sm sm:text-base">Gestiona los proyectos que has postulado o en los que participas.</p>
                </div>
              </div>
              <Link
                to="/student/register-project"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 font-semibold text-white shadow-lg shadow-emerald-200/40 transition-all hover:from-emerald-700 hover:to-teal-700"
              >
                <i className="pi pi-plus"></i>
                Postular proyecto
              </Link>
            </div>
            <div className="h-1 w-24 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full"></div>
          </div>

          {/* Resumen de estados */}
          {!loadingProjects && !error && projects.length > 0 && (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {[
                { label: "Total", valor: projectsEvento.length, icono: "pi-folder", caja: "from-blue-50 to-blue-100 border-blue-200 text-blue-900", chip: "from-blue-500 to-blue-600" },
                { label: "Aprobados", valor: resumen.aprobado, icono: "pi-check-circle", caja: "from-emerald-50 to-emerald-100 border-emerald-200 text-emerald-900", chip: "from-emerald-500 to-emerald-600" },
                { label: "Pendientes", valor: resumen.pendiente, icono: "pi-clock", caja: "from-amber-50 to-amber-100 border-amber-200 text-amber-900", chip: "from-amber-500 to-amber-600" },
                { label: "Reprobados", valor: resumen.reprobado, icono: "pi-times-circle", caja: "from-red-50 to-red-100 border-red-200 text-red-900", chip: "from-red-500 to-red-600" },
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

          {/* Búsqueda, filtros y vista (solo si hay proyectos) */}
          {!loadingProjects && !error && projects.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-4">
              {eventosDisponibles.length > 0 && (
                <div className="flex flex-col gap-3 rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 shadow">
                      <i className="pi pi-calendar text-white"></i>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {eventoEfectivo === EVENTO_TODOS
                          ? "Histórico de todos los eventos"
                          : eventoSeleccionadoInfo?.nombre || "Evento"}
                      </p>
                      <p className="text-xs text-gray-600">
                        {eventoEfectivo === EVENTO_TODOS
                          ? "Estás viendo también los proyectos de eventos anteriores"
                          : eventoSeleccionadoInfo?.id === eventoActualId
                          ? `Evento actual${eventoSeleccionadoInfo?.estadoTexto ? ` · ${eventoSeleccionadoInfo.estadoTexto}` : ""}`
                          : `Evento anterior${eventoSeleccionadoInfo?.estadoTexto ? ` · ${eventoSeleccionadoInfo.estadoTexto}` : ""}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <label htmlFor="filtro-evento-estudiante" className="text-sm font-medium text-gray-700">
                      Evento:
                    </label>
                    <select
                      id="filtro-evento-estudiante"
                      value={eventoEfectivo}
                      onChange={(e) => setEventoElegido(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 sm:w-auto sm:min-w-[220px]"
                    >
                      {eventosDisponibles.map((ev) => (
                        <option key={ev.id} value={ev.id}>
                          {ev.nombre}
                          {ev.estadoTexto ? ` · ${ev.estadoTexto}` : ""}
                          {ev.id === eventoActualId ? " (actual)" : ""}
                        </option>
                      ))}
                      <option value={EVENTO_TODOS}>Todos los eventos (histórico)</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="pi pi-search text-gray-400"></i>
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por nombre del proyecto..."
                    maxLength={120}
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      aria-label="Borrar búsqueda"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <i className="pi pi-times"></i>
                    </button>
                  )}
                </div>

                <div className="relative w-full lg:w-52">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="pi pi-book text-gray-400"></i>
                  </div>
                  <select
                    value={filterMateria}
                    onChange={(e) => {
                      setFilterMateria(e.target.value);
                      setFilterGrupo('Todos');
                    }}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 appearance-none bg-white"
                  >
                    <option value="Todas">Todas las materias</option>
                    {materias.map((materia) => (
                      <option key={materia} value={materia}>{materia}</option>
                    ))}
                  </select>
                </div>

                <div className="relative w-full lg:w-48">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="pi pi-users text-gray-400"></i>
                  </div>
                  <select
                    value={filterGrupo}
                    onChange={(e) => setFilterGrupo(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 appearance-none bg-white disabled:bg-gray-50 disabled:text-gray-400"
                    disabled={grupos.length === 0}
                  >
                    <option value="Todos">Todos los grupos</option>
                    {grupos.map((grupo) => (
                      <option key={grupo} value={grupo}>{grupo}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1 border border-gray-200 self-start lg:self-auto">
                  {[
                    { id: "grid", label: "Tarjetas", icono: "pi-th-large" },
                    { id: "table", label: "Tabla", icono: "pi-list" },
                  ].map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setViewMode(v.id)}
                      aria-pressed={viewMode === v.id}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                        viewMode === v.id
                          ? "bg-emerald-500 text-white shadow-sm"
                          : "text-gray-600 hover:text-gray-800 hover:bg-white"
                      }`}
                    >
                      <i className={`pi ${v.icono}`}></i>
                      <span className="hidden sm:inline">{v.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="inline-flex items-center gap-2 text-gray-600">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                  Mostrando <strong className="text-gray-900">{filteredProjects.length}</strong> de {projectsEvento.length} proyectos
                </span>
                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="ml-1 font-medium text-emerald-600 underline hover:text-emerald-700 transition-colors"
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Contenido principal */}
          {loadingProjects ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm animate-pulse">
                  <div className="h-4 w-3/4 rounded bg-gray-200 mb-3" />
                  <div className="h-3 w-1/2 rounded bg-gray-200 mb-6" />
                  <div className="h-3 w-full rounded bg-gray-100 mb-2" />
                  <div className="h-3 w-5/6 rounded bg-gray-100 mb-6" />
                  <div className="flex gap-2">
                    <div className="h-6 w-16 rounded-full bg-gray-200" />
                    <div className="h-6 w-20 rounded-full bg-gray-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div role="alert" className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <div className="w-14 h-14 bg-red-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                <i className="pi pi-exclamation-triangle text-2xl text-red-500"></i>
              </div>
              <h3 className="text-lg font-semibold text-red-900 mb-1">No pudimos cargar tus proyectos</h3>
              <p className="text-red-700 mb-4 text-sm">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Reintentar
              </button>
            </div>
          ) : projects.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(12, 183, 106, 0.1)' }}>
                <i className="pi pi-folder-open text-4xl" style={{ color: 'rgba(12, 183, 106, 1)' }}></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No tienes proyectos registrados</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Comienza postulando tu primer proyecto para la convocatoria Exposoftware 2026.
              </p>
              <Link
                to="/student/register-project"
                className="inline-flex items-center gap-2 text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity shadow-lg"
                style={{ backgroundColor: 'rgba(12, 183, 106, 1)' }}
              >
                <i className="pi pi-plus-circle"></i>
                Postular Nuevo Proyecto
              </Link>
            </div>
          ) : projectsEvento.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
              <div className="w-16 h-16 bg-emerald-50 rounded-full mx-auto mb-4 flex items-center justify-center">
                <i className="pi pi-calendar text-3xl text-emerald-500"></i>
              </div>
              <p className="text-gray-800 font-medium mb-1">
                Aún no tienes proyectos en {eventoSeleccionadoInfo?.nombre || "este evento"}
              </p>
              <p className="text-sm text-gray-500 mb-5">
                Puedes postular uno nuevo o revisar tus proyectos de eventos anteriores.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  to="/student/register-project"
                  className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:from-emerald-700 hover:to-teal-700"
                >
                  <i className="pi pi-plus"></i>
                  Postular proyecto
                </Link>
                <button
                  onClick={() => setEventoElegido(EVENTO_TODOS)}
                  className="rounded-lg border border-emerald-200 bg-emerald-50 px-5 py-2.5 text-sm font-medium text-emerald-700 hover:bg-emerald-100 transition-colors"
                >
                  Ver histórico
                </button>
              </div>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <i className="pi pi-search text-3xl text-gray-400"></i>
              </div>
              <p className="text-gray-700 font-medium mb-1">No se encontraron proyectos</p>
              <p className="text-sm text-gray-500 mb-4">Prueba con otro nombre o quita algún filtro.</p>
              <button
                onClick={clearFilters}
                className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100 transition-colors"
              >
                Limpiar filtros
              </button>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {filteredProjects.map((proyecto) => (
                <ProjectCard
                  key={proyecto.id_proyecto}
                  proyecto={proyecto}
                  onViewDetails={handleViewDetails}
                />
              ))}

              {/* Tarjeta para postular otro proyecto (toda la tarjeta es un enlace) */}
              <Link
                to="/student/register-project"
                className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center hover:border-teal-400 hover:bg-teal-50 transition-all duration-300 group"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-teal-200 rounded-full flex items-center justify-center mb-4 group-hover:from-teal-200 group-hover:to-teal-300 transition-all duration-300">
                  <i className="pi pi-plus text-2xl text-teal-600"></i>
                </div>
                <h4 className="font-bold text-gray-900 mb-2 text-center">Postular Nuevo Proyecto</h4>
                <p className="text-gray-500 text-sm text-center max-w-xs">Haz clic para iniciar una nueva postulación.</p>
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr className="border-b border-gray-200">
                      {["Proyecto", "Materia", "Tipo", "Estado", "Acciones"].map((h) => (
                        <th key={h} className="text-left py-4 px-6 text-sm font-semibold text-gray-700 whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProjects.map((project, index) => {
                      const estado = estadoProyecto(project);
                      const tipo = tipoActividad(project);
                      return (
                        <tr
                          key={project.id_proyecto}
                          className={`border-b border-gray-100 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 transition-all duration-200 ${
                            index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                          }`}
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <i className="pi pi-folder-open text-emerald-600 text-sm"></i>
                              </div>
                              <div className="min-w-0 max-w-[280px]">
                                <p className="text-sm font-semibold text-gray-900 truncate" title={project.titulo_proyecto}>
                                  {project.titulo_proyecto || "Sin título"}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">{fechaProyecto(project)}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <p className="text-sm font-medium text-gray-900">
                              {project.nombre_materia || project.codigo_materia || "N/A"}
                            </p>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${tipo.clases}`}>
                              <i className={`pi ${tipo.icono} text-[11px]`}></i>
                              {tipo.texto}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex flex-col gap-1">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold w-fit ${estado.clases}`}>
                                <i className={`pi ${estado.icono} text-[11px]`}></i>
                                {estado.texto}
                              </span>
                              {project.calificacion && (
                                <span className="text-xs text-gray-500 font-medium">
                                  <i className="pi pi-star-fill text-yellow-500"></i> {project.calificacion}/5.0
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <button
                              onClick={() => handleViewDetails(project)}
                              className="flex items-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors text-sm font-medium"
                              title="Ver detalles del proyecto"
                            >
                              <i className="pi pi-eye"></i>
                              <span className="hidden md:inline">Ver</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </StudentLayout>

      <ProjectDetailsModal
        selectedProject={selectedProject}
        eventoInfo={eventoInfo}
        user={user}
        onClose={closeModal}
        onDownloadCertificado={handleDescargarCertificado}
        onDownloadTodosCertificados={handleDescargarTodosCertificados}
        token={localStorage.getItem('auth_token')}
        onOpenAddMember={() => setShowAddMemberModal(true)}
        onEdit={handleEditProject}
        calificacionPopular={calificacionPopular}
        loadingCalificacionPopular={loadingCalificacionPopular}
      />

      {selectedProject && (
        <AddMemberModal
          project={selectedProject}
          onClose={() => setShowAddMemberModal(false)}
          onMemberAdded={handleMemberAdded}
          isOpen={showAddMemberModal}
        />
      )}
    </div>
  );
}
