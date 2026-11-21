import { useState, useEffect, useMemo } from "react";
import { useStudentProjects, EVENTO_TODOS } from "../../hooks/Teacher/useStudentProjects";
import { ProjectDetailsModal, GradeModal, ProjectActionModal } from "../../components/Teacher/ProjectModals";
import { TeacherHeader, TeacherSidebar } from "../../components/Teacher/TeacherLayout";
import ProjectCard from "../../components/ProjectCard";
import QRCalificacionModal from "./QRCalificacionModal";

/* ------------------------------------------------------------------ */
/* Helpers de presentación (no modifican datos ni llaman al backend)    */
/* ------------------------------------------------------------------ */

const MATERIA_DEFAULT = "Filtrar por materia";
const GRUPO_DEFAULT = "Filtrar por grupo";

// Misma lógica de estado que tenía la tabla, centralizada
function estadoProyecto(p) {
  if (p.estado === "rechazado") return { clave: "rechazado", texto: "Rechazado", clases: "bg-red-100 text-red-800", icono: "pi-times-circle" };
  if (p.estado === "aprobado" || p.calificacion >= 3.0)
    return { clave: "aprobado", texto: "Aprobado", clases: "bg-green-100 text-green-800", icono: "pi-check-circle" };
  if (p.calificacion < 3.0 && p.calificacion !== null)
    return { clave: "reprobado", texto: "Reprobado", clases: "bg-red-100 text-red-800", icono: "pi-times-circle" };
  if (p.activo) return { clave: "pendiente", texto: "Pendiente", clases: "bg-yellow-100 text-yellow-800", icono: "pi-clock" };
  return { clave: "inactivo", texto: "Inactivo", clases: "bg-gray-100 text-gray-800", icono: "pi-ban" };
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
  const f = p.fecha_subida || p.created_at || p.fecha_creacion;
  return f ? new Date(f).toLocaleDateString("es-ES") : "Fecha no disponible";
}

