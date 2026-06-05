import { useState, useEffect } from "react";
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

export default function MyProjects() {
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
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
  } = useProjectFilters(projects);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      <StudentHeader user={user} getFullName={getFullName} getInitials={getInitials} logout={logout} />

      <StudentLayout>
        <StudentSidebar user={user} getInitials={getInitials} getFullName={getFullName} />

        <main className="lg:col-span-3">
          {/* Información del estudiante */}
          <div className="border rounded-lg p-4 sm:p-6 mb-6" style={{ background: 'linear-gradient(to right, rgba(12, 183, 106, 0.05), rgba(12, 183, 106, 0.1))', borderColor: 'rgba(12, 183, 106, 0.3)' }}>
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(12, 183, 106, 1)' }}>
                <span className="text-white font-bold text-lg sm:text-xl">{getInitials()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{getFullName()}</h3>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 mt-1">
                  <span className="flex items-center gap-1">
                    <i className="pi pi-id-card"></i>
                    <span className="truncate">{user?.identificacion}</span>
                  </span>
                  <span className="hidden sm:inline text-gray-300">•</span>
                  <span className="flex items-center gap-1">
                    <i className="pi pi-book"></i>
                    <span>Semestre {user?.semestre}</span>
                  </span>
                </div>
              </div>
              <div className="hidden sm:block flex-shrink-0">
                <span className="inline-flex items-center gap-2 text-white px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium" style={{ backgroundColor: 'rgba(12, 183, 106, 1)' }}>
                  <i className="pi pi-check-circle"></i>
                  Estudiante Activo
                </span>
              </div>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-2">Mis Proyectos</h2>
          <p className="text-gray-600 mb-6">Aquí puedes gestionar todos los proyectos académicos que has postulado o en los que participas.</p>

          {/* Búsqueda y Filtros mejorados */}
          <div className="bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
                <i className="pi pi-search text-white text-lg"></i>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Buscar y Filtrar</h3>
                <p className="text-sm text-gray-500">Encuentra rápidamente tus proyectos</p>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="relative flex-1 w-full lg:w-auto max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="pi pi-search text-gray-400"></i>
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nombre..."
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <i className="pi pi-times"></i>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <i className="pi pi-filter text-gray-500 text-sm"></i>
                <span className="text-sm font-medium text-gray-700">Filtros:</span>
              </div>

              <div className="relative w-full lg:w-auto max-w-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="pi pi-book text-gray-400"></i>
                </div>
                <select
                  value={filterMateria}
                  onChange={(e) => {
                    setFilterMateria(e.target.value);
                    setFilterGrupo('Todos'); // Reset grupo cuando cambia materia
                  }}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 appearance-none bg-white"
                >
                  <option value="Todas">Todas las materias</option>
                  {materias.map((materia) => (
                    <option key={materia} value={materia}>
                      {materia}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative w-full lg:w-auto max-w-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="pi pi-users text-gray-400"></i>
                </div>
                <select
                  value={filterGrupo}
                  onChange={(e) => setFilterGrupo(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 appearance-none bg-white"
                  disabled={grupos.length === 0}
                >
                  <option value="Todos">Todos los grupos</option>
                  {grupos.map((grupo) => (
                    <option key={grupo} value={grupo}>
                      {grupo}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Mensajes informativos */}
            <div className="flex flex-col gap-3 mt-4">
              {searchTerm && (
                <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-800">
                  <i className="pi pi-search text-emerald-600"></i>
                  <span>
                    <strong>Búsqueda:</strong> "{searchTerm}" - {filteredProjects.length} resultado(s)
                  </span>
                </div>
              )}
              {hasFilters && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                  <i className="pi pi-info-circle text-blue-600"></i>
                  <span>
                    <strong>Filtros activos:</strong> Mostrando {filteredProjects.length} de {projects.length} proyectos
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Controles de vista y estadísticas */}
          <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl border border-emerald-200 p-4 mb-6 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">
                    {filteredProjects.length} de {projects.length} proyectos
                  </span>
                </div>

                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-medium underline transition-colors"
                  >
                    Limpiar filtros
                  </button>
                )}

                <div className="flex gap-2">
                  {projects.filter((p) => p.estado === "aprobado" || p.calificacion >= 3.0).length > 0 && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>
                        {projects.filter((p) => p.estado === "aprobado" || p.calificacion >= 3.0).length} Aprobados
                      </span>
                    </div>
                  )}
                  {projects.filter(
                    (p) => p.estado === "rechazado" || (p.calificacion < 3.0 && p.calificacion !== null)
                  ).length > 0 && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span>
                        {
                          projects.filter(
                            (p) => p.estado === "rechazado" || (p.calificacion < 3.0 && p.calificacion !== null)
                          ).length
                        }{" "}
                        Reprobados
                      </span>
                    </div>
                  )}
                  {projects.filter((p) => p.estado !== "aprobado" && p.estado !== "rechazado" && (!p.calificacion || (p.calificacion === null || p.calificacion === undefined))).length >
                    0 && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span>
                        {
                          projects.filter((p) => p.estado !== "aprobado" && p.estado !== "rechazado" && (!p.calificacion || (p.calificacion === null || p.calificacion === undefined)))
                            .length
                        }{" "}
                        Pendientes
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Controles de vista */}
              <div className="flex items-center gap-2 bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    viewMode === "grid"
                      ? "bg-emerald-500 text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                  }`}
                >
                  <i className="pi pi-th-large"></i>
                  <span className="hidden sm:inline">Tarjetas</span>
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    viewMode === "table"
                      ? "bg-emerald-500 text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                  }`}
                >
                  <i className="pi pi-list"></i>
                  <span className="hidden sm:inline">Tabla</span>
                </button>
              </div>
            </div>
          </div>

          {/* Contenido principal */}
          {loadingProjects ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <div className="w-16 h-16 border-4 rounded-full animate-spin mx-auto mb-4" style={{ borderColor: 'rgba(12, 183, 106, 1)', borderTopColor: 'transparent' }}></div>
              <p className="text-gray-600">Cargando proyectos...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <i className="pi pi-exclamation-triangle text-3xl text-red-500 mb-3"></i>
              <h3 className="text-lg font-semibold text-red-900 mb-2">Error al cargar proyectos</h3>
              <p className="text-red-700 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Reintentar
              </button>
            </div>
          ) : projects.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(12, 183, 106, 0.1)' }}>
                <i className="pi pi-folder-open text-4xl" style={{ color: 'rgba(12, 183, 106, 1)' }}></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No tienes proyectos registrados</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Comienza postulando tu primer proyecto para la convocatoria Exposoftware 2025.
              </p>
              <Link
                to="/student/register-project"
                className="inline-flex items-center gap-2 text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
                style={{ backgroundColor: 'rgba(12, 183, 106, 1)' }}
              >
                <i className="pi pi-plus-circle"></i>
                Postular Nuevo Proyecto
              </Link>
            </div>
          ) : viewMode === "grid" ? (
            <div>
              {filteredProjects.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <i className="pi pi-search text-4xl text-gray-400"></i>
                  </div>
                  <p className="text-gray-600 mb-2">No se encontraron proyectos</p>
                  <p className="text-sm text-gray-500">Intenta con otros términos de búsqueda</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {filteredProjects.map((proyecto) => (
                    <ProjectCard
                      key={proyecto.id_proyecto}
                      proyecto={proyecto}
                      onViewDetails={handleViewDetails}
                    />
                  ))}

                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center hover:border-teal-400 hover:bg-teal-50 transition-all duration-300 group cursor-pointer">
                    <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-teal-200 rounded-full flex items-center justify-center mb-4 group-hover:from-teal-200 group-hover:to-teal-300 transition-all duration-300">
                      <i className="pi pi-plus text-2xl text-teal-600"></i>
                    </div>
                    <h4 className="font-bold text-gray-900 mb-2 text-center">Postular Nuevo Proyecto</h4>
                    <p className="text-gray-500 text-sm mb-4 text-center max-w-xs">Haga clic para iniciar una nueva postulación.</p>
                    <Link
                      to="/student/register-project"
                      className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:from-teal-600 hover:to-teal-700 transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
                    >
                      <i className="pi pi-plus-circle"></i>
                      Postular
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                        Proyecto
                      </th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                        Materia
                      </th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                        Tipo
                      </th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                        Estado
                      </th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProjects.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="py-12 px-6 text-center">
                          <div className="flex flex-col items-center">
                            <i className="pi pi-search text-4xl text-gray-400 mb-4"></i>
                            <p className="text-gray-600">No se encontraron proyectos</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredProjects.map((project, index) => (
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
                              <div className="min-w-0 flex-1">
                                <p
                                  className="text-sm font-semibold text-gray-900 truncate"
                                  title={project.titulo_proyecto}
                                >
                                  {project.titulo_proyecto || "Sin título"}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {project.fecha_subida
                                    ? new Date(project.fecha_subida).toLocaleDateString("es-ES")
                                    : project.created_at
                                    ? new Date(project.created_at).toLocaleDateString("es-ES")
                                    : "Fecha no disponible"}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="text-sm text-gray-900">
                              <p className="font-medium">
                                {project.nombre_materia || project.codigo_materia || "N/A"}
                              </p>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                (() => {
                                  const tipo = project.tipo_actividad || project.id_tipo_actividad;
                                  return tipo === 1
                                    ? "bg-blue-100 text-blue-800"
                                    : tipo === 2
                                    ? "bg-orange-100 text-orange-800"
                                    : tipo === 3
                                    ? "bg-purple-100 text-purple-800"
                                    : tipo === 4
                                    ? "bg-indigo-100 text-indigo-800"
                                    : "bg-gray-100 text-gray-800";
                                })()
                              }`}
                            >
                              {(() => {
                                const tipo = project.tipo_actividad || project.id_tipo_actividad;
                                return tipo === 1
                                  ? "📚 Proyecto"
                                  : tipo === 2
                                  ? "🛠️ Taller"
                                  : tipo === 3
                                  ? "🎤 Ponencia"
                                  : tipo === 4
                                  ? "🎭 Conferencia"
                                  : "❓ No especificado";
                              })()}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex flex-col gap-1">
                              <span
                                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold w-fit ${
                                  project.estado === "rechazado"
                                    ? "bg-red-100 text-red-800"
                                    : project.estado === "aprobado" || project.calificacion >= 3.0
                                    ? "bg-green-100 text-green-800"
                                    : project.calificacion < 3.0 &&
                                      project.calificacion !== null
                                    ? "bg-red-100 text-red-800"
                                    : !project.calificacion || project.calificacion === null || project.calificacion === undefined
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {project.estado === "rechazado"
                                  ? "❌ Rechazado"
                                  : project.estado === "aprobado" || project.calificacion >= 3.0
                                  ? "✅ Aprobado"
                                  : project.calificacion < 3.0 &&
                                    project.calificacion !== null
                                  ? "❌ Reprobado"
                                  : !project.calificacion || project.calificacion === null || project.calificacion === undefined
                                  ? "⏳ Pendiente"
                                  : "🚫 Sin estado"}
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
                      ))
                    )}
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
