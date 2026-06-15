import { API_ENDPOINTS } from '../utils/constants';
import * as AuthService from './AuthService';

const getAuthHeaders = () => {
  const token = AuthService.getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

/**
 * Servicio para gestionar certificados
 */
class CertificadosService {
  /**
   * Obtener listado de lotes de certificados
   * GET /api/v1/admin/reportes/certificados/lotes
   */
  async obtenerLotesCertificados() {
    try {
      const response = await fetch(
        API_ENDPOINTS.ADMIN_LOTES_CERTIFICADOS,
        {
          method: 'GET',
          headers: getAuthHeaders(),
          credentials: 'include'
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
   * Enviar certificados por correo electrónico a los estudiantes del proyecto
   * POST /api/v1/admin/reportes/certificados/enviar-por-correo
   * @param {string} id_proyecto - ID del proyecto cuyos certificados se descargan desde Cloudinary
   * @param {string} asunto - Asunto del correo electrónico
   * @param {string} mensaje_personalizado - Mensaje personalizado del correo
   */
  async enviarCertificadosPorCorreo(id_proyecto, asunto, mensaje_personalizado) {
    try {

      const payload = {
        id_proyecto: id_proyecto,
        asunto: asunto,
        mensaje_personalizado: mensaje_personalizado
      };

      const response = await fetch(
        API_ENDPOINTS.ADMIN_ENVIAR_CERTIFICADOS,
        {
          method: 'POST',
          headers: getAuthHeaders(),
          credentials: 'include',
          body: JSON.stringify(payload)
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
   * Descargar certificados de un proyecto en formato ZIP
   * GET /api/v1/admin/reportes/certificados/descargar-zip/{id_proyecto}
   * @param {string} id_proyecto - ID del proyecto cuyos certificados descargar
   */
  async descargarLoteCertificados(id_proyecto) {
    try {

      const response = await fetch(
        API_ENDPOINTS.ADMIN_DESCARGAR_CERTIFICADOS_ZIP(id_proyecto),
        {
          method: 'GET',
          headers: getAuthHeaders(),
          credentials: 'include'
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.detail || `Error ${response.status}: ${response.statusText}`;
        throw new Error(errorMsg);
      }

      // Verificar si realmente es un archivo ZIP
      const contentType = response.headers.get('content-type');

      if (contentType && !contentType.includes('application/zip') && !contentType.includes('application/octet-stream')) {
        throw new Error(`Tipo de archivo inesperado: ${contentType}. Se esperaba un archivo ZIP.`);
      }

      // Crear un enlace temporal para descargar el archivo
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Obtener el nombre del archivo desde los headers o usar uno por defecto
      const contentDisposition = response.headers.get('content-disposition');
      let fileName = `certificados_proyecto_${id_proyecto}.zip`;

      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (fileNameMatch && fileNameMatch[1]) {
          fileName = fileNameMatch[1].replace(/['"]/g, '');
        }
      }

      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return { success: true, fileName };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Generar certificados por proyecto
   * POST /api/v1/admin/reportes/certificados/generar-por-proyecto
   * @param {string} id_proyecto - ID del proyecto
   * @param {boolean} incluir_calificacion - Incluir calificación en el certificado
   * @param {string} director_evento - Nombre del director del evento
   * @param {string} coordinador_general - Nombre del coordinador general
   */
  async generarCertificadosPorProyecto(id_proyecto, incluir_calificacion = false, director_evento = '', coordinador_general = '') {
    try {

      const payload = {
        id_proyecto,
        incluir_calificacion,
        director_evento,
        coordinador_general
      };

      const response = await fetch(
        API_ENDPOINTS.ADMIN_GENERAR_CERTIFICADO_POR_PROYECTO,
        {
          method: 'POST',
          headers: getAuthHeaders(),
          credentials: 'include',
          body: JSON.stringify(payload)
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
   * Generar certificados por evento (masivo)
   * POST /api/v1/admin/reportes/certificados/generar-por-evento
   * Genera certificados para todos los proyectos de un evento
   * @param {string} id_evento - UUID del evento
   * @param {boolean} incluir_calificacion - Default false
   * @param {string} director_evento - Nombre del director (opcional)
   * @param {string} coordinador_general - Nombre del coordinador (opcional)
   */
  async generarCertificadosPorEvento(id_evento, incluir_calificacion = false, director_evento = '', coordinador_general = '') {
    try {
      const payload = {
        id_evento,
        incluir_calificacion,
        ...(director_evento && { director_evento }),
        ...(coordinador_general && { coordinador_general })
      };

      // Usar AbortController para timeout de 20 minutos (1200 segundos)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200000);

      try {
        const response = await fetch(
          API_ENDPOINTS.ADMIN_GENERAR_CERTIFICADOS_POR_EVENTO,
          {
            method: 'POST',
            headers: getAuthHeaders(),
            credentials: 'include',
            body: JSON.stringify(payload),
            signal: controller.signal
          }
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMsg = errorData.detail || errorData.mensaje || `Error ${response.status}: ${response.statusText}`;
          throw new Error(errorMsg);
        }

        const data = await response.json();
        return data;
      } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          throw new Error('La operación tardó demasiado. Por favor intenta nuevamente.');
        }
        throw error;
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Generar certificado individual
   * POST /api/v1/admin/reportes/certificados/generar-individual
   * @param {string} id_estudiante - ID del estudiante
   * @param {string} id_proyecto - ID del proyecto
   * @param {string} formato_salida - Formato del certificado ('pdf' o 'png')
   */
  async generarCertificadoIndividual(id_estudiante, id_proyecto, formato_salida = 'pdf') {
    try {

      const payload = {
        id_estudiante,
        id_proyecto,
        formato_salida
      };

      const response = await fetch(
        API_ENDPOINTS.ADMIN_GENERAR_CERTIFICADO_INDIVIDUAL,
        {
          method: 'POST',
          headers: getAuthHeaders(),
          credentials: 'include',
          body: JSON.stringify(payload)
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
}

export default new CertificadosService();
