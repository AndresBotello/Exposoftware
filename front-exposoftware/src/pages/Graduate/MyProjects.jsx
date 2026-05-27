import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import * as ProjectsService from "../../Services/ProjectsService";
import EventosService from "../../Services/EventosService";
import logo from "../../assets/Logo-unicesar.png";

export default function GraduateMyProjects() {
  const [selectedProject, setSelectedProject] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [error, setError] = useState(null);
  const [eventoInfo, setEventoInfo] = useState(null);
  const [miPerfil, setMiPerfil] = useState(null);
  const { user, getFullName, getInitials, logout, loading, getGraduateProfile } = useAuth();
  const navigate = useNavigate();

  // Cargar proyectos del egresado al montar el componente
  useEffect(() => {
    const cargarMisProyectos = async () => {
      if (!user || loading) {
        return;
      }

      try {
        setLoadingProjects(true);
        setError(null);

        // 1. Obtener datos completos del usuario desde el contexto (ya fue cargado en Dashboard)
        const perfilCompleto = getGraduateProfile();

        if (!perfilCompleto) {
          throw new Error('No se pudo obtener el perfil del egresado');
        }
        setMiPerfil(perfilCompleto);

        // 2. Extraer el ID correcto (preferir id_egresado, luego identificacion)
        const idEgresado = perfilCompleto.id_egresado || perfilCompleto.identificacion;
        
        if (!idEgresado) {
          setError('No se pudo identificar al usuario. Por favor, recarga la página.');
          return;
        }

        // 3. Los egresados también usan obtenerMisProyectos (el backend debe manejar ambos roles)
        let misProyectos = await ProjectsService.obtenerMisProyectos(idEgresado);
        
        if (misProyectos.length > 0) {
          console.log('🔍 DEBUG - Primer proyecto completo:', JSON.stringify(misProyectos[0], null, 2));
        }
        
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
  }, [user, loading]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      navigate('/login', { replace: true });
    }
  };

  const handleViewDetails = async (project) => {
    setSelectedProject(project);
    setShowModal(true);
    setEventoInfo(null);
    
    if (project.id_evento) {
      try {
        const todosEventos = await EventosService.obtenerEventos();
        const evento = todosEventos.find(e => e.id_evento === project.id_evento);
        
        if (evento) {
          setEventoInfo(evento);
        }
      } catch (error) {
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProject(null);
    setEventoInfo(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

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
                <Link to="/graduate/proyectos" className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium bg-green-50 text-green-700">
                  <i className="pi pi-briefcase text-base"></i>
                  Mis Proyectos
                </Link>
                <Link to="/graduate/profile" className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                  <i className="pi pi-cog text-base"></i>
                  Configuración
                </Link>
              </nav>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4 mt-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-green-600 font-bold text-2xl">{getInitials()}</span>
                </div>
                <h3 className="font-semibold text-gray-900">{miPerfil?.nombre_completo || getFullName()}</h3>
                <p className="text-sm text-gray-500">Egresado UPC</p>
                {(miPerfil?.anio_graduacion || user?.anio_graduacion) && (
                  <p className="text-xs text-gray-400 mt-1">Promoción {miPerfil?.anio_graduacion || user.anio_graduacion}</p>
                )}
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main className="lg:col-span-3">
            {/* Información del egresado */}
            <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-xl">{getInitials()}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{miPerfil?.nombre_completo || getFullName()}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                    <span className="flex items-center gap-1">
                      <i className="pi pi-graduation-cap"></i>
                      Egresado
                    </span>
                    {(miPerfil?.anio_graduacion || user?.anio_graduacion) && (
                      <span className="flex items-center gap-1">
                        <i className="pi pi-calendar"></i>
                        Promoción {miPerfil?.anio_graduacion || user.anio_graduacion}
                      </span>
                    )}
                  </div>
                </div>
                <div className="hidden sm:block">
                  <span className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                    <i className="pi pi-check-circle"></i>
                    Activo
                  </span>
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-2">Mis Proyectos</h2>
            <p className="text-gray-600 mb-6">
              Gestiona los proyectos que has registrado como egresado. Puedes revisar su estado, 
              editar detalles o postular nuevos proyectos para eventos académicos.
            </p>

            {/* Loading state */}
            {loadingProjects ? (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
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
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="pi pi-folder-open text-4xl text-green-600"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No tienes proyectos registrados</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Como egresado, puedes registrar proyectos para compartir tu experiencia profesional 
                  y participar en eventos académicos.
                </p>
                <Link 
                  to="/graduate/register-project" 
                  className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  <i className="pi pi-plus-circle"></i>
                  Registrar Nuevo Proyecto
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projects.map(proyecto => {
                  const tipoActividad = {
                    1: 'Proyecto (Exposoftware)',
                    2: 'Taller',
                    3: 'Ponencia',
                    4: 'Conferencia'
                  }[proyecto.tipo_actividad] || 'Tipo Desconocido';

                  const fechaSubida = proyecto.fecha_subida 
                    ? new Date(proyecto.fecha_subida).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })
                    : 'Fecha no disponible';

                  const estadoConfig = proyecto.activo 
                    ? { texto: 'Activo', color: 'bg-green-100 text-green-800' }
                    : { texto: 'Inactivo', color: 'bg-gray-100 text-gray-800' };

                  return (
                    <div key={proyecto.id_proyecto} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900 flex-1">{proyecto.titulo_proyecto}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${estadoConfig.color} whitespace-nowrap ml-2`}>
                          {estadoConfig.texto}
                        </span>
                      </div>

                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-2">
                          <i className="pi pi-briefcase text-green-600"></i>
                          <span className="font-medium">{tipoActividad}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <i className="pi pi-calendar text-green-600"></i>
                          <span>{fechaSubida}</span>
                        </div>

                        {proyecto.calificacion && (
                          <div className="flex items-center gap-2">
                            <i className="pi pi-star-fill text-yellow-500"></i>
                            <span className="font-medium">Calificación: {proyecto.calificacion}/5</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                        <button 
                          onClick={() => handleViewDetails(proyecto)}
                          className="flex-1 border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                        >
                          <i className="pi pi-eye"></i> Ver detalles
                        </button>
                        {proyecto.archivo_pdf && (
                          <a 
                            href={proyecto.archivo_pdf}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-green-100 text-green-600 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-green-200 transition-colors"
                          >
                            <i className="pi pi-download"></i>
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Registrar nuevo proyecto card */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center hover:border-green-400 transition-colors">
                  <div className="text-4xl text-gray-400 mb-4">+</div>
                  <h4 className="font-semibold text-gray-900 mb-2">Registrar Nuevo Proyecto</h4>
                  <p className="text-gray-500 text-sm mb-4 text-center">Comparte tu experiencia profesional</p>
                  <Link 
                    to="/graduate/register-project" 
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Registrar
                  </Link>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Modal de Detalles - Igual que el de estudiantes */}
      {showModal && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 overflow-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <h3 className="text-xl font-bold text-gray-900">Detalles del Proyecto</h3>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <i className="pi pi-times text-xl"></i>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Contenido del modal - similar al de estudiantes */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h4 className="text-2xl font-bold text-gray-900 mb-2">{selectedProject.titulo_proyecto}</h4>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <i className="pi pi-briefcase"></i>
                      {
                        {
                          1: 'Proyecto (Exposoftware)',
                          2: 'Taller',
                          3: 'Ponencia',
                          4: 'Conferencia'
                        }[selectedProject.tipo_actividad] || 'Tipo Desconocido'
                      }
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <i className="pi pi-calendar"></i>
                      {selectedProject.fecha_subida 
                        ? new Date(selectedProject.fecha_subida).toLocaleDateString('es-ES')
                        : 'Fecha no disponible'}
                    </span>
                  </div>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${
                  selectedProject.activo ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                }`}>
                  {selectedProject.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              {/* Información adicional del proyecto */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="text-sm font-semibold text-gray-900 mb-3">Información del Proyecto</h5>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">ID del Proyecto</p>
                    <p className="font-medium">{selectedProject.id_proyecto}</p>
                  </div>
                  {selectedProject.codigo_linea && (
                    <div>
                      <p className="text-gray-500">Línea de Investigación</p>
                      <p className="font-medium">{selectedProject.nombre_linea || selectedProject.codigo_linea}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Evento asociado */}
              {selectedProject.id_evento && eventoInfo && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <i className="pi pi-calendar-plus text-green-600"></i>
                    Evento Asociado
                  </h5>
                  <p className="text-sm font-medium">{eventoInfo.nombre_evento}</p>
                  {eventoInfo.descripcion && (
                    <p className="text-xs text-gray-600 mt-1">{eventoInfo.descripcion}</p>
                  )}
                </div>
              )}

              {/* Archivo PDF */}
              {selectedProject.archivo_pdf && (
                <div>
                  <h5 className="text-sm font-semibold text-gray-900 mb-3">Archivos Adjuntos</h5>
                  <a
                    href={selectedProject.archivo_pdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border border-gray-200 rounded-lg p-3 flex items-center gap-3 hover:bg-gray-50"
                  >
                    <div className="w-10 h-10 bg-red-100 rounded flex items-center justify-center">
                      <i className="pi pi-file-pdf text-red-600"></i>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Documento del proyecto</p>
                      <p className="text-xs text-gray-500">PDF</p>
                    </div>
                    <i className="pi pi-download text-green-600"></i>
                  </a>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex justify-end gap-3">
              <button 
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                Cerrar
              </button>
              {selectedProject.archivo_pdf && (
                <a
                  href={selectedProject.archivo_pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <i className="pi pi-download"></i>
                  Descargar PDF
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
