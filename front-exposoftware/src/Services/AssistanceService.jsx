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
  static async generarQrEvento(idEvento, urlFront = 'https://exposoftware2026.netlify.app') {
    try {

      const response = await fetch(
        `${API_ENDPOINTS.GENERAR_QR(idEvento)}?url_front=${urlFront}`,
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

      const response = await fetch(API_ENDPOINTS.REGISTRAR_ASISTENCIA(idEvento), {
        credentials: 'include',
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ correo_usuario: correoUsuario })
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
   * @param {number} limit - Límite de registros a obtener (default: 100)
   */
  static async obtenerAsistenciasEvento(idEvento, limit = 100) {
    try {

      const response = await fetch(
        `${API_ENDPOINTS.ASISTENCIAS_EVENTO(idEvento)}?limit=${limit}`,
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
      return data;
    } catch (error) {
      throw error;
    }
  }
}

export default AssistanceService;