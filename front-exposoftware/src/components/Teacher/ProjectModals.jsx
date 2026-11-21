import { useState, useEffect } from "react";
import { getRolName } from "../../utils/constants";

/* ------------------------------------------------------------------ */
/* Helpers de presentación del modal de detalles                        */
/* ------------------------------------------------------------------ */

// Solo se aceptan enlaces http(s): evita javascript:, data: u otros esquemas en href/src/iframe
const urlSegura = (u) => {
  if (!u || typeof u !== "string") return null;
  try {
    const parsed = new URL(u, window.location.origin);
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? parsed.href : null;
  } catch {
    return null;
  }
};

const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const TIPOS_ACTIVIDAD = {
  1: { texto: "Proyecto (Exposoftware)", icono: "pi-folder" },
  2: { texto: "Taller", icono: "pi-wrench" },
  3: { texto: "Ponencia", icono: "pi-megaphone" },
  4: { texto: "Conferencia", icono: "pi-microphone" },
};

function estadoDetalle(p) {
  if (p.estado === "aprobado") return { texto: "Aprobado", clases: "bg-emerald-100 text-emerald-800 ring-emerald-200", icono: "pi-check-circle" };
  if (p.estado === "rechazado") return { texto: "Rechazado", clases: "bg-red-100 text-red-800 ring-red-200", icono: "pi-times-circle" };
  if (p.estado === "pendiente") return { texto: "Pendiente", clases: "bg-amber-100 text-amber-800 ring-amber-200", icono: "pi-clock" };
  if (p.calificacion && num(p.calificacion) !== null) return { texto: `Calificado: ${num(p.calificacion).toFixed(1)}`, clases: "bg-emerald-100 text-emerald-800 ring-emerald-200", icono: "pi-star" };
  if (p.activo) return { texto: "Pendiente", clases: "bg-yellow-100 text-yellow-800 ring-yellow-200", icono: "pi-clock" };
  return { texto: "Inactivo", clases: "bg-gray-100 text-gray-800 ring-gray-200", icono: "pi-ban" };
}

function Seccion({ icono, color = "text-emerald-600", titulo, children }) {
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

function Dato({ etiqueta, valor, sub }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{etiqueta}</p>
      <p className="text-sm font-medium text-gray-900 break-words">{valor}</p>
      {sub && <p className="text-xs text-gray-500">{sub}</p>}
    </div>
  );
}

