import { API_ENDPOINTS } from '../utils/constants';
import * as AuthService from './AuthService';
import { fetchApi } from '../utils/apiClient';
import { safeRemoveItem } from '../utils/safeStorage';

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
    
    const token = getAuthToken();
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    const response = await fetchApi(API_ENDPOINTS.AUTH_ME, {
      method: 'GET',
      headers: getAuthHeaders()
    });


    if (!response.ok) {
      if (response.status === 401) {
        safeRemoveItem('auth_token');
        throw new Error('Sesión expirada. Por favor inicie sesión nuevamente.');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.detail || 'Error al obtener información del usuario');
    }

    const userData = await response.json();
    
    return userData;
    
  } catch (error) {
    throw error;
  }
};

/**
 * Obtener perfil del invitado autenticado
 * Usa las cookies de sesión para obtener la información desde /api/v1/invitados/mi-perfil
 */
export const obtenerMiPerfilInvitado = async () => {
  try {

    const token = getAuthToken();
    const headers = getAuthHeaders();

    const response = await fetchApi(API_ENDPOINTS.INVITADO_MI_PERFIL, {
      method: 'GET',
      headers: headers
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Sesión expirada. Por favor inicie sesión nuevamente.');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.detail || `Error al obtener perfil (${response.status})`);
    }

    const userData = await response.json();

    // La respuesta tiene formato: { status, message, data: { invitado, usuario }, code }
    if (userData.data && userData.data.invitado && userData.data.usuario) {

      // Procesar y retornar todos los datos del invitado
      return procesarDatosInvitado(userData.data);
    }

    throw new Error('Respuesta inválida del servidor: estructura de datos no esperada');
    
  } catch (error) {
    throw error;
  }
};

/**
 * Obtener perfil de un invitado específico por ID
 */
export const obtenerPerfilInvitadoPorId = async (guestId) => {
  try {
    
    const response = await fetchApi(API_ENDPOINTS.ADMIN_INVITADO_BY_ID(guestId), {
      method: 'GET',
      headers: getAuthHeaders()
    });


    if (response.ok) {
      const data = await response.json();
      
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
    throw error;
  }
};

/**
 * Actualizar perfil del invitado
 */
export const actualizarPerfilInvitado = async (guestId, datosInvitado) => {
  try {
    
    const datosProcesados = prepararDatosParaBackend(datosInvitado);
    
    const response = await fetchApi(API_ENDPOINTS.ADMIN_INVITADO_BY_ID(guestId), {
      credentials: 'include',
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(datosProcesados)
    });


    if (response.ok) {
      const data = await response.json();
      return procesarDatosInvitado(data.data || data);
    } else {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.detail || 'Error al actualizar perfil');
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Procesa los datos del invitado del backend al formato del frontend
 * Estructura esperada: { invitado: {...}, usuario: {...} }
 */
const procesarDatosInvitado = (perfil) => {
  if (!perfil) {
    return {};
  }


  // Extraer datos del usuario e invitado
  const usuario = perfil.usuario || {};
  const invitado = perfil.invitado || {};


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

  const payload = {
    p_nombre: datosInvitado.p_nombre || '',
    p_apellido: datosInvitado.p_apellido || '',
    telefono: datosInvitado.telefono || '',
    nombre_empresa: datosInvitado.nombre_empresa || '',
    id_sector: datosInvitado.id_sector || '',
    es_profesor_extranjero: datosInvitado.es_profesor_extranjero || false
  };

  return payload;
};

/**
 * Obtener todos los proyectos disponibles
 */
export const obtenerTodosLosProyectos = async () => {
  try {
    
    const response = await fetchApi(API_ENDPOINTS.PROYECTOS, {
      method: 'GET',
      headers: getAuthHeaders()
    });


    if (response.ok) {
      const data = await response.json();
      
      // La respuesta puede venir en diferentes formatos
      let proyectos = data.data || data.proyectos || data;
      
      if (!Array.isArray(proyectos)) {
        proyectos = Object.values(data).find(val => Array.isArray(val)) || [];
      }
      
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