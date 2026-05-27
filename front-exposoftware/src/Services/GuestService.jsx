import { API_ENDPOINTS } from '../utils/constants';
import * as AuthService from './AuthService';

// Definición de sectores disponibles
const SECTORES = [
  { id: 1, nombre: 'Educativo' },
  { id: 2, nombre: 'Empresarial' },
  { id: 3, nombre: 'Social' },
  { id: 4, nombre: 'Gubernamental' },
];

/**
 * Función para obtener el nombre del sector por ID
 */
const obtenerNombreSector = (idSector) => {
  if (!idSector) return 'No especificado';
  const sector = SECTORES.find(s => s.id === parseInt(idSector));
  return sector ? sector.nombre : 'No especificado';
};

/**
 * Obtener token de autenticación
 * Busca en localStorage (usuarios reales) y sessionStorage (invitados)
 */
const getAuthToken = () => {
  return AuthService.getToken();
};

/**
 * Obtener headers de autenticación
 */
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

/**
 * Obtener información del usuario autenticado desde /api/v1/auth/me
 */
export const obtenerInformacionUsuario = async () => {
  try {
    console.log('👤 Obteniendo información del usuario desde /api/v1/auth/me...');
    
    const token = getAuthToken();
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    const response = await fetch(API_ENDPOINTS.AUTH_ME, {
      credentials: 'include',
      method: 'GET',
      headers: getAuthHeaders()
    });

    console.log('📡 Respuesta /api/v1/auth/me - Status:', response.status);

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('auth_token');
        throw new Error('Sesión expirada. Por favor inicie sesión nuevamente.');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.detail || 'Error al obtener información del usuario');
    }

    const userData = await response.json();
    console.log('✅ Información del usuario obtenida:', userData);
    
    return userData;
    
  } catch (error) {
    console.error('❌ Error obteniendo información del usuario:', error);
    throw error;
  }
};

/**
 * Obtener perfil del invitado autenticado
 * Usa las cookies de sesión para obtener la información desde /api/v1/invitados/mi-perfil
 */
export const obtenerMiPerfilInvitado = async () => {
  try {
    console.log('👤 Obteniendo información completa del usuario invitado desde /api/v1/invitados/mi-perfil...');

    const token = getAuthToken();
    const headers = getAuthHeaders();
    console.log('🔐 Token disponible:', !!token);
    console.log('📤 Headers siendo enviados:', headers);

    const response = await fetch(API_ENDPOINTS.INVITADO_MI_PERFIL, {
      credentials: 'include',
      method: 'GET',
      headers: headers
    });

    console.log('📡 Respuesta /api/v1/invitados/mi-perfil - Status:', response.status);
    console.log('📄 Response body:', await response.clone().text());

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Sesión expirada. Por favor inicie sesión nuevamente.');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.detail || `Error al obtener perfil (${response.status})`);
    }

    const userData = await response.json();
    console.log('✅ Información completa del usuario obtenida desde /api/v1/invitados/mi-perfil:', userData);
    console.log('📊 Estructura completa de data:', JSON.stringify(userData, null, 2));

    // La respuesta tiene formato: { status, message, data: { invitado, usuario }, code }
    if (userData.data && userData.data.invitado && userData.data.usuario) {
      console.log('📦 userData.data.invitado:', userData.data.invitado);
      console.log('👤 userData.data.usuario:', userData.data.usuario);
      console.log('✅ Perfil de invitado validado');

      // Procesar y retornar todos los datos del invitado
      return procesarDatosInvitado(userData.data);
    }

    throw new Error('Respuesta inválida del servidor: estructura de datos no esperada');
    
  } catch (error) {
    console.error('❌ Error obteniendo perfil del invitado:', error);
    throw error;
  }
};

/**
 * Obtener perfil de un invitado específico por ID
 */
export const obtenerPerfilInvitadoPorId = async (guestId) => {
  try {
    console.log('📞 Obteniendo perfil del invitado con ID:', guestId);
    
    const response = await fetch(API_ENDPOINTS.ADMIN_INVITADO_BY_ID(guestId), {
      credentials: 'include',
      method: 'GET',
      headers: getAuthHeaders()
    });

    console.log('📡 Respuesta - Status:', response.status);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Perfil del invitado obtenido:', data);
      
      // La respuesta puede venir en data.data o directamente
      const perfil = data.data || data;
      return procesarDatosInvitado(perfil);
    } else if (response.status === 401) {
      throw new Error('Sesión expirada. Por favor inicie sesión nuevamente.');
    } else if (response.status === 404) {
      throw new Error('Perfil de invitado no encontrado');
    } else {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.detail || 'Error al obtener perfil');
    }
  } catch (error) {
    console.error('❌ Error obteniendo perfil del invitado por ID:', error);
    throw error;
  }
};

/**
 * Actualizar perfil del invitado
 */
