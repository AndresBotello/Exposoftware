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
 * Servicio para la gestión de asistencias a eventos
 */
class AssistanceService {
  /**
   * Genera un código QR para registro de asistencia del evento
   * POST /api/v1/asistencia/generar-qr/{id_evento}
   * @param {string} idEvento - ID del evento
   * @param {string} urlFront - URL base del frontend (opcional)
   */
  static async generarQrEvento(idEvento, urlFront = null) {
    try {
      // Usar la URL actual del navegador si no se proporciona
      const baseUrl = urlFront || window.location.origin;

      const response = await fetch(
        `${API_ENDPOINTS.GENERAR_QR(idEvento)}?url_front=${baseUrl}`,
        {
          method: 'POST',
          credentials: 'include',
          headers: getAuthHeaders()
        }
      );

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
   * Registra la asistencia de un usuario en el evento
   * POST /api/v1/asistencia/registrar/{id_evento}
   * @param {string} idEvento - ID del evento
   * @param {string} correoUsuario - Correo del usuario
   */
  static async registrarAsistencia(idEvento, correoUsuario) {
    try {
      const ahora = new Date();
      const hora = ahora.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

      const response = await fetch(API_ENDPOINTS.REGISTRAR_ASISTENCIA(idEvento), {
        credentials: 'include',
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          correo_usuario: correoUsuario,
          hora_asistencia: hora
        })
      });

      const data = await response.json();

      if (!response.ok) {
        const error = new Error(data.message || `Error ${response.status}`);
        error.status = response.status;
        error.data = data;
        throw error;
      }
      return data;
    } catch (error) {
      if (!error.status) {
        throw error;
      }

      throw error;
    }
  }

  /**
   * Obtiene todas las asistencias de un evento (requiere autenticación ADMIN)
   * GET /api/v1/asistencia/evento/{id_evento}
   * @param {string} idEvento - ID del evento
   */
  static async obtenerAsistenciasEvento(idEvento) {
    try {
      let allAsistencias = [];
      let page = 1;
      const limit = 500; // Máximo permitido por el backend
      let hasMore = true;

      while (hasMore) {
        const response = await fetch(
          `${API_ENDPOINTS.ASISTENCIAS_EVENTO(idEvento)}?page=${page}&limit=${limit}`,
          {
            method: 'GET',
            credentials: 'include',
            headers: getAuthHeaders()
          }
        );

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        const asistencias = data.data?.asistencias || [];

        if (asistencias.length === 0) {
          hasMore = false;
        } else {
          allAsistencias = [...allAsistencias, ...asistencias];
          page++;

          // Si devolvió menos de lo que pedimos, ya no hay más
          if (asistencias.length < limit) {
            hasMore = false;
          }
        }
      }

      // Retornar en el mismo formato que el endpoint
      return {
        status: 'success',
        data: {
          asistencias: allAsistencias
        }
      };
    } catch (error) {
      throw error;
    }
  }
}

export default AssistanceService;