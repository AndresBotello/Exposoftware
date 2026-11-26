import { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  LogOut,
  LogIn,
  CalendarDays,
  Eye,
  Search,
  X,
  Info,
  Inbox,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Gavel,
  Users,
  BarChart3,
} from "lucide-react";
import TableroTop5 from "../../components/Ranking/TableroTop5";
import { useRankingEventos } from "../../hooks/useRankingEventos";
import { INTERVALO_TABLEROS_MS } from "../../hooks/useTablerosEvento";
import ProjectCard from "../../components/ProjectCard";
import ProjectDetailsModal from "../../components/ProjectDetailsModal";
import { useAuth } from "../../contexts/AuthContext";
import { API_BASE_URL } from "../../utils/constants";
import { safeGetItem, safeSetItem } from "../../utils/safeStorage";
import logo from "../../assets/Logo-unicesar.png";
import { confirmarCierreSesion } from "../../utils/confirmDialog.jsx";

const OPCIONES_POR_PAGINA = [21, 24, 30, 36, 48, 60, 120, 150];

const formatoNota = (valor) => (Number(valor) || 0).toFixed(2);

export default function InvitedPage() {
  const { eventoId } = useParams();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const [eventos, setEventos] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    const saved = parseInt(safeGetItem("invitedPageItemsPerPage"), 10);
    return OPCIONES_POR_PAGINA.includes(saved) ? saved : 150;
  });

  // Ranking en vivo de todos los eventos activos (tableros y puntaje por proyecto).
  const idsEventos = useMemo(() => eventos.map((e) => e.id_evento), [eventos]);
  const { datos: rankingPorEvento, cargando: cargandoRanking, error: errorRanking } =
    useRankingEventos(idsEventos);

  // Puntaje de cada proyecto, indexado por id_proyecto.
  const puntajePorProyecto = useMemo(() => {
    const mapa = {};
    Object.values(rankingPorEvento).forEach((evento) => {
      Object.assign(mapa, evento.proyectos);
    });
    return mapa;
  }, [rankingPorEvento]);

  // Redirigir a home si el usuario se desautentica
  useEffect(() => {
    if (!user) navigate("/");
  }, [user, navigate]);

  // Cargar los proyectos visibles de todos los eventos en curso.
  useEffect(() => {
    const cargarEventosActivos = async () => {
      setLoadingProjects(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/eventos/en-curso/proyectos`, {
          method: "GET",
          credentials: "include",
        });
        if (!response.ok) throw new Error("No se pudieron cargar los proyectos.");

        const body = await response.json();
        let activos = body.data?.eventos_en_curso || [];
        let proyectos = body.data?.proyectos || [];

        if (eventoId) {
          activos = activos.filter((e) => e.id_evento === eventoId);
          proyectos = proyectos.filter((p) => p.id_evento === eventoId);
        }

        if (activos.length === 0) {
          setError("Por el momento no hay eventos en curso. Vuelve más tarde para ver los proyectos de la próxima jornada.");
        }
        setEventos(activos);
        setProjects(proyectos);
      } catch (err) {
        setError(err.message || "Error al cargar los proyectos");
      } finally {
        setLoadingProjects(false);
      }
    };

    cargarEventosActivos();
  }, [eventoId]);

  const handleViewDetails = (project) => {
    setSelectedProject({ ...project });
  };

  const seleccionarProyecto = (proyectoRanking) => {
    const proyectoCompleto = projects.find((p) => p.id_proyecto === proyectoRanking.id_proyecto) || proyectoRanking;
    handleViewDetails(proyectoCompleto);
  };

  const closeModal = () => setSelectedProject(null);

  const handleLogout = async () => {
    if (!(await confirmarCierreSesion())) return;
    try {
      await logout();
    } finally {
      navigate("/");
    }
  };

  const handleItemsPerPageChange = (value) => {
    const numero = parseInt(value, 10);
    setItemsPerPage(numero);
    setCurrentPage(1);
    safeSetItem("invitedPageItemsPerPage", String(numero));
  };

  const filteredProjects = projects.filter((project) => {
    const termino = searchTerm.toLowerCase();
    return (
      project.titulo_proyecto?.toLowerCase().includes(termino) ||
      project.nombre_materia?.toLowerCase().includes(termino) ||
      project.nombre_grupo?.toLowerCase().includes(termino)
    );
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProjects = filteredProjects.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen bg-gray-50" translate="no">
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex flex-shrink-0 items-center gap-3">
              <img src={logo} alt="Logo" className="w-8 sm:w-10" />
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold text-gray-900">Expo-software</h1>
                <p className="text-xs text-gray-500">UPC · Invitado</p>
              </div>
              <h1 className="text-sm font-semibold sm:hidden">Expo-software</h1>
            </div>
            {user ? (
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Cerrar sesión</span>
              </button>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-800"
              >
                <LogIn className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Ingresar</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          <aside className="space-y-4 lg:col-span-1">
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
                <CalendarDays className="h-4 w-4 text-emerald-700" aria-hidden="true" />
                Eventos en curso
              </h3>
              {eventos.length > 0 ? (
                <ul className="space-y-3">
                  {eventos.map((evento) => (
                    <li key={evento.id_evento}>
                      <p className="text-sm font-medium text-gray-900">{evento.nombre_evento}</p>
                      <p className="text-xs text-gray-500">
                        {projects.filter((p) => p.id_evento === evento.id_evento).length} proyectos publicados
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">
                  {loadingProjects ? "Cargando eventos..." : "No hay eventos disponibles"}
                </p>
              )}
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-emerald-50">
                <Eye className="h-5 w-5 text-emerald-700" aria-hidden="true" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">Acceso de invitado</h3>
              <p className="mt-1 text-sm text-gray-500">
                Puedes ver los proyectos y las calificaciones en vivo de los eventos en curso.
              </p>
            </div>
          </aside>

          <main className="lg:col-span-3">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Proyectos públicos</h2>
              <p className="mt-1 text-gray-600">Explora los proyectos de los eventos en curso.</p>
            </div>

            {/* Ranking en vivo */}
            {eventos.length > 0 && (
              <section className="mb-8">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-lg font-semibold text-gray-900">Ranking del evento</h3>
                  <span className="flex items-center gap-1.5 text-xs text-gray-500">
                    <RefreshCw
                      className={`h-3.5 w-3.5 ${cargandoRanking ? "animate-spin" : ""}`}
                      aria-hidden="true"
                    />
                    Se actualiza cada {INTERVALO_TABLEROS_MS / 1000} segundos
                  </span>
                </div>

                {errorRanking && (
                  <p className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                    No se pudo actualizar el ranking. Se mostrará el último resultado disponible.
                  </p>
                )}

                <div className="space-y-6">
                  {eventos.map((evento) => {
                    const tableros = rankingPorEvento[evento.id_evento]?.tableros;
                    return (
                      <div key={evento.id_evento}>
                        <p className="mb-3 text-sm font-medium text-gray-700">{evento.nombre_evento}</p>
                        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                          <TableroTop5
                            titulo="Solo jurado"
                            descripcion="Promedio de los docentes jurado. Mínimo 2 votos de jurado."
                            items={tableros?.solo_jurado || []}
                            campoPuntaje="puntaje_solo_jurado"
                            campoVotos="votos_jurado_docente"
                            etiquetaVotos="votos de jurado"
                            cargando={cargandoRanking && !tableros}
                            onSeleccionar={seleccionarProyecto}
                          />
                          <TableroTop5
                            titulo="Jurado y voto popular"
                            descripcion="80 % jurado y 20 % voto popular. Mínimo 6 calificaciones."
                            items={tableros?.jurado_y_publico || []}
                            campoPuntaje="puntaje_jurado_publico"
                            campoVotos="total_calificaciones"
                            etiquetaVotos="calificaciones"
                            cargando={cargandoRanking && !tableros}
                            onSeleccionar={seleccionarProyecto}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Búsqueda y tamaño de página */}
            <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4">
              <div className="mb-4 flex items-center gap-3">
                <Search className="h-4 w-4 flex-shrink-0 text-gray-400" aria-hidden="true" />
                <input
                  type="text"
                  placeholder="Buscar por título, materia o grupo"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 bg-transparent text-sm outline-none"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="text-gray-400 transition-colors hover:text-gray-600"
                    aria-label="Limpiar búsqueda"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <label htmlFor="itemsPerPage" className="font-medium text-gray-700">
                  Proyectos por página
                </label>
                <select
                  id="itemsPerPage"
                  value={itemsPerPage}
                  onChange={(e) => handleItemsPerPageChange(e.target.value)}
                  className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  {OPCIONES_POR_PAGINA.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            </div>

            {loadingProjects && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600"></div>
                  <p className="text-gray-600">Cargando proyectos...</p>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-6 flex items-start gap-3 rounded-md border border-blue-200 bg-blue-50 p-4">
                <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-700" aria-hidden="true" />
                <p className="text-sm text-blue-800">{error}</p>
              </div>
            )}

            {!loadingProjects && filteredProjects.length > 0 && (
              <>
                <p className="mb-4 text-sm text-gray-600">
                  Mostrando <span className="font-medium text-gray-900">{startIndex + 1}–{Math.min(endIndex, filteredProjects.length)}</span> de{" "}
                  <span className="font-medium text-gray-900">{filteredProjects.length}</span> proyectos
                </p>

                <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {paginatedProjects.map((project) => {
                    const puntaje = puntajePorProyecto[project.id_proyecto];
                    return (
                      <div key={project.id_proyecto} className="flex flex-col">
                        <ProjectCard proyecto={project} onViewDetails={handleViewDetails} />
                        <div className="-mt-1 rounded-b-lg border border-t-0 border-gray-200 bg-white px-4 py-3">
                          {puntaje ? (
                            <dl className="grid grid-cols-3 gap-2 text-xs">
                              <div>
                                <dt className="flex items-center gap-1 text-gray-500">
                                  <Gavel className="h-3 w-3" aria-hidden="true" />
                                  Jurado
                                </dt>
                                <dd className="mt-0.5 font-semibold tabular-nums text-gray-900">
                                  {puntaje.promedio_jurado_docente != null ? formatoNota(puntaje.promedio_jurado_docente) : "—"}
                                </dd>
                              </div>
                              <div>
                                <dt className="flex items-center gap-1 text-gray-500">
                                  <Users className="h-3 w-3" aria-hidden="true" />
                                  Popular
                                </dt>
                                <dd className="mt-0.5 font-semibold tabular-nums text-gray-900">
                                  {puntaje.promedio_publico_general != null ? formatoNota(puntaje.promedio_publico_general) : "—"}
                                </dd>
                              </div>
                              <div>
                                <dt className="flex items-center gap-1 text-gray-500">
                                  <BarChart3 className="h-3 w-3" aria-hidden="true" />
                                  Puntaje
                                </dt>
                                <dd className="mt-0.5 font-semibold tabular-nums text-emerald-700">
                                  {formatoNota(puntaje.puntaje_jurado_publico)}
                                </dd>
                              </div>
                            </dl>
                          ) : (
                            <p className="text-xs text-gray-500">Sin calificaciones todavía</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="flex items-center gap-1 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                      Anterior
                    </button>

                    <div className="flex gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((n) => n === 1 || n === totalPages || Math.abs(n - currentPage) <= 1)
                        .map((n, idx, lista) => (
                          <span key={n} className="flex items-center">
                            {idx > 0 && n - lista[idx - 1] > 1 && <span className="px-2 text-gray-500">…</span>}
                            <button
                              type="button"
                              onClick={() => setCurrentPage(n)}
                              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                                currentPage === n
                                  ? "bg-emerald-700 text-white"
                                  : "border border-gray-300 text-gray-700 hover:bg-gray-100"
                              }`}
                            >
                              {n}
                            </button>
                          </span>
                        ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-1 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Siguiente
                      <ChevronRight className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                )}
              </>
            )}

            {!loadingProjects && filteredProjects.length === 0 && (
              <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
                <Inbox className="mx-auto mb-4 h-12 w-12 text-gray-300" aria-hidden="true" />
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  {projects.length === 0 ? "No hay proyectos disponibles" : "No se encontraron proyectos"}
                </h3>
                <p className="text-gray-600">
                  {projects.length === 0
                    ? "Aún no hay proyectos publicados en los eventos en curso."
                    : "Intenta con otros términos de búsqueda."}
                </p>
              </div>
            )}
          </main>
        </div>
      </div>

      <ProjectDetailsModal
        selectedProject={selectedProject}
        eventoInfo={eventos.find((e) => e.id_evento === selectedProject?.id_evento) || null}
        user={null}
        onClose={closeModal}
        onDownloadCertificado={null}
        onDownloadTodosCertificados={null}
        token={null}
      />
    </div>
  );
}