export const actualizarPerfilInvitado = async (guestId, datosInvitado) => {
  try {
    console.log('💾 Actualizando perfil del invitado...');
    console.log('Datos a enviar:', datosInvitado);
    
    const datosProcesados = prepararDatosParaBackend(datosInvitado);
    
    const response = await fetch(API_ENDPOINTS.ADMIN_INVITADO_BY_ID(guestId), {
      credentials: 'include',
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(datosProcesados)
    });

    console.log('📡 Respuesta actualización - Status:', response.status);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Perfil actualizado exitosamente:', data);
      return procesarDatosInvitado(data.data || data);
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Error en respuesta:', errorData);
      throw new Error(errorData.message || errorData.detail || 'Error al actualizar perfil');
    }
  } catch (error) {
    console.error('❌ Error actualizando perfil del invitado:', error);
    throw error;
  }
};

/**
 * Procesa los datos del invitado del backend al formato del frontend
 * Estructura esperada: { invitado: {...}, usuario: {...} }
 */
const procesarDatosInvitado = (perfil) => {
  if (!perfil) {
    console.warn('⚠️ No hay datos del invitado para procesar');
    return {};
  }

  console.log('🔄 PERFIL COMPLETO RECIBIDO PARA PROCESAR:', perfil);
  console.log('🔍 usuario:', perfil.usuario);
  console.log('🔍 invitado:', perfil.invitado);

  // Extraer datos del usuario e invitado
  const usuario = perfil.usuario || {};
  const invitado = perfil.invitado || {};

  console.log('👤 Datos del usuario:', usuario);
  console.log('🎓 Datos del invitado:', invitado);

  // Procesar nombres (p_nombre, p_apellido)
  const p_nombre = usuario.p_nombre || '';
  const p_apellido = usuario.p_apellido || '';

  const datosProcesados = {
    // IDs
    id_invitado: invitado.id_invitado || '',
    id_usuario: usuario.id_usuario || '',
    id_sector: invitado.id_sector || '',

    // Información personal
    identificacion: usuario.identificacion || '',
    p_nombre: p_nombre,
    p_apellido: p_apellido,
    nombres: p_nombre,
    apellidos: p_apellido,

    // Contacto
    telefono: usuario.telefono || '',
    correo: usuario.correo || '',

    // Información de empresa
    nombre_empresa: invitado.nombre_empresa || '',
    es_profesor_extranjero: invitado.es_profesor_extranjero || false,

    // Sistema
    activo: usuario.activo !== undefined ? usuario.activo : true,

    // Iniciales para avatar
    iniciales: getIniciales(p_nombre, p_apellido)
  };

  console.log('✅ DATOS PROCESADOS FINALES:', datosProcesados);
  return datosProcesados;
};

/**
 * Obtener iniciales de primer nombre y primer apellido
 */
const getIniciales = (primerNombre, primerApellido) => {
  const nombre = (primerNombre || '').trim();
  const apellido = (primerApellido || '').trim();
  return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
};

/**
 * Prepara los datos del frontend para enviar al backend
 * Solo envía los campos que el backend acepta
 */
const prepararDatosParaBackend = (datosInvitado) => {
  console.log('📦 Preparando datos para backend:', datosInvitado);

  const payload = {
    p_nombre: datosInvitado.p_nombre || '',
    p_apellido: datosInvitado.p_apellido || '',
    telefono: datosInvitado.telefono || '',
    nombre_empresa: datosInvitado.nombre_empresa || '',
    id_sector: datosInvitado.id_sector || '',
    es_profesor_extranjero: datosInvitado.es_profesor_extranjero || false
  };

  console.log('✅ Payload preparado:', payload);
  return payload;
};

/**
 * Obtener todos los proyectos disponibles
 */
export const obtenerTodosLosProyectos = async () => {
  try {
    console.log('📚 Obteniendo todos los proyectos...');
    
    const response = await fetch(API_ENDPOINTS.PROYECTOS, {
      credentials: 'include',
      method: 'GET',
      headers: getAuthHeaders()
    });

    console.log('📡 Respuesta proyectos - Status:', response.status);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Proyectos obtenidos:', data);
      
      // La respuesta puede venir en diferentes formatos
      let proyectos = data.data || data.proyectos || data;
      
      if (!Array.isArray(proyectos)) {
        proyectos = Object.values(data).find(val => Array.isArray(val)) || [];
      }
      
      console.log('📊 Total de proyectos:', proyectos.length);
      return proyectos;
    } else if (response.status === 401) {
      throw new Error('Sesión expirada. Por favor inicie sesión nuevamente.');
    } else if (response.status === 404) {
      return [];
    } else {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.detail || 'Error al obtener proyectos');
    }
  } catch (error) {
    console.error('❌ Error obteniendo proyectos:', error);
    throw error;
  }
};

// Exportar la función obtenerNombreSector para uso externo
export { obtenerNombreSector, SECTORES };

export default {
  obtenerInformacionUsuario,
  obtenerMiPerfilInvitado,
  obtenerPerfilInvitadoPorId,
  actualizarPerfilInvitado,
  obtenerTodosLosProyectos,
  obtenerNombreSector,
  SECTORES
};