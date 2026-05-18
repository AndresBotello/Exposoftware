import { useStudentProjects } from "../../hooks/Teacher/useStudentProjects";
import { ProjectDetailsModal, GradeModal } from "../../components/Teacher/ProjectModals";
import { TeacherHeader, TeacherSidebar } from "../../components/Teacher/TeacherLayout";

export default function StudentProjects() {
  const {
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
    projects,
    filteredProjects,
    loading,
    error,
    handleLogout,
    handleViewDetails,
    closeModal,
    handleOpenGradeModal,
    closeGradeModal,
    handleGradeProject,
    getLineaName,
    getSublineaName,
    getAreaName,
    getEventoName,
  } = useStudentProjects();

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
          <main className="lg:col-span-3">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Proyectos de Estudiantes
              </h2>
              <p className="text-sm text-gray-600">
                Gestión y visualización de todos los proyectos de los estudiantes.
              </p>
            </div>

            {/* Barra de búsqueda y filtros */}
            <div className="bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                {/* Búsqueda */}
                <div className="relative flex-1 w-full lg:w-auto max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="pi pi-search text-gray-400"></i>
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar por título, materia o estudiante..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <i className="pi pi-times"></i>
                    </button>
                  )}
                </div>

                {/* Filtros */}
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center w-full lg:w-auto">
                  <div className="flex items-center gap-2">
                    <i className="pi pi-filter text-gray-500 text-sm"></i>
                    <span className="text-sm font-medium text-gray-700">Filtros:</span>
                  </div>

                  <select
                    value={selectedMateria}
                    onChange={(e) => {
                      setSelectedMateria(e.target.value);
                      setSelectedGroup("Filtrar por grupo");
                    }}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 min-w-[180px]"
                    disabled={materiasList.length === 0}
                  >
                    <option value="Filtrar por materia">
                      {materiasList.length === 0 ? "No hay materias" : "Todas las materias"}
                    </option>
                    {materiasList.length > 0 &&
                      materiasList.map((m, idx) => (
                        <option
                          key={idx}
                          value={(m.codigo || m.code || m.id || "").toString()}
                        >
                          {m.nombre || m.name || m.title || m.codigo || m.id}
                        </option>
                      ))}
                  </select>

                  <select
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 min-w-[160px]"
                    disabled={
                      !selectedMateria ||
                      selectedMateria === "Filtrar por materia" ||
                      gruposList.length === 0
                    }
                  >
                    <option value="Filtrar por grupo">
                      {!selectedMateria || selectedMateria === "Filtrar por materia"
                        ? "Seleccione materia"
                        : gruposList.length === 0
                        ? "No hay grupos"
                        : "Todos los grupos"}
                    </option>
                    {gruposList.length > 0 &&
                      gruposList.map((g, idx) => (
                        <option
                          key={idx}
                          value={(
                            g.id_grupo ||
                            g.id ||
                            g.codigo ||
                            g.group_code ||
                            g.nombre ||
                            ""
                          ).toString()}
                        >
                          {g.nombre ||
                            g.name ||
                            g.nombre_grupo ||
                            String(g.id_grupo || g.id || g.codigo)}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Mensajes informativos */}
              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                {materiasList.length === 0 && projects.length > 0 && (
                  <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                    <i className="pi pi-info-circle text-blue-600"></i>
                    <span>
                      <strong>Nota:</strong> Los filtros se generan automáticamente de tus
                      proyectos existentes.
                    </span>
                  </div>
                )}
                {materiasList.length === 0 && projects.length === 0 && (
                  <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                    <i className="pi pi-exclamation-triangle text-amber-600"></i>
                    <span>
                      <strong>Nota:</strong> No tienes proyectos asignados. Los filtros
                      estarán disponibles cuando tengas proyectos.
                    </span>
                  </div>
                )}
                {searchQuery && (
                  <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-800">
                    <i className="pi pi-search text-emerald-600"></i>
                    <span>
                      <strong>Búsqueda:</strong> "{searchQuery}" -{" "}
                      {filteredProjects.length} resultado(s)
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Controles de vista y estadísticas */}
            <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl border border-emerald-200 p-4 mb-6 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                {/* Estadísticas */}
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">
                      {filteredProjects.length} de {projects.length} proyectos
                    </span>
                  </div>

                  {filteredProjects.length !== projects.length && (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedMateria("Filtrar por materia");
                        setSelectedGroup("Filtrar por grupo");
                      }}
                      className="text-xs text-emerald-600 hover:text-emerald-700 font-medium underline transition-colors"
                    >
                      Limpiar filtros
                    </button>
                  )}

                  <div className="flex gap-2">
                    {projects.filter((p) => p.calificacion >= 3.0).length > 0 && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>
                          {projects.filter((p) => p.calificacion >= 3.0).length} Aprobados
                        </span>
                      </div>
                    )}
                    {projects.filter(
                      (p) => p.calificacion < 3.0 && p.calificacion !== null
                    ).length > 0 && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span>
                          {
                            projects.filter(
                              (p) => p.calificacion < 3.0 && p.calificacion !== null
                            ).length
                          }{" "}
                          Reprobados
                        </span>
                      </div>
                    )}
                    {projects.filter((p) => p.calificacion === null && p.activo).length >
                      0 && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span>
                          {
                            projects.filter((p) => p.calificacion === null && p.activo)
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

            {/* Vista de Tarjetas */}
            {viewMode === "grid" && (
              <div>
                {loading ? (
                  <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                    <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando proyectos...</p>
                  </div>
                ) : error ? (
                  <div className="bg-white rounded-lg border border-red-200 p-6 text-center bg-red-50">
                    <p className="text-red-600 font-medium">Error al cargar proyectos</p>
                    <p className="text-sm text-red-500 mt-1">{error}</p>
                  </div>
                ) : filteredProjects.length === 0 ? (
                  <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <i className="pi pi-search text-4xl text-gray-400"></i>
                    </div>
                    <p className="text-gray-600 mb-2">No se encontraron proyectos</p>
                    <p className="text-sm text-gray-500">
                      Intenta con otros términos de búsqueda
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
                    {filteredProjects.map((project) => (
                      <div
                        key={project.id_proyecto}
                        className="group bg-white rounded-xl border border-gray-200 hover:border-emerald-300 hover:shadow-xl transition-all duration-300 overflow-hidden"
                      >
                        {/* Header con gradiente */}
                        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-4 text-white">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h3
                                className="text-lg font-bold truncate mb-1"
                                title={project.titulo_proyecto}
                              >
                                {project.titulo_proyecto || "Sin título"}
                              </h3>
                              <div className="flex items-center gap-2 text-emerald-100 text-sm">
                                <i className="pi pi-calendar text-xs"></i>
                                <span>
                                  {project.fecha_subida
                                    ? new Date(project.fecha_subida).toLocaleDateString(
                                        "es-ES"
                                      )
                                    : "Fecha no disponible"}
                                </span>
                              </div>
                            </div>
                            <div
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                project.calificacion >= 3.0
                                  ? "bg-green-500 text-white"
                                  : project.calificacion < 3.0 &&
                                    project.calificacion !== null
                                  ? "bg-red-500 text-white"
                                  : project.activo
                                  ? "bg-yellow-500 text-white"
                                  : "bg-gray-500 text-white"
                              }`}
                            >
                              {project.calificacion >= 3.0
                                ? "Aprobado"
                                : project.calificacion < 3.0 &&
                                  project.calificacion !== null
                                ? "Reprobado"
                                : project.activo
                                ? "Pendiente"
                                : "Inactivo"}
                            </div>
                          </div>
                        </div>

                        {/* Contenido principal */}
                        <div className="p-5">
                          <div className="space-y-3 mb-4">
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                                  <i className="pi pi-users text-emerald-600 text-sm"></i>
                                </div>
                                <span className="font-medium">
                                  {project.id_estudiantes?.length || 0} estudiante(s)
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                  <i className="pi pi-book text-blue-600 text-sm"></i>
                                </div>
                                <span>
                                  {project.codigo_materia || "Sin materia"} - Grupo{" "}
                                  {project.id_grupo || "N/A"}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full font-medium">
                                {project.tipo_actividad === 1
                                  ? "📚 Proyecto"
                                  : project.tipo_actividad === 2
                                  ? "🛠️ Taller"
                                  : project.tipo_actividad === 3
                                  ? "🎤 Ponencia"
                                  : project.tipo_actividad === 4
                                  ? "🎭 Conferencia"
                                  : "❓ No especificado"}
                              </span>
                            </div>
                          </div>

                          {(project.codigo_linea || project.codigo_sublinea) && (
                            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                              <p className="text-xs text-gray-500 mb-1">
                                Línea de investigación
                              </p>
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {getLineaName(project.codigo_linea) || "No asignada"}
                              </p>
                              {project.codigo_sublinea && (
                                <p className="text-xs text-gray-600 mt-1 truncate">
                                  {getSublineaName(project.codigo_sublinea)}
                                </p>
                              )}
                            </div>
                          )}

                          {project.calificacion && (
                            <div className="mb-4 flex items-center justify-center">
                              <div
                                className={`px-4 py-2 rounded-lg font-bold text-lg ${
                                  project.calificacion >= 3.0
                                    ? "bg-green-100 text-green-800"
                                    : project.calificacion < 3.0
                                    ? "bg-red-100 text-red-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                <i className="pi pi-pencil text-yellow-500"></i>{" "}
                                {project.calificacion}/5.0
                              </div>
                            </div>
                          )}

                          <div className="flex gap-2 pt-3 border-t border-gray-100">
                            <button
                              onClick={() => handleViewDetails(project)}
                              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors text-sm font-medium"
                            >
                              <i className="pi pi-eye"></i>
                              <span className="hidden sm:inline">Ver detalles</span>
                            </button>
                            <button
                              onClick={() => handleOpenGradeModal(project)}
                              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                            >
                              <i className="pi pi-pencil"></i>
                              <span className="hidden sm:inline">
                                {project.calificacion ? "Editar" : "Calificar"}
                              </span>
                            </button>
                          </div>
                        </div>

                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl"></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Vista de Tabla */}
            {viewMode === "table" && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                          Proyecto
                        </th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                          Estudiantes
                        </th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                          Materia/Grupo
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
                      {filteredProjects.map((project, index) => (
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
                                    ? new Date(project.fecha_subida).toLocaleDateString(
                                        "es-ES"
                                      )
                                    : "Fecha no disponible"}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                                <i className="pi pi-users text-emerald-600 text-xs"></i>
                              </div>
                              <span className="text-sm font-medium text-gray-900">
                                {project.id_estudiantes?.length || 0}
                              </span>
                              <span className="text-xs text-gray-500">estudiante(s)</span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="text-sm text-gray-900">
                              <p className="font-medium">
                                {project.codigo_materia || "N/A"}
                              </p>
                              <p className="text-gray-500">
                                Grupo {project.id_grupo || "N/A"}
                              </p>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                project.tipo_actividad === 1
                                  ? "bg-blue-100 text-blue-800"
                                  : project.tipo_actividad === 2
                                  ? "bg-orange-100 text-orange-800"
                                  : project.tipo_actividad === 3
                                  ? "bg-purple-100 text-purple-800"
                                  : project.tipo_actividad === 4
                                  ? "bg-indigo-100 text-indigo-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {project.tipo_actividad === 1
                                ? "📚 Proyecto"
                                : project.tipo_actividad === 2
                                ? "🛠️ Taller"
                                : project.tipo_actividad === 3
                                ? "🎤 Ponencia"
                                : project.tipo_actividad === 4
                                ? "🎭 Conferencia"
                                : "❓ No especificado"}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex flex-col gap-1">
                              <span
                                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold w-fit ${
                                  project.calificacion >= 3.0
                                    ? "bg-green-100 text-green-800"
                                    : project.calificacion < 3.0 &&
                                      project.calificacion !== null
                                    ? "bg-red-100 text-red-800"
                                    : project.activo
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {project.calificacion >= 3.0
                                  ? "✅ Aprobado"
                                  : project.calificacion < 3.0 &&
                                    project.calificacion !== null
                                  ? "❌ Reprobado"
                                  : project.activo
                                  ? "⏳ Pendiente"
                                  : "🚫 Inactivo"}
                              </span>
                              {project.calificacion && (
                                <span className="text-xs text-gray-500 font-medium">
                                  <i className="pi pi-pencil text-yellow-500"></i>{" "}
                                  {project.calificacion}/5.0
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
                                onClick={() => handleOpenGradeModal(project)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                                  project.calificacion
                                    ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                                    : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                                }`}
                                title={
                                  project.calificacion
                                    ? "Editar calificación"
                                    : "Calificar proyecto"
                                }
                              >
                                <i className="pi pi-pencil"></i>
                                <span className="hidden md:inline">
                                  {project.calificacion ? "Editar" : "Calificar"}
                                </span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Sin resultados */}
            {filteredProjects.length === 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <i className="pi pi-search text-4xl text-gray-400"></i>
                </div>
                <p className="text-gray-600 mb-2">No se encontraron proyectos</p>
                <p className="text-sm text-gray-500">
                  Intenta con otros términos de búsqueda
                </p>
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
      />

      <GradeModal
        show={showGradeModal}
        project={projectToGrade}
        gradeValue={gradeValue}
        setGradeValue={setGradeValue}
        gradingProject={gradingProject}
        onGrade={handleGradeProject}
        onClose={closeGradeModal}
      />
    </div>
  );
}
