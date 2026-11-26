import { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  LogOut,
  LogIn,
  CalendarDays,
  FolderOpen,
  Trophy,
  Search,
  X,
  Info,
  Inbox,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import TableroTop5 from "../../components/Ranking/TableroTop5";
import ProyectoPublicoCard from "../../components/Public/ProyectoPublicoCard";
import ProjectDetailsModal from "../../components/ProjectDetailsModal";
import { useRankingEventos } from "../../hooks/useRankingEventos";
import {
  obtenerProyectosPublicos,
  obtenerResumenPublico,
  obtenerEventosActivosPublicos,
  obtenerEstadoPublico,
} from "../../Services/PublicProjectsService";

// Cada cuánto se consulta si cambió algo (la consulta es muy liviana).
const INTERVALO_ESTADO_MS = 15000;
import { useAuth } from "../../contexts/AuthContext";
import logo from "../../assets/Logo-unicesar.png";
import { confirmarCierreSesion } from "../../utils/confirmDialog.jsx";
import { safeGetItem, safeSetItem } from "../../utils/safeStorage";

const TAMANOS_PAGINA = [12, 24, 36, 48];
const TAMANO_PAGINA_DEFECTO = 24;

function Estadistica({ icono, etiqueta, valor }) {
  const Icono = icono;
  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-green-50">
        <Icono className="h-5 w-5 text-green-700" aria-hidden="true" />
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{etiqueta}</p>
        <p className="text-2xl font-semibold tabular-nums text-gray-900">{valor}</p>
      </div>
    </div>
  );
}

