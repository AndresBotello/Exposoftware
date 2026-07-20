import { API_ENDPOINTS } from '../utils/constants';
import * as AuthService from './AuthService';
import JSZip from 'jszip';

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
  descargarBlob(blob, fileName) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }

  async obtenerZipLoteBlob(id_proyecto) {
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

    const contentType = response.headers.get('content-type');

    if (contentType && !contentType.includes('application/zip') && !contentType.includes('application/octet-stream')) {
      throw new Error(`Tipo de archivo inesperado: ${contentType}. Se esperaba un archivo ZIP.`);
    }

    const blob = await response.blob();
    const contentDisposition = response.headers.get('content-disposition');
    let fileName = `certificados_proyecto_${id_proyecto}.zip`;

    if (contentDisposition) {
      const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (fileNameMatch && fileNameMatch[1]) {
        fileName = fileNameMatch[1].replace(/['"]/g, '');
      }
    }

    return { blob, fileName };
  }

  /**
   * Obtener listado de lotes de certificados
   * GET /api/v1/admin/reportes/certificados/lotes
   */
  async obtenerLotesCertificados() {
    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost';
      const lotesAcumulados = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const url = new URL(API_ENDPOINTS.ADMIN_LOTES_CERTIFICADOS, baseUrl);
        url.searchParams.set('page', String(page));
        url.searchParams.set('limit', '100');

        const response = await fetch(url.toString(), {
          method: 'GET',
          headers: getAuthHeaders(),
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        let pageLotes = [];
        if (Array.isArray(data)) {
          pageLotes = data;
        } else if (data?.data?.lotes && Array.isArray(data.data.lotes)) {
          pageLotes = data.data.lotes;
        } else if (data?.lotes && Array.isArray(data.lotes)) {
          pageLotes = data.lotes;
        }

        if (pageLotes.length === 0) {
          hasMore = false;
        } else {
          lotesAcumulados.push(...pageLotes);
          page += 1;
        }
      }

      return lotesAcumulados.length > 0 ? lotesAcumulados : [];
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
      const { blob, fileName } = await this.obtenerZipLoteBlob(id_proyecto);
      this.descargarBlob(blob, fileName);

      return { success: true, fileName };
    } catch (error) {
      throw error;
    }
  }

  async descargarTodosLosCertificadosEnZip(lotes = []) {
    if (!Array.isArray(lotes) || lotes.length === 0) {
      throw new Error('No hay lotes de certificados para comprimir');
    }

    const zipMaestro = new JSZip();
    let lotesProcesados = 0;
    let lotesFallidos = 0;

    for (const lote of lotes) {
      const idProyecto = lote?.id_proyecto || lote?.proyecto?.id_proyecto;

      if (!idProyecto) {
        lotesFallidos += 1;
        continue;
      }

      try {
        const { blob } = await this.obtenerZipLoteBlob(idProyecto);
        const innerZip = await JSZip.loadAsync(blob);
        const folderName = (lote?.titulo_proyecto || lote?.proyecto?.nombre_proyecto || `proyecto_${idProyecto}`)
          .toString()
          .replace(/[\\/:*?"<>|]/g, '_')
          .trim() || `proyecto_${idProyecto}`;

        const folder = zipMaestro.folder(folderName);

        for (const [relativePath, file] of Object.entries(innerZip.files)) {
          if (!file.dir) {
            const fileBlob = await file.async('blob');
            folder.file(relativePath, fileBlob);
          }
        }

        lotesProcesados += 1;
      } catch (error) {
        console.error(`Error agregando lote ${idProyecto} al ZIP maestro:`, error);
        lotesFallidos += 1;
      }
    }

    if (lotesProcesados === 0) {
      throw new Error('No se pudo incluir ningún lote en el ZIP maestro');
    }

    const blob = await zipMaestro.generateAsync({ type: 'blob' });
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `certificados_todos_los_lotes_${timestamp}.zip`;

    this.descargarBlob(blob, fileName);

    return {
      success: true,
      fileName,
      lotesProcesados,
      lotesFallidos
    };
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
