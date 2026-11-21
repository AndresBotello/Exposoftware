/**
 * Reglas para decidir cuál es el "evento actual" que se muestra primero.
 *
 * Ciclo de vida de un evento (ver ManageEvents del administrador):
 *   borrador -> inscripciones_abiertas -> inscripciones_cerradas -> en_curso -> finalizado
 *   (y cancelado en cualquier punto)
 *
 * Es lógica de presentación: solo ordena y filtra datos que ya llegan del backend.
 */

export const normalizarEstadoEvento = (e) =>
  String(e?.estado || "")
    .toLowerCase()
    .trim()
    .replace(/[\s-]+/g, "_");

// Menor número = más prioritario para mostrarse como evento principal
const PRIORIDAD = {
  inscripciones_abiertas: 1, // el que está recibiendo proyectos ahora
  en_curso: 2,
  activo: 2, // compatibilidad con datos antiguos
  inscripciones_cerradas: 3,
  finalizado: 4,
  borrador: 5,
  cancelado: 6,
};

export const prioridadEvento = (e) => {
  const est = normalizarEstadoEvento(e);
  if (est in PRIORIDAD) return PRIORIDAD[est];
  return e?.activo === true ? 2 : 7;
};

// Estados que un docente puede ver listados aunque aún no tenga proyectos en ellos
export const esEventoVisibleParaDocente = (e) => {
  const est = normalizarEstadoEvento(e);
  return !["borrador", "cancelado"].includes(est);
};

export const etiquetaEstadoEvento = (e) => {
  const est = normalizarEstadoEvento(e);
  const etiquetas = {
    inscripciones_abiertas: "Inscripciones abiertas",
    inscripciones_cerradas: "Inscripciones cerradas",
    en_curso: "En curso",
    activo: "En curso",
    finalizado: "Finalizado",
    borrador: "Borrador",
    cancelado: "Cancelado",
  };
  return etiquetas[est] || "";
};

export const idEvento = (e) => e?.id || e?.id_evento || e?.evento_id;

export const nombreEvento = (e) => e?.nombre || e?.nombre_evento || e?.title || "Evento sin nombre";

export const fechaEvento = (e) => {
  const f = e?.fecha_inicio || e?.fecha_evento || e?.fecha || e?.fecha_creacion || e?.created_at;
  const t = f ? new Date(f).getTime() : 0;
  return Number.isFinite(t) ? t : 0;
};

// Orden: por prioridad de estado y, a igual prioridad, el más reciente primero
export const compararEventos = (a, b) =>
  prioridadEvento(a) - prioridadEvento(b) || fechaEvento(b) - fechaEvento(a);

/**
 * Evento actual: el de mayor prioridad (inscripciones abiertas > en curso > cerradas > finalizado).
 * Ignora borradores y cancelados. Devuelve null si no hay candidatos.
 */
export const elegirEventoActual = (eventos) => {
  const candidatos = (Array.isArray(eventos) ? eventos : []).filter(
    (e) => idEvento(e) && esEventoVisibleParaDocente(e)
  );
  if (candidatos.length === 0) return null;
  return [...candidatos].sort(compararEventos)[0];
};

/* ------------------------------------------------------------------ */
/* Utilidades adicionales (estudiante, administrador y público)         */
/* ------------------------------------------------------------------ */

export const EVENTO_AUTO = "__auto__";
export const EVENTO_TODOS = "__todos__";

export const esEventoEnCurso = (e) => {
  const est = normalizarEstadoEvento(e);
  return est === "en_curso" || est === "activo" || e?.activo === true;
};

// Eventos ordenados: el más relevante primero (no modifica el arreglo original)
export const ordenarEventos = (eventos) =>
  [...(Array.isArray(eventos) ? eventos : [])].sort(compararEventos);

// Para pantallas donde importan los votos/ranking: el que está en curso, luego el último finalizado
const PRIORIDAD_VOTACION = {
  en_curso: 1,
  activo: 1,
  finalizado: 2,
  inscripciones_cerradas: 3,
  inscripciones_abiertas: 4,
};

export const elegirEventoParaVotacion = (eventos) => {
  const candidatos = (Array.isArray(eventos) ? eventos : []).filter(
    (e) => idEvento(e) && normalizarEstadoEvento(e) in PRIORIDAD_VOTACION
  );
  if (candidatos.length === 0) return null;
  const peso = (e) => PRIORIDAD_VOTACION[normalizarEstadoEvento(e)];
  return [...candidatos].sort((a, b) => peso(a) - peso(b) || fechaEvento(b) - fechaEvento(a))[0];
};

/**
 * Lista de eventos para un selector: los visibles (aunque no haya proyectos en ellos) más
 * cualquiera donde ya existan proyectos. Ordenados con el evento actual primero.
 */
export const construirEventosDisponibles = (eventosRaw, proyectos = []) => {
  const mapa = new Map();
  (Array.isArray(eventosRaw) ? eventosRaw : []).forEach((e) => {
    const id = idEvento(e);
    if (id && esEventoVisibleParaDocente(e)) mapa.set(String(id), e);
  });
  proyectos.forEach((p) => {
    if (p?.id_evento && !mapa.has(String(p.id_evento))) {
      const raw = (Array.isArray(eventosRaw) ? eventosRaw : []).find(
        (e) => String(idEvento(e)) === String(p.id_evento)
      );
      mapa.set(String(p.id_evento), raw || { id: p.id_evento });
    }
  });
  return Array.from(mapa.entries())
    .map(([id, raw]) => ({
      id,
      raw,
      nombre: nombreEvento(raw),
      estadoTexto: etiquetaEstadoEvento(raw),
    }))
    .sort((x, y) => compararEventos(x.raw, y.raw));
};
