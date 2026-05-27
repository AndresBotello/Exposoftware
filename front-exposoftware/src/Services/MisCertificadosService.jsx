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

    // Paso 1: Obtener el certificado del backend (sin credenciales para evitar CORS con Cloudinary)
    // El backend debe estar configurado para aceptar esta solicitud cross-origin
    const response = await fetch(
      API_ENDPOINTS.CERTIFICADO_DESCARGAR(idCertificado),
      {
        method: 'GET'
      }
    );

    console.log('📡 Status de respuesta:', response.status);
    console.log('📋 Content-Type:', response.headers.get('content-type'));

    // Manejar respuesta
    if (response.ok) {
      // Verificar si es un PDF directo o una redirección a Cloudinary
      const contentType = response.headers.get('content-type') || '';

      if (contentType.includes('application/pdf')) {
        // El servidor devolvió el archivo PDF directamente
        const blob = await response.blob();
        console.log('✅ Certificado obtenido (PDF directo):');
        console.log('   - Tamaño:', blob.size, 'bytes');
        console.log('   - Tipo MIME:', blob.type);

        descargarBlob(blob, nombreArchivo);
        return { success: true, message: 'Certificado descargado exitosamente' };
      } else {
        // El servidor redirigió a Cloudinary, obtenemos la URL final
        const blob = await response.blob();
        const urlCloudinary = response.url;

        console.log('✅ URL de Cloudinary obtenida:', urlCloudinary);
        console.log('   - Descargando desde Cloudinary sin credenciales...');

        // Paso 2: Descargar directamente desde Cloudinary SIN usar fetch (evita CORS)
        // Usar window.location para que el navegador descargue el archivo normalmente
        const link = document.createElement('a');
        link.href = urlCloudinary;
        link.download = nombreArchivo;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        console.log('✅ Descarga iniciada desde Cloudinary');
        return { success: true, message: 'Certificado descargado exitosamente' };
      }
    } else if (response.status === 401) {
      throw new Error('Sesión expirada. Por favor inicie sesión nuevamente.');
    } else if (response.status === 403) {
      throw new Error('No tienes permiso para descargar este certificado.');
    } else if (response.status === 404) {
      throw new Error('El certificado no fue encontrado.');
    } else {
      throw new Error(`Error al descargar certificado: ${response.status}`);
    }
  } catch (error) {
    console.error('❌ Error descargando certificado:', error);

    // Proporcionar mensajes de error más específicos
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

  console.log('✅ Certificado descargado:');
  console.log('   - Nombre:', nombreArchivo);
  console.log('   - Tamaño:', blob.size, 'bytes');
  console.log('   - Tipo MIME:', blob.type);
};

export default {
  obtenerMisCertificados,
  descargarMiCertificado
};
