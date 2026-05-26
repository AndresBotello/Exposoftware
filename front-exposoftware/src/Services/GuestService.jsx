import { API_ENDPOINTS } from '../utils/constants';

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
 */
const getAuthToken = () => {
  return localStorage.getItem('auth_token');
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
 * Usa el token del usuario para obtener TODA su información desde /api/v1/auth/me
 */
export const obtenerMiPerfilInvitado = async () => {
  try {
    console.log('👤 Obteniendo información completa del usuario invitado desde /api/v1/auth/me...');
    
    // Validar que existe el token
    const token = getAuthToken();
    if (!token) {
      throw new Error('No hay token de autenticación. Por favor inicie sesión nuevamente.');
    }

    console.log('🔑 Token encontrado, validando con el backend...');

    // Obtener TODA la información del usuario autenticado usando su token
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
      throw new Error(errorData.message || errorData.detail || 'Error al validar usuario');
    }

    const userData = await response.json();
    console.log('✅ Información completa del usuario obtenida desde /api/v1/auth/me:', userData);
    console.log('📊 Estructura completa de data:', JSON.stringify(userData, null, 2));
    
    // La respuesta tiene formato: { status, message, data, code }
    if (userData.data) {
      console.log('📦 userData.data:', userData.data);
      console.log('👤 userData.data.usuario:', userData.data.usuario);
      
      // Validar que el usuario tiene rol de Invitado
      const usuario = userData.data.usuario || userData.data;
      if (usuario.rol !== 'Invitado') {
        throw new Error(`Usuario no es invitado. Rol actual: ${usuario.rol}`);
      }

      console.log('✅ Usuario validado como Invitado');
      
      // Procesar y retornar todos los datos del invitado
      return procesarDatosInvitado(userData.data);
    }
    
    // Si no viene en data, usar directamente
    if (userData.rol !== 'Invitado') {
      throw new Error(`Usuario no es invitado. Rol actual: ${userData.rol}`);
    }

    return procesarDatosInvitado(userData);
    
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
 */
const procesarDatosInvitado = (perfil) => {
  if (!perfil) {
    console.warn('⚠️ No hay datos del invitado para procesar');
    return {};
  }

  console.log('🔄 PERFIL COMPLETO RECIBIDO PARA PROCESAR:', perfil);
  console.log('🔍 usuario:', perfil.usuario);
  console.log('🔍 datos_rol:', perfil.datos_rol);

  // Extraer datos del usuario y datos_rol
  const usuario = perfil.usuario || perfil;
  const datosRol = perfil.datos_rol || perfil;
  
  console.log('👤 Datos del usuario:', usuario);
  console.log('🎓 Datos del rol (invitado):', datosRol);

  // Procesar nombres
  let primer_nombre = usuario.primer_nombre || '';
  let segundo_nombre = usuario.segundo_nombre || '';
  let primer_apellido = usuario.primer_apellido || '';
  let segundo_apellido = usuario.segundo_apellido || '';
  
  if (!primer_nombre && !primer_apellido && usuario.nombre_completo) {
    console.log('⚠️ Dividiendo nombre_completo...');
    const nombreCompleto = usuario.nombre_completo.trim();
    const partes = nombreCompleto.split(/\s+/);
    
    if (partes.length >= 4) {
      primer_nombre = partes[0];
      segundo_nombre = partes[1];
      primer_apellido = partes[2];
      segundo_apellido = partes[3];
    } else if (partes.length === 3) {
      primer_nombre = partes[0];
      segundo_nombre = partes[1];
      primer_apellido = partes[2];
    } else if (partes.length === 2) {
      primer_nombre = partes[0];
      primer_apellido = partes[1];
    } else if (partes.length === 1) {
      primer_nombre = partes[0];
    }
  }

  const datosProcesados = {
    // IDs
    id_invitado: datosRol.id_invitado || '',
    id_usuario: usuario.id_usuario || '',
    id_sector: datosRol.id_sector || '',
    
    // Sector con nombre
    sector_nombre: obtenerNombreSector(datosRol.id_sector),
    
    // Información personal (desde usuario)
    tipo_documento: usuario.tipo_documento || '',
    identificacion: usuario.identificacion || '',
    primer_nombre: primer_nombre,
    segundo_nombre: segundo_nombre,
    primer_apellido: primer_apellido,
    segundo_apellido: segundo_apellido,
    
    // Datos combinados para compatibilidad
    nombres: `${primer_nombre} ${segundo_nombre}`.trim(),
    apellidos: `${primer_apellido} ${segundo_apellido}`.trim(),
    nombre_completo: usuario.nombre_completo || `${primer_nombre} ${segundo_nombre} ${primer_apellido} ${segundo_apellido}`.trim().replace(/\s+/g, ' '),
    
    // Información demográfica (desde usuario)
    sexo: usuario.sexo || '',
    genero: usuario.genero || usuario.sexo || '',
    identidad_sexual: usuario.identidad_sexual || '',
    fecha_nacimiento: usuario.fecha_nacimiento ? usuario.fecha_nacimiento.split('T')[0] : '', // Solo fecha
    nacionalidad: usuario.nacionalidad || '',
    
    // Ubicación (desde usuario)
    pais: usuario.pais || usuario.pais_residencia || '',
    pais_residencia: usuario.pais_residencia || usuario.pais || '',
    departamento: usuario.departamento || '',
    municipio: usuario.municipio || '',
    ciudad: usuario.ciudad || usuario.ciudad_residencia || '',
    ciudad_residencia: usuario.ciudad_residencia || usuario.ciudad || '',
    direccion_residencia: usuario.direccion_residencia || '',
    
    // Contacto
    telefono: usuario.telefono || '',
    correo: usuario.correo || '',
    email: usuario.correo || '',
    
    // Información de empresa (desde datos_rol)
    nombre_empresa: datosRol.nombre_empresa || '',
    institucion_origen: datosRol.institucion_origen || '',
    
    // Rol
    rol: usuario.rol || 'Invitado',
    
    // Sistema
    activo: usuario.activo !== undefined ? usuario.activo : true,
    created_at: usuario.created_at || '',
    updated_at: usuario.updated_at || '',
    
    // Iniciales para avatar
    iniciales: getIniciales(primer_nombre, primer_apellido)
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
 */
const prepararDatosParaBackend = (datosInvitado) => {
  console.log('📦 Preparando datos para backend:', datosInvitado);
  
  // Estructura plana según el backend
  const payload = {
    tipo_documento: datosInvitado.tipo_documento,
    identificacion: datosInvitado.identificacion,
    primer_nombre: datosInvitado.primer_nombre,
    segundo_nombre: datosInvitado.segundo_nombre || '',
    primer_apellido: datosInvitado.primer_apellido,
    segundo_apellido: datosInvitado.segundo_apellido || '',
    sexo: datosInvitado.sexo || datosInvitado.genero,
    identidad_sexual: datosInvitado.identidad_sexual || '',
    fecha_nacimiento: datosInvitado.fecha_nacimiento,
    nacionalidad: datosInvitado.nacionalidad,
    pais_residencia: datosInvitado.pais_residencia || datosInvitado.pais,
    departamento: datosInvitado.departamento,
    municipio: datosInvitado.municipio,
    ciudad_residencia: datosInvitado.ciudad_residencia || datosInvitado.ciudad,
    direccion_residencia: datosInvitado.direccion_residencia,
    telefono: datosInvitado.telefono,
    correo: datosInvitado.correo || datosInvitado.email,
    id_sector: datosInvitado.id_sector,
    nombre_empresa: datosInvitado.nombre_empresa,
    institucion_origen: datosInvitado.institucion_origen || ''
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