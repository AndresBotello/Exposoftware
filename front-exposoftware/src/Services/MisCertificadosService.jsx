/**
 * MisCertificadosService.jsx
 * Servicio para que los estudiantes descarguen sus certificados ya generados
 */

import { API_ENDPOINTS } from '../utils/constants';
import * as AuthService from './AuthService';

/**
 * Obtener lista de certificados del usuario autenticado
 * GET /api/v1/certificados/mis-certificados
 */
export const obtenerMisCertificados = async () => {
  try {

    const response = await fetch(API_ENDPOINTS.MIS_CERTIFICADOS, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      credentials: 'include'
    });

    if (response.ok) {
      const data = await response.json();
      const certificados = data.data || data || [];
      return certificados;
    } else if (response.status === 401) {
      throw new Error('Sesión expirada. Por favor inicie sesión nuevamente.');
    } else {
      throw new Error(`Error al obtener certificados: ${response.status}`);
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Descargar un certificado específico del usuario
 * GET /api/v1/certificados/mis-certificados/{id_certificado}/descargar
 * @param {string} idCertificado - ID del certificado a descargar
 * @param {string} nombreArchivo - Nombre del archivo a descargar
 * @param {string} urlCloudinary - (Opcional) URL de Cloudinary directa
 */
export const descargarMiCertificado = async (idCertificado, nombreArchivo = 'certificado.pdf', urlCloudinary = null) => {
  try {

    // Si ya tenemos la URL de Cloudinary, usarla directamente
    if (urlCloudinary) {
      const blob = await fetch(urlCloudinary).then(r => r.blob());
      descargarBlob(blob, nombreArchivo);
      return { success: true, message: 'Certificado descargado exitosamente' };
    }

    const url = API_ENDPOINTS.CERTIFICADO_DESCARGAR(idCertificado);

    // El endpoint es público (sin autenticación)
    // redirect: 'manual' detiene en 302 para capturar URL de Cloudinary
    let response;
    try {
      response = await fetch(url, {
        method: 'GET',
        redirect: 'manual'          // Capturar 302, no seguir a Cloudinary
      });
    } catch (fetchError) {
      throw new Error(`Error de conexión: ${fetchError.message}`);
    }

    console.log('📋 Content-Type:', response.headers.get('content-type'));

    // Caso 1: Redirect a Cloudinary (status 302, 301, etc)
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const urlCloudinary = response.headers.get('location');
      if (urlCloudinary) {
        // Fetch a Cloudinary SIN credentials (wildcard CORS funciona sin credentials)
        const cloudinaryResponse = await fetch(urlCloudinary);
        if (cloudinaryResponse.ok) {
          const blob = await cloudinaryResponse.blob();
          descargarBlob(blob, nombreArchivo);
          return { success: true, message: 'Certificado descargado exitosamente' };
        }
      }
    }

    // Caso 2: Respuesta exitosa (200)
    if (response.ok) {
      const contentType = response.headers.get('content-type') || '';

      // Subcase 2a: PDF directo
      if (contentType.includes('application/pdf')) {
        console.log('✅ Certificado obtenido (PDF directo)');
        const blob = await response.blob();
        descargarBlob(blob, nombreArchivo);
        return { success: true, message: 'Certificado descargado exitosamente' };
      }

      // Subcase 2b: JSON con URL
      if (contentType.includes('application/json')) {
        const data = await response.json();
        if (data.url) {
          const cloudinaryResponse = await fetch(data.url);
          if (cloudinaryResponse.ok) {
            const blob = await cloudinaryResponse.blob();
            descargarBlob(blob, nombreArchivo);
            return { success: true, message: 'Certificado descargado exitosamente' };
          }
        }
      }
    }

    // Errores HTTP
    if (response.status === 401) {
      throw new Error('Sesión expirada. Por favor inicie sesión nuevamente.');
    } else if (response.status === 403) {
      throw new Error('No tienes permiso para descargar este certificado.');
    } else if (response.status === 404) {
      throw new Error('El certificado no fue encontrado.');
    } else if (!response.ok) {
      throw new Error(`Error al descargar certificado: ${response.status}`);
    }

    throw new Error('No se pudo obtener el certificado: formato de respuesta desconocido');

  } catch (error) {

    if (error.message.includes('Failed to fetch')) {
      throw new Error('Error de conexión. Verifica tu conexión a internet e intenta de nuevo.');
    } else if (error.message.includes('CORS')) {
      throw new Error('Error de seguridad (CORS). Intenta desde un navegador actualizado.');
    }

    throw error;
  }
};

/**
 * Función auxiliar para descargar un blob
 */
const descargarBlob = (blob, nombreArchivo) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = nombreArchivo;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);

};

export default {
  obtenerMisCertificados,
  descargarMiCertificado
};
