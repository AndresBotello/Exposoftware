import { useState, useEffect } from 'react';
import InvestigacionService from '../Services/InvestigacionService';

export default function ProjectDetailsModal({
  selectedProject,
  eventoInfo,
  user,
  onClose,
  onDownloadCertificado,
  onDownloadTodosCertificados,
  token,
  onOpenAddMember
}) {
  const [investigacionNames, setInvestigacionNames] = useState({
    linea: selectedProject?.nombre_linea || null,
    sublinea: selectedProject?.nombre_sublinea || null,
    area: selectedProject?.nombre_area || null
  });

  useEffect(() => {
    // Si ya tiene nombres en el proyecto, no hacer peticiones
    if (selectedProject?.nombre_linea || selectedProject?.nombre_sublinea || selectedProject?.nombre_area) {
      setInvestigacionNames({
        linea: selectedProject?.nombre_linea || null,
        sublinea: selectedProject?.nombre_sublinea || null,
        area: selectedProject?.nombre_area || null
      });
      return;
    }

    const fetchInvestigacionNames = async () => {
      if (!selectedProject?.codigo_linea) return;

      try {
        const names = await InvestigacionService.obtenerNombresInvestigacion(
          selectedProject.codigo_linea,
          selectedProject.codigo_sublinea,
          selectedProject.codigo_area
        );
        setInvestigacionNames(names);
      } catch (error) {
        setInvestigacionNames({ linea: null, sublinea: null, area: null });
      }
    };

    fetchInvestigacionNames();
  }, [selectedProject?.codigo_linea, selectedProject?.codigo_sublinea, selectedProject?.codigo_area]);

  const obtenerNombreTipoActividad = (tipoId) => {
    const tipos = {
      1: 'Proyecto (Exposoftware)',
      2: 'Taller',
      3: 'Ponencia',
      4: 'Conferencia'
    };
    return tipos[tipoId] || 'Tipo desconocido';
  };

  const obtenerEstadoBadge = (estado) => {
    if (!estado) return { color: 'bg-gray-100 text-gray-800', label: 'Sin estado' };

    const estadoNorm = estado.toLowerCase();
    const estados = {
      'pendiente': { color: 'bg-yellow-100 text-yellow-800', label: 'Pendiente' },
      'aprobado': { color: 'bg-green-100 text-green-800', label: 'Aprobado' },
      'rechazado': { color: 'bg-red-100 text-red-800', label: 'Rechazado' },
      'revisión': { color: 'bg-blue-100 text-blue-800', label: 'En Revisión' }
    };
    return estados[estadoNorm] || { color: 'bg-gray-100 text-gray-800', label: estado };
  };

  const obtenerNombreParticipante = (participante) => {
    if (typeof participante === 'string') return participante;
    if (participante?.nombre) return participante.nombre;
    if (participante?.nombre_completo) return participante.nombre_completo;
    if (participante?.p_nombre && participante?.p_apellido) {
      return `${participante.p_nombre} ${participante.p_apellido}`;
    }
    return 'Participante';
  };

  if (!selectedProject) return null;

  const participantes = selectedProject.integrantes || selectedProject.id_estudiantes || [];
  const estadoBadge = obtenerEstadoBadge(selectedProject.estado);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 overflow-auto" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
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
                {selectedProject.titulo_proyecto || selectedProject.nombre_proyecto || 'Sin título'}
              </h4>
              <div className="flex items-center gap-3 text-sm text-gray-600 flex-wrap">
                {selectedProject.tipo_actividad && (
                  <>
                    <span className="flex items-center gap-1">
                      <i className="pi pi-tag"></i>
                      {obtenerNombreTipoActividad(selectedProject.tipo_actividad)}
                    </span>
                    <span>•</span>
                  </>
                )}
                {participantes.length > 0 && (
                  <>
                    <span className="flex items-center gap-1">
                      <i className="pi pi-users"></i>
                      {participantes.length} estudiante(s)
                    </span>
                    <span>•</span>
                  </>
                )}
                {selectedProject.nombre_grupo || selectedProject.id_grupo && (
                  <span className="flex items-center gap-1">
                    <i className="pi pi-sitemap"></i>
                    Grupo {selectedProject.nombre_grupo || selectedProject.id_grupo}
                  </span>
                )}
              </div>
            </div>
            {selectedProject.estado && (
              <span className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${estadoBadge.color}`}>
                {estadoBadge.label}
              </span>
            )}
          </div>

          {/* Información del Proyecto */}
          <div>
            <h5 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <i className="pi pi-align-left text-emerald-600"></i>
              Información del Proyecto
            </h5>
            <div className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg space-y-2">
              {selectedProject.tipo_actividad && (
                <p>
                  <span className="font-medium">Tipo de Actividad:</span>{" "}
                  {obtenerNombreTipoActividad(selectedProject.tipo_actividad)}
                </p>
              )}
              {selectedProject.estado && (
                <p>
                  <span className="font-medium">Estado:</span>{" "}
                  {selectedProject.estado.charAt(0).toUpperCase() + selectedProject.estado.slice(1)}
                </p>
              )}
              {selectedProject.calificacion !== undefined && (
                <p>
                  <span className="font-medium">Calificación:</span> {selectedProject.calificacion} / 5
                </p>
              )}
            </div>
          </div>

          {/* Grid de dos columnas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Información Adicional */}
            <div className="space-y-4">
              <h5 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <i className="pi pi-info-circle text-emerald-600"></i>
                Información Adicional
              </h5>
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                {selectedProject.nombre_materia && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Materia</p>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedProject.nombre_materia}
                    </p>
                  </div>
                )}
                {(selectedProject.nombre_grupo || selectedProject.id_grupo) && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Grupo</p>
                    <p className="text-sm font-medium text-gray-900">
                      Grupo {selectedProject.nombre_grupo || selectedProject.id_grupo}
                    </p>
                  </div>
                )}
                {(selectedProject.docentes_materias?.length > 0 || selectedProject.nombre_docente || selectedProject.id_docente) && (
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Docente(s) Responsable(s)</p>
                    <div className="space-y-2">
                      {selectedProject.docentes_materias && selectedProject.docentes_materias.length > 0 ? (
                        selectedProject.docentes_materias.map((docente, idx) => (
                          <div key={idx} className="text-sm font-medium text-gray-900 bg-blue-50 p-2 rounded border border-blue-100">
                            <p className="font-semibold text-blue-900">{docente.nombre_docente}</p>
                            {docente.nombre_materia && (
                              <p className="text-xs text-blue-700 mt-1">
                                <i className="pi pi-book text-xs mr-1"></i>
                                {docente.nombre_materia} (Grupo {docente.nombre_grupo})
                              </p>
                            )}
                          </div>
                        ))
                      ) : selectedProject.nombre_docente ? (
                        <p className="text-sm font-medium text-gray-900">{selectedProject.nombre_docente}</p>
                      ) : (
                        <p className="text-sm text-gray-600">No asignado</p>
                      )}
                    </div>
                  </div>
                )}
                {(eventoInfo?.nombre_evento || selectedProject.nombre_evento) && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Evento</p>
                    <p className="text-sm font-medium text-gray-900">
                      {eventoInfo?.nombre_evento || selectedProject.nombre_evento}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Líneas de Investigación */}
            {(selectedProject.codigo_linea || selectedProject.codigo_sublinea || selectedProject.codigo_area) && (
              <div className="space-y-4">
                <h5 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <i className="pi pi-sitemap text-emerald-600"></i>
                  Líneas de Investigación
                </h5>
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  {selectedProject.codigo_linea && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Línea de Investigación</p>
                      <p className="text-sm font-medium text-gray-900">
                        {investigacionNames.linea || selectedProject.nombre_linea || `Cargando...`}
                      </p>
                    </div>
                  )}
                  {selectedProject.codigo_sublinea && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Sublínea</p>
                      <p className="text-sm font-medium text-gray-900">
                        {investigacionNames.sublinea || selectedProject.nombre_sublinea || `Cargando...`}
                      </p>
                    </div>
                  )}
                  {selectedProject.codigo_area && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Área</p>
                      <p className="text-sm font-medium text-gray-900">
                        {investigacionNames.area || `Cargando...`}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Estudiantes Participantes */}
          {participantes.length > 0 && (
            <div>
              <h5 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <i className="pi pi-users text-emerald-600"></i>
                Estudiantes Participantes ({participantes.length})
              </h5>
              <div className="space-y-2">
                {participantes.map((participante, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <i className="pi pi-user text-emerald-600 text-sm"></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {obtenerNombreParticipante(participante)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Documento del Proyecto */}
          {selectedProject.url_cloudinary && (
            <div>
              <h5 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <i className="pi pi-file-pdf text-emerald-600"></i>
                Documento del Proyecto
              </h5>
              <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                {selectedProject.url_preview_png ? (
                  <img
                    src={selectedProject.url_preview_png}
                    alt="Vista previa PDF"
                    className="w-full h-auto object-contain max-h-96"
                  />
                ) : (
                  <iframe
                    src={selectedProject.url_cloudinary}
                    title="Vista previa PDF"
                    width="100%"
                    height="400"
                    style={{ border: 'none' }}
                  />
                )}
              </div>
              <div className="mt-3">
                <a
                  href={selectedProject.url_cloudinary}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium text-sm transition-colors"
                >
                  <i className="pi pi-download"></i>
                  Descargar PDF
                </a>
              </div>
            </div>
          )}

          {/* Botones de Certificados */}
          {onDownloadCertificado && (
            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <button
                onClick={() => onDownloadCertificado(selectedProject)}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
              >
                <i className="pi pi-download text-sm"></i>
                Mi Certificado
              </button>
              {onDownloadTodosCertificados && (
                <button
                  onClick={() => onDownloadTodosCertificados(selectedProject)}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                >
                  <i className="pi pi-download text-sm"></i>
                  Todos los Certificados
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between gap-3">
          <div>
            {onOpenAddMember && (
              <button
                onClick={onOpenAddMember}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium flex items-center gap-2"
              >
                <i className="pi pi-user-plus"></i>
                Agregar Integrante
              </button>
            )}
          </div>
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
