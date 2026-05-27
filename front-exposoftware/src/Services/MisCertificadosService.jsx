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
    console.log('📋 Obteniendo lista de mis certificados...');

    const response = await fetch(API_ENDPOINTS.MIS_CERTIFICADOS, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      credentials: 'include'
    });

    if (response.ok) {
      const data = await response.json();
      const certificados = data.data || data || [];
      console.log('✅ Certificados obtenidos:', certificados.length);
      return certificados;
    } else if (response.status === 401) {
      throw new Error('Sesión expirada. Por favor inicie sesión nuevamente.');
    } else {
      throw new Error(`Error al obtener certificados: ${response.status}`);
    }
  } catch (error) {
    console.error('❌ Error obteniendo certificados:', error);
    throw error;
  }
};

/**
 * Descargar un certificado específico del usuario
 * GET /api/v1/certificados/mis-certificados/{id_certificado}/descargar
 * @param {string} idCertificado - ID del certificado a descargar
 * @param {string} nombreArchivo - Nombre del archivo a descargar
 */
export const descargarMiCertificado = async (idCertificado, nombreArchivo = 'certificado.pdf') => {
  try {
    console.log('📥 Descargando certificado:', idCertificado);

    // SOLUCIÓN: No seguir el redirect automáticamente (redirect: 'manual')
    // Esto evita que fetch() intente acceder a Cloudinary con CORS
    // IMPORTANTE: Sí enviamos credentials para autenticar con el backend
    const response = await fetch(
      API_ENDPOINTS.CERTIFICADO_DESCARGAR(idCertificado),
      {
        method: 'GET',
        credentials: 'include',  // Enviar cookies de sesión
        redirect: 'manual'  // Detener en el redirect, no seguirlo
      }
    );

    console.log('📡 Status de respuesta:', response.status);
    console.log('📋 Content-Type:', response.headers.get('content-type'));

    // Caso 1: Redirect a Cloudinary (status 302, 301, etc)
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const urlCloudinary = response.headers.get('location');
      if (urlCloudinary) {
        console.log('✅ Redirect detectado:', urlCloudinary);
        // Abrir en nueva ventana evita CORS (no es fetch)
        abrirDescargaEnNuevaVentana(urlCloudinary, nombreArchivo);
        return { success: true, message: 'Certificado descargado exitosamente' };
      }
    }

    // Caso 2: Respuesta exitosa (200)
    if (response.ok) {
      const contentType = response.headers.get('content-type') || '';

      // Subcase 2a: PDF directo
      if (contentType.includes('application/pdf')) {
        console.log('✅ Certificado obtenido (PDF directo)');
        const blob = await response.blob();
        console.log('   - Tamaño:', blob.size, 'bytes');
        descargarBlob(blob, nombreArchivo);
        return { success: true, message: 'Certificado descargado exitosamente' };
      }

      // Subcase 2b: JSON con URL
      if (contentType.includes('application/json')) {
        const data = await response.json();
        if (data.url) {
          console.log('✅ URL de Cloudinary en JSON:', data.url);
          abrirDescargaEnNuevaVentana(data.url, nombreArchivo);
          return { success: true, message: 'Certificado descargado exitosamente' };
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
    console.error('❌ Error descargando certificado:', error);

    if (error.message.includes('Failed to fetch')) {
      throw new Error('Error de conexión. Verifica tu conexión a internet e intenta de nuevo.');
    } else if (error.message.includes('CORS')) {
      throw new Error('Error de seguridad (CORS). Intenta desde un navegador actualizado.');
    }

    throw error;
  }
};

/**
 * Abrir descarga en nueva ventana (evita problemas CORS)
 */
const abrirDescargaEnNuevaVentana = (url, nombreArchivo) => {
  const link = document.createElement('a');
  link.href = url;
  link.download = nombreArchivo;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  console.log('✅ Descarga iniciada:', nombreArchivo);
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

  console.log('✅ Certificado descargado:');
  console.log('   - Nombre:', nombreArchivo);
  console.log('   - Tamaño:', blob.size, 'bytes');
  console.log('   - Tipo MIME:', blob.type);
};

export default {
  obtenerMisCertificados,
  descargarMiCertificado
};
