export function ProjectDetailsModal({
  show,
  project,
  onClose,
  getLineaName,
  getSublineaName,
  getAreaName,
  getEventoName,
}) {
  if (!show || !project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 overflow-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h3 className="text-xl font-bold text-gray-900">Detalles del Proyecto</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <i className="pi pi-times text-xl"></i>
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-6">
          {/* Título y Estado */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h4 className="text-2xl font-bold text-gray-900 mb-2">
                {project.titulo_proyecto || "Sin título"}
              </h4>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <i className="pi pi-users"></i>
                  {project.id_estudiantes?.length || 0} estudiante(s)
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <i className="pi pi-book"></i>
                  {project.codigo_materia || "N/A"} - Grupo {project.id_grupo || "N/A"}
                </span>
              </div>
            </div>
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${
                project.calificacion
                  ? "bg-emerald-100 text-emerald-800"
                  : project.activo
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {project.calificacion
                ? `Calificado: ${project.calificacion}`
                : project.activo
                ? "Pendiente"
                : "Inactivo"}
            </span>
          </div>

          {/* Información del Proyecto */}
          <div>
            <h5 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <i className="pi pi-align-left text-emerald-600"></i>
              Información del Proyecto
            </h5>
            <div className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg space-y-2">
              <p>
                <span className="font-medium">Tipo de Actividad:</span>{" "}
                {project.tipo_actividad === 1
                  ? "Proyecto (Exposoftware)"
                  : project.tipo_actividad === 2
                  ? "Taller"
                  : project.tipo_actividad === 3
                  ? "Ponencia"
                  : project.tipo_actividad === 4
                  ? "Conferencia"
                  : "No especificado"}
              </p>
              <p>
                <span className="font-medium">Fecha de Subida:</span>{" "}
                {project.fecha_subida
                  ? new Date(project.fecha_subida).toLocaleDateString("es-ES")
                  : "No disponible"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Información Adicional */}
            <div className="space-y-4">
              <h5 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <i className="pi pi-info-circle text-emerald-600"></i>
                Información Adicional
              </h5>
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Materia</p>
                  <p className="text-sm font-medium text-gray-900">
                    {project.codigo_materia || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Grupo</p>
                  <p className="text-sm font-medium text-gray-900">
                    Grupo {project.id_grupo || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Evento</p>
                  <p className="text-sm font-medium text-gray-900">
                    {getEventoName(project.id_evento)}
                  </p>
                </div>
              </div>
            </div>

            {/* Líneas de Investigación */}
            <div className="space-y-4">
              <h5 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <i className="pi pi-sitemap text-emerald-600"></i>
                Líneas de Investigación
              </h5>
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Línea de Investigación</p>
                  <p className="text-sm font-medium text-gray-900">
                    {getLineaName(project.codigo_linea)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Sublínea</p>
                  <p className="text-sm font-medium text-gray-900">
                    {getSublineaName(project.codigo_sublinea)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Área</p>
                  <p className="text-sm font-medium text-gray-900">
                    {getAreaName(project.codigo_area)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Participantes */}
          <div>
            <h5 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <i className="pi pi-users text-emerald-600"></i>
              Estudiantes Participantes
            </h5>
            <div className="flex flex-wrap gap-2">
              {project.id_estudiantes && project.id_estudiantes.length > 0 ? (
                project.id_estudiantes.map((estudiante, idx) => {
                  const nombreEstudiante =
                    typeof estudiante === "object"
                      ? estudiante.nombre
                      : `Estudiante ${idx + 1}`;
                  return (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 px-3 py-2 rounded-full text-sm font-medium"
                    >
                      <div className="w-6 h-6 bg-emerald-200 rounded-full flex items-center justify-center">
                        <i className="pi pi-user text-emerald-800 text-xs"></i>
                      </div>
                      {nombreEstudiante}
                    </span>
                  );
                })
              ) : (
                <span className="text-sm text-gray-500">
                  No hay estudiantes asignados
                </span>
              )}
            </div>
          </div>

          {/* Archivos Adjuntos */}
          <div>
            <h5 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <i className="pi pi-paperclip text-emerald-600"></i>
              Archivos Adjuntos
            </h5>
            {project.archivo_pdf ? (
              <div className="grid grid-cols-1 gap-3">
                <div className="border border-gray-200 rounded-lg p-3 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 bg-red-100 rounded flex items-center justify-center flex-shrink-0">
                    <i className="pi pi-file-pdf text-red-600 text-lg"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      Documento del Proyecto
                    </p>
                    <p className="text-xs text-gray-500">PDF</p>
                  </div>
                  <a
                    href={project.archivo_pdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 hover:text-emerald-700"
                  >
                    <i className="pi pi-external-link"></i>
                  </a>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">
                No hay archivos adjuntos
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export function GradeModal({
  show,
  project,
  gradeValue,
  setGradeValue,
  gradingProject,
  onGrade,
  onClose,
}) {
  if (!show || !project) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <i className="pi pi-pencil text-yellow-500"></i>
              Calificar Proyecto
            </h3>
            <button
              onClick={onClose}
              disabled={gradingProject}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            >
              <i className="pi pi-times text-xl"></i>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-900 mb-1">Proyecto:</p>
            <p className="text-base font-semibold text-blue-800">
              {project.titulo_proyecto}
            </p>
            {project.calificacion && (
              <p className="text-sm text-blue-700 mt-2">
                Calificación actual:{" "}
                <span className="font-bold">{project.calificacion}</span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Calificación (0.0 - 5.0)
            </label>
            <input
              type="number"
              min="0"
              max="5"
              step="0.1"
              value={gradeValue}
              onChange={(e) => setGradeValue(e.target.value)}
              disabled={gradingProject}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-lg font-semibold text-center"
              placeholder="Ej: 4.5"
            />
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>Mínimo: 0.0</span>
              <span>Máximo: 5.0</span>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-xs text-gray-600">
              <strong>Nota:</strong> Si la nota es mayor o igual a 3.0, el proyecto será
              marcado como{" "}
              <span className="text-green-600 font-semibold">aprobado</span>. Si es menor
              a 3.0, será marcado como{" "}
              <span className="text-red-600 font-semibold">reprobado</span>.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3 rounded-b-xl">
          <button
            onClick={onClose}
            disabled={gradingProject}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            onClick={onGrade}
            disabled={gradingProject || !gradeValue}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {gradingProject ? (
              <>
                <i className="pi pi-spin pi-spinner"></i>
                Guardando...
              </>
            ) : (
              <>
                <i className="pi pi-check"></i>
                Guardar Calificación
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