function PaginationBar({ currentPage, totalPages, total, itemsPerPage, setItemsPerPage, setCurrentPage, tabla }) {
  return (
    <div
      className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-gray-50 ${
        tabla ? "border-t border-gray-200" : "mt-6 rounded-xl border border-gray-200"
      }`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="text-sm text-gray-600">
          Página <span className="font-semibold text-gray-900">{currentPage}</span> de{" "}
          <span className="font-semibold text-gray-900">{totalPages}</span>
          <span className="ml-3 text-gray-500">({total} en total)</span>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 font-medium">Por página:</label>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(parseInt(e.target.value));
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            {[10, 25, 50, 100].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <i className="pi pi-chevron-left mr-2"></i>Anterior
        </button>
        <button
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Siguiente<i className="pi pi-chevron-right ml-2"></i>
        </button>
      </div>
    </div>
  );
}

function SkeletonCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {[0, 1, 2, 3, 4, 5].map((i) => (
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
  );
}

/* ------------------------------------------------------------------ */

export default function StudentProjects() {
  const [activeSection, setActiveSection] = useState("assigned");
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedProjectForQR, setSelectedProjectForQR] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);

  const {
    eventosDisponibles,
    eventoActualId,
    selectedEvento,
    setSelectedEvento,
    filtrarPorEvento,
    user,
    getFullName,
    getInitials,
    viewMode,
    setViewMode,
    selectedGroup,
    setSelectedGroup,
    selectedMateria,
    setSelectedMateria,
    materiasList,
    gruposList,
    searchQuery,
    setSearchQuery,
    selectedProject,
    showModal,
    showGradeModal,
    projectToGrade,
    gradeValue,
    setGradeValue,
    gradingProject,
    projectCalificacionPopular,
    loadingCalificacionPopular,
    projects,
    filteredProjects,
    myProjects,
    filteredMyProjects,
    projectsForApproval,
    filteredApprovalProjects,
    projectsApproved,
    filteredApprovedProjects,
    approvingProject,
    rejectingProject,
    showActionModal,
    projectForAction,
    showRejectReason,
    setShowRejectReason,
    rejectReason,
    setRejectReason,
    loading,
    error,
    handleLogout,
    handleViewDetails,
    closeModal,
    handleOpenGradeModal,
    closeGradeModal,
    handleGradeProject,
    handleApproveProjectFromModal,
    handleOpenActionModal,
    handleCloseActionModal,
    handleGradeProjectAction,
    handleApproveProjectAction,
    handleRejectProjectAction,
    handleApproveProject,
    handleRejectProject,
    getLineaName,
    getSublineaName,
    getAreaName,
    getEventoName,
  } = useStudentProjects();

  // Qué proyectos se muestran según la pestaña activa
  let displayProjects = filtrarPorEvento(projects);
  let displayFiltered = filteredProjects;

  if (activeSection === "assigned") {
    displayProjects = filtrarPorEvento(myProjects);
    displayFiltered = filteredMyProjects;
  } else if (activeSection === "approval") {
    displayProjects = filtrarPorEvento(projectsForApproval);
    displayFiltered = filteredApprovalProjects;
  } else if (activeSection === "approved") {
    displayProjects = filtrarPorEvento(projectsApproved);
    displayFiltered = filteredApprovedProjects;
  }

  const eventoSeleccionado = eventosDisponibles.find((e) => e.id === String(selectedEvento));
  const viendoHistorico = selectedEvento === EVENTO_TODOS;

  const tabs = [
    { id: "assigned", label: "Mis proyectos", icono: "pi-briefcase", cuenta: filtrarPorEvento(myProjects).length },
    { id: "approval", label: "Para aprobar", icono: "pi-hourglass", cuenta: filtrarPorEvento(projectsForApproval).length },
    { id: "approved", label: "Aprobados", icono: "pi-check", cuenta: filtrarPorEvento(projectsApproved).length },
  ];

  // Resumen de estados de la pestaña actual (antes se calculaba sobre todos los proyectos)
  const resumen = useMemo(() => {
    const r = { aprobado: 0, pendiente: 0, reprobado: 0 };
    displayProjects.forEach((p) => {
      const { clave } = estadoProyecto(p);
      if (clave === "aprobado") r.aprobado += 1;
      else if (clave === "pendiente") r.pendiente += 1;
      else if (clave === "reprobado" || clave === "rechazado") r.reprobado += 1;
    });
    return r;
  }, [displayProjects]);

  const hayFiltros =
    searchQuery.trim() !== "" || selectedMateria !== MATERIA_DEFAULT || selectedGroup !== GRUPO_DEFAULT;

  const limpiarFiltros = () => {
    setSearchQuery("");
    setSelectedMateria(MATERIA_DEFAULT);
    setSelectedGroup(GRUPO_DEFAULT);
  };

  const nombreMateriaSeleccionada = useMemo(() => {
    if (selectedMateria === MATERIA_DEFAULT) return null;
    const m = materiasList.find((x) => String(x.codigo || x.code || x.id || "") === selectedMateria);
    return m ? m.nombre || m.name || m.title || m.codigo || m.id : selectedMateria;
  }, [selectedMateria, materiasList]);

  const handleOpenQRModal = (project) => {
    setSelectedProjectForQR(project);
    setShowQRModal(true);
  };

  const handleCloseQRModal = () => {
    setShowQRModal(false);
    setSelectedProjectForQR(null);
  };

  // Paginación
  const totalPages = Math.max(1, Math.ceil(displayFiltered.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProjects = displayFiltered.slice(startIndex, startIndex + itemsPerPage);

  // Volver a la página 1 cuando cambian filtros o pestaña
  useEffect(() => {
    setCurrentPage(1);
  }, [activeSection, selectedMateria, selectedGroup, searchQuery]);

  const mensajeVacio =
    activeSection === "assigned"
      ? "Aún no tienes proyectos asignados."
      : activeSection === "approval"
      ? "No hay proyectos para aprobar en este momento."
      : "Todavía no hay proyectos aprobados.";

  const paginacionProps = {
    currentPage,
    totalPages,
    total: displayFiltered.length,
    itemsPerPage,
    setItemsPerPage,
    setCurrentPage,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TeacherHeader
        getInitials={getInitials}
        getFullName={getFullName}
        user={user}
        handleLogout={handleLogout}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <TeacherSidebar
            activePage="proyectos"
            getInitials={getInitials}
            getFullName={getFullName}
            user={user}
          />

          {/* Main Content */}
          <main className="lg:col-span-3 space-y-6">
            {/* Encabezado */}
            <div>
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                  <i className="pi pi-folder-open text-white text-xl"></i>
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Proyectos de estudiantes</h2>
                  <p className="text-gray-600">Gestión y visualización de los proyectos de tus grupos</p>
                </div>
              </div>
              <div className="h-1 w-24 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full"></div>
            </div>

            {/* Evento: por defecto el actual; los proyectos de eventos anteriores quedan en el histórico */}
            {eventosDisponibles.length > 0 && (
              <div className="flex flex-col gap-3 rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 shadow">
                    <i className="pi pi-calendar text-white"></i>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {viendoHistorico
                        ? "Histórico de todos los eventos"
                        : eventoSeleccionado?.nombre || "Evento"}
                    </p>
                    <p className="text-xs text-gray-600">
                      {viendoHistorico
                        ? "Estás viendo también los proyectos de eventos anteriores"
                        : eventoSeleccionado?.id === eventoActualId
                        ? `Evento actual${eventoSeleccionado?.estadoTexto ? ` · ${eventoSeleccionado.estadoTexto}` : ""} · los proyectos de eventos anteriores están ocultos`
                        : `Evento anterior${eventoSeleccionado?.estadoTexto ? ` · ${eventoSeleccionado.estadoTexto}` : ""}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <label htmlFor="filtro-evento" className="text-sm font-medium text-gray-700">
                    Evento:
                  </label>
                  <select
                    id="filtro-evento"
                    value={selectedEvento}
                    onChange={(e) => setSelectedEvento(e.target.value)}
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

            {/* Pestañas (deslizables en móvil) */}
            <div className="overflow-x-auto -mx-1 px-1">
              <div role="tablist" className="inline-flex min-w-full sm:min-w-0 gap-1 rounded-xl bg-white border border-gray-200 p-1 shadow-sm">
                {tabs.map((t) => {
                  const activa = activeSection === t.id;
                  return (
                    <button
                      key={t.id}
                      role="tab"
                      aria-selected={activa}
                      onClick={() => setActiveSection(t.id)}
                      className={`flex flex-1 sm:flex-none items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                        activa
                          ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <i className={`pi ${t.icono}`}></i>
                      {t.label}
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          activa ? "bg-white/25 text-white" : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {t.cuenta}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Búsqueda y filtros */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div className="relative flex-1 w-full lg:max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="pi pi-search text-gray-400"></i>
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar por título, materia o estudiante..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    maxLength={120}
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      aria-label="Borrar búsqueda"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <i className="pi pi-times"></i>
                    </button>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center w-full lg:w-auto">
                  <div className="flex items-center gap-2">
                    <i className="pi pi-filter text-gray-500 text-sm"></i>
                    <span className="text-sm font-medium text-gray-700">Filtros:</span>
                  </div>

                  <select
                    value={selectedMateria}
                    onChange={(e) => {
                      setSelectedMateria(e.target.value);
                      setSelectedGroup(GRUPO_DEFAULT);
                    }}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 w-full sm:w-auto sm:min-w-[180px]"
                    disabled={materiasList.length === 0}
                  >
                    <option value={MATERIA_DEFAULT}>
                      {materiasList.length === 0 ? "No hay materias" : "Todas las materias"}
                    </option>
                    {materiasList.map((m, idx) => (
                      <option key={idx} value={(m.codigo || m.code || m.id || "").toString()}>
                        {m.nombre || m.name || m.title || m.codigo || m.id}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 w-full sm:w-auto sm:min-w-[160px]"
                    disabled={!selectedMateria || selectedMateria === MATERIA_DEFAULT || gruposList.length === 0}
                  >
                    <option value={GRUPO_DEFAULT}>
                      {!selectedMateria || selectedMateria === MATERIA_DEFAULT
                        ? "Seleccione materia"
                        : gruposList.length === 0
                        ? "No hay grupos"
                        : "Todos los grupos"}
                    </option>
                    {gruposList.map((g, idx) => (
                      <option
                        key={idx}
                        value={(g.id_grupo || g.id || g.codigo || g.group_code || g.nombre || "").toString()}
                      >
                        {g.nombre || g.name || g.nombre_grupo || String(g.id_grupo || g.id || g.codigo)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Filtros activos */}
              {hayFiltros && (
                <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                  <span className="text-gray-500">Filtrando por:</span>
                  {searchQuery.trim() !== "" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-emerald-800">
                      <i className="pi pi-search text-xs"></i>"{searchQuery}"
                    </span>
                  )}
                  {nombreMateriaSeleccionada && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-blue-800">
                      <i className="pi pi-book text-xs"></i>
                      {nombreMateriaSeleccionada}
                    </span>
                  )}
                  {selectedGroup !== GRUPO_DEFAULT && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 border border-purple-200 px-3 py-1 text-purple-800">
                      <i className="pi pi-users text-xs"></i>Grupo seleccionado
                    </span>
                  )}
                  <button
                    onClick={limpiarFiltros}
                    className="ml-1 font-medium text-emerald-600 underline hover:text-emerald-700 transition-colors"
                  >
                    Limpiar filtros
                  </button>
                </div>
              )}
            </div>

            {/* Resumen + selector de vista */}
            <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl border border-emerald-200 p-4 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">
                      {displayFiltered.length} de {displayProjects.length} proyectos
                    </span>
                  </div>

                  {resumen.aprobado > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800">
                      <span className="h-2 w-2 rounded-full bg-green-500"></span>
                      {resumen.aprobado} aprobados
                    </span>
                  )}
                  {resumen.pendiente > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-medium text-yellow-800">
                      <span className="h-2 w-2 rounded-full bg-yellow-500"></span>
                      {resumen.pendiente} pendientes
                    </span>
                  )}
                  {resumen.reprobado > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-800">
                      <span className="h-2 w-2 rounded-full bg-red-500"></span>
                      {resumen.reprobado} reprobados
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
                  {[
                    { id: "grid", label: "Tarjetas", icono: "pi-th-large" },
                    { id: "table", label: "Tabla", icono: "pi-list" },
                  ].map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setViewMode(v.id)}
                      aria-pressed={viewMode === v.id}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                        viewMode === v.id
                          ? "bg-emerald-500 text-white shadow-sm"
                          : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                      }`}
                    >
                      <i className={`pi ${v.icono}`}></i>
                      <span className="hidden sm:inline">{v.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Estados: cargando / error / vacío (una sola vez para ambas vistas) */}
            {loading ? (
              <SkeletonCards />
            ) : error ? (
              <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
                <div className="w-14 h-14 bg-red-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <i className="pi pi-exclamation-triangle text-2xl text-red-500"></i>
                </div>
                <p className="text-red-700 font-medium">No pudimos cargar los proyectos</p>
                <p className="text-sm text-red-600 mt-1">Revisa tu conexión e inténtalo de nuevo.</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
                >
                  Reintentar
                </button>
              </div>
            ) : displayFiltered.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <i className={`pi ${hayFiltros ? "pi-search" : "pi-folder-open"} text-3xl text-gray-400`}></i>
                </div>
                <p className="text-gray-700 font-medium mb-1">
                  {hayFiltros ? "No se encontraron proyectos" : mensajeVacio}
                </p>
                <p className="text-sm text-gray-500">
                  {hayFiltros
                    ? "Prueba con otros términos de búsqueda o quita algún filtro."
                    : "Cuando haya proyectos aparecerán aquí."}
                </p>
                {hayFiltros && (
                  <button
                    onClick={limpiarFiltros}
                    className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100 transition-colors"
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>
            ) : viewMode === "grid" ? (
              /* Vista de tarjetas */
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {paginatedProjects.map((project) => (
                    <div key={project.id_proyecto} className="relative">
                      <ProjectCard proyecto={project} onViewDetails={() => handleViewDetails(project)} />
                      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                        <button
                          onClick={() => handleOpenQRModal(project)}
                          aria-label="Generar QR de calificación"
                          className="flex items-center justify-center px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all text-sm font-medium shadow-lg hover:-translate-y-0.5"
                          title="Generar QR de calificación"
                        >
                          <i className="pi pi-qrcode"></i>
                        </button>
                        <button
                          onClick={() => handleOpenActionModal(project)}
                          aria-label="Gestionar proyecto"
                          className="flex items-center justify-center px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all text-sm font-medium shadow-lg hover:-translate-y-0.5"
                          title="Gestionar proyecto"
                        >
                          <i className="pi pi-cog"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <PaginationBar {...paginacionProps} />
              </div>
            ) : (
              /* Vista de tabla */
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <tr className="border-b border-gray-200">
                        {["Proyecto", "Estudiantes", "Materia/Grupo", "Tipo", "Estado", "Acciones"].map((h) => (
                          <th key={h} className="text-left py-4 px-6 text-sm font-semibold text-gray-700 whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedProjects.map((project, index) => {
                        const estado = estadoProyecto(project);
                        const tipo = tipoActividad(project);
                        const integrantes = project.integrantes || [];
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
                                <div className="min-w-0 max-w-[260px]">
                                  <p className="text-sm font-semibold text-gray-900 truncate" title={project.titulo_proyecto}>
                                    {project.titulo_proyecto || "Sin título"}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">{fechaProyecto(project)}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <i className="pi pi-users text-emerald-600 text-xs"></i>
                                  </div>
                                  <span className="text-sm font-medium text-gray-900">
                                    {integrantes.length || project.id_estudiantes?.length || 0}
                                  </span>
                                </div>
                                {integrantes.length > 0 && (
                                  <div className="ml-10 space-y-1">
                                    {integrantes.slice(0, 2).map((integrante, idx) => (
                                      <div key={idx} className="text-xs text-gray-600 flex items-center gap-1">
                                        <span className={`w-1.5 h-1.5 rounded-full ${integrante.es_lider ? "bg-yellow-500" : "bg-gray-400"}`}></span>
                                        <span className="truncate max-w-[160px]" title={integrante.nombre_completo || integrante.nombre}>
                                          {integrante.nombre_completo || integrante.nombre || "Sin nombre"}
                                          {integrante.es_lider && " (Líder)"}
                                        </span>
                                      </div>
                                    ))}
                                    {integrantes.length > 2 && (
                                      <div className="text-xs text-gray-500 italic ml-3">+{integrantes.length - 2} más</div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="text-sm text-gray-900">
                                <p className="font-medium">{project.nombre_materia || project.codigo_materia || "N/A"}</p>
                                <p className="text-gray-500">Grupo {project.nombre_grupo || "N/A"}</p>
                              </div>
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
                                    <i className="pi pi-pencil text-yellow-500"></i> {project.calificacion}/5.0
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleViewDetails(project)}
                                  className="flex items-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors text-sm font-medium"
                                  title="Ver detalles del proyecto"
                                >
                                  <i className="pi pi-eye"></i>
                                  <span className="hidden md:inline">Ver</span>
                                </button>
                                <button
                                  onClick={() => handleOpenQRModal(project)}
                                  className="flex items-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors text-sm font-medium"
                                  title="Generar QR de calificación"
                                >
                                  <i className="pi pi-qrcode"></i>
                                  <span className="hidden md:inline">QR</span>
                                </button>
                                <button
                                  onClick={() => handleOpenActionModal(project)}
                                  className="flex items-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium"
                                  title="Gestionar proyecto (calificar, aprobar, rechazar)"
                                >
                                  <i className="pi pi-cog"></i>
                                  <span className="hidden md:inline">Gestionar</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <PaginationBar {...paginacionProps} tabla />
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Modales */}
      <ProjectDetailsModal
        show={showModal}
        project={selectedProject}
        onClose={closeModal}
        getLineaName={getLineaName}
        getSublineaName={getSublineaName}
        getAreaName={getAreaName}
        getEventoName={getEventoName}
        calificacionPopular={projectCalificacionPopular}
        loadingCalificacionPopular={loadingCalificacionPopular}
      />

      <GradeModal
        show={showGradeModal}
        project={projectToGrade}
        gradeValue={gradeValue}
        setGradeValue={setGradeValue}
        gradingProject={gradingProject}
        approvingProject={approvingProject}
        onGrade={handleGradeProject}
        onApprove={handleApproveProjectFromModal}
        onClose={closeGradeModal}
      />

      <ProjectActionModal
        show={showActionModal}
        project={projectForAction}
        gradeValue={gradeValue}
        setGradeValue={setGradeValue}
        gradingProject={gradingProject}
        approvingProject={approvingProject}
        rejectingProject={rejectingProject}
        showRejectReason={showRejectReason}
        setShowRejectReason={setShowRejectReason}
        rejectReason={rejectReason}
        setRejectReason={setRejectReason}
        onGrade={handleGradeProjectAction}
        onApprove={handleApproveProjectAction}
        onReject={handleRejectProjectAction}
        onClose={handleCloseActionModal}
        calificacionPopular={projectCalificacionPopular}
        loadingCalificacionPopular={loadingCalificacionPopular}
      />

      <QRCalificacionModal
        isOpen={showQRModal}
        projectId={selectedProjectForQR?.id_proyecto}
        projectName={selectedProjectForQR?.titulo_proyecto}
        onClose={handleCloseQRModal}
      />
    </div>
  );
}
