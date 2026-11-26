import { useState, useEffect } from 'react';
import InvestigacionService from '../Services/InvestigacionService';

// Solo se aceptan enlaces http(s): evita javascript:, data: u otros esquemas en href/src/iframe
const urlSegura = (u) => {
  if (!u || typeof u !== 'string') return null;
  try {
    const parsed = new URL(u, window.location.origin);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:' ? parsed.href : null;
  } catch {
    return null;
  }
};

const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

function Seccion({ icono, color = 'text-emerald-600', titulo, children }) {
  return (
    <section>
      <h5 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-700">
        <i className={`pi ${icono} ${color}`}></i>
        {titulo}
      </h5>
      {children}
    </section>
  );
}

function Dato({ etiqueta, valor }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{etiqueta}</p>
      <p className="break-words text-sm font-medium text-gray-900">{valor}</p>
    </div>
  );
}

export default function ProjectDetailsModal({
  selectedProject,
  eventoInfo,
  user,
  onClose,
  onDownloadCertificado,
  onDownloadTodosCertificados,
  token,
  onOpenAddMember,
  onEdit,
  calificacionPopular,
  loadingCalificacionPopular
}) {
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({
    titulo_proyecto: selectedProject?.titulo_proyecto || '',
    codigo_area: selectedProject?.codigo_area || '',
    codigo_linea: selectedProject?.codigo_linea || '',
    codigo_sublinea: selectedProject?.codigo_sublinea || '',
    id_tipo_actividad: selectedProject?.id_tipo_actividad || ''
  });
  const [archivoPDF, setArchivoPDF] = useState(null);
  const [saving, setSaving] = useState(false);
  const [arbolInvestigacion, setArbolInvestigacion] = useState([]);
  const [sublinesOptions, setSublineasOptions] = useState([]);
  const [areasOptions, setAreasOptions] = useState([]);

  const [investigacionNames, setInvestigacionNames] = useState({
    linea: selectedProject?.nombre_linea || null,
    sublinea: selectedProject?.nombre_sublinea || null,
    area: selectedProject?.nombre_area || null
  });

  useEffect(() => {
    if (selectedProject) {
      setEditData({
        titulo_proyecto: selectedProject?.titulo_proyecto || '',
        codigo_area: selectedProject?.codigo_area || '',
        codigo_linea: selectedProject?.codigo_linea || '',
        codigo_sublinea: selectedProject?.codigo_sublinea || '',
        id_tipo_actividad: selectedProject?.id_tipo_actividad || ''
      });
      setEditMode(false);
      setArchivoPDF(null);
    }
  }, [selectedProject]);

  // Cargar árbol de investigación cuando se activa modo edición
  useEffect(() => {
    if (editMode) {
      cargarArbolInvestigacion();
    }
  }, [editMode]);

  // Actualizar sublíneas cuando cambia la línea
  useEffect(() => {
    if (editData.codigo_linea && arbolInvestigacion.length > 0) {
      const linea = arbolInvestigacion.find(l => l.codigo_linea === Number(editData.codigo_linea));
      if (linea && linea.sublineas) {
        setSublineasOptions(linea.sublineas);
        // Solo resetear codigo_sublinea si la sublínea actual no existe en las nuevas opciones
        const sublineaValida = linea.sublineas.find(s => s.codigo_sublinea === Number(editData.codigo_sublinea));
        if (!sublineaValida) {
          setEditData(prev => ({ ...prev, codigo_sublinea: '' }));
          setAreasOptions([]);
        }
      }
    }
  }, [editData.codigo_linea, arbolInvestigacion]);

  // Actualizar áreas cuando cambia la sublínea
  useEffect(() => {
    if (editData.codigo_sublinea && sublinesOptions.length > 0) {
      const sublinea = sublinesOptions.find(s => s.codigo_sublinea === Number(editData.codigo_sublinea));
      if (sublinea && sublinea.areas_tematicas) {
        setAreasOptions(sublinea.areas_tematicas);
        // Solo resetear codigo_area si el área actual no existe en las nuevas opciones
        const areaValida = sublinea.areas_tematicas.find(a => a.codigo_area === Number(editData.codigo_area));
        if (!areaValida) {
          setEditData(prev => ({ ...prev, codigo_area: '' }));
        }
      }
    }
  }, [editData.codigo_sublinea, sublinesOptions]);

  const cargarArbolInvestigacion = async () => {
    try {
      const arbol = await InvestigacionService.obtenerArbolCompleto();
      setArbolInvestigacion(arbol);

      if (editData.codigo_linea) {
        const linea = arbol.find(l => l.codigo_linea === Number(editData.codigo_linea));
        if (linea && linea.sublineas) {
          setSublineasOptions(linea.sublineas);

          if (editData.codigo_sublinea) {
            const sublinea = linea.sublineas.find(s => s.codigo_sublinea === Number(editData.codigo_sublinea));
            if (sublinea && sublinea.areas_tematicas) {
              setAreasOptions(sublinea.areas_tematicas);
            }
          }
        }
      }
    } catch (error) {
      console.error('❌ Error cargando árbol de investigación:', error);
    }
  };

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

  // Cerrar con Esc y bloquear el scroll de la página mientras el modal está abierto
  const abierto = Boolean(selectedProject);
  useEffect(() => {
    if (!abierto) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [abierto, onClose]);

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
  const tipoId = selectedProject.tipo_actividad || selectedProject.id_tipo_actividad;
  const urlDocumento = urlSegura(selectedProject.url_cloudinary);
  const urlPreview = urlSegura(selectedProject.url_preview_png);
  const nota = selectedProject.calificacion !== undefined && selectedProject.calificacion !== null && selectedProject.calificacion !== ''
    ? num(selectedProject.calificacion)
    : null;
  const promedioPopular = num(calificacionPopular?.promedio_ponderado) || 0;
  const votos = num(calificacionPopular?.total_calificaciones ?? calificacionPopular?.total_votos) || 0;
  // El grupo puede venir directo o solo dentro de la lista de docentes/materias del proyecto
  const claseDocente = selectedProject.docentes_materias?.find((d) => d?.nombre_grupo) || null;
  const grupo = selectedProject.nombre_grupo || selectedProject.id_grupo || claseDocente?.nombre_grupo;
  const materia = selectedProject.nombre_materia || claseDocente?.nombre_materia;
  const fecha = selectedProject.fecha_subida || selectedProject.created_at;

  const claseInput =
    'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100';

  const cancelarEdicion = () => {
    setEditMode(false);
    setArchivoPDF(null);
    setEditData({
      titulo_proyecto: selectedProject?.titulo_proyecto || '',
      codigo_area: selectedProject?.codigo_area || '',
      codigo_linea: selectedProject?.codigo_linea || '',
      codigo_sublinea: selectedProject?.codigo_sublinea || '',
      id_tipo_actividad: selectedProject?.id_tipo_actividad || ''
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="detalle-proyecto-titulo"
    >
      <div
        className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5 text-white">
          <button
            onClick={onClose}
            aria-label="Cerrar detalles"
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/30"
          >
            <i className="pi pi-times"></i>
          </button>
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-emerald-100">
            {editMode ? 'Editando proyecto' : 'Detalles del proyecto'}
          </p>
          <h3 id="detalle-proyecto-titulo" className="pr-12 text-xl font-bold leading-snug sm:text-2xl">
            {selectedProject.titulo_proyecto || selectedProject.nombre_proyecto || 'Sin título'}
          </h3>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {selectedProject.estado && (
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-black/5 ${estadoBadge.color}`}>
                {estadoBadge.label}
              </span>
            )}
            {tipoId && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
                <i className="pi pi-tag text-[11px]"></i>
                {obtenerNombreTipoActividad(tipoId)}
              </span>
            )}
          </div>
        </div>

        {/* Contenido con scroll */}
        <div className="flex-1 space-y-6 overflow-y-auto p-5 sm:p-6">
          {/* Modo Edición */}
          {editMode && (
            <div className="space-y-4 rounded-xl border border-emerald-200 bg-emerald-50/60 p-5">
              <h5 className="flex items-center gap-2 text-lg font-semibold text-emerald-900">
                <i className="pi pi-pencil"></i>
                Editar proyecto
              </h5>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Título del proyecto</label>
                <input
                  type="text"
                  value={editData.titulo_proyecto}
                  onChange={(e) => setEditData({ ...editData, titulo_proyecto: e.target.value })}
                  maxLength={250}
                  className={claseInput}
                  placeholder="Título del proyecto"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Tipo de actividad</label>
                  <select
                    value={editData.id_tipo_actividad}
                    onChange={(e) => setEditData({ ...editData, id_tipo_actividad: Number(e.target.value) })}
                    className={claseInput}
                  >
                    <option value="">Seleccionar tipo</option>
                    <option value={1}>Exposoftware</option>
                    <option value={2}>Ponencia</option>
                    <option value={3}>Taller</option>
                    <option value={4}>Conferencia</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Línea de investigación</label>
                  <select
                    value={String(editData.codigo_linea)}
                    onChange={(e) => setEditData({ ...editData, codigo_linea: Number(e.target.value) || '' })}
                    className={claseInput}
                  >
                    <option value="">Seleccionar línea</option>
                    {arbolInvestigacion.map((linea) => (
                      <option key={linea.codigo_linea} value={String(linea.codigo_linea)}>
                        {linea.nombre_linea}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Sublínea</label>
                  <select
                    value={String(editData.codigo_sublinea)}
                    onChange={(e) => setEditData({ ...editData, codigo_sublinea: Number(e.target.value) || '' })}
                    disabled={!editData.codigo_linea}
                    className={claseInput}
                  >
                    <option value="">Seleccionar sublínea</option>
                    {sublinesOptions.map((sublinea) => (
                      <option key={sublinea.codigo_sublinea} value={String(sublinea.codigo_sublinea)}>
                        {sublinea.nombre_sublinea}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Área temática</label>
                  <select
                    value={String(editData.codigo_area)}
                    onChange={(e) => setEditData({ ...editData, codigo_area: Number(e.target.value) || '' })}
                    disabled={!editData.codigo_sublinea}
                    className={claseInput}
                  >
                    <option value="">Seleccionar área</option>
                    {areasOptions.map((area) => (
                      <option key={area.codigo_area} value={String(area.codigo_area)}>
                        {area.nombre_area}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">PDF del proyecto</label>
                {urlDocumento && (
                  <div className="mb-3 flex items-center gap-3 rounded-lg border border-gray-300 bg-white p-3">
                    <i className="pi pi-file-pdf text-xl text-red-600"></i>
                    <div>
                      <p className="text-sm font-medium text-gray-900">PDF actual</p>
                      <a
                        href={urlDocumento}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-emerald-700 hover:underline"
                      >
                        Ver documento
                      </a>
                    </div>
                  </div>
                )}
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setArchivoPDF(e.target.files[0]);
                    }
                  }}
                  className="w-full cursor-pointer rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                {archivoPDF && (
                  <p className="mt-2 text-xs font-medium text-emerald-700">
                    <i className="pi pi-check mr-1"></i>
                    Nuevo PDF: {archivoPDF.name} ({(archivoPDF.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Resumen rápido */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { icono: 'pi-users', etiqueta: 'Integrantes', valor: participantes.length },
              { icono: 'pi-sitemap', etiqueta: 'Grupo', valor: grupo || 'N/A' },
              { icono: 'pi-star', etiqueta: 'Calificación', valor: nota !== null ? `${nota.toFixed(1)} / 5` : 'Sin nota' },
              {
                icono: 'pi-calendar',
                etiqueta: 'Subido el',
                valor: fecha ? new Date(fecha).toLocaleDateString('es-ES') : 'No disponible'
              }
            ].map((d) => (
              <div key={d.etiqueta} className="rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-teal-50 p-3">
                <div className="mb-1 flex items-center gap-2 text-emerald-700">
                  <i className={`pi ${d.icono} text-sm`}></i>
                  <span className="text-xs font-medium">{d.etiqueta}</span>
                </div>
                <p className="truncate text-base font-bold text-gray-900" title={String(d.valor)}>
                  {d.valor}
                </p>
              </div>
            ))}
          </div>

          {/* Información + líneas de investigación */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Seccion icono="pi-info-circle" titulo="Información adicional">
              <div className="space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
                {materia && <Dato etiqueta="Materia" valor={materia} />}
                {grupo && <Dato etiqueta="Grupo" valor={`Grupo ${grupo}`} />}
                {(selectedProject.docentes_materias?.length > 0 ||
                  selectedProject.nombre_docente ||
                  selectedProject.id_docente) && (
                  <div>
                    <p className="mb-2 text-xs text-gray-500">Docentes responsables</p>
                    <div className="space-y-2">
                      {selectedProject.docentes_materias && selectedProject.docentes_materias.length > 0 ? (
                        selectedProject.docentes_materias.map((docente, idx) => (
                          <div key={idx} className="rounded-lg border border-blue-100 bg-blue-50 p-2">
                            <p className="text-sm font-semibold text-blue-900">{docente.nombre_docente}</p>
                            {docente.nombre_materia && (
                              <p className="mt-0.5 text-xs text-blue-700">
                                <i className="pi pi-book mr-1 text-xs"></i>
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
                  <Dato etiqueta="Evento" valor={eventoInfo?.nombre_evento || selectedProject.nombre_evento} />
                )}
              </div>
            </Seccion>

            {(selectedProject.codigo_linea || selectedProject.codigo_sublinea || selectedProject.codigo_area) && (
              <Seccion icono="pi-sitemap" titulo="Líneas de investigación">
                <div className="space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
                  {selectedProject.codigo_linea && (
                    <Dato
                      etiqueta="Línea de investigación"
                      valor={investigacionNames.linea || selectedProject.nombre_linea || 'Cargando...'}
                    />
                  )}
                  {selectedProject.codigo_sublinea && (
                    <Dato
                      etiqueta="Sublínea"
                      valor={investigacionNames.sublinea || selectedProject.nombre_sublinea || 'Cargando...'}
                    />
                  )}
                  {selectedProject.codigo_area && (
                    <Dato etiqueta="Área" valor={investigacionNames.area || 'Cargando...'} />
                  )}
                </div>
              </Seccion>
            )}
          </div>

          {/* Calificación popular del público */}
          {loadingCalificacionPopular ? (
            <div className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-yellow-200 border-t-yellow-500"></div>
              <p className="text-sm text-gray-600">Cargando calificación del público...</p>
            </div>
          ) : calificacionPopular ? (
            <Seccion icono="pi-star-fill" color="text-yellow-500" titulo="Calificación popular del público">
              <div className="space-y-4 rounded-xl border border-indigo-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
                <div className="flex items-center gap-5">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-indigo-700">{promedioPopular.toFixed(2)}</p>
                    <p className="text-xs font-medium text-indigo-600">/ 5.0</p>
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex gap-0.5" aria-hidden="true">
                      {[...Array(5)].map((_, i) => (
                        <i
                          key={i}
                          className={`pi text-lg ${
                            i < Math.round(promedioPopular)
                              ? 'pi-star-fill text-yellow-400'
                              : 'pi-star text-gray-300'
                          }`}
                        ></i>
                      ))}
                    </div>
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold text-gray-900">{votos}</span> {votos === 1 ? 'voto' : 'votos'}
                    </p>
                  </div>
                </div>

                {votos === 0 && (
                  <p className="text-center text-sm text-gray-600">
                    <i className="pi pi-info-circle mr-2"></i>
                    Este proyecto aún no tiene calificaciones del público
                  </p>
                )}

                {calificacionPopular.desglose_por_rol && Object.keys(calificacionPopular.desglose_por_rol).length > 0 && (
                  <div className="border-t border-indigo-100 pt-3">
                    <p className="mb-2 text-xs font-semibold text-gray-600">Desglose por rol</p>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {Object.entries(calificacionPopular.desglose_por_rol).map(([rol, datos]) => (
                        <div key={rol} className="rounded-lg border border-indigo-100 bg-white p-2">
                          <p className="text-xs font-medium capitalize text-gray-700">
                            {rol === '1' ? 'Docente' : rol === '2' ? 'Estudiante' : rol === '5' ? 'Egresado' : `Rol ${rol}`}
                          </p>
                          <p className="text-sm font-bold text-indigo-600">{(num(datos.promedio) || 0).toFixed(2)}</p>
                          {datos.cantidad ? (
                            <p className="text-xs text-gray-500">
                              ({datos.cantidad} {datos.cantidad === 1 ? 'voto' : 'votos'})
                            </p>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Seccion>
          ) : null}

          {/* Participantes */}
          {participantes.length > 0 && (
            <Seccion icono="pi-users" titulo={`Estudiantes participantes (${participantes.length})`}>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {participantes.map((participante, idx) => {
                  const nombre = obtenerNombreParticipante(participante);
                  const esLider = typeof participante === 'object' && participante?.es_lider;
                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-3 rounded-xl border p-3 ${
                        esLider ? 'border-amber-200 bg-amber-50' : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div
                        className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                          esLider ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {nombre.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900" title={nombre}>
                          {nombre}
                        </p>
                        {esLider && (
                          <p className="inline-flex items-center gap-1 text-xs font-medium text-amber-700">
                            <i className="pi pi-star-fill text-[10px]"></i> Líder del proyecto
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Seccion>
          )}

          {/* Documento */}
          {urlDocumento && (
            <Seccion icono="pi-file-pdf" titulo="Documento del proyecto">
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                {urlPreview ? (
                  <img
                    src={urlPreview}
                    alt="Vista previa del documento"
                    referrerPolicy="no-referrer"
                    className="h-auto max-h-96 w-full object-contain"
                  />
                ) : (
                  <iframe
                    src={urlDocumento}
                    title="Vista previa del documento"
                    referrerPolicy="no-referrer"
                    width="100%"
                    height="400"
                    style={{ border: 'none' }}
                  />
                )}
              </div>
              <div className="mt-3 flex flex-wrap gap-3">
                <a
                  href={urlDocumento}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-100"
                >
                  <i className="pi pi-external-link"></i>
                  Abrir en nueva ventana
                </a>
                <a
                  href={urlDocumento}
                  download
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100"
                >
                  <i className="pi pi-download"></i>
                  Descargar PDF
                </a>
              </div>
            </Seccion>
          )}

          {/* Certificados */}
          {onDownloadCertificado && (
            <div className="flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row">
              <button
                onClick={() => onDownloadCertificado(selectedProject)}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3 font-semibold text-white shadow-sm transition-all duration-300 hover:from-emerald-700 hover:to-teal-700 hover:shadow-md"
              >
                <i className="pi pi-download text-sm"></i>
                Mi certificado
              </button>
              {onDownloadTodosCertificados && (
                <button
                  onClick={() => onDownloadTodosCertificados(selectedProject)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 font-semibold text-white shadow-sm transition-all duration-300 hover:from-blue-700 hover:to-indigo-700 hover:shadow-md"
                >
                  <i className="pi pi-download text-sm"></i>
                  Todos los certificados
                </button>
              )}
            </div>
          )}
        </div>

        {/* Aviso de edición */}
        {onEdit && selectedProject.estado !== 'pendiente' && !editMode && (
          <div className="flex items-center gap-2 border-t border-yellow-200 bg-yellow-50 px-6 py-3 text-sm text-yellow-800">
            <i className="pi pi-info-circle text-yellow-600"></i>
            <span>Solo se puede editar cuando el estado del proyecto esté Pendiente</span>
          </div>
        )}

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4">
          <div className="flex gap-2">
            {!editMode && onOpenAddMember && (
              <button
                onClick={onOpenAddMember}
                className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white transition-colors hover:bg-emerald-700"
              >
                <i className="pi pi-user-plus"></i>
                Agregar integrante
              </button>
            )}
          </div>
          <div className="flex gap-2">
            {editMode ? (
              <>
                <button
                  onClick={cancelarEdicion}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-100"
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  onClick={async () => {
                    setSaving(true);
                    try {
                      await onEdit(editData, archivoPDF);
                      setEditMode(false);
                      setArchivoPDF(null);
                    } finally {
                      setSaving(false);
                    }
                  }}
                  className="rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
                  disabled={saving}
                >
                  {saving ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </>
            ) : (
              <>
                {onEdit && selectedProject.estado === 'pendiente' && (
                  <button
                    onClick={() => setEditMode(true)}
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
                  >
                    <i className="pi pi-pencil"></i>
                    Editar
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-100"
                >
                  Cerrar
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
