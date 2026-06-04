import { useState, useEffect } from "react";

export function ProjectDetailsModal({
  show,
  project,
  onClose,
  getLineaName,
  getSublineaName,
  getAreaName,
  getEventoName,
  calificacionPopular,
  loadingCalificacionPopular,
}) {
  const obtenerNombreEstudiante = (estudiante) => {
    if (typeof estudiante === 'string') return estudiante;
    if (estudiante?.nombre) return estudiante.nombre;
    if (estudiante?.nombre_completo) return estudiante.nombre_completo;
    if (estudiante?.p_nombre && estudiante?.p_apellido) {
      return `${estudiante.p_nombre} ${estudiante.p_apellido}`;
    }
    if (estudiante?.usuario?.p_nombre && estudiante?.usuario?.p_apellido) {
      return `${estudiante.usuario.p_nombre} ${estudiante.usuario.p_apellido}`;
    }
    return 'Estudiante';
  };

  const obtenerNombreDocente = (docente) => {
    if (typeof docente === 'string') return docente;
    if (docente?.nombre) return docente.nombre;
    if (docente?.nombre_completo) return docente.nombre_completo;
    if (docente?.p_nombre && docente?.p_apellido) {
      return `${docente.p_nombre} ${docente.p_apellido}`;
    }
    if (docente?.usuario?.p_nombre && docente?.usuario?.p_apellido) {
      return `${docente.usuario.p_nombre} ${docente.usuario.p_apellido}`;
    }
    return 'Docente';
  };

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
                  {project.codigo_materia || "N/A"} - Grupo {project.nombre_grupo || "N/A"}
                </span>
              </div>
            </div>
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${
                project.estado === "aprobado" || project.estado === "rechazado"
                  ? project.estado === "aprobado"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-red-100 text-red-800"
                  : project.estado === "pendiente"
                  ? "bg-amber-100 text-amber-800"
                  : project.calificacion
                  ? "bg-emerald-100 text-emerald-800"
                  : project.activo
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {project.estado === "aprobado"
                ? "✅ Aprobado"
                : project.estado === "pendiente"
                ? "⏳ Pendiente"
                : project.estado === "rechazado"
                ? "❌ Rechazado"
                : project.calificacion
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
                {(() => {
                  const tipo = project.tipo_actividad || project.id_tipo_actividad;
                  return tipo === 1
                    ? "Proyecto (Exposoftware)"
                    : tipo === 2
                    ? "Taller"
                    : tipo === 3
                    ? "Ponencia"
                    : tipo === 4
                    ? "Conferencia"
                    : "No especificado";
                })()}
              </p>
              <p>
                <span className="font-medium">Fecha de Subida:</span>{" "}
                {project.fecha_subida || project.created_at
                  ? new Date(project.fecha_subida || project.created_at).toLocaleDateString("es-ES")
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
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {project.nombre_materia || project.codigo_materia || "No especificada"}
                    </p>
                    {project.codigo_materia && project.nombre_materia && (
                      <p className="text-xs text-gray-600">
                        {project.codigo_materia}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Grupo</p>
                  <p className="text-sm font-medium text-gray-900">
                    {project.nombre_grupo ? `Grupo ${project.nombre_grupo}` : project.id_grupo ? `Grupo ${project.id_grupo}` : "No especificado"}
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

          {/* Estudiantes Participantes */}
          <div>
            <h5 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <i className="pi pi-users text-emerald-600"></i>
              Estudiantes Participantes ({project.id_estudiantes?.length || 0})
            </h5>
            {project.id_estudiantes && project.id_estudiantes.length > 0 ? (
              <div className="space-y-2">
                {project.id_estudiantes.map((estudiante, idx) => {
                  const esLider = typeof estudiante === "object" && estudiante.es_lider;
                  const nombreEstudiante = obtenerNombreEstudiante(estudiante);
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <i className={`pi text-emerald-600 text-sm ${esLider ? "pi-crown" : "pi-user"}`}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {nombreEstudiante}
                        </p>
                        {esLider && (
                          <p className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded inline-block">
                            👑 Líder del proyecto
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <span className="text-sm text-gray-500">
                No hay estudiantes asignados
              </span>
            )}
          </div>

          {/* Docentes Responsables */}
          {(project.docentes_materias?.length > 0 || project.id_docente) && (
            <div>
              <h5 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <i className="pi pi-users text-blue-600"></i>
                Docentes Responsables ({project.docentes_materias?.length || 1})
              </h5>
              <div className="space-y-2">
                {project.docentes_materias && project.docentes_materias.length > 0 ? (
                  project.docentes_materias.map((docente, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200"
                    >
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <i className="pi pi-user text-blue-600 text-sm"></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {docente.nombre_docente}
                        </p>
                        {docente.nombre_materia && (
                          <p className="text-xs text-blue-700 mt-1">
                            <i className="pi pi-book text-xs mr-1"></i>
                            {docente.nombre_materia} (Grupo {docente.nombre_grupo})
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : project.id_docente ? (
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <i className="pi pi-user text-blue-600 text-sm"></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {obtenerNombreDocente(project.id_docente)}
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          )}

          {/* Documento del Proyecto */}
          {project.url_preview_png || project.archivo_pdf || project.url_cloudinary ? (
            <div>
              <h5 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <i className="pi pi-file-pdf text-emerald-600"></i>
                Documento del Proyecto
              </h5>
              <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                {project.url_preview_png ? (
                  <img
                    src={project.url_preview_png}
                    alt="Vista previa PDF"
                    className="w-full h-auto object-contain max-h-96"
                  />
                ) : (
                  <iframe
                    src={project.archivo_pdf || project.url_cloudinary}
                    title="Vista previa PDF"
                    width="100%"
                    height="500"
                    style={{ border: 'none' }}
                  />
                )}
              </div>
              <div className="mt-4 flex items-center gap-3">
                <a
                  href={project.archivo_pdf || project.url_cloudinary}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors font-medium text-sm"
                >
                  <i className="pi pi-external-link"></i>
                  Abrir en nueva ventana
                </a>
                <a
                  href={project.archivo_pdf || project.url_cloudinary}
                  download
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm"
                >
                  <i className="pi pi-download"></i>
                  Descargar PDF
                </a>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
              <i className="pi pi-info-circle text-yellow-600 text-2xl mb-2"></i>
              <p className="text-sm text-yellow-800 font-medium">
                No hay documento adjunto para este proyecto
              </p>
            </div>
          )}

          {/* Calificación Popular y Ranking */}
          {loadingCalificacionPopular ? (
            <div className="flex items-center justify-center p-4">
              <div className="w-6 h-6 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
              <p className="ml-2 text-sm text-gray-600">Cargando calificación del público...</p>
            </div>
          ) : calificacionPopular ? (
            <div>
              <h5 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <i className="pi pi-star-fill text-yellow-500"></i>
                Calificación Popular del Público
              </h5>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-indigo-200 rounded-lg p-4 space-y-4">
                {/* Nota Principal */}
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-indigo-700">
                      {calificacionPopular.promedio_ponderado ? calificacionPopular.promedio_ponderado.toFixed(2) : "0.00"}
                    </p>
                    <p className="text-xs text-indigo-600 font-medium">/ 5.0</p>
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">Promedio Ponderado:</span>
                      <span className="text-sm text-gray-900 font-semibold">
                        {calificacionPopular.promedio_ponderado ? calificacionPopular.promedio_ponderado.toFixed(2) : "0.00"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">Total de Votos:</span>
                      <span className="text-sm text-gray-900 font-semibold">
                        {calificacionPopular.total_votos || 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Desglose por Rol */}
                {calificacionPopular.desglose_por_rol && Object.keys(calificacionPopular.desglose_por_rol).length > 0 && (
                  <div className="border-t border-indigo-100 pt-3">
                    <p className="text-xs font-semibold text-gray-600 mb-2">Desglose por Rol:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(calificacionPopular.desglose_por_rol).map(([rol, datos]) => (
                        <div key={rol} className="bg-white rounded p-2 border border-indigo-100">
                          <p className="text-xs font-medium text-gray-700 capitalize">{rol}</p>
                          <p className="text-sm font-bold text-indigo-600">
                            {datos.promedio ? datos.promedio.toFixed(2) : "0.00"}
                          </p>
                          {datos.cantidad && (
                            <p className="text-xs text-gray-500">({datos.cantidad} {datos.cantidad === 1 ? 'voto' : 'votos'})</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {calificacionPopular.total_votos === 0 && (
                  <div className="text-center py-2">
                    <p className="text-sm text-gray-600">
                      <i className="pi pi-info-circle mr-2"></i>
                      Este proyecto aún no tiene calificaciones del público
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : null}
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
  approvingProject,
  onGrade,
  onApprove,
  onClose,
}) {
  if (!show || !project) return null;

  const getEstadoInfo = () => {
    switch (project.estado) {
      case 'pendiente':
        return {
          titulo: 'Registrar Nota',
          subtitulo: '(el proyecto sigue sin aprobar para el evento)',
          botonPrincipal: 'Registrar Nota',
          mostrarBotonAprobar: true,
          subtituloBotonAprobar: 'Aprobar proyecto para vitrina'
        };
      case 'rechazado':
        return {
          titulo: 'Registrar Nota',
          subtitulo: '(el proyecto sigue rechazado)',
          botonPrincipal: 'Registrar Nota',
          mostrarBotonAprobar: false,
          subtituloBotonAprobar: ''
        };
      case 'aprobado':
        return {
          titulo: 'Calificar',
          subtitulo: '(al calificar todos los docentes pasa a calificado)',
          botonPrincipal: 'Calificar',
          mostrarBotonAprobar: false,
          subtituloBotonAprobar: ''
        };
      case 'calificado':
        return {
          titulo: 'Actualizar Nota',
          subtitulo: '(corregir nota)',
          botonPrincipal: 'Actualizar Nota',
          mostrarBotonAprobar: false,
          subtituloBotonAprobar: ''
        };
      default:
        return {
          titulo: 'Calificar',
          subtitulo: '',
          botonPrincipal: 'Calificar',
          mostrarBotonAprobar: false,
          subtituloBotonAprobar: ''
        };
    }
  };

  const estadoInfo = getEstadoInfo();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <i className="pi pi-pencil text-yellow-500"></i>
              {estadoInfo.titulo}
            </h3>
            <button
              onClick={onClose}
              disabled={gradingProject || approvingProject}
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
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs font-medium text-blue-700">Estado:</span>
              <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                project.estado === 'aprobado' ? 'bg-green-100 text-green-800' :
                project.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                project.estado === 'rechazado' ? 'bg-red-100 text-red-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {project.estado === 'aprobado' ? '✅ Aprobado' :
                 project.estado === 'pendiente' ? '⏳ Pendiente' :
                 project.estado === 'rechazado' ? '❌ Rechazado' :
                 project.estado === 'calificado' ? '⭐ Calificado' :
                 project.estado}
              </span>
            </div>
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
              disabled={gradingProject || approvingProject}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-lg font-semibold text-center"
              placeholder="Ej: 4.5"
            />
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>Mínimo: 0.0</span>
              <span>Máximo: 5.0</span>
            </div>
          </div>

          {estadoInfo.subtitulo && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-xs text-gray-600">
                <i className="pi pi-info-circle mr-2"></i>
                {estadoInfo.subtitulo}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col gap-3 rounded-b-xl">
          {estadoInfo.mostrarBotonAprobar && (
            <button
              onClick={onApprove}
              disabled={approvingProject || gradingProject}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              title={estadoInfo.subtituloBotonAprobar}
            >
              {approvingProject ? (
                <>
                  <i className="pi pi-spin pi-spinner"></i>
                  Aprobando...
                </>
              ) : (
                <>
                  <i className="pi pi-check-circle"></i>
                  Aprobar y Registrar Nota
                </>
              )}
            </button>
          )}
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              disabled={gradingProject || approvingProject}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              onClick={onGrade}
              disabled={gradingProject || approvingProject || !gradeValue}
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
                  {estadoInfo.botonPrincipal}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProjectActionModal({
  show,
  project,
  gradeValue,
  setGradeValue,
  gradingProject,
  approvingProject,
  rejectingProject,
  showRejectReason,
  setShowRejectReason,
  rejectReason,
  setRejectReason,
  onGrade,
  onApprove,
  onReject,
  onClose,
  calificacionPopular,
  loadingCalificacionPopular,
}) {
  const [activeTab, setActiveTab] = useState("resumen");

  if (!show || !project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 overflow-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h3 className="text-xl font-bold text-gray-900">Gestionar Proyecto</h3>
          <button
            onClick={onClose}
            disabled={gradingProject || approvingProject || rejectingProject}
            className="text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
          >
            <i className="pi pi-times text-xl"></i>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50">
          <button
            onClick={() => setActiveTab("resumen")}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === "resumen"
                ? "text-emerald-600 border-b-2 border-emerald-600 bg-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <i className="pi pi-info-circle mr-2"></i>
            Resumen
          </button>
          <button
            onClick={() => setActiveTab("ranking")}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === "ranking"
                ? "text-amber-600 border-b-2 border-amber-600 bg-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <i className="pi pi-star-fill mr-2"></i>
            Ranking
          </button>
          <button
            onClick={() => setActiveTab("acciones")}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === "acciones"
                ? "text-blue-600 border-b-2 border-blue-600 bg-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <i className="pi pi-cog mr-2"></i>
            Acciones
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Tab: Resumen */}
          {activeTab === "resumen" && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <h4 className="text-lg font-bold text-gray-900 mb-2">
                  {project.titulo_proyecto || "Sin título"}
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Estudiantes</p>
                    <p className="text-lg font-semibold text-emerald-700">
                      {project.id_estudiantes?.length || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Materia</p>
                    <p className="text-lg font-semibold text-emerald-700">
                      {project.nombre_materia || project.codigo_materia || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Grupo</p>
                    <p className="text-lg font-semibold text-emerald-700">
                      {project.nombre_grupo || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Estado</p>
                    <p className={`text-lg font-semibold ${
                      project.estado === "aprobado"
                        ? "text-emerald-700"
                        : project.estado === "pendiente"
                        ? "text-amber-700"
                        : project.estado === "rechazado"
                        ? "text-red-700"
                        : "text-gray-700"
                    }`}>
                      {project.estado === "aprobado"
                        ? "✅ Aprobado"
                        : project.estado === "pendiente"
                        ? "⏳ Pendiente"
                        : project.estado === "rechazado"
                        ? "❌ Rechazado"
                        : project.calificacion
                        ? `Calificado: ${project.calificacion}`
                        : project.activo
                        ? "Pendiente"
                        : "Inactivo"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Ranking */}
          {activeTab === "ranking" && (
            <div className="space-y-4">
              {loadingCalificacionPopular ? (
                <div className="flex items-center justify-center p-8">
                  <div className="w-6 h-6 border-2 border-amber-200 border-t-amber-600 rounded-full animate-spin"></div>
                  <p className="ml-2 text-sm text-gray-600">Cargando ranking...</p>
                </div>
              ) : calificacionPopular ? (
                <>
                  {/* Rating Display */}
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-6 text-center">
                    <p className="text-5xl font-bold text-amber-700 mb-1">
                      {calificacionPopular.promedio_ponderado
                        ? calificacionPopular.promedio_ponderado.toFixed(2)
                        : "0.00"}
                    </p>
                    <p className="text-sm text-amber-600 font-medium mb-4">/ 5.0</p>
                    <p className="text-sm text-gray-700">
                      Total de votos:{" "}
                      <span className="font-bold text-amber-700">
                        {calificacionPopular.total_votos || 0}
                      </span>
                    </p>
                  </div>

                  {/* Desglose por Rol */}
                  {calificacionPopular.desglose_por_rol &&
                    Object.keys(calificacionPopular.desglose_por_rol).length > 0 && (
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h5 className="text-sm font-semibold text-gray-900 mb-3">
                          Desglose por Rol
                        </h5>
                        <div className="grid grid-cols-2 gap-3">
                          {Object.entries(
                            calificacionPopular.desglose_por_rol
                          ).map(([rol, datos]) => (
                            <div
                              key={rol}
                              className="bg-gray-50 border border-gray-200 rounded p-3"
                            >
                              <p className="text-xs font-medium text-gray-600 capitalize mb-1">
                                {rol}
                              </p>
                              <p className="text-lg font-bold text-amber-600">
                                {datos.promedio
                                  ? datos.promedio.toFixed(2)
                                  : "0.00"}
                              </p>
                              {datos.cantidad && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {datos.cantidad}{" "}
                                  {datos.cantidad === 1 ? "voto" : "votos"}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {calificacionPopular.total_votos === 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                      <p className="text-sm text-yellow-800">
                        <i className="pi pi-info-circle mr-2"></i>
                        Este proyecto aún no tiene calificaciones del público
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600">
                    No hay datos de ranking disponibles
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tab: Acciones */}
          {activeTab === "acciones" && (
            <div className="space-y-6">
              {/* Calificar */}
              <div className="border-l-4 border-blue-500 bg-blue-50 border border-blue-200 rounded p-4">
                <h5 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <i className="pi pi-pencil"></i>
                  Calificar Proyecto
                </h5>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 text-sm font-semibold text-center"
                      placeholder="Ej: 4.5"
                    />
                    <div className="flex justify-between mt-1 text-xs text-gray-500">
                      <span>≥ 3.0 = Aprobado</span>
                      <span>&lt; 3.0 = Reprobado</span>
                    </div>
                  </div>
                  <button
                    onClick={onGrade}
                    disabled={gradingProject || !gradeValue}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm flex items-center justify-center gap-2"
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

              {/* Aprobar */}
              <div className="border-l-4 border-green-500 bg-green-50 border border-green-200 rounded p-4">
                <h5 className="text-sm font-semibold text-green-900 mb-2 flex items-center gap-2">
                  <i className="pi pi-check"></i>
                  Aprobar Proyecto
                </h5>
                <p className="text-xs text-green-800 mb-3">
                  El proyecto pasará al estado <strong>Aprobado</strong> y será visible en
                  los eventos.
                </p>
                <button
                  onClick={onApprove}
                  disabled={approvingProject}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm flex items-center justify-center gap-2"
                >
                  {approvingProject ? (
                    <>
                      <i className="pi pi-spin pi-spinner"></i>
                      Aprobando...
                    </>
                  ) : (
                    <>
                      <i className="pi pi-check-circle"></i>
                      Aprobar Proyecto
                    </>
                  )}
                </button>
              </div>

              {/* Rechazar */}
              <div className="border-l-4 border-red-500 bg-red-50 border border-red-200 rounded p-4">
                <h5 className="text-sm font-semibold text-red-900 mb-2 flex items-center gap-2">
                  <i className="pi pi-times"></i>
                  Rechazar Proyecto
                </h5>
                <p className="text-xs text-red-800 mb-3">
                  El proyecto pasará al estado <strong>Rechazado</strong>. Puedes agregar
                  una razón.
                </p>
                <div className="space-y-3">
                  {!showRejectReason && (
                    <button
                      onClick={() => setShowRejectReason(true)}
                      className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm flex items-center justify-center gap-2"
                    >
                      <i className="pi pi-times-circle"></i>
                      Rechazar Proyecto
                    </button>
                  )}
                  {showRejectReason && (
                    <>
                      <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Razón del rechazo (opcional)..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm resize-none"
                        rows="3"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setShowRejectReason(false);
                            setRejectReason("");
                          }}
                          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium text-sm"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={onReject}
                          disabled={rejectingProject}
                          className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm flex items-center justify-center gap-2"
                        >
                          {rejectingProject ? (
                            <>
                              <i className="pi pi-spin pi-spinner"></i>
                              Rechazando...
                            </>
                          ) : (
                            <>
                              <i className="pi pi-check"></i>
                              Confirmar Rechazo
                            </>
                          )}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end">
          <button
            onClick={onClose}
            disabled={gradingProject || approvingProject || rejectingProject}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
