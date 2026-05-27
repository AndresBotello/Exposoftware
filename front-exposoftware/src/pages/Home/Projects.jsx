import { useState, useEffect } from "react";
import { obtenerTodosLosProyectos } from "../../Services/GuestService";
import { getEventoById } from "../../Services/EventosPublicService";
import logo from "../../assets/Logo-unicesar.png";

export default function PublicProjects() {
  const [selectedProject, setSelectedProject] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [proyectos, setProyectos] = useState([]);
  const [eventoNombre, setEventoNombre] = useState({});

  useEffect(() => {
    cargarProyectos();
  }, []);

  const cargarProyectos = async () => {
    try {
      setCargando(true);
      setError(null);

      const datosProyectos = await obtenerTodosLosProyectos();
      setProyectos(datosProyectos);

    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  // Función para obtener nombre del evento
  const obtenerNombreEvento = async (eventoId) => {
    if (!eventoId || eventoNombre[eventoId]) return;

    try {
      const evento = await getEventoById(eventoId);
      setEventoNombre(prev => ({
        ...prev,
        [eventoId]: evento.nombre_evento || evento.nombre || 'Evento desconocido'
      }));
    } catch (error) {
      setEventoNombre(prev => ({
        ...prev,
        [eventoId]: 'Evento desconocido'
      }));
    }
  };

  // Función para obtener nombre del tipo de actividad
  const obtenerNombreTipoActividad = (tipoId) => {
    const tipos = {
      1: 'Proyecto (Exposoftware)',
      2: 'Taller',
      3: 'Ponencia',
      4: 'Conferencia'
    };
    return tipos[tipoId] || 'Tipo desconocido';
  };

  const handleViewDetails = (project) => {
    setSelectedProject(project);
    setShowModal(true);

    // Obtener nombre del evento si hay ID de evento
    if (project.id_evento) {
      obtenerNombreEvento(project.id_evento);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProject(null);
  };

  // Filtrar proyectos por búsqueda
  const filteredProjects = proyectos.filter(project => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    const matchesTitle = (project.nombre_proyecto || project.titulo_proyecto || project.titulo || '').toLowerCase().includes(searchLower);
    const matchesDocente = (project.id_docente?.nombre || '').toLowerCase().includes(searchLower);
    const matchesLinea = (project.nombre_linea || '').toLowerCase().includes(searchLower);
    const matchesTipoActividad = obtenerNombreTipoActividad(project.tipo_actividad).toLowerCase().includes(searchLower);

    return matchesTitle || matchesDocente || matchesLinea || matchesTipoActividad;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">

      {/* Banner Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-700 via-green-600 to-teal-700 text-white py-16 md:py-20">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-teal-300 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-400 rounded-full blur-3xl opacity-40"></div>
        </div>
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-medium mb-6 border border-white/20">
            <span className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse"></span>
            Universidad Popular del Cesar
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-5 tracking-tight">
            Expo-Software <span className="text-emerald-200">2025</span>
          </h1>
          <p className="text-lg md:text-xl text-emerald-100/90 max-w-2xl mx-auto leading-relaxed">
            Descubre los proyectos innovadores desarrollados por nuestros estudiantes
          </p>
          {!cargando && !error && (
            <div className="mt-8 flex items-center justify-center gap-6">
              <div className="bg-white/10 backdrop-blur-md px-8 py-4 rounded-2xl border border-white/20 shadow-lg">
                <p className="text-4xl font-extrabold tracking-tight">{proyectos.length}</p>
                <p className="text-sm text-emerald-200 font-medium mt-1">Proyectos Inscritos</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Panel de Filtros */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-10 shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
              <i className="pi pi-search text-white text-lg"></i>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Buscar Proyectos</h3>
              <p className="text-sm text-gray-500">Filtra por título, docente, línea o tipo de actividad</p>
            </div>
          </div>

          {/* Barra de búsqueda */}
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Escribe para buscar proyectos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white text-gray-900 placeholder-gray-400 transition-all duration-200"
              />
              <i className="pi pi-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg"></i>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors duration-200"
                >
                  <i className="pi pi-times text-lg"></i>
                </button>
              )}
            </div>
          </div>

          {/* Contador de resultados */}
          {searchTerm && (
            <div className="flex items-center justify-between bg-emerald-50/60 rounded-xl p-3.5 border border-emerald-100">
              <p className="text-sm text-gray-700">
                <span className="font-bold text-emerald-600">{filteredProjects.length}</span> de <span className="font-semibold">{proyectos.length}</span> proyectos encontrados
              </p>
              <button
                onClick={() => setSearchTerm("")}
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-lg border border-emerald-200 hover:border-emerald-300 hover:shadow-sm transition-all duration-200"
              >
                <i className="pi pi-times-circle"></i>
                Limpiar
              </button>
            </div>
          )}
        </div>

        {/* Estado de carga */}
        {cargando && (
          <div className="bg-white rounded-2xl border border-gray-100 p-20 text-center shadow-sm">
            <div className="relative inline-flex items-center justify-center mb-8">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-100 border-t-emerald-600"></div>
              <i className="pi pi-code absolute text-emerald-600 text-lg"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Cargando proyectos...</h3>
            <p className="text-gray-500">Estamos obteniendo la información más reciente</p>
          </div>
        )}

        {/* Error */}
        {error && !cargando && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <i className="pi pi-exclamation-triangle text-red-600 text-xl"></i>
              <div>
                <h3 className="text-sm font-semibold text-red-900">Error al cargar proyectos</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Contenido - Solo si no hay error ni está cargando */}
        {!cargando && !error && (
          <>
            {/* Grid de Proyectos */}
            {filteredProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7">
                {filteredProjects.map((p, index) => (
                  <div key={p.id_proyecto} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-2xl hover:shadow-emerald-100/50 transition-all duration-500 hover:-translate-y-2 group flex flex-col" style={{ animationDelay: `${index * 50}ms` }}>
                    {/* Header de la tarjeta */}
                    <div className="relative bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600 p-5">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                      <div className="relative">
                        {p.tipo_actividad && (
                          <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full font-semibold mb-3 border border-white/10">
                            <i className="pi pi-tag text-[10px]"></i>
                            {obtenerNombreTipoActividad(p.tipo_actividad)}
                          </span>
                        )}
                        <h3 className="text-base font-bold text-white leading-snug line-clamp-2 min-h-[2.75rem]">
                          {p.nombre_proyecto || p.titulo_proyecto || p.titulo || 'Proyecto sin título'}
                        </h3>
                      </div>
                    </div>

                    {/* Contenido */}
                    <div className="p-5 flex-1 flex flex-col">
                      {/* Información del proyecto */}
                      <div className="space-y-3 mb-5 flex-1">
                        {p.id_docente?.nombre && (
                          <div className="flex items-center gap-3 text-sm">
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                              <i className="pi pi-user text-emerald-600 text-xs"></i>
                            </div>
                            <div className="min-w-0">
                              <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">Docente</p>
                              <p className="text-sm text-gray-700 font-medium truncate">{p.id_docente.nombre}</p>
                            </div>
                          </div>
                        )}

                        {p.id_estudiantes && p.id_estudiantes.length > 0 && (
                          <div className="flex items-center gap-3 text-sm">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                              <i className="pi pi-users text-blue-600 text-xs"></i>
                            </div>
                            <div>
                              <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">Equipo</p>
                              <p className="text-sm text-gray-700 font-medium">{p.id_estudiantes.length} estudiante{p.id_estudiantes.length !== 1 ? 's' : ''}</p>
                            </div>
                          </div>
                        )}

                        {p.nombre_linea && (
                          <div className="flex items-center gap-3 text-sm">
                            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                              <i className="pi pi-bookmark text-purple-600 text-xs"></i>
                            </div>
                            <div className="min-w-0">
                              <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">Línea</p>
                              <p className="text-sm text-gray-700 font-medium truncate">{p.nombre_linea}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Estado y calificación */}
                      {(p.estado_calificacion || p.calificacion !== undefined) && (
                        <div className="flex items-center justify-between mb-4 p-3 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-100">
                          {p.estado_calificacion && (
                            <div className="flex items-center gap-1.5 text-xs">
                              <span className={`w-2 h-2 rounded-full ${p.estado_calificacion.toLowerCase().includes('aprobado') ? 'bg-emerald-500' : p.estado_calificacion.toLowerCase().includes('pendiente') ? 'bg-amber-500' : 'bg-gray-400'}`}></span>
                              <span className={`font-semibold ${p.estado_calificacion.toLowerCase().includes('aprobado') ? 'text-emerald-700' : p.estado_calificacion.toLowerCase().includes('pendiente') ? 'text-amber-700' : 'text-gray-600'}`}>
                                {p.estado_calificacion}
                              </span>
                            </div>
                          )}

                          {p.calificacion !== undefined && (
                            <div className="flex items-center gap-1.5 text-xs">
                              <i className="pi pi-star-fill text-amber-400 text-[10px]"></i>
                              <span className="font-bold text-gray-700">{p.calificacion}<span className="text-gray-400 font-normal">/5</span></span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Botón */}
                      <button
                        onClick={() => handleViewDetails(p)}
                        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-emerald-200/40 group-hover:shadow-xl group-hover:shadow-emerald-200/60 mt-auto text-sm"
                      >
                        <i className="pi pi-eye text-sm"></i>
                        Ver Detalles
                        <i className="pi pi-arrow-right text-xs ml-1 group-hover:translate-x-1 transition-transform duration-300"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center shadow-sm">
                <div className="w-24 h-24 bg-gradient-to-br from-emerald-50 to-teal-100 rounded-2xl mx-auto mb-6 flex items-center justify-center rotate-3">
                  <i className="pi pi-search text-4xl text-emerald-400 -rotate-3"></i>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {proyectos.length === 0 ? 'No hay proyectos disponibles' : 'No se encontraron proyectos'}
                </h3>
                <p className="text-gray-500 mb-8 max-w-md mx-auto leading-relaxed">
                  {proyectos.length === 0
                    ? 'Aún no se han registrado proyectos para el evento. ¡Vuelve pronto para ver las innovadoras propuestas!'
                    : 'No hay proyectos que coincidan con tu búsqueda. Intenta con otros términos.'}
                </p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-3 rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 font-semibold inline-flex items-center gap-2 shadow-lg shadow-emerald-200/50"
                  >
                    <i className="pi pi-refresh"></i>
                    Limpiar búsqueda
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de Detalles del Proyecto */}
      {showModal && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-auto" onClick={closeModal}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-auto border border-gray-100" onClick={(e) => e.stopPropagation()}>
            {/* Header del modal */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200/50">
                  <i className="pi pi-folder-open text-white text-sm"></i>
                </div>
                <h3 className="text-lg font-bold text-gray-900">Detalles del Proyecto</h3>
              </div>
              <button
                onClick={closeModal}
                className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-red-50 flex items-center justify-center text-gray-500 hover:text-red-500 transition-all duration-200"
              >
                <i className="pi pi-times text-sm"></i>
              </button>
            </div>

            {/* Contenido del modal */}
            <div className="p-6">
              <div className="space-y-5">
                {/* Título */}
                <div className="pb-4 border-b border-gray-100">
                  <h4 className="text-2xl font-extrabold text-gray-900 leading-snug">
                    {selectedProject.titulo_proyecto || selectedProject.nombre_proyecto || selectedProject.titulo || 'Proyecto sin título'}
                  </h4>
                </div>

                {/* Docente */}
                {selectedProject.id_docente && selectedProject.id_docente.nombre && (
                  <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1.5">
                      <i className="pi pi-user text-emerald-600 text-sm"></i>
                      <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">Docente Responsable</p>
                    </div>
                    <p className="text-base font-semibold text-emerald-900">{selectedProject.id_docente.nombre}</p>
                  </div>
                )}

                {/* Estudiantes */}
                {selectedProject.id_estudiantes && selectedProject.id_estudiantes.length > 0 && (
                  <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <i className="pi pi-users text-indigo-600 text-sm"></i>
                      <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">Estudiantes Participantes ({selectedProject.id_estudiantes.length})</p>
                    </div>
                    <ul className="space-y-2">
                      {selectedProject.id_estudiantes.map(e => (
                        <li key={e.id_estudiante} className="text-sm text-indigo-800 flex items-center gap-2.5 bg-white/60 rounded-lg px-3 py-2">
                          <div className="w-6 h-6 rounded-full bg-indigo-200 flex items-center justify-center flex-shrink-0">
                            <i className="pi pi-user text-[10px] text-indigo-600"></i>
                          </div>
                          <span className="font-medium">{e.nombre}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Grupo */}
                {selectedProject.id_grupo && (
                  <div className="bg-teal-50/70 border border-teal-100 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1.5">
                      <i className="pi pi-users text-teal-600 text-sm"></i>
                      <p className="text-xs font-semibold text-teal-700 uppercase tracking-wide">Grupo Académico</p>
                    </div>
                    <p className="text-base font-semibold text-teal-900">{selectedProject.id_grupo}</p>
                  </div>
                )}

                {/* Información Académica */}
                {(selectedProject.nombre_area || selectedProject.nombre_linea || selectedProject.nombre_sublinea || selectedProject.codigo_materia) && (
                  <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <i className="pi pi-graduation-cap text-slate-600 text-sm"></i>
                      <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Información Académica</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedProject.nombre_linea && (
                        <div className="bg-white/70 rounded-lg p-2.5">
                          <p className="text-[11px] text-slate-500 mb-0.5 font-medium">Línea de Investigación</p>
                          <p className="text-sm font-semibold text-slate-800">{selectedProject.nombre_linea}</p>
                        </div>
                      )}
                      {selectedProject.nombre_sublinea && (
                        <div className="bg-white/70 rounded-lg p-2.5">
                          <p className="text-[11px] text-slate-500 mb-0.5 font-medium">Sublínea</p>
                          <p className="text-sm font-semibold text-slate-800">{selectedProject.nombre_sublinea}</p>
                        </div>
                      )}
                      {selectedProject.nombre_area && (
                        <div className="bg-white/70 rounded-lg p-2.5">
                          <p className="text-[11px] text-slate-500 mb-0.5 font-medium">Área Temática</p>
                          <p className="text-sm font-semibold text-slate-800">{selectedProject.nombre_area}</p>
                        </div>
                      )}
                      {selectedProject.codigo_materia && (
                        <div className="bg-white/70 rounded-lg p-2.5">
                          <p className="text-[11px] text-slate-500 mb-0.5 font-medium">Materia</p>
                          <p className="text-sm font-semibold text-slate-800">{selectedProject.codigo_materia}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Evento y Tipo de Actividad */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedProject.id_evento && (
                    <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-1.5">
                        <i className="pi pi-calendar text-blue-600 text-sm"></i>
                        <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Evento</p>
                      </div>
                      <p className="text-sm font-semibold text-blue-900">
                        {eventoNombre[selectedProject.id_evento] || 'Cargando...'}
                      </p>
                    </div>
                  )}

                  {selectedProject.tipo_actividad && (
                    <div className="bg-purple-50/70 border border-purple-100 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-1.5">
                        <i className="pi pi-tag text-purple-600 text-sm"></i>
                        <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Tipo de Actividad</p>
                      </div>
                      <p className="text-sm font-semibold text-purple-900">
                        {obtenerNombreTipoActividad(selectedProject.tipo_actividad)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Estado y calificación */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedProject.estado_calificacion && (
                    <div className="bg-amber-50/70 border border-amber-100 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-1.5">
                        <i className="pi pi-check-circle text-amber-600 text-sm"></i>
                        <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Estado</p>
                      </div>
                      <p className="text-sm font-semibold text-amber-900">{selectedProject.estado_calificacion}</p>
                    </div>
                  )}
                  {selectedProject.calificacion !== undefined && (
                    <div className="bg-yellow-50/70 border border-yellow-100 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-1.5">
                        <i className="pi pi-star-fill text-yellow-500 text-sm"></i>
                        <p className="text-xs font-semibold text-yellow-700 uppercase tracking-wide">Calificación</p>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <p className="text-2xl font-extrabold text-yellow-900">{selectedProject.calificacion}</p>
                        <p className="text-sm text-yellow-600 font-medium">/5</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* PDF */}
                {selectedProject.archivo_pdf && (
                  <div className="bg-red-50/70 border border-red-100 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                          <i className="pi pi-file-pdf text-red-600"></i>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-red-700 uppercase tracking-wide">Documento</p>
                          <p className="text-sm font-medium text-red-900">Archivo PDF del proyecto</p>
                        </div>
                      </div>
                      <a
                        href={selectedProject.archivo_pdf}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-xl hover:bg-red-700 transition-all duration-200 font-semibold text-sm shadow-lg shadow-red-200/50"
                      >
                        <i className="pi pi-external-link text-xs"></i>
                        Abrir PDF
                      </a>
                    </div>
                  </div>
                )}

                {/* Fecha de subida y Estado activo */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedProject.fecha_subida && (
                    <div className="bg-cyan-50/70 border border-cyan-100 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-1.5">
                        <i className="pi pi-calendar-plus text-cyan-600 text-sm"></i>
                        <p className="text-xs font-semibold text-cyan-700 uppercase tracking-wide">Fecha de Subida</p>
                      </div>
                      <p className="text-sm font-semibold text-cyan-900">
                        {new Date(selectedProject.fecha_subida).toLocaleString('es-CO', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  )}

                  {selectedProject.activo !== undefined && (
                    <div className={`border rounded-xl p-4 ${selectedProject.activo ? 'bg-emerald-50/70 border-emerald-100' : 'bg-gray-50/70 border-gray-100'}`}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${selectedProject.activo ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`}></span>
                        <p className={`text-xs font-semibold uppercase tracking-wide ${selectedProject.activo ? 'text-emerald-700' : 'text-gray-600'}`}>Estado del Proyecto</p>
                      </div>
                      <p className={`text-sm font-semibold ${selectedProject.activo ? 'text-emerald-900' : 'text-gray-800'}`}>
                        {selectedProject.activo ? 'Activo' : 'Inactivo'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer del modal */}
            <div className="sticky bottom-0 bg-white/95 backdrop-blur-md border-t border-gray-100 px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-8 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 font-semibold text-sm shadow-lg shadow-emerald-200/40"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
