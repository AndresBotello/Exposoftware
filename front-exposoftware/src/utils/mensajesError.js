// Traduce los errores del backend a mensajes claros para el usuario.
// Sin dependencias: se usa tanto desde la capa de red como desde la interfaz.

const CAMPOS = {
  contenido_tecnico: 'contenido técnico',
  organizacion_proyecto: 'organización del proyecto',
  diseno_ui_ux: 'diseño y UI/UX',
  utilidad_idea: 'utilidad de la idea',
  comunicacion_presentacion: 'comunicación y presentación',
  comentario: 'comentario',
  page: 'página',
  page_size: 'tamaño de página',
  q: 'búsqueda',
  id_evento: 'evento',
  jurado: 'jurado',
  voto_popular: 'voto popular',
  estado_evento: 'estado del evento',
  estado: 'estado',
  correo: 'correo',
  telefono: 'teléfono',
};

const CRITERIOS = new Set([
  'contenido_tecnico', 'organizacion_proyecto', 'diseno_ui_ux',
  'utilidad_idea', 'comunicacion_presentacion',
]);

const TIPOS_PYDANTIC = {
  missing: 'Falta completar este campo',
  float_parsing: 'Escribe solo números',
  int_parsing: 'Escribe solo números enteros',
  float_type: 'Escribe solo números',
  int_type: 'Escribe solo números enteros',
  string_type: 'Escribe solo texto',
  uuid_parsing: 'El identificador no es válido',
  string_too_long: 'El texto es demasiado largo',
  string_too_short: 'El texto es demasiado corto',
  json_invalid: 'Los datos enviados no son válidos',
  list_type: 'Debe ser una lista',
};

const REGLAS = {
  voto_popular_unico_por_usuario:
    'Ya calificaste este proyecto. Cada persona puede votar una sola vez y el voto no se puede cambiar.',
};

// Mensajes del backend que ya existen pero se leen mal para el usuario.
const MENSAJES_CONOCIDOS = [
  ['Eres docente asignado al proyecto', 'Como docente asignado a este proyecto, califícalo desde tu perfil con la nota oficial.'],
  ['No puedes calificar un proyecto del que eres integrante', 'No puedes calificar un proyecto en el que participas como integrante.'],
  ['La votación no está disponible para este evento', 'La votación de este evento no está abierta en este momento.'],
  ['Solo se puede votar proyectos aprobados o calificados', 'Este proyecto todavía no está disponible para calificar.'],
  ['Ya votaste por este proyecto', 'Ya calificaste este proyecto. Cada persona puede votar una sola vez y el voto no se puede cambiar.'],
];

const traducirConocido = (texto) => {
  const hallado = MENSAJES_CONOCIDOS.find(([fragmento]) => texto?.includes(fragmento));
  return hallado ? hallado[1] : null;
};

// Textos que delatan detalles técnicos: no se muestran tal cual al usuario.
const TECNICO = /HTTP|Traceback|Exception|Error interno|None|null|undefined|detail|stack|sqlalchemy|asyncpg|pydantic|field required|\bNaN\b/i;

// Solo se usa el texto del backend si parece redactado para una persona.
const esTextoAmigable = (texto) =>
  typeof texto === 'string' && texto.trim().length > 0 && texto.length < 300 && !TECNICO.test(texto);

const nombreCampo = (campo) => {
  const ultimo = String(campo || '').split('.').pop();
  return CAMPOS[ultimo] || ultimo;
};

/** Primer error de validación en lenguaje claro. */
function traducirErroresValidacion(errores) {
  const primero = Array.isArray(errores) && errores.length ? errores[0] : null;
  if (!primero) return 'Revisa los datos ingresados e intenta de nuevo.';

  const ultimo = String(primero.field || '').split('.').pop();
  const etiqueta = nombreCampo(primero.field);
  const tipo = primero.type || '';

  let detalle;
  if (CRITERIOS.has(ultimo) && /less|greater|between|range/.test(tipo)) {
    detalle = 'debe estar entre 0 y 5';
  } else if (tipo === 'less_than_equal' || tipo === 'less_than') {
    detalle = 'es demasiado alto';
  } else if (tipo === 'greater_than_equal' || tipo === 'greater_than') {
    detalle = 'es demasiado bajo';
  } else {
    detalle = TIPOS_PYDANTIC[tipo] || 'no es válido';
  }

  return etiqueta ? `Revisa el campo «${etiqueta}»: ${detalle}.` : `Revisa los datos: ${detalle}.`;
}

/**
 * Mensaje para el usuario según el estado HTTP y el cuerpo de la respuesta.
 * @param {number} status - código HTTP
 * @param {object|null} cuerpo - JSON de la respuesta (puede ser null)
 */
export function traducirRespuesta(status, cuerpo = null) {
  const mensaje = cuerpo?.message || cuerpo?.detail;
  const conocido = traducirConocido(mensaje);
  const amigable = conocido || (esTextoAmigable(mensaje) ? mensaje : null);

  if (cuerpo?.details?.rule && REGLAS[cuerpo.details.rule]) {
    return REGLAS[cuerpo.details.rule];
  }

  switch (status) {
    case 400:
      return amigable || 'No se pudo completar la acción. Revisa los datos e intenta de nuevo.';
    case 401:
      return 'Tu sesión expiró. Vuelve a iniciar sesión para continuar.';
    case 403:
      return amigable || 'No tienes permiso para realizar esta acción.';
    case 404:
      return amigable || 'No encontramos lo que buscas. Puede que ya no esté disponible.';
    case 405:
      return 'Esta acción no está disponible en este momento.';
    case 408:
      return 'La solicitud tardó demasiado. Intenta de nuevo.';
    case 409:
      return amigable || 'La información cambió mientras la revisabas. Actualiza la página e intenta de nuevo.';
    case 413:
      return 'El archivo es demasiado grande para enviarlo.';
    case 415:
      return 'El formato enviado no es compatible.';
    case 422:
      return cuerpo?.errors ? traducirErroresValidacion(cuerpo.errors) : (amigable || 'Revisa los datos ingresados.');
    case 429:
      return 'Hiciste demasiadas solicitudes en poco tiempo. Espera un minuto e intenta de nuevo.';
    case 502:
    case 503:
    case 504:
      return 'El servicio está ocupado en este momento. Intenta de nuevo en unos segundos.';
    default:
      if (status >= 500) return 'Ocurrió un problema en el servidor. Intenta de nuevo más tarde.';
      return amigable || 'Ocurrió un error inesperado. Intenta de nuevo.';
  }
}

export const MENSAJE_SIN_CONEXION =
  'No hay conexión con el servidor. Revisa tu internet e intenta de nuevo.';
