import axios from 'axios';
import { API_ENDPOINTS } from '../utils/constants';

/**
 * Servicio para gestionar certificados
 */
class CertificadosService {
  /**
   * Obtener la configuración de autenticación
   */
  getAuthConfig() {
    const token = localStorage.getItem('auth_token');
    return {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      withCredentials: true // Enviar cookies para mantener sesión
    };
  }

  /**
   * Obtener listado de lotes de certificados
   * GET /api/v1/admin/reportes/certificados/lotes
   */
  async obtenerLotesCertificados() {
    try {
      console.log('🔍 Obteniendo lotes de certificados...');
      const response = await axios.get(
        API_ENDPOINTS.ADMIN_CERTIFICADOS_LOTES,
        this.getAuthConfig()
      );
      
      console.log('✅ Lotes obtenidos:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener lotes de certificados:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Enviar certificados por correo electrónico a los estudiantes del lote
   * POST /api/v1/admin/reportes/certificados/enviar-por-correo
   * @param {string} id_lote - ID del lote de certificados
   * @param {string} asunto - Asunto del correo electrónico
   * @param {string} mensaje_personalizado - Mensaje personalizado del correo
   */
  async enviarCertificadosPorCorreo(id_lote, asunto, mensaje_personalizado) {
    try {
      console.log('📧 Enviando certificados por correo...', { id_lote, asunto });
      
      const payload = {
        id_lote: id_lote,
        asunto: asunto,
        mensaje_personalizado: mensaje_personalizado
      };

      const response = await axios.post(
        API_ENDPOINTS.ADMIN_CERTIFICADOS_ENVIAR_CORREO,
        payload,
        this.getAuthConfig()
      );
      
      console.log('✅ Certificados enviados:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al enviar certificados:', error.response?.data || error.message);
      
      // Manejar errores específicos
      if (error.response) {
        const { status, data } = error.response;
        
        // Error 400 - Bad Request
        if (status === 400) {
          const errorMsg = data?.mensaje || data?.detail || 'Solicitud inválida';
          throw new Error(errorMsg);
        }
        
        // Error 404 - Lote no encontrado
        if (status === 404) {
          throw new Error('El lote de certificados no existe');
        }
        
        // Error 500 - Error del servidor
        if (status === 500) {
          throw new Error('Error interno del servidor al enviar los certificados');
        }
        
        // Otros errores
        throw new Error(data?.detail || data?.mensaje || `Error ${status}: No se pudieron enviar los certificados`);
      }
      
      throw error;
    }
  }

  /**
   * Descargar certificados de un lote en formato ZIP
   * GET /api/v1/admin/reportes/certificados/descargar/{id_lote}
   * @param {string} id_lote - ID del lote de certificados
   */
  async descargarLoteCertificados(id_lote) {
    try {
      console.log('📥 Descargando lote de certificados...', id_lote);
      
      const token = localStorage.getItem('auth_token');
      const response = await axios.get(
        API_ENDPOINTS.ADMIN_CERTIFICADOS_DESCARGAR(id_lote),
        {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          responseType: 'blob', // Importante para archivos binarios
          validateStatus: function (status) {
            // Aceptar solo 200, rechazar otros
            return status === 200;
          }
        }
      );
      
      // Verificar si realmente es un archivo ZIP
      const contentType = response.headers['content-type'];
      console.log('📦 Content-Type recibido:', contentType);
      
      if (contentType && !contentType.includes('application/zip') && !contentType.includes('application/octet-stream')) {
        throw new Error(`Tipo de archivo inesperado: ${contentType}. Se esperaba un archivo ZIP.`);
      }
      
      // Crear un enlace temporal para descargar el archivo
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Obtener el nombre del archivo desde los headers o usar uno por defecto
      const contentDisposition = response.headers['content-disposition'];
      let fileName = `certificados_lote_${id_lote}.zip`;
      
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
      
      console.log('✅ Certificados descargados:', fileName);
      return { success: true, fileName };
    } catch (error) {
      console.error('❌ Error al descargar certificados:', error);
      
      // Manejar errores específicos
      if (error.response) {
        const { status, data } = error.response;
        
        // Si el error viene como blob, convertirlo a texto
        if (data instanceof Blob) {
          try {
            const text = await data.text();
            const errorData = JSON.parse(text);
            console.error('📄 Error del servidor:', errorData);
            throw new Error(errorData.detail || `Error ${status}: ${errorData.message || 'Error al descargar certificados'}`);
          } catch (parseError) {
            throw new Error(`Error ${status}: No se pudo descargar el lote de certificados. Verifica que el lote existe.`);
          }
        }
        
        throw new Error(data?.detail || `Error ${status}: No se pudo descargar el lote de certificados`);
      }
      
      throw error;
    }
  }

  /**
   * Generar certificados por proyecto
   * POST /api/v1/admin/reportes/certificados/generar-por-proyecto
   * @param {string} id_proyecto - ID del proyecto
   * @param {string} formato_salida - Formato del certificado ('pdf' o 'png')
   */
  async generarCertificadosPorProyecto(id_proyecto, formato_salida = 'pdf') {
    try {
      console.log('📄 Generando certificados por proyecto...', { id_proyecto, formato_salida });
      
      const response = await axios.post(
        API_ENDPOINTS.ADMIN_CERTIFICADOS_POR_PROYECTO,
        { id_proyecto, formato_salida },
        this.getAuthConfig()
      );
      
      console.log('✅ Certificados generados:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al generar certificados:', error.response?.data || error.message);
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
      console.log('📄 Generando certificado individual...', { id_estudiante, id_proyecto, formato_salida });
      
      const response = await axios.post(
        API_ENDPOINTS.ADMIN_CERTIFICADOS_INDIVIDUAL,
        { id_estudiante, id_proyecto, formato_salida },
        this.getAuthConfig()
      );
      
      console.log('✅ Certificado individual generado:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al generar certificado individual:', error.response?.data || error.message);
      throw error;
    }
  }
}

export default new CertificadosService();
