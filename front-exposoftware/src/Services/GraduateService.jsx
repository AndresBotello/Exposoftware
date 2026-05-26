import { API_ENDPOINTS } from '../utils/constants';

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
 * Obtener perfil del egresado autenticado
 * Usa el token del usuario para obtener TODA su información desde /api/v1/auth/me
 */
export const obtenerMiPerfilEgresado = async () => {
  try {
    console.log('👨‍🎓 Obteniendo información completa del usuario egresado desde /api/v1/auth/me...');
    
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
      
      // Validar que el usuario tiene rol de Egresado
      const usuario = userData.data.usuario || userData.data;
      if (usuario.rol !== 'Egresado') {
        throw new Error(`Usuario no es egresado. Rol actual: ${usuario.rol}`);
      }

      console.log('✅ Usuario validado como Egresado');
      
      // Procesar y retornar todos los datos del egresado
      return procesarDatosEgresado(userData.data);
    }
    
    // Si no viene en data, usar directamente
    if (userData.rol !== 'Egresado') {
      throw new Error(`Usuario no es egresado. Rol actual: ${userData.rol}`);
    }

    return procesarDatosEgresado(userData);
    
  } catch (error) {
    console.error('❌ Error obteniendo perfil del egresado:', error);
    throw error;
  }
};

/**
 * Obtener perfil de un egresado por ID
 * GET /api/v1/egresados/{graduate_id}
 */
export const obtenerPerfilEgresadoPorId = async (graduateId) => {
  try {
    console.log('👨‍🎓 Obteniendo perfil del egresado:', graduateId);
    
    const response = await fetch(API_ENDPOINTS.ADMIN_EGRESADO_BY_ID(graduateId), {
      credentials: 'include',
      method: 'GET',
      headers: getAuthHeaders()
    });

    console.log('📡 Respuesta - Status:', response.status);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Perfil del egresado obtenido:', data);
      
      // La respuesta tiene formato: { status, message, data, code }
      const perfil = data.data || data;
      return procesarDatosEgresado(perfil);
    } else if (response.status === 401) {
      throw new Error('No autorizado');
    } else if (response.status === 404) {
      throw new Error('Egresado no encontrado');
    } else {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.detail || 'Error al obtener perfil');
    }
  } catch (error) {
    console.error('❌ Error obteniendo perfil del egresado:', error);
    throw error;
  }
};

/**
 * Actualizar perfil del egresado
 * PUT /api/v1/egresados/{graduate_id}
 */
export const actualizarPerfilEgresado = async (graduateId, datosActualizados) => {
  try {
    console.log('🔄 Actualizando perfil del egresado:', graduateId);
    console.log('📝 Datos a actualizar:', datosActualizados);
    
    const response = await fetch(API_ENDPOINTS.ADMIN_EGRESADO_BY_ID(graduateId), {
      credentials: 'include',
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(datosActualizados)
    });

    console.log('📡 Respuesta - Status:', response.status);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Perfil actualizado exitosamente:', data);
      
      const perfil = data.data || data;
      return procesarDatosEgresado(perfil);
    } else if (response.status === 401) {
      throw new Error('No autorizado');
    } else if (response.status === 404) {
      throw new Error('Egresado no encontrado');
    } else if (response.status === 422) {
      const errorData = await response.json();
      const errores = errorData.detail || [];
      const mensajesError = errores.map(err => `${err.loc?.join('.')}: ${err.msg}`).join(', ');
      throw new Error(`Datos inválidos: ${mensajesError}`);
    } else {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.detail || 'Error al actualizar perfil');
    }
  } catch (error) {
    console.error('❌ Error actualizando perfil del egresado:', error);
    throw error;
  }
};

/**
 * Procesar datos del egresado desde el backend
 * Transforma la estructura del backend a la estructura del frontend
 * Maneja tanto la respuesta de /api/v1/auth/me como /api/v1/egresados/{id}
 */
