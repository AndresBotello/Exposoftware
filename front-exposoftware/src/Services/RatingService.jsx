import { API_ENDPOINTS, API_BASE_URL } from '../utils/constants';

class RatingService {
  /**
   * Calificar un proyecto como asistente
   * POST /api/v1/proyectos/{id_proyecto}/calificar-asistente
   * @param {string} id_proyecto - ID del proyecto a calificar
   * @param {number} calificacion - Calificación (1-5)
   * @returns {Promise} Respuesta del servidor
   */
  async calificarProyecto(id_proyecto, calificacion) {
    try {

      const response = await fetch(
        `${API_BASE_URL}/api/v1/proyectos/${id_proyecto}/calificar-asistente`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({ calificacion })
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.detail || errorData.mensaje || `Error ${response.status}: ${response.statusText}`;
        throw new Error(errorMsg);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener proyectos de un evento para calificar
   * GET /api/v1/eventos/{id_evento}/proyectos
   * @param {string} id_evento - ID del evento
   * @returns {Promise} Lista de proyectos
   */
  async obtenerProyectosDelEvento(id_evento) {
    try {

      const response = await fetch(
        API_ENDPOINTS.EVENTO_PROYECTOS(id_evento),
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data || data || [];
    } catch (error) {
      throw error;
    }
  }
}

export default new RatingService();
