import { API_ENDPOINTS } from "../utils/constants";
import * as AuthService from "./AuthService";

/**
 * Servicio para gestionar el perfil del estudiante autenticado
 */

/**
 * Obtener perfil del estudiante actual
 * @returns {Promise<Object>} Datos completos del estudiante y usuario
 */
export const obtenerMiPerfil = async () => {

  try {
    const response = await fetch(API_ENDPOINTS.ESTUDIANTE_MI_PERFIL, {
      method: 'GET',
      headers: AuthService.getAuthHeaders(),
      credentials: 'include'
    });


    if (response.ok) {
      const data = await response.json();
      
      // La respuesta tiene formato: { status, message, data, code }
      if (data.data) {
        return {
          success: true,
          data: data.data,
          message: data.message || 'Perfil obtenido correctamente'
        };
      }
      
      return {
        success: true,
        data: data,
        message: 'Perfil obtenido correctamente'
      };
    } else if (response.status === 401) {
      throw new Error('Sesión expirada. Por favor inicie sesión nuevamente.');
    } else if (response.status === 404) {
      throw new Error('No se encontró el perfil del estudiante.');
    } else {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error al obtener el perfil');
    }
  } catch (error) {
    if (error.message) {
      throw error;
    }
    throw new Error('Error de conexión. Verifique su conexión a internet.');
  }
};

/**
 * Actualizar perfil del estudiante actual
 * @param {Object} datosActualizados - Datos a actualizar
 * @returns {Promise<Object>} Datos actualizados del estudiante
 */
export const actualizarMiPerfil = async (datosActualizados) => {

  try {
    const payload = {};

    // Solo incluir datos que pueden actualizarse
    if (datosActualizados.p_nombre !== undefined) {
      payload.p_nombre = datosActualizados.p_nombre || '';
    }
    if (datosActualizados.p_apellido !== undefined) {
      payload.p_apellido = datosActualizados.p_apellido || '';
    }
    if (datosActualizados.telefono !== undefined) {
      payload.telefono = datosActualizados.telefono || '';
    }

    console.log('📦 Payload final a enviar:', JSON.stringify(payload, null, 2));

    const response = await fetch(API_ENDPOINTS.ESTUDIANTE_MI_PERFIL, {
      method: 'PUT',
      headers: AuthService.getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(payload)
    });


    if (response.ok) {
      const data = await response.json();

      if (data.data) {
        return {
          success: true,
          data: data.data,
          message: data.message || 'Perfil actualizado correctamente'
        };
      }

      return {
        success: true,
        data: data,
        message: 'Perfil actualizado correctamente'
      };
    } else if (response.status === 400) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Datos incorrectos para actualizar');
    } else if (response.status === 401) {
      throw new Error('Sesión expirada. Por favor inicie sesión nuevamente.');
    } else if (response.status === 404) {
      throw new Error('No se encontró el perfil del estudiante.');
    } else if (response.status === 422) {
      const errorData = await response.json().catch(() => ({}));

      if (errorData.errors && Array.isArray(errorData.errors)) {
        const errorMessages = errorData.errors.map(err =>
          `• ${err.field}: ${err.message}`
        ).join('\n');
        throw new Error('Errores de validación:\n' + errorMessages);
      }

      throw new Error(errorData.message || 'Datos no válidos para actualizar');
    } else {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error al actualizar el perfil');
    }
  } catch (error) {
    if (error.message) {
      throw error;
    }
    throw new Error('Error de conexión. Verifique su conexión a internet.');
  }
};

/**
 * Extraer información del perfil para mostrar en el dashboard
 * @param {Object} perfil - Datos completos del perfil con estructura { estudiante: {...}, usuario: {...} }
 * @returns {Object} Información procesada del perfil
 */
export const procesarDatosPerfil = (perfil) => {
  if (!perfil) return null;


  const usuario = perfil.usuario || {};
  const estudiante = perfil.estudiante || {};

  const primer_nombre = usuario.p_nombre || '';
  const primer_apellido = usuario.p_apellido || '';

  const datosProcessados = {
    // Datos de usuario
    id_usuario: usuario.id_usuario || '',
    identificacion: usuario.identificacion || '',
    primer_nombre: primer_nombre,
    primer_apellido: primer_apellido,
    nombre_completo: `${primer_nombre} ${primer_apellido}`.trim(),
    correo: usuario.correo || '',
    telefono: usuario.telefono || '',
    rol: usuario.rol || 'Estudiante',
    activo: usuario.activo !== undefined ? usuario.activo : true,

    // Datos de estudiante
    id_estudiante: estudiante.id_estudiante || '',
    codigo_programa: estudiante.codigo_programa || '',
    semestre: estudiante.semestre || null,
    anio_ingreso: estudiante.anio_ingreso || null,
    periodo: estudiante.periodo || null,

    // Metadata
    fecha_creacion: estudiante.created_at || null,
    fecha_actualizacion: estudiante.updated_at || null,

    // Iniciales para avatar
    iniciales: getIniciales(primer_nombre, primer_apellido)
  };

  return datosProcessados;
};

/**
 * Obtener iniciales de primer nombre y primer apellido
 * @param {string} primerNombre 
 * @param {string} primerApellido 
 * @returns {string} Iniciales (ej: "JP" para Juan Pérez)
 */
const getIniciales = (primerNombre, primerApellido) => {
  const nombre = (primerNombre || '').trim();
  const apellido = (primerApellido || '').trim();
  return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
};
