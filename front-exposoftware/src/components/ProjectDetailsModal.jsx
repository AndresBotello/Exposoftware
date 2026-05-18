export default function ProjectDetailsModal({
  selectedProject,
  eventoInfo,
  user,
  onClose,
  onDownloadCertificado,
  onDownloadTodosCertificados
}) {
  const obtenerNombreTipoActividad = (tipoId) => {
    const tipos = {
      1: 'Proyecto (Exposoftware)',
      2: 'Taller',
      3: 'Ponencia',
      4: 'Conferencia'
    };
    return tipos[tipoId] || 'Tipo desconocido';
  };

  if (!selectedProject) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-auto" onClick={onClose}>
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
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-red-50 flex items-center justify-center text-gray-500 hover:text-red-500 transition-all duration-200"
          >
            <i className="pi pi-times text-sm"></i>
          </button>
        </div>

        {/* Contenido del modal */}
        <div className="p-6">
          <div className="space-y-5">
            {/* Tipo de Actividad */}
            {selectedProject.tipo_actividad && (
              <div className="pb-3">
                <span className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs px-4 py-2 rounded-full font-semibold">
                  <i className="pi pi-tag text-emerald-600"></i>
                  {obtenerNombreTipoActividad(selectedProject.tipo_actividad)}
                </span>
              </div>
            )}

            {/* Título */}
            <div className="pb-4 border-b border-gray-100">
              <h4 className="text-2xl font-extrabold text-gray-900 leading-snug">
                {selectedProject.titulo_proyecto || selectedProject.nombre_proyecto || 'Proyecto sin título'}
              </h4>
            </div>

            {/* Docente */}
            {selectedProject.id_docente && (
              <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <i className="pi pi-user text-emerald-600 text-sm"></i>
                  <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">Docente Responsable</p>
                </div>
                <p className="text-base font-semibold text-emerald-900">
                  {selectedProject.id_docente.nombre || selectedProject.id_docente}
                </p>
              </div>
            )}

            {/* Estudiantes */}
            {selectedProject.id_estudiantes && selectedProject.id_estudiantes.length > 0 && (
              <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <i className="pi pi-users text-indigo-600 text-sm"></i>
                  <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">
                    Estudiantes Participantes ({selectedProject.id_estudiantes.length})
                  </p>
                </div>
                <ul className="space-y-2">
                  {selectedProject.id_estudiantes.map((e, idx) => (
                    <li key={idx} className="text-sm text-indigo-800 flex items-center gap-2.5 bg-white/60 rounded-lg px-3 py-2">
                      <div className="w-6 h-6 rounded-full bg-indigo-200 flex items-center justify-center flex-shrink-0">
                        <i className="pi pi-user text-[10px] text-indigo-600"></i>
                      </div>
                      <span className="font-medium">{typeof e === 'string' ? e : e.nombre || e.nombre_completo || e}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Grupo */}
            {selectedProject.id_grupo && (
              <div className="bg-teal-50/70 border border-teal-100 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <i className="pi pi-sitemap text-teal-600 text-sm"></i>
                  <p className="text-xs font-semibold text-teal-700 uppercase tracking-wide">Grupo Académico</p>
                </div>
                <p className="text-base font-semibold text-teal-900">{selectedProject.id_grupo}</p>
              </div>
            )}

            {/* Línea de Investigación */}
            {selectedProject.nombre_linea && (
              <div className="bg-purple-50/70 border border-purple-100 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <i className="pi pi-bookmark text-purple-600 text-sm"></i>
                  <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Línea de Investigación</p>
                </div>
                <p className="text-base font-semibold text-purple-900">{selectedProject.nombre_linea}</p>
              </div>
            )}

            {/* Sublínea */}
            {selectedProject.nombre_sublinea && (
              <div className="bg-amber-50/70 border border-amber-100 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <i className="pi pi-directions text-amber-600 text-sm"></i>
                  <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Sublínea</p>
                </div>
                <p className="text-base font-semibold text-amber-900">{selectedProject.nombre_sublinea}</p>
              </div>
            )}

            {/* Materia */}
            {selectedProject.nombre_materia && (
              <div className="bg-orange-50/70 border border-orange-100 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <i className="pi pi-book text-orange-600 text-sm"></i>
                  <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide">Materia</p>
                </div>
                <p className="text-base font-semibold text-orange-900">{selectedProject.nombre_materia}</p>
              </div>
            )}

            {/* Evento */}
            {(selectedProject.id_evento || eventoInfo) && (
              <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <i className="pi pi-calendar text-blue-600 text-sm"></i>
                  <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Evento</p>
                </div>
                <p className="text-base font-semibold text-blue-900">
                  {eventoInfo?.nombre_evento || selectedProject.nombre_evento || 'Evento'}
                </p>
              </div>
            )}

            {/* Calificación y Estado */}
            {(selectedProject.calificacion !== undefined || selectedProject.estado_calificacion) && (
              <div className="grid grid-cols-2 gap-3">
                {selectedProject.calificacion !== undefined && (
                  <div className="bg-yellow-50/70 border border-yellow-100 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1.5">
                      <i className="pi pi-star-fill text-yellow-500 text-sm"></i>
                      <p className="text-xs font-semibold text-yellow-700 uppercase tracking-wide">Calificación</p>
                    </div>
                    <p className="text-2xl font-extrabold text-yellow-900">
                      {selectedProject.calificacion}
                      <span className="text-xs text-yellow-700 font-normal ml-1">/5</span>
                    </p>
                  </div>
                )}

                {selectedProject.estado_calificacion && (
                  <div className={`rounded-xl p-4 border ${
                    selectedProject.estado_calificacion.toLowerCase().includes('aprobado')
                      ? 'bg-emerald-50/70 border-emerald-100'
                      : selectedProject.estado_calificacion.toLowerCase().includes('rechazado')
                      ? 'bg-red-50/70 border-red-100'
                      : 'bg-gray-50/70 border-gray-100'
                  }`}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <i className={`pi ${
                        selectedProject.estado_calificacion.toLowerCase().includes('aprobado')
                          ? 'pi-check-circle text-emerald-600'
                          : selectedProject.estado_calificacion.toLowerCase().includes('rechazado')
                          ? 'pi-times-circle text-red-600'
                          : 'pi-clock text-gray-600'
                      } text-sm`}></i>
                      <p className={`text-xs font-semibold uppercase tracking-wide ${
                        selectedProject.estado_calificacion.toLowerCase().includes('aprobado')
                          ? 'text-emerald-700'
                          : selectedProject.estado_calificacion.toLowerCase().includes('rechazado')
                          ? 'text-red-700'
                          : 'text-gray-700'
                      }`}>
                        Estado
                      </p>
                    </div>
                    <p className={`text-base font-semibold ${
                      selectedProject.estado_calificacion.toLowerCase().includes('aprobado')
                        ? 'text-emerald-900'
                        : selectedProject.estado_calificacion.toLowerCase().includes('rechazado')
                        ? 'text-red-900'
                        : 'text-gray-900'
                    }`}>
                      {selectedProject.estado_calificacion}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Botones de descargar certificado */}
            {onDownloadCertificado && (
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={() => onDownloadCertificado(selectedProject)}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-emerald-200/40 hover:shadow-xl hover:shadow-emerald-200/60"
                >
                  <i className="pi pi-download text-sm"></i>
                  Mi Certificado
                </button>
                {onDownloadTodosCertificados && (
                  <button
                    onClick={() => onDownloadTodosCertificados(selectedProject)}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-blue-200/40 hover:shadow-xl hover:shadow-blue-200/60"
                  >
                    <i className="pi pi-download text-sm"></i>
                    Todos los Certificados
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
