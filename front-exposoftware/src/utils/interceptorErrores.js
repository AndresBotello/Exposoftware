import { traducirRespuesta, MENSAJE_SIN_CONEXION } from './mensajesError';

// Instala una sola vez una capa sobre fetch para las llamadas a la API.
//
// Las pantallas leen `errorData.message` o `errorData.detail` y muestran ese texto.
// Aquí se reemplaza por un mensaje claro antes de que llegue a cada pantalla, así
// todas las pantallas muestran el mismo lenguaje sin tocar cada servicio.
// Las respuestas exitosas no se modifican.

const MARCA = '__erroresTraducidos';

const esLlamadaApi = (url) => {
  const texto = typeof url === 'string' ? url : url?.url || '';
  return texto.includes('/api/');
};

async function reescribirRespuesta(response) {
  const texto = await response.text();
  let cuerpo = null;
  try {
    cuerpo = texto ? JSON.parse(texto) : null;
  } catch {
    cuerpo = null; // p. ej. una página HTML de nginx en un 502
  }

  const mensaje = traducirRespuesta(response.status, cuerpo);
  const nuevo = {
    ...(cuerpo && typeof cuerpo === 'object' ? cuerpo : {}),
    status: 'error',
    message: mensaje,
    code: cuerpo?.code || `HTTP_${response.status}`,
  };
  if (cuerpo && typeof cuerpo.detail === 'string') {
    nuevo.detail = mensaje;
  }

  return new Response(JSON.stringify(nuevo), {
    status: response.status,
    statusText: response.statusText,
    headers: { 'Content-Type': 'application/json' },
  });
}

// Ruta de renovación de sesión, relativa al mismo origen que la petición.
const rutaRenovacion = (url) => `${url.slice(0, url.indexOf('/api/'))}/api/v1/auth/refresh`;

const esRutaAuth = (url) => url.includes('/api/v1/auth/');

export function instalarInterceptorErrores() {
  if (typeof window === 'undefined' || window.fetch[MARCA]) return;

  const fetchOriginal = window.fetch.bind(window);

  // Un solo intento de renovación aunque haya varias peticiones con 401 a la vez.
  let renovacionEnCurso = null;
  const renovarSesion = (url) => {
    if (!renovacionEnCurso) {
      renovacionEnCurso = fetchOriginal(rutaRenovacion(url), { method: 'POST', credentials: 'include' })
        .then((r) => r.ok)
        .catch(() => false)
        .finally(() => {
          renovacionEnCurso = null;
        });
    }
    return renovacionEnCurso;
  };

  const ejecutar = async (entrada, opciones, reintento) => {
    const url = typeof entrada === 'string' ? entrada : entrada?.url;
    let respuesta;
    try {
      respuesta = await fetchOriginal(entrada, opciones);
    } catch (error) {
      if (error?.name === 'AbortError') throw error;
      if (!esLlamadaApi(url)) throw error;
      const sinConexion = new Error(MENSAJE_SIN_CONEXION);
      sinConexion.code = 'SIN_CONEXION';
      throw sinConexion;
    }

    if (respuesta.ok || !esLlamadaApi(url)) return respuesta;

    // Sesión de access vencida: se renueva con la cookie de refresh y se repite la petición.
    if (respuesta.status === 401 && !reintento && !esRutaAuth(url)) {
      const renovada = await renovarSesion(url);
      if (renovada) return ejecutar(entrada, opciones, true);
    }
    return reescribirRespuesta(respuesta);
  };

  const fetchTraducido = (entrada, opciones) => ejecutar(entrada, opciones, false);

  fetchTraducido[MARCA] = true;
  window.fetch = fetchTraducido;
}