export const procesarDatosEgresado = (perfil) => {
  if (!perfil) {
    console.warn('⚠️ No hay datos del egresado para procesar');
    return {};
  }

  console.log('🔄 PERFIL COMPLETO RECIBIDO PARA PROCESAR:', perfil);
  console.log('🔍 usuario:', perfil.usuario);
  console.log('🔍 datos_rol:', perfil.datos_rol);

  // Extraer datos del usuario y datos_rol
  const usuario = perfil.usuario || {};
  const datosRol = perfil.datos_rol || {};
  
  console.log('👤 Datos del usuario:', usuario);
  console.log('🎓 Datos del rol (egresado):', datosRol);

  // Procesar nombres (igual que antes)
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
    id_egresado: datosRol.id_egresado || '',
    id_usuario: usuario.id_usuario || '',
    
    // Datos académicos del egresado (desde datos_rol)
    codigo_programa: datosRol.codigo_programa || '',
    anio_graduacion: datosRol.año_graduacion || new Date().getFullYear(),
    modalidad_grado: datosRol.modalidad_grado || '',
    programa_academico: datosRol.programa_academico || '',
    titulo_obtenido: datosRol.titulo_obtenido || '',
    titulado: datosRol.titulado !== undefined ? datosRol.titulado : true,
    
    // Datos personales (desde usuario)
    tipo_documento: usuario.tipo_documento || 'CC',
    identificacion: usuario.identificacion || '',
    nombres: `${primer_nombre} ${segundo_nombre}`.trim(),
    apellidos: `${primer_apellido} ${segundo_apellido}`.trim(),
    nombre_completo: usuario.nombre_completo || `${primer_nombre} ${segundo_nombre} ${primer_apellido} ${segundo_apellido}`.trim().replace(/\s+/g, ' '),
    primer_nombre: primer_nombre,
    segundo_nombre: segundo_nombre,
    primer_apellido: primer_apellido,
    segundo_apellido: segundo_apellido,
    
    // Información de contacto
    correo: usuario.correo || '',
    telefono: usuario.telefono || '',
    
    // Información demográfica (desde usuario) - ESTOS SON LOS CAMPOS QUE FALLAN
    sexo: usuario.sexo || '',
    identidad_sexual: usuario.identidad_sexual || '',
    fecha_nacimiento: usuario.fecha_nacimiento ? usuario.fecha_nacimiento.split('T')[0] : '', // Solo fecha
    nacionalidad: usuario.nacionalidad || 'CO',
    
    // Ubicación (desde usuario)
    pais_residencia: usuario.pais_residencia || 'CO',
    departamento: usuario.departamento || '',
    municipio: usuario.municipio || '',
    ciudad_residencia: usuario.ciudad_residencia || '',
    direccion_residencia: usuario.direccion_residencia || '',
    
    // Sistema
    rol: usuario.rol || 'Egresado',
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
 * Preparar datos para enviar al backend
 * Transforma la estructura del frontend a la estructura del backend
 */
export const prepararDatosParaBackend = (datosFormulario) => {
  console.log('📦 Preparando datos para enviar al backend:', datosFormulario);

  const payload = {
    // Datos personales
    tipo_documento: datosFormulario.tipo_documento || 'CC',
    identificacion: datosFormulario.identificacion || '',
    primer_nombre: datosFormulario.primer_nombre || '',
    segundo_nombre: datosFormulario.segundo_nombre || '',
    primer_apellido: datosFormulario.primer_apellido || '',
    segundo_apellido: datosFormulario.segundo_apellido || '',
    
    // Información demográfica
    sexo: datosFormulario.sexo || '',
    identidad_sexual: datosFormulario.identidad_sexual || '',
    fecha_nacimiento: datosFormulario.fecha_nacimiento || '',
    nacionalidad: datosFormulario.nacionalidad || 'Colombiana',
    
    // Ubicación
    pais_residencia: datosFormulario.pais_residencia || 'Colombia',
    departamento: datosFormulario.departamento || '',
    municipio: datosFormulario.municipio || '',
    ciudad_residencia: datosFormulario.ciudad_residencia || datosFormulario.municipio || '',
    direccion_residencia: datosFormulario.direccion_residencia || '',
    
    // Contacto
    telefono: datosFormulario.telefono || '',
    correo: datosFormulario.correo || '',
    
    // Datos académicos
    codigo_programa: datosFormulario.codigo_programa || '',
    programa_academico: datosFormulario.programa_academico || '',
    año_graduacion: parseInt(datosFormulario.anio_graduacion) || new Date().getFullYear(),
    titulo_obtenido: datosFormulario.titulo_obtenido || '',
    titulado: datosFormulario.titulado !== undefined ? datosFormulario.titulado : true,
    
    // Sistema
    rol: 'Egresado'
  };

  // Si hay contraseña (para actualizaciones), incluirla
  if (datosFormulario.contraseña) {
    payload.contraseña = datosFormulario.contraseña;
  }

  console.log('✅ Payload preparado:', payload);
  return payload;
};

export default {
  obtenerMiPerfilEgresado,
  obtenerPerfilEgresadoPorId,
  actualizarPerfilEgresado,
  procesarDatosEgresado,
  prepararDatosParaBackend
};