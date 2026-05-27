import { API_ENDPOINTS } from '../utils/constants';
import { getAuthHeaders } from './AuthService';
import CacheService from './CacheService';

/**
 * 📋 Servicio para obtener información pública de eventos
 * Usado principalmente para obtener nombres de eventos a partir de sus IDs
 */

/**
 * 🎯 Obtener todos los eventos
 * GET /api/v1/admin/eventos
 * @returns {Promise<Array>} Lista de eventos
 */
export const getAllEventos = async () => {
  return CacheService.withCache(
    'all_eventos',
    async () => {
      try {

        const response = await fetch(API_ENDPOINTS.ADMIN_EVENTOS, {
          credentials: 'include',
          method: 'GET',
          headers: getAuthHeaders()
        });

        if (!response.ok) {
          throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();

        // El backend puede devolver: array directo, {data: array}, o {eventos: array}
        let eventos = [];
        if (Array.isArray(result)) {
          eventos = result;
        } else if (result.data && Array.isArray(result.data)) {
          eventos = result.data;
        } else if (result.eventos && Array.isArray(result.eventos)) {
          eventos = result.eventos;
        }

        return eventos;

      } catch (error) {
        throw error;
      }
    },
    10 * 60 * 1000 // 10 minutos de caché
  );
};

/**
 * 🎯 Obtener un evento específico por ID
 * GET /api/v1/admin/eventos/{id}
 * @param {string} eventoId - ID del evento
 * @returns {Promise<Object>} Datos del evento
 */
export const getEventoById = async (eventoId) => {
  try {
    
    const response = await fetch(API_ENDPOINTS.ADMIN_EVENTO_BY_ID(eventoId), {
      credentials: 'include',
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    // El backend puede devolver: objeto directo o {data: objeto}
    const evento = result.data || result;

    return evento;
    
  } catch (error) {
    throw error;
  }
};

/**
 * 🗺️ Crear un mapa de ID a nombre de eventos
 * Útil para obtener nombres de eventos rápidamente sin hacer múltiples peticiones
 * @returns {Promise<Map>} Map de id_evento -> nombre_evento
 */
export const getEventosMap = async () => {
  try {
    const eventos = await getAllEventos();
    const map = new Map();
    
    eventos.forEach(evento => {
      // Intentar diferentes nombres de campos para el ID y el nombre
      const id = evento.id || evento.id_evento || evento.evento_id;
      const nombre = evento.nombre || evento.nombre_evento || evento.title || 'Sin nombre';
      
      if (id) {
        map.set(id, nombre);
      }
    });
    
    return map;
    
  } catch (error) {
    return new Map(); // Retornar mapa vacío en caso de error
  }
};

/**
 * 🎪 Obtener eventos que estén en curso
 * @returns {Promise<Array>} Lista de eventos en_curso
 */
export const getEventosEnCurso = async () => {
  try {
    const eventos = await getAllEventos();


    const eventosEnCurso = eventos.filter(evento => {
      const estado = evento.estado || evento.status;
      return estado && (estado.toLowerCase() === 'en_curso' || estado.toLowerCase() === 'en curso');
    });

    eventosEnCurso.forEach((e, idx) => {
      console.log(`   [${idx}] ${e.nombre_evento || e.nombre} (ID: ${e.id_evento || e.id})`);
    });
    return eventosEnCurso;
  } catch (error) {
    throw error;
  }
};

/**
 * 📚 Obtener proyectos de un evento específico
 * GET /api/v1/proyectos/evento/{id_evento}
 * @param {string} idEvento - ID del evento
 * @returns {Promise<Array>} Lista de proyectos del evento
 */
export const getProyectosEventoAprobados = async (idEvento) => {
  try {

    const response = await fetch(API_ENDPOINTS.PROYECTOS_BY_EVENTO(idEvento), {
      credentials: 'include',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    // Extraer el array de proyectos
    let proyectos = result.data || result;
    if (!Array.isArray(proyectos)) {
      proyectos = [];
    }


    // Mostrar estado de cada proyecto
    proyectos.forEach((p, idx) => {
      const estado = p.estado || p.status || 'SIN ESTADO';
    });

    return proyectos;
  } catch (error) {
    throw error;
  }
};
