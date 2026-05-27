import { API_ENDPOINTS } from '../utils/constants';

/**
 * Obtener el token de autenticación
 */
const getAuthToken = () => {
  return localStorage.getItem('auth_token');
};

/**
 * Headers comunes con autenticación
 */
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

/**
 * Servicio para la gestión de eventos
 */
class EventosService {
  
  /**
   * Obtener todos los eventos
   * GET /api/v1/admin/eventos (requiere autenticación de admin)
   */
  static async obtenerEventos() {
    try {
      
      const response = await fetch(API_ENDPOINTS.ADMIN_EVENTOS, {
        credentials: 'include',
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      let eventos = [];
      if (Array.isArray(data)) {
        eventos = data;
      } else if (data.data && Array.isArray(data.data)) {
        eventos = data.data;
      } else if (data.eventos && Array.isArray(data.eventos)) {
        eventos = data.eventos;
      }
      
      return eventos;
      
    } catch (error) {
      throw new Error('No se pudieron cargar los eventos');
    }
  }

  /**
   * Obtener un evento por ID
   * GET /api/v1/eventos/{evento_id}
   */
  static async obtenerEventoPorId(eventoId) {
    try {
      
      const response = await fetch(API_ENDPOINTS.ADMIN_EVENTO_BY_ID(eventoId), {
        credentials: 'include',
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      return data.data || data;
      
    } catch (error) {
      throw new Error('No se pudo cargar el evento');
    }
  }

  /**
   * Crear un nuevo evento
   * POST /api/v1/admin/eventos
   */
  static async crearEvento(eventoData) {
    try {
      
      // Validar campos requeridos según OpenAPI: nombre_evento, fecha_inicio, fecha_fin
      if (!eventoData.nombre_evento || !eventoData.fecha_inicio || !eventoData.fecha_fin) {
        throw new Error('Faltan campos requeridos: nombre_evento, fecha_inicio, fecha_fin');
      }

      const fechaInicio = new Date(eventoData.fecha_inicio);
      const fechaFin = new Date(eventoData.fecha_fin);
      
      if (fechaFin < fechaInicio) {
        throw new Error('La fecha de fin no puede ser anterior a la fecha de inicio');
      }

      // Construir payload solo con campos que tienen valores
      const payload = {
        nombre_evento: eventoData.nombre_evento,
        fecha_inicio: eventoData.fecha_inicio,
        fecha_fin: eventoData.fecha_fin
      };

      // Agregar campos opcionales solo si tienen valores válidos
      if (eventoData.descripcion && eventoData.descripcion.trim()) {
        payload.descripcion = eventoData.descripcion.trim();
      }
      
      if (eventoData.lugar && eventoData.lugar.trim()) {
        payload.lugar = eventoData.lugar.trim();
      }
      
      // Validar y convertir cupo_maximo correctamente
      if (eventoData.cupo_maximo !== null && eventoData.cupo_maximo !== undefined && eventoData.cupo_maximo !== '') {
        const cupoParsed = parseInt(eventoData.cupo_maximo);
        
        if (isNaN(cupoParsed)) {
          throw new Error(`cupo_maximo debe ser un número válido, recibido: ${eventoData.cupo_maximo}`);
        }
        
        if (cupoParsed <= 0) {
          throw new Error(`cupo_maximo debe ser mayor a 0, recibido: ${cupoParsed}`);
        }
        
        payload.cupo_maximo = cupoParsed;
      }
      
      console.log('📦 Payload final a enviar:', JSON.stringify(payload, null, 2));

      const response = await fetch(API_ENDPOINTS.ADMIN_EVENTOS, {
        credentials: 'include',
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      return data.data || data;
      
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualizar un evento
   * PUT /api/v1/admin/eventos/{evento_id}
   */
  static async actualizarEvento(eventoId, eventoData) {
    try {

      console.log('📦 Payload final:', JSON.stringify(eventoData, null, 2));

      const response = await fetch(API_ENDPOINTS.ADMIN_EVENTO_BY_ID(eventoId), {
        credentials: 'include',
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(eventoData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Payload enviado:', JSON.stringify(eventoData, null, 2));

        let mensajeError = errorData.message || errorData.detail || `Error ${response.status}: ${response.statusText}`;

        if (errorData.errors) {
          if (Array.isArray(errorData.errors)) {
            // Si es un array de errores
            console.error('❌ Errores en array:', JSON.stringify(errorData.errors, null, 2));
            mensajeError = errorData.errors.map((err, idx) => {
              if (typeof err === 'string') return err;
              if (err.message) return err.message;
              return JSON.stringify(err);
            }).join(', ');
          } else {
            // Si es un objeto de errores por campo
            mensajeError = Object.entries(errorData.errors).map(([key, val]) => `${key}: ${val}`).join(', ');
          }
        }
        throw new Error(mensajeError);
      }

      const data = await response.json();

      return data.data || data;

    } catch (error) {
      throw error;
    }
  }

  /**
   * Eliminar un evento
   * DELETE /api/v1/admin/eventos/{evento_id}
   */
  static async eliminarEvento(eventoId) {
    try {
      
      const response = await fetch(API_ENDPOINTS.ADMIN_EVENTO_BY_ID(eventoId), {
        credentials: 'include',
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      return true;
      
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener asistentes de un evento
   * GET /api/v1/eventos/{evento_id}/asistentes
   */
  static async obtenerAsistentes(eventoId) {
    try {
      
      const response = await fetch(API_ENDPOINTS.EVENTO_ASISTENTES(eventoId), {
        credentials: 'include',
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ Asistentes obtenidos (${data.length || 0}):`, data);
      
      return Array.isArray(data) ? data : (data.data || data.asistentes || []);
      
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener todos los eventos (Admin)
   * GET /api/v1/admin/eventos
   */
  static async obtenerEventosAdmin() {
    try {

      const response = await fetch(API_ENDPOINTS.ADMIN_EVENTOS, {
        credentials: 'include',
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      return Array.isArray(data) ? data : (data.data || data.eventos || []);

    } catch (error) {
      console.error('❌ Error obteniendo eventos (admin):', error);
      throw new Error('No se pudieron cargar los eventos');
    }
  }

  /**
   * Obtener un evento por ID (Admin)
   * GET /api/v1/admin/eventos/{id}
   */
  static async obtenerEventoPorIdAdmin(eventoId) {
    try {
      
      const response = await fetch(API_ENDPOINTS.ADMIN_EVENTO_BY_ID(eventoId), {
        credentials: 'include',
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      return data.data || data;
      
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cambiar estado de un evento
   * PATCH /api/v1/admin/eventos/{id}/estado
   */
  static async cambiarEstadoEvento(eventoId, estado) {
    try {

      const payload = {
        estado: estado.toLowerCase(),
        comentario: null
      };

      console.log('📦 Payload:', JSON.stringify(payload, null, 2));

      const response = await fetch(API_ENDPOINTS.ADMIN_EVENTO_ESTADO(eventoId), {
        credentials: 'include',
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      return data;

    } catch (error) {
      throw error;
    }
  }

  /**
   * Verificar capacidad de un evento
   * GET /api/v1/admin/eventos/{id}/capacidad
   */
  static async verificarCapacidad(eventoId) {
    try {
      
      const response = await fetch(API_ENDPOINTS.ADMIN_EVENTO_CAPACIDAD(eventoId), {
        credentials: 'include',
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      return data;
      
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener eventos próximos
   * GET /api/v1/admin/eventos/proximos/listado
   */
  static async obtenerEventosProximos() {
    try {
      
      const response = await fetch(API_ENDPOINTS.ADMIN_EVENTOS_PROXIMOS, {
        credentials: 'include',
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      return Array.isArray(data) ? data : (data.data || data.eventos || []);
      
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener estadísticas generales de eventos
   * GET /api/v1/admin/eventos/estadisticas/generales
   */
  static async obtenerEstadisticasGenerales() {
    try {

      const response = await fetch(API_ENDPOINTS.ADMIN_EVENTOS_ESTADISTICAS, {
        credentials: 'include',
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      return data;

    } catch (error) {
      throw error;
    }
  }

  /**
   * Archivar un evento
   * PATCH /api/v1/admin/eventos/{id}/archivar
   */
  static async archivarEvento(eventoId) {
    try {

      const response = await fetch(API_ENDPOINTS.ADMIN_EVENTO_ARCHIVAR(eventoId), {
        credentials: 'include',
        method: 'PATCH',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      return data.data || data;

    } catch (error) {
      throw error;
    }
  }
}

export default EventosService;
