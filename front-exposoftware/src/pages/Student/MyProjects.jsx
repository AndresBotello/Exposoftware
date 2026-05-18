import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import * as ProjectsService from "../../Services/ProjectsService";
import EventosService from "../../Services/EventosService";
import { useProjectFilters } from "../../hooks/Student/useProjectFilters";
import StudentHeader from "../../components/Student/StudentHeader";
import StudentSidebar from "../../components/Student/StudentSidebar";
import StudentLayout from "../../components/Student/StudentLayout";
import ProjectCard from "../../components/ProjectCard";
import ProjectDetailsModal from "../../components/ProjectDetailsModal";
import * as CertificadoService from "../../Services/CertificadoService";

export default function MyProjects() {
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [eventoInfo, setEventoInfo] = useState(null);
  const { user, getFullName, getInitials, logout, loading } = useAuth();
  const navigate = useNavigate();

  const {
    searchTerm,
    setSearchTerm,
    filterMateria,
    setFilterMateria,
    filteredProjects,
    clearFilters,
    hasFilters
  } = useProjectFilters(projects);

  useEffect(() => {
    const cargarMisProyectos = async () => {
      const idEstudiante = user?.id_estudiante || user?.id_usuario;

      if (!user || !idEstudiante) {
        console.log('⏳ Esperando datos del usuario...');
        return;
      }

      try {
        setLoadingProjects(true);
        setError(null);
        console.log('🔍 Cargando proyectos del estudiante:', idEstudiante);

        let misProyectos = await ProjectsService.obtenerMisProyectos(idEstudiante);
        setProjects(misProyectos);
        console.log('✅ Proyectos cargados:', misProyectos.length);
      } catch (err) {
        console.error('❌ Error cargando proyectos:', err);
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
    setSelectedProject(project);
    setShowModal(true);
    setEventoInfo(null);

    if (project.id_evento) {
      try {
        console.log('🔍 Cargando info del evento:', project.id_evento);
        const todosEventos = await EventosService.obtenerEventos();
        const evento = todosEventos.find(e => e.id_evento === project.id_evento);

        if (evento) {
          console.log('✅ Evento encontrado:', evento);
          setEventoInfo(evento);
        } else {
          console.warn('⚠️ Evento no encontrado:', project.id_evento);
        }
      } catch (error) {
        console.warn('⚠️ No se pudo cargar el evento:', error);
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProject(null);
    setEventoInfo(null);
  };

  const handleDescargarCertificado = async (proyecto) => {
    if (!user?.id_estudiante || !proyecto?.id_proyecto) {
      alert('❌ Error: No se encontró la información necesaria.');
      return;
    }

    try {
      const nombreProyecto = proyecto.titulo_proyecto || 'Proyecto';
      await CertificadoService.generarYDescargarCertificado(
        user.id_estudiante,
        proyecto.id_proyecto,
        nombreProyecto
      );
      console.log('✅ Certificado descargado exitosamente');
    } catch (error) {
      console.error('❌ Error al descargar certificado:', error);
      throw error;
    }
  };

  const handleDescargarTodosCertificados = async (proyecto) => {
    if (!proyecto?.id_proyecto) {
      alert('❌ Error: No se encontró el ID del proyecto.');
      return;
    }

    try {
      const nombreProyecto = proyecto.titulo_proyecto || 'Proyecto';
      await CertificadoService.generarYDescargarCertificadosPorProyecto(
        proyecto.id_proyecto,
        nombreProyecto,
        {
          id_evento: proyecto.id_evento || null,
          incluir_calificacion: false,
          coordinador_general: "Juan Yaneth",
          formato_salida: "zip"
        }
      );
      console.log('✅ Certificados descargados exitosamente');
    } catch (error) {
      console.error('❌ Error al descargar certificados:', error);
      throw error;
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

          {/* Búsqueda y Filtros */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 mb-6 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
                <i className="pi pi-search text-white text-lg"></i>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Buscar y Filtrar Proyectos</h3>
                <p className="text-sm text-gray-500">Encuentra rápidamente tus proyectos por nombre o materia</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <i className="pi pi-tag mr-1"></i>Nombre del Proyecto
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por nombre..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base"
                  />
                  <i className="pi pi-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <i className="pi pi-book mr-1"></i>Materia
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={filterMateria}
                    onChange={(e) => setFilterMateria(e.target.value)}
                    placeholder="Filtrar por materia..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm sm:text-base"
                  />
                  <i className="pi pi-book absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mt-4 pt-4 border-t border-gray-100">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <i className="pi pi-times"></i>
                    Limpiar filtros
                  </button>
                )}
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{filteredProjects.length}</span> de <span className="font-medium">{projects.length}</span> proyectos
                  {hasFilters && (
                    <span className="ml-1 text-blue-600">(filtrados)</span>
                  )}
                </div>
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
        </main>
      </StudentLayout>

      <ProjectDetailsModal
        selectedProject={selectedProject}
        eventoInfo={eventoInfo}
        user={user}
        onClose={closeModal}
        onDownloadCertificado={handleDescargarCertificado}
        onDownloadTodosCertificados={handleDescargarTodosCertificados}
      />
    </div>
  );
}
