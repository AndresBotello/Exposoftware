import { API_ENDPOINTS } from '../utils/constants';
import { fetchApi } from '../utils/apiClient';
import { safeGetItem } from '../utils/safeStorage';

/**
 * Obtener token de autenticación
 */
const getAuthToken = () => {
  return safeGetItem('auth_token');
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
 * GET /api/v1/egresados/mi-perfil
 * Usa cookies de sesión para obtener la información del egresado autenticado
 */
export const obtenerMiPerfilEgresado = async () => {
  try {

    const token = getAuthToken();
    const headers = getAuthHeaders();

    const response = await fetchApi(`${API_ENDPOINTS.API_BASE_URL || ''}/api/v1/egresados/mi-perfil`, {
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

    // La respuesta tiene formato: { status, message, data: { egresado, usuario }, code }
    if (userData.data && userData.data.egresado && userData.data.usuario) {

      // Procesar y retornar todos los datos del egresado
      return procesarDatosEgresado(userData.data);
    }

    throw new Error('Respuesta inválida del servidor: estructura de datos no esperada');

  } catch (error) {
    throw error;
  }
};

/**
 * Obtener perfil de un egresado por ID
 * GET /api/v1/egresados/{graduate_id}
 */
export const obtenerPerfilEgresadoPorId = async (graduateId) => {
  try {
    
    const response = await fetchApi(API_ENDPOINTS.ADMIN_EGRESADO_BY_ID(graduateId), {
      method: 'GET',
      headers: getAuthHeaders()
    });


    if (response.ok) {
      const data = await response.json();
      
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
    throw error;
  }
};

/**
 * Actualizar perfil del egresado
 * PUT /api/v1/egresados/{graduate_id}
 */
export const actualizarPerfilEgresado = async (graduateId, datosActualizados) => {
  try {
    
    const response = await fetchApi(API_ENDPOINTS.ADMIN_EGRESADO_BY_ID(graduateId), {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(datosActualizados)
    });


    if (response.ok) {
      const data = await response.json();
      
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
    throw error;
  }
};

/**
 * Procesar datos del egresado desde el backend
 * Extrae solo los campos que realmente vienen de /api/v1/egresados/mi-perfil
 */
export const procesarDatosEgresado = (perfil) => {
  if (!perfil) {
    return {};
  }


  // Extraer datos del usuario y egresado
  const usuario = perfil.usuario || {};
  const egresado = perfil.egresado || {};


  // Procesar nombres del usuario (campos p_nombre, p_apellido)
  const primer_nombre = usuario.p_nombre || '';
  const primer_apellido = usuario.p_apellido || '';

  const datosProcesados = {
    // IDs
    id_egresado: egresado.id_egresado || '',
    id_usuario: usuario.id_usuario || '',

    // Datos académicos del egresado
    codigo_programa: egresado.codigo_programa || '',
    anio_graduacion: egresado.anio_finalizacion || new Date().getFullYear(),
    titulado: egresado.titulado !== undefined ? egresado.titulado : false,

    // Datos personales del usuario
    identificacion: usuario.identificacion || '',
    primer_nombre: primer_nombre,
    primer_apellido: primer_apellido,
    nombre_completo: `${primer_nombre} ${primer_apellido}`.trim(),

    // Información de contacto
    correo: usuario.correo || '',
    telefono: usuario.telefono || '',

    // Sistema
    activo: usuario.activo !== undefined ? usuario.activo : true,

    // Iniciales para avatar
    iniciales: getIniciales(primer_nombre, primer_apellido)
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
 * Preparar datos para enviar al backend
 * Transforma la estructura del frontend a la estructura del backend
 */
export const prepararDatosParaBackend = (datosFormulario) => {

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

  return payload;
};

/**
 * Obtener el nombre del programa por su código
 * Busca en el árbol completo académico
 */
export const obtenerNombrePrograma = async (codigoPrograma) => {
  try {
    if (!codigoPrograma) return 'Sin especificar';


    const response = await fetch(`${API_ENDPOINTS.API_BASE_URL || ''}/api/v1/public-academico/arbol-completo`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      return codigoPrograma; // Devolver el código como fallback
    }

    const data = await response.json();

    // Buscar en facultades > programas
    if (data.data && Array.isArray(data.data)) {
      for (const facultad of data.data) {
        if (facultad.programas && Array.isArray(facultad.programas)) {
          const programa = facultad.programas.find(p =>
            p.codigo_programa === codigoPrograma || p.codigo === codigoPrograma
          );
          if (programa) {
            const nombre = programa.nombre_programa || programa.nombre || codigoPrograma;
            return nombre;
          }
        }
      }
    }

    return codigoPrograma; // Devolver el código como fallback

  } catch (error) {
    return codigoPrograma; // Devolver el código como fallback
  }
};

export default {
  obtenerMiPerfilEgresado,
  obtenerPerfilEgresadoPorId,
  actualizarPerfilEgresado,
  procesarDatosEgresado,
  prepararDatosParaBackend,
  obtenerNombrePrograma
};