import { API_BASE_URL } from '../utils/constants';
import { safeGetItem, safeSetItem } from '../utils/safeStorage';

// Los proyectos se guardan en el navegador (localStorage) y solo se vuelven a
// pedir cuando el servidor informa que cambió la versión de proyectos. Así el
// invitado no bombardea el servidor mientras navega.
const CLAVE_CACHE_PROYECTOS = 'invitado:proyectos:v1';

async function pedirJson(url) {
  const response = await fetch(url, { method: 'GET', credentials: 'include' });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const body = await response.json();
  return body.data;
}

function leerCacheProyectos() {
  try {
    const crudo = safeGetItem(CLAVE_CACHE_PROYECTOS);
    return crudo ? JSON.parse(crudo) : null;
  } catch {
    return null;
  }
}

function guardarCacheProyectos(cache) {
  try {
    safeSetItem(CLAVE_CACHE_PROYECTOS, JSON.stringify(cache));
  } catch {
    // Sin almacenamiento disponible la página sigue funcionando, solo sin caché.
  }
}

/** Clave de una página: filtros y tamaño forman parte de la clave. */
export function claveDePagina({ page, pageSize, q, idEvento }) {
  return `${q || ''}|${idEvento || ''}|${pageSize}|${page}`;
}

/**
 * Página de proyectos aprobados. `version` es la versión que informó el servidor;
 * si la caché guardada es de otra versión, se descarta y se vuelve a pedir.
 */
export async function obtenerProyectosPublicos({ page = 1, pageSize = 24, q = '', idEvento = null, version }) {
  const clave = claveDePagina({ page, pageSize, q, idEvento });
  let cache = leerCacheProyectos();
  if (!cache || cache.version !== version) {
    cache = { version, paginas: {} };
  }
  if (cache.paginas[clave]) {
    return cache.paginas[clave];
  }

  const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
  if (q) params.set('q', q);
  if (idEvento) params.set('id_evento', idEvento);
  const datos = await pedirJson(`${API_BASE_URL}/api/v1/proyectos/publicos?${params.toString()}`);

  cache.paginas[clave] = datos;
  guardarCacheProyectos(cache);
  return datos;
}

/** Versiones de proyectos y ranking. Cambian solo cuando hay algo nuevo que mostrar. */
export function obtenerEstadoPublico() {
  return pedirJson(`${API_BASE_URL}/api/v1/proyectos/publicos/estado`);
}

/** Totales: eventos activos y proyectos aprobados por evento. */
export function obtenerResumenPublico() {
  return pedirJson(`${API_BASE_URL}/api/v1/proyectos/publicos/resumen`);
}

/** Eventos en curso (lista corta para el selector). */
export function obtenerEventosActivosPublicos() {
  return pedirJson(`${API_BASE_URL}/api/v1/eventos/en-curso`);
}
