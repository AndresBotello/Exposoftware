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
        console.log('🎪 Obteniendo lista de todos los eventos...');

        const response = await fetch(API_ENDPOINTS.ADMIN_EVENTOS, {
          credentials: 'include',
          method: 'GET',
          headers: getAuthHeaders()
        });

        if (!response.ok) {
          throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        console.log('✅ Eventos obtenidos:', result);

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
        console.error('❌ Error obteniendo eventos:', error);
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
    console.log(`🎪 Obteniendo evento con ID: ${eventoId}`);
    
    const response = await fetch(API_ENDPOINTS.ADMIN_EVENTO_BY_ID(eventoId), {
      credentials: 'include',
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ Evento obtenido:', result);

    // El backend puede devolver: objeto directo o {data: objeto}
    const evento = result.data || result;

    return evento;
    
  } catch (error) {
    console.error(`❌ Error obteniendo evento ${eventoId}:`, error);
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
    
    console.log(`📊 Mapa de eventos creado con ${map.size} eventos`);
    return map;
    
  } catch (error) {
    console.error('❌ Error creando mapa de eventos:', error);
    return new Map(); // Retornar mapa vacío en caso de error
  }
};
