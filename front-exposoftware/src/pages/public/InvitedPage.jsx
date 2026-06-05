import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import ProjectCard from "../../components/ProjectCard";
import ProjectDetailsModal from "../../components/ProjectDetailsModal";
import EventosService from "../../Services/EventosService";
import { useAuth } from "../../contexts/AuthContext";
import { API_BASE_URL } from "../../utils/constants";
import { safeGetItem, safeSetItem } from "../../utils/safeStorage";
import logo from "../../assets/Logo-unicesar.png";

export default function InvitedPage() {
  const { eventoId } = useParams();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [eventoInfo, setEventoInfo] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    try {
      const saved = safeGetItem('invitedPageItemsPerPage');
      return saved ? parseInt(saved) : 150;
    } catch (e) {
      return 150;
    }
  });
  const [rankingProjects, setRankingProjects] = useState([]);
  const [loadingRanking, setLoadingRanking] = useState(false);
  const [rankingDisplayCount, setRankingDisplayCount] = useState(() => {
    try {
      const saved = safeGetItem('invitedPageRankingCount');
      return saved ? Math.max(10, parseInt(saved)) : 10;
    } catch (e) {
      return 10;
    }
  });

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (err) {
      navigate("/");
    }
  };

  // Redirigir a home si el usuario se desautentica
  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Cargar proyectos públicos del evento
  useEffect(() => {
    const cargarProyectosPublicos = async () => {
      try {
        setLoadingProjects(true);
        setError(null);

        // Obtener evento en curso
        let idEvento = eventoId;
        if (!idEvento) {
          const todosEventos = await EventosService.obtenerEventos();
          // Filtrar por eventos que están en curso
          const eventosEnCurso = todosEventos?.filter(e => e.estado === 'en-curso' || e.estado === 'en_curso') || [];
          if (eventosEnCurso && eventosEnCurso.length > 0) {
            idEvento = eventosEnCurso[0].id_evento;
            setEventoInfo(eventosEnCurso[0]);
          } else {
            throw new Error('No hay eventos en curso disponibles');
          }
        }


        const response = await fetch(
          `${API_BASE_URL}/api/v1/eventos/${idEvento}/proyectos`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            },
            credentials: 'include'
          }
        );

        if (response.ok) {
          const data = await response.json();
          const proyectos = data.data || [];
          setProjects(proyectos);

          // Si no tenemos evento info, usar la del primer proyecto
          if (!eventoInfo && proyectos.length > 0) {
            setEventoInfo({
              id_evento: proyectos[0].id_evento,
              nombre_evento: proyectos[0].nombre_evento
            });
          }
        } else {
          throw new Error('Error al obtener proyectos públicos');
        }
      } catch (err) {
        if (err.message.includes('No hay eventos en curso')) {
          setError('No hay eventos en curso disponibles en este momento');
        } else {
          setError(err.message || 'Error al cargar los proyectos');
        }
      } finally {
        setLoadingProjects(false);
      }
    };

    cargarProyectosPublicos();
  }, [eventoId]);

  // Cargar ranking de proyectos (todos sin límite)
  useEffect(() => {
    const cargarRanking = async () => {
      try {
        setLoadingRanking(true);

        // Obtener id_evento
        let idEvento = eventoId;
        if (!idEvento && eventoInfo?.id_evento) {
          idEvento = eventoInfo.id_evento;
        }

        if (!idEvento) return;

        // Traer todos los rankings sin límite
        // El backend tiene máximo 50, así que hacemos paginación si es necesario
        let allRanking = [];
        let offset = 0;
        const limit = 50;
        let hasMore = true;

        while (hasMore) {
          const response = await fetch(
            `${API_BASE_URL}/api/v1/proyectos/ranking/evento/${idEvento}?limit=${limit}&offset=${offset}`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );

          if (response.ok) {
            const data = await response.json();
            const ranking = data.data || [];

            if (ranking.length === 0) {
              hasMore = false;
            } else {
              allRanking = [...allRanking, ...ranking];
              offset += limit;

              // Si devolvió menos de lo que pedimos, ya no hay más
              if (ranking.length < limit) {
                hasMore = false;
              }
            }
          } else {
            hasMore = false;
          }
        }

        setRankingProjects(allRanking);
      } catch (err) {
        console.error('Error cargando ranking:', err);
      } finally {
        setLoadingRanking(false);
      }
    };

    if (eventoId || eventoInfo?.id_evento) {
      cargarRanking();
    }
  }, [eventoId, eventoInfo?.id_evento]);

  const handleViewDetails = async (project) => {
    setShowModal(true);
    let projectEnriched = { ...project };
    setSelectedProject(projectEnriched);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProject(null);
  };

  // Filtrar proyectos por búsqueda
  const filteredProjects = projects.filter(project =>
    project.titulo_proyecto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.nombre_materia?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.nombre_grupo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Resetear a página 1 cuando cambia la búsqueda
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Guardar preferencia de items por página
  const handleItemsPerPageChange = (value) => {
    const newValue = parseInt(value);
    setItemsPerPage(newValue);
    try {
      safeSetItem('invitedPageItemsPerPage', newValue.toString());
    } catch (e) {
      // Ignorar si no se puede guardar
    }
    setCurrentPage(1);
  };

  // Manejar cambio de cantidad de proyectos en el ranking
  const handleRankingDisplayCountChange = (value) => {
    const newValue = Math.max(10, parseInt(value));
    setRankingDisplayCount(newValue);
    try {
      safeSetItem('invitedPageRankingCount', newValue.toString());
    } catch (e) {
      // Ignorar si no se puede guardar
    }
  };

  // Calcular proyectos paginados
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProjects = filteredProjects.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen bg-gray-50" translate="no">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <img src={logo} alt="Logo" className="w-8 sm:w-10" />
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-gray-900">Expo-software</h1>
                <p className="text-xs text-gray-500">UPC - Invitado</p>
              </div>
              <div className="sm:hidden">
                <h1 className="text-sm font-bold">Expo-software</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {user ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  <i className="pi pi-sign-out"></i>
                  <span className="hidden sm:inline">Salir</span>
                </button>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
                >
                  <i className="pi pi-sign-in"></i>
                  <span className="hidden sm:inline">Ingresar</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            {/* Card de Evento */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <i className="pi pi-calendar text-emerald-600"></i>
                Evento
              </h3>
              {eventoInfo ? (
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-2">
                    {eventoInfo.nombre_evento}
                  </p>
                  <p className="text-xs text-gray-500">
                    {projects.length} proyecto{projects.length !== 1 ? 's' : ''} publicado{projects.length !== 1 ? 's' : ''}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Cargando evento...</p>
              )}
            </div>

            {/* Card de Información */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 bg-emerald-100">
                <i className="pi pi-eye text-emerald-600 text-2xl"></i>
              </div>
              <h3 className="font-semibold text-center text-gray-900 mb-1">Invitado</h3>
              <p className="text-sm text-center text-gray-500">Acceso público a proyectos</p>
            </div>

            {/* Ranking Completo */}
            {rankingProjects.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <i className="pi pi-list text-yellow-500"></i>
                  Ranking Completo
                </h3>

                {/* Selector de cantidad */}
                <div className="mb-4">
                  <label className="text-xs text-gray-600 block mb-2">Mostrar:</label>
                  <select
                    value={rankingDisplayCount}
                    onChange={(e) => handleRankingDisplayCountChange(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    {[10, 15, 20, 25, 30, 50, 75, 100, 150].map(num => (
                      <option key={num} value={num}>
                        {num} proyectos
                      </option>
                    ))}
                  </select>
                </div>

                {/* Lista de proyectos */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {rankingProjects.slice(0, rankingDisplayCount).map((rankingProject, idx) => (
                    <div
                      key={rankingProject.id_proyecto}
                      className="p-2 bg-yellow-50 rounded-lg border border-yellow-100 hover:bg-yellow-100 transition-colors cursor-pointer text-sm"
                      onClick={() => {
                        const fullProject = projects.find(p => p.id_proyecto === rankingProject.id_proyecto) || rankingProject;
                        handleViewDetails(fullProject);
                      }}
                    >
                      <div className="flex items-start gap-2">
                        <span className="font-bold text-yellow-600 text-xs w-6 flex-shrink-0">
                          {rankingProject.posicion === 1 ? '🥇' : rankingProject.posicion === 2 ? '🥈' : rankingProject.posicion === 3 ? '🥉' : `${rankingProject.posicion}.`}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 line-clamp-2 text-xs">
                            {rankingProject.titulo_proyecto}
                          </p>
                          {rankingProject.promedio && (
                            <p className="text-xs text-gray-600 mt-1">
                              ⭐ {rankingProject.promedio.toFixed(2)}/5.0
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">
            {/* Título y Descripción */}
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Proyectos Públicos
              </h2>
              <p className="text-gray-600">
                Explora los proyectos presentados en este evento
              </p>
            </div>

            {/* Sección de Ranking */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <i className="pi pi-star-fill text-yellow-500 text-2xl"></i>
                <h3 className="text-xl font-bold text-gray-900">🏆 Top Proyectos</h3>
                <span className="text-sm text-gray-500">(Más votados)</span>
              </div>

              {loadingRanking ? (
                <div className="flex justify-center items-center py-8">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-yellow-200 border-t-yellow-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 text-sm">Cargando ranking...</p>
                  </div>
                </div>
              ) : rankingProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
                  {rankingProjects.slice(0, 5).map((rankingProject) => {
                    // Buscar el proyecto completo para mostrar toda la información
                    const fullProject = projects.find(p => p.id_proyecto === rankingProject.id_proyecto) || rankingProject;
                    return (
                    <div
                      key={rankingProject.id_proyecto}
                      className="relative bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg border-2 border-yellow-200 p-4 hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => handleViewDetails(fullProject)}
                    >
                      {/* Medal Badge */}
                      <div className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                        {rankingProject.posicion === 1 ? '🥇' : rankingProject.posicion === 2 ? '🥈' : rankingProject.posicion === 3 ? '🥉' : rankingProject.posicion}
                      </div>

                      {/* Título */}
                      <h4 className="font-semibold text-gray-900 text-sm mb-2 pr-6 line-clamp-2">
                        {rankingProject.titulo_proyecto}
                      </h4>

                      {/* Rating/Votos */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <i
                              key={i}
                              className={`pi text-xs ${
                                i < Math.round(rankingProject.promedio_ponderado || 0)
                                  ? 'pi-star-fill text-yellow-400'
                                  : 'pi-star text-gray-300'
                              }`}
                            ></i>
                          ))}
                        </div>
                        <span className="text-xs text-gray-600">
                          {(rankingProject.promedio_ponderado || 0).toFixed(1)}/5
                        </span>
                      </div>

                      {/* Calificaciones */}
                      <div className="text-xs text-gray-500">
                        <span className="font-medium">{rankingProject.total_calificaciones || 0}</span> calificaciones
                      </div>

                      {/* Detalles */}
                      <div className="mt-3 pt-3 border-t border-yellow-200">
                        <p className="text-xs text-gray-600 mb-1">
                          <i className="pi pi-star text-yellow-500 text-xs mr-1"></i>
                          <span className="font-medium">Top #{rankingProject.posicion}</span>
                        </p>
                        <p className="text-xs text-gray-500">
                          <i className="pi pi-chart-bar text-blue-600 text-xs mr-1"></i>
                          {rankingProject.promedio_ponderado?.toFixed(2) || 0}/5 rating
                        </p>
                      </div>
                    </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg border-2 border-yellow-200 p-12 text-center">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <i className="pi pi-star text-3xl text-yellow-400"></i>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Aún sin votos</h4>
                  <p className="text-gray-600 text-sm">
                    Los proyectos aparecerán aquí una vez que reciban votos populares
                  </p>
                </div>
              )}
            </div>

            {/* Barra de búsqueda y filtros */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <i className="pi pi-search text-gray-400"></i>
                <input
                  type="text"
                  placeholder="Buscar por título, materia o grupo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 outline-none text-sm bg-transparent"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <i className="pi pi-times"></i>
                  </button>
                )}
              </div>

              {/* Selector de items por página */}
              <div className="flex items-center gap-2 text-sm">
                <label htmlFor="itemsPerPage" className="text-gray-700 font-medium">
                  Proyectos por página:
                </label>
                <select
                  id="itemsPerPage"
                  value={itemsPerPage}
                  onChange={(e) => handleItemsPerPageChange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 text-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                >
                  <option value="21">21</option>
                  <option value="24">24</option>
                  <option value="30">30</option>
                  <option value="36">36</option>
                  <option value="48">48</option>
                  <option value="60">60</option>
                  <option value="120">120</option>
                  <option value="150">150</option>
                </select>
              </div>
            </div>

            {/* Mensaje de carga */}
            {loadingProjects && (
              <div className="flex justify-center items-center py-12">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Cargando proyectos...</p>
                </div>
              </div>
            )}

            {/* Mensaje de error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-800 flex items-center gap-2">
                  <i className="pi pi-exclamation-circle"></i>
                  {error}
                </p>
              </div>
            )}

            {/* Proyectos */}
            {!loadingProjects && filteredProjects.length > 0 && (
              <>
                <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg border border-emerald-200 p-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">
                      Mostrando <span className="font-semibold">{startIndex + 1}-{Math.min(endIndex, filteredProjects.length)}</span> de{" "}
                      <span className="font-semibold">{filteredProjects.length}</span> proyectos
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                  {paginatedProjects.map((project) => (
                    <ProjectCard
                      key={project.id_proyecto}
                      proyecto={project}
                      onViewDetails={handleViewDetails}
                    />
                  ))}
                </div>

                {/* Controles de Paginación */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <i className="pi pi-chevron-left"></i> Anterior
                    </button>

                    <div className="flex gap-1">
                      {Array.from({ length: totalPages }, (_, i) => {
                        const pageNum = i + 1;
                        // Mostrar páginas cercanas a la actual
                        if (
                          pageNum === 1 ||
                          pageNum === totalPages ||
                          (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                currentPage === pageNum
                                  ? "bg-emerald-600 text-white"
                                  : "border border-gray-300 text-gray-700 hover:bg-gray-100"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                          return (
                            <span key={pageNum} className="px-2 py-2 text-gray-500">
                              ...
                            </span>
                          );
                        }
                        return null;
                      })}
                    </div>

                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Siguiente <i className="pi pi-chevron-right"></i>
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Sin proyectos */}
            {!loadingProjects && filteredProjects.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <i className="pi pi-inbox text-5xl text-gray-300 mb-4 block"></i>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {projects.length === 0 ? "No hay proyectos disponibles" : "No se encontraron proyectos"}
                </h3>
                <p className="text-gray-600">
                  {projects.length === 0
                    ? "Aún no hay proyectos publicados en este evento."
                    : "Intenta con otros términos de búsqueda."}
                </p>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Modal de detalles */}
      <ProjectDetailsModal
        selectedProject={selectedProject}
        eventoInfo={eventoInfo}
        user={null}
        onClose={closeModal}
        onDownloadCertificado={null}
        onDownloadTodosCertificados={null}
        token={null}
      />
    </div>
  );
}