export default function InvitedPage() {
  const { eventoId } = useParams();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const [eventos, setEventos] = useState([]);
  const [eventoFiltro, setEventoFiltro] = useState(eventoId || "");
  const [resumen, setResumen] = useState(null);

  const [proyectos, setProyectos] = useState([]);
  const [total, setTotal] = useState(0);
  const [paginas, setPaginas] = useState(1);
  const [pagina, setPagina] = useState(1);
  const [pageSize, setPageSize] = useState(() => {
    const guardado = parseInt(safeGetItem("invitedPageSize"), 10);
    return TAMANOS_PAGINA.includes(guardado) ? guardado : TAMANO_PAGINA_DEFECTO;
  });
  const [busqueda, setBusqueda] = useState("");
  const [consulta, setConsulta] = useState("");

  const [cargandoProyectos, setCargandoProyectos] = useState(true);
  const [cargandoInicial, setCargandoInicial] = useState(true);
  const [error, setError] = useState(null);
  const [proyectoAbierto, setProyectoAbierto] = useState(null);
  // Versiones que informa el servidor. Solo cambian cuando hay algo nuevo.
  const [estado, setEstado] = useState(null);
  const versionProyectos = estado?.proyectos;
  const versionRanking = estado?.ranking;

  // Ranking de los eventos activos: se vuelve a pedir solo si cambió la versión de votos.
  const idsEventos = useMemo(() => eventos.map((e) => e.id_evento), [eventos]);
  const { datos: rankingPorEvento, cargando: cargandoRanking, error: errorRanking } =
    useRankingEventos(idsEventos, versionRanking);

  const puntajePorProyecto = useMemo(() => {
    const mapa = {};
    Object.values(rankingPorEvento).forEach((evento) => Object.assign(mapa, evento.proyectos));
    return mapa;
  }, [rankingPorEvento]);

  // Proyectos con al menos una calificación en los eventos activos.
  const conCalificaciones = useMemo(
    () => Object.values(puntajePorProyecto).filter((p) => (p.total_calificaciones || 0) > 0).length,
    [puntajePorProyecto]
  );

  const tablerosEventos = useMemo(
    () => eventos.map((evento) => ({ evento, tableros: rankingPorEvento[evento.id_evento]?.tableros })),
    [eventos, rankingPorEvento]
  );

  // Redirigir a home si el usuario se desautentica
  useEffect(() => {
    if (!user) navigate("/");
  }, [user, navigate]);

  // Carga inicial: eventos activos y resumen.
  useEffect(() => {
    const cargarInicial = async () => {
      try {
        const [activos, resumenDatos] = await Promise.all([
          obtenerEventosActivosPublicos(),
          obtenerResumenPublico(),
        ]);
        const lista = Array.isArray(activos) ? activos : [];
        setEventos(eventoId ? lista.filter((e) => e.id_evento === eventoId) : lista);
        setResumen(resumenDatos);
        if (lista.length === 0) {
          setError("Por el momento no hay eventos en curso. Vuelve más tarde para ver los proyectos de la próxima jornada.");
        }
      } catch (err) {
        setError("No se pudo cargar la información de los eventos.");
        console.error(err);
      } finally {
        setCargandoInicial(false);
      }
    };
    cargarInicial();
  }, [eventoId]);

  // Consulta liviana de versiones. Solo corre con la pestaña visible y no
  // vuelve a renderizar si nada cambió.
  useEffect(() => {
    let temporizador = null;
    let activo = true;

    const programar = (ms) => {
      clearTimeout(temporizador);
      temporizador = setTimeout(revisar, ms);
    };

    const revisar = async () => {
      if (document.visibilityState === "visible") {
        try {
          const nuevo = await obtenerEstadoPublico();
          if (!activo) return;
          setEstado((previo) =>
            previo && previo.proyectos === nuevo.proyectos && previo.ranking === nuevo.ranking
              ? previo
              : nuevo
          );
        } catch (err) {
          console.error("No se pudo consultar el estado:", err);
        }
      }
      if (activo) programar(INTERVALO_ESTADO_MS);
    };

    const alVolverAVisible = () => {
      if (document.visibilityState === "visible") programar(0);
    };

    programar(0);
    document.addEventListener("visibilitychange", alVolverAVisible);
    return () => {
      activo = false;
      clearTimeout(temporizador);
      document.removeEventListener("visibilitychange", alVolverAVisible);
    };
  }, []);

  // Resumen: se vuelve a pedir solo cuando cambian los proyectos.
  useEffect(() => {
    if (versionProyectos == null) return;
    obtenerResumenPublico().then(setResumen).catch((err) => console.error(err));
  }, [versionProyectos]);

  // Búsqueda con retardo para no pedir una página por cada tecla.
  useEffect(() => {
    const temporizador = setTimeout(() => {
      setConsulta(busqueda.trim());
      setPagina(1);
    }, 350);
    return () => clearTimeout(temporizador);
  }, [busqueda]);

  // Página de proyectos aprobados. Sale de la caché local salvo que cambie la versión.
  useEffect(() => {
    if (versionProyectos == null) return undefined;
    let cancelado = false;
    const cargarProyectos = async () => {
      setCargandoProyectos(true);
      try {
        const datos = await obtenerProyectosPublicos({
          page: pagina,
          pageSize,
          q: consulta,
          idEvento: eventoFiltro || null,
          version: versionProyectos,
        });
        if (cancelado) return;
        setProyectos(datos.items || []);
        setTotal(datos.total || 0);
        setPaginas(datos.pages || 1);
      } catch (err) {
        if (cancelado) return;
        console.error(err);
        setError("No se pudo cargar los proyectos. Intenta de nuevo.");
      } finally {
        if (!cancelado) setCargandoProyectos(false);
      }
    };
    cargarProyectos();
    return () => {
      cancelado = true;
    };
  }, [pagina, pageSize, consulta, eventoFiltro, versionProyectos]);

  const seleccionarProyecto = (proyecto) => setProyectoAbierto({ ...proyecto });

  const handleLogout = async () => {
    if (!(await confirmarCierreSesion())) return;
    try {
      await logout();
    } finally {
      navigate("/");
    }
  };

  const cambiarTamano = (valor) => {
    const numero = parseInt(valor, 10);
    setPageSize(numero);
    setPagina(1);
    safeSetItem("invitedPageSize", String(numero));
  };

  const desde = total === 0 ? 0 : (pagina - 1) * pageSize + 1;
  const hasta = Math.min(pagina * pageSize, total);

  return (
    <div className="min-h-screen bg-gray-50" translate="no">
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Logo Unicesar" className="h-auto w-9 sm:w-10" />
              <div>
                <h1 className="text-base font-bold text-gray-900 sm:text-lg">Expo-software</h1>
                <p className="hidden text-xs text-gray-500 sm:block">Universidad Popular del Cesar</p>
              </div>
            </div>
            {user ? (
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Cerrar sesión</span>
              </button>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
              >
                <LogIn className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Ingresar</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <section>
          <h2 className="text-2xl font-semibold text-gray-900">Proyectos aprobados</h2>
          <p className="mt-1 text-sm text-gray-600">
            Explora los proyectos aprobados de los eventos en curso y sigue sus calificaciones en vivo.
          </p>
        </section>

        {/* Resumen */}
        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Estadistica icono={FolderOpen} etiqueta="Aprobados" valor={resumen?.proyectos_aprobados ?? "—"} />
          <Estadistica icono={CalendarDays} etiqueta="Eventos en curso" valor={resumen?.eventos_activos ?? "—"} />
          <Estadistica icono={Trophy} etiqueta="Con calificaciones" valor={eventos.length ? conCalificaciones : "—"} />
          <Estadistica icono={Inbox} etiqueta="En esta vista" valor={cargandoProyectos ? "—" : total} />
        </section>

        {error && (
          <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-700" aria-hidden="true" />
            <p className="text-sm text-blue-800">{error}</p>
          </div>
        )}

        {/* Ranking en vivo */}
        {eventos.length > 0 && (
          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-lg font-semibold text-gray-900">Ranking en vivo</h3>
              <span className="flex items-center gap-1.5 text-xs text-gray-500">
                <RefreshCw className={`h-3.5 w-3.5 ${cargandoRanking ? "animate-spin" : ""}`} aria-hidden="true" />
                Se actualiza al registrarse una calificación
              </span>
            </div>
            {errorRanking && (
              <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                No se pudo actualizar el ranking. Se muestra el último resultado disponible.
              </p>
            )}
            {tablerosEventos.map(({ evento, tableros }) => (
              <div key={evento.id_evento} className="space-y-3">
                <p className="text-sm font-medium text-gray-700">{evento.nombre_evento}</p>
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
            ))}
          </section>
        )}

        {/* Filtros */}
        <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
              <input
                type="text"
                placeholder="Buscar por título"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                maxLength={100}
                className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
              />
              {busqueda && (
                <button
                  type="button"
                  onClick={() => setBusqueda("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Limpiar búsqueda"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </div>
            {eventos.length > 1 && (
              <select
                value={eventoFiltro}
                onChange={(e) => {
                  setEventoFiltro(e.target.value);
                  setPagina(1);
                }}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-600"
                aria-label="Filtrar por evento"
              >
                <option value="">Todos los eventos</option>
                {eventos.map((evento) => (
                  <option key={evento.id_evento} value={evento.id_evento}>
                    {evento.nombre_evento}
                  </option>
                ))}
              </select>
            )}
            <select
              value={pageSize}
              onChange={(e) => cambiarTamano(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-600"
              aria-label="Proyectos por página"
            >
              {TAMANOS_PAGINA.map((n) => (
                <option key={n} value={n}>
                  {n} por página
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* Proyectos */}
        {cargandoInicial || cargandoProyectos ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-green-200 border-t-green-600" aria-label="Cargando" />
          </div>
        ) : proyectos.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
            <Inbox className="mx-auto mb-4 h-12 w-12 text-gray-300" aria-hidden="true" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              {consulta ? "No se encontraron proyectos" : "No hay proyectos aprobados"}
            </h3>
            <p className="text-sm text-gray-600">
              {consulta ? "Intenta con otros términos de búsqueda." : "Aún no hay proyectos aprobados en los eventos en curso."}
            </p>
          </div>
        ) : (
          <section className="space-y-6">
            <p className="text-sm text-gray-600">
              Mostrando <span className="font-medium text-gray-900">{desde}–{hasta}</span> de{" "}
              <span className="font-medium text-gray-900">{total}</span> proyectos
            </p>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {proyectos.map((proyecto) => (
                <ProyectoPublicoCard
                  key={proyecto.id_proyecto}
                  proyecto={proyecto}
                  puntaje={puntajePorProyecto[proyecto.id_proyecto]}
                  onAbrir={seleccionarProyecto}
                />
              ))}
            </div>

            {paginas > 1 && (
              <nav className="flex items-center justify-center gap-3" aria-label="Paginación">
                <button
                  type="button"
                  onClick={() => setPagina((p) => Math.max(1, p - 1))}
                  disabled={pagina === 1}
                  className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                  Anterior
                </button>
                <span className="text-sm text-gray-600">
                  Página <span className="font-medium text-gray-900">{pagina}</span> de {paginas}
                </span>
                <button
                  type="button"
                  onClick={() => setPagina((p) => Math.min(paginas, p + 1))}
                  disabled={pagina === paginas}
                  className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </nav>
            )}
          </section>
        )}
      </main>

      <ProjectDetailsModal
        selectedProject={proyectoAbierto}
        eventoInfo={eventos.find((e) => e.id_evento === proyectoAbierto?.id_evento) || null}
        user={null}
        onClose={() => setProyectoAbierto(null)}
        onDownloadCertificado={null}
        onDownloadTodosCertificados={null}
        token={null}
      />
    </div>
  );
}