function Estrellas({ valor }) {
  return (
    <div className="flex gap-0.5" aria-hidden="true">
      {[...Array(5)].map((_, i) => (
        <i
          key={i}
          className={`pi text-lg ${i < Math.round(valor || 0) ? "pi-star-fill text-yellow-400" : "pi-star text-gray-300"}`}
        ></i>
      ))}
    </div>
  );
}

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

  // Cerrar con Esc y bloquear el scroll de la página mientras el modal está abierto
  useEffect(() => {
    if (!show) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [show, onClose]);

  if (!show || !project) return null;

  const estado = estadoDetalle(project);
  const tipo = TIPOS_ACTIVIDAD[project.tipo_actividad || project.id_tipo_actividad] || {
    texto: "No especificado",
    icono: "pi-question-circle",
  };
  const fecha = project.fecha_subida || project.created_at;
  const estudiantes = project.id_estudiantes || [];
  const urlDocumento = urlSegura(project.archivo_pdf || project.url_cloudinary);
  const urlPreview = urlSegura(project.url_preview_png);
  const notaDocente = project.calificacion ? num(project.calificacion) : null;
  const promedioPopular = num(calificacionPopular?.promedio_ponderado) || 0;
  const votos = num(calificacionPopular?.total_calificaciones ?? calificacionPopular?.total_votos) || 0;

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
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-emerald-100">Detalles del proyecto</p>
          <h3 id="detalle-proyecto-titulo" className="pr-12 text-xl font-bold leading-snug sm:text-2xl">
            {project.titulo_proyecto || "Sin título"}
          </h3>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${estado.clases}`}>
              <i className={`pi ${estado.icono} text-[11px]`}></i>
              {estado.texto}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
              <i className={`pi ${tipo.icono} text-[11px]`}></i>
              {tipo.texto}
            </span>
          </div>
        </div>

        {/* Contenido con scroll */}
        <div className="flex-1 space-y-6 overflow-y-auto p-5 sm:p-6">
          {/* Resumen rápido */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { icono: "pi-users", etiqueta: "Estudiantes", valor: estudiantes.length },
              { icono: "pi-book", etiqueta: "Materia", valor: project.codigo_materia || "N/A" },
              { icono: "pi-th-large", etiqueta: "Grupo", valor: project.nombre_grupo || project.id_grupo || "N/A" },
              {
                icono: "pi-calendar",
                etiqueta: "Subido el",
                valor: fecha ? new Date(fecha).toLocaleDateString("es-ES") : "No disponible",
              },
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

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Seccion icono="pi-info-circle" titulo="Información adicional">
              <div className="space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
                <Dato
                  etiqueta="Materia"
                  valor={project.nombre_materia || project.codigo_materia || "No especificada"}
                  sub={project.codigo_materia && project.nombre_materia ? project.codigo_materia : null}
                />
                <Dato
                  etiqueta="Grupo"
                  valor={
                    project.nombre_grupo
                      ? `Grupo ${project.nombre_grupo}`
                      : project.id_grupo
                      ? `Grupo ${project.id_grupo}`
                      : "No especificado"
                  }
                />
                <Dato etiqueta="Evento" valor={getEventoName(project.id_evento)} />
              </div>
            </Seccion>

            <Seccion icono="pi-sitemap" titulo="Líneas de investigación">
              <div className="space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
                <Dato etiqueta="Línea de investigación" valor={getLineaName(project.codigo_linea)} />
                <Dato etiqueta="Sublínea" valor={getSublineaName(project.codigo_sublinea)} />
                <Dato etiqueta="Área" valor={getAreaName(project.codigo_area)} />
              </div>
            </Seccion>
          </div>

          {/* Estudiantes */}
          <Seccion icono="pi-users" titulo={`Estudiantes participantes (${estudiantes.length})`}>
            {estudiantes.length > 0 ? (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {estudiantes.map((estudiante, idx) => {
                  const esLider = typeof estudiante === "object" && estudiante.es_lider;
                  const nombre = obtenerNombreEstudiante(estudiante);
                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-3 rounded-xl border p-3 ${
                        esLider ? "border-amber-200 bg-amber-50" : "border-gray-200 bg-gray-50"
                      }`}
                    >
                      <div
                        className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                          esLider ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
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
            ) : (
              <p className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 text-center text-sm text-gray-500">
                No hay estudiantes asignados
              </p>
            )}
          </Seccion>

          {/* Docentes */}
          {(project.docentes_materias?.length > 0 || project.id_docente) && (
            <Seccion icono="pi-id-card" color="text-blue-600" titulo={`Docentes responsables (${project.docentes_materias?.length || 1})`}>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {project.docentes_materias && project.docentes_materias.length > 0 ? (
                  project.docentes_materias.map((docente, idx) => (
                    <div key={idx} className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-3">
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                        <i className="pi pi-user text-sm text-blue-600"></i>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900">{docente.nombre_docente}</p>
                        {docente.nombre_materia && (
                          <p className="mt-0.5 text-xs text-blue-700">
                            <i className="pi pi-book mr-1 text-xs"></i>
                            {docente.nombre_materia} (Grupo {docente.nombre_grupo})
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 p-3">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                      <i className="pi pi-user text-sm text-blue-600"></i>
                    </div>
                    <p className="text-sm font-medium text-gray-900">{obtenerNombreDocente(project.id_docente)}</p>
                  </div>
                )}
              </div>
            </Seccion>
          )}

          {/* Calificaciones lado a lado */}
          {(notaDocente !== null || loadingCalificacionPopular || calificacionPopular) && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {notaDocente !== null && (
                <Seccion icono="pi-pencil" color="text-amber-600" titulo="Calificación del docente">
                  <div className="flex items-center gap-5 rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-4">
                    <div className="text-center">
                      <p className="text-4xl font-bold text-amber-700">{notaDocente.toFixed(2)}</p>
                      <p className="text-xs font-medium text-amber-600">/ 5.0</p>
                    </div>
                    <div className="flex-1">
                      <div className="h-2 overflow-hidden rounded-full bg-amber-200/70">
                        <div
                          className="h-full rounded-full bg-amber-500"
                          style={{ width: `${Math.min(100, Math.max(0, (notaDocente / 5) * 100))}%` }}
                        />
                      </div>
                      <p className="mt-2 text-xs text-amber-700">
                        {notaDocente >= 3 ? "Nota aprobatoria" : "Por debajo de la nota aprobatoria (3.0)"}
                      </p>
                    </div>
                  </div>
                </Seccion>
              )}

              {loadingCalificacionPopular ? (
                <div className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600"></div>
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
                        <Estrellas valor={promedioPopular} />
                        <p className="text-sm text-gray-700">
                          <span className="font-semibold text-gray-900">{votos}</span> {votos === 1 ? "voto" : "votos"}
                        </p>
                      </div>
                    </div>

                    {votos === 0 && (
                      <p className="text-center text-sm text-gray-600">
                        <i className="pi pi-info-circle mr-2"></i>
                        Este proyecto aún no tiene calificaciones del público
                      </p>
                    )}

                    {calificacionPopular.desglose_por_rol &&
                      Object.keys(calificacionPopular.desglose_por_rol).length > 0 && (
                        <div className="border-t border-indigo-100 pt-3">
                          <p className="mb-2 text-xs font-semibold text-gray-600">Desglose por rol</p>
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(calificacionPopular.desglose_por_rol).map(([rol, datos]) => (
                              <div key={rol} className="rounded-lg border border-indigo-100 bg-white p-2">
                                <p className="text-xs font-medium capitalize text-gray-700">{getRolName(rol)}</p>
                                <p className="text-sm font-bold text-indigo-600">
                                  {(num(datos.promedio) || 0).toFixed(2)}
                                </p>
                                {datos.cantidad ? (
                                  <p className="text-xs text-gray-500">
                                    ({datos.cantidad} {datos.cantidad === 1 ? "voto" : "votos"})
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
            </div>
          )}

          {/* Documento */}
          {urlPreview || urlDocumento ? (
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
                    height="500"
                    style={{ border: "none" }}
                  />
                )}
              </div>
              {urlDocumento && (
                <div className="mt-4 flex flex-wrap items-center gap-3">
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
              )}
            </Seccion>
          ) : (
            <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-center">
              <i className="pi pi-info-circle mb-2 text-2xl text-yellow-600"></i>
              <p className="text-sm font-medium text-yellow-800">No hay documento adjunto para este proyecto</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-5 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-100"
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
                        {calificacionPopular.total_calificaciones || calificacionPopular.total_votos || 0}
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
                                {getRolName(rol)}
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

                  {calificacionPopular.total_calificaciones || calificacionPopular.total_votos === 0 && (
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
