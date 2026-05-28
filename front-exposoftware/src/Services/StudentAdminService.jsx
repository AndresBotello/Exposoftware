import { API_ENDPOINTS } from "../utils/constants";
import * as AuthService from "./AuthService";

/**
 * Servicio para la gestión administrativa de estudiantes
 * Incluye funcionalidades para listar, crear, actualizar, activar y desactivar estudiantes
 */

/**
 * Procesar respuesta del servidor
 * @param {Response} response - Respuesta fetch
 * @returns {Promise<Object>} Datos procesados
 */
const procesarRespuesta = async (response) => {
  const contentType = response.headers.get("content-type");
  let responseData = {};


  if (contentType && contentType.includes("application/json")) {
    try {
      responseData = await response.json();
    } catch (error) {
      if (!response.ok) {
        throw new Error(`Error del servidor (${response.status})`);
      }
    }
  } else {
    // Si no es JSON, intentar leer como texto
    const textData = await response.text();
  }

  if (response.ok) {
    return {
      success: true,
      data: responseData.data || responseData,
      message: responseData.message || 'Operación exitosa'
    };
  } else {
    // Manejo de errores
    const errorMessage = responseData.detail || 
                        responseData.message || 
                        `Error ${response.status}: ${response.statusText}`;
    console.error('❌ Error del servidor:', {
      status: response.status,
      statusText: response.statusText,
      responseData
    });
    throw new Error(errorMessage);
  }
};

/**
 * Obtener lista de todos los estudiantes
 * @param {Object} params - Parámetros de consulta opcionales (manejados en frontend)
 * @returns {Promise<Object>} Lista de estudiantes
 */
export const obtenerEstudiantes = async (params = {}) => {
  try {
    // El endpoint no acepta parámetros, devuelve todos los estudiantes
    const url = API_ENDPOINTS.ADMIN_ESTUDIANTES;
    const headers = AuthService.getAuthHeaders();

    const response = await fetch(url, {
      credentials: 'include',
      method: 'GET',
      headers: headers
    });

    const result = await procesarRespuesta(response);
    
    // Normalizar respuesta para que siempre tenga estructura consistente
    if (result.data) {
      return result;
    } else {
      // Si la respuesta es un array directo
      return {
        data: Array.isArray(result) ? result : [],
        total: Array.isArray(result) ? result.length : 0
      };
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Obtener estudiante por ID (información básica)
 * @param {string} studentId - ID del estudiante
 * @returns {Promise<Object>} Datos del estudiante
 */
export const obtenerEstudiantePorId = async (studentId) => {
  try {
    const url = API_ENDPOINTS.ADMIN_ESTUDIANTE_BY_ID(studentId);
    
    
    const response = await fetch(url, {
      credentials: 'include',
      method: 'GET',
      headers: AuthService.getAuthHeaders()
    });

    const result = await procesarRespuesta(response);
    
    return result;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtener estudiante con información completa (incluye datos de usuario)
 * @param {string} studentId - ID del estudiante
 * @returns {Promise<Object>} Datos completos del estudiante
 */
export const obtenerEstudianteCompleto = async (studentId) => {
  try {
    const url = API_ENDPOINTS.ADMIN_ESTUDIANTE_BY_ID(studentId);
    
    
    const response = await fetch(url, {
      credentials: 'include',
      method: 'GET',
      headers: AuthService.getAuthHeaders()
    });

    const result = await procesarRespuesta(response);
    
    return result;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtener estudiantes por programa académico
 * @param {string} codigoPrograma - Código del programa académico
 * @param {Object} params - Parámetros adicionales (manejados en frontend)
 * @returns {Promise<Object>} Lista de estudiantes del programa
 */
export const obtenerEstudiantesPorPrograma = async (codigoPrograma, params = {}) => {
  try {
    // El endpoint no acepta parámetros de paginación
    const url = `/api/v1/admin/estudiantes/programa/${codigoPrograma}`;
    
    
    const response = await fetch(url, {
      credentials: 'include',
      method: 'GET',
      headers: AuthService.getAuthHeaders()
    });

    const result = await procesarRespuesta(response);
    
    // Normalizar respuesta
    if (result.data) {
      return result;
    } else {
      return {
        data: Array.isArray(result) ? result : [],
        total: Array.isArray(result) ? result.length : 0
      };
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Actualizar información de un estudiante
 * @param {string} studentId - ID del estudiante
 * @param {Object} studentData - Datos a actualizar
 * @param {string} studentData.codigo_programa - Código del programa académico
 * @param {number} studentData.semestre - Semestre actual (1-10)
 * @param {string} studentData.periodo - Período académico (2024-1, 2024-2, etc.)
 * @param {number} studentData.anio_ingreso - Año de ingreso
 * @returns {Promise<Object>} Estudiante actualizado
 */
export const actualizarEstudiante = async (studentId, studentData) => {
  try {
    const url = API_ENDPOINTS.ADMIN_ESTUDIANTE_BY_ID(studentId);
    
    
    const response = await fetch(url, {
      credentials: 'include',
      method: 'PUT',
      headers: AuthService.getAuthHeaders(),
      body: JSON.stringify(studentData)
    });

    const result = await procesarRespuesta(response);
    
    return result;
  } catch (error) {
    throw error;
  }
};

/**
 * Activar un estudiante (cambiar estado a activo)
 * @param {string} studentId - ID del estudiante
 * @returns {Promise<Object>} Resultado de la operación
 */
export const activarEstudiante = async (studentId) => {
  try {
    const url = API_ENDPOINTS.ADMIN_ESTUDIANTE_ACTIVAR(studentId);
    
    
    const response = await fetch(url, {
      credentials: 'include',
      method: 'PATCH',
      headers: AuthService.getAuthHeaders()
    });

    const result = await procesarRespuesta(response);
    
    return result;
  } catch (error) {
    throw error;
  }
};

/**
 * Desactivar un estudiante (cambiar estado a inactivo)
 * El backend exige una `razon` (Body embed=True). Si el llamador no la pasa,
 * se envía un placeholder genérico para que el request no falle con 422.
 * @param {string} studentId - ID UUID del estudiante
 * @param {string} [razon] - Motivo de la desactivación
 * @returns {Promise<Object>} Resultado de la operación
 */
export const desactivarEstudiante = async (studentId, razon = "Desactivado por administrador") => {
  try {
    // Guard: el backend exige UUID en el path. Si el caller pasa undefined o un
    // valor con prefijo extraño (urn:uuid:..., etc.) FastAPI tira 422 con un
    // mensaje crítico. Mejor fallar acá con un error legible.
    const UUID_RE = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    if (!studentId || !UUID_RE.test(String(studentId))) {
      console.error('[desactivarEstudiante] studentId inválido (no es UUID):', studentId);
      throw new Error(`ID de estudiante inválido: "${studentId}". Esperado un UUID.`);
    }
    const url = API_ENDPOINTS.ADMIN_ESTUDIANTE_DESACTIVAR(studentId);

    const response = await fetch(url, {
      credentials: 'include',
      method: 'PATCH',
      headers: AuthService.getAuthHeaders(),
      body: JSON.stringify({ razon })
    });

    const result = await procesarRespuesta(response);
    
    return result;
  } catch (error) {
    throw error;
  }
};

/**
 * Asignar rol de estudiante a un usuario existente
 * @param {Object} data - Datos de asignación
 * @param {string} data.id_usuario - ID del usuario existente
 * @param {string} data.codigo_programa - Código del programa académico
 * @param {number} data.semestre - Semestre actual
 * @param {string} data.periodo - Período académico
 * @param {number} data.anio_ingreso - Año de ingreso
 * @returns {Promise<Object>} Estudiante creado
 */
export const asignarEstudianteExistente = async (data) => {
  try {
    const url = `/api/v1/admin/estudiantes/asignar-existente`;
    
    
    const response = await fetch(url, {
      credentials: 'include',
      method: 'POST',
      headers: AuthService.getAuthHeaders(),
      body: JSON.stringify(data)
    });

    const result = await procesarRespuesta(response);
    
    return result;
  } catch (error) {
    throw error;
  }
};

/**
 * Buscar estudiantes por nombre, identificación o código
 * @param {string} query - Término de búsqueda
 * @param {Array} estudiantes - Lista de estudiantes donde buscar
 * @param {Array} programas - Lista de programas para búsqueda por nombre de programa
 * @returns {Array} Estudiantes que coinciden con la búsqueda
 */
export const buscarEstudiantes = (query, estudiantes, programas = []) => {
  if (!query || !query.trim()) return estudiantes;
  
  const searchTerm = query.toLowerCase().trim();
  
  return estudiantes.filter(estudiante => {
    // Acceder correctamente a los datos anidados
    const usuario = estudiante.usuario || {};
    const estudianteData = estudiante.estudiante || estudiante;

    const nombreCompleto = usuario.nombre_completo?.toLowerCase() ||
                          `${usuario.primer_nombre || ''} ${usuario.segundo_nombre || ''} ${usuario.primer_apellido || ''} ${usuario.segundo_apellido || ''}`.toLowerCase().trim() ||
                          `${usuario.nombres || ''} ${usuario.apellidos || ''}`.toLowerCase().trim() || '';
    const identificacion = usuario.identificacion?.toLowerCase() || '';
    const email = usuario.correo?.toLowerCase() || usuario.email?.toLowerCase() || '';
    
    // Buscar por nombre de programa si tenemos la lista de programas
    let programaNombre = '';
    if (estudianteData.codigo_programa && programas.length > 0) {
      const programaEncontrado = programas.find(p => p.codigo === estudianteData.codigo_programa);
      if (programaEncontrado) {
        programaNombre = programaEncontrado.nombre.toLowerCase();
      }
    }
    const codigoPrograma = estudianteData.codigo_programa?.toLowerCase() || '';

    return nombreCompleto.includes(searchTerm) ||
           identificacion.includes(searchTerm) ||
           email.includes(searchTerm) ||
           programaNombre.includes(searchTerm) ||
           codigoPrograma.includes(searchTerm);
  });
};/**
 * Filtrar estudiantes por estado
 * @param {string} estado - Estado a filtrar (activo/inactivo/todos)
 * @param {Array} estudiantes - Lista de estudiantes
 * @returns {Array} Estudiantes filtrados
 */
export const filtrarPorEstado = (estado, estudiantes) => {
  if (estado === 'todos') return estudiantes;

  const estadoBool = estado === 'activo';
  return estudiantes.filter(estudiante => {
    // Acceder correctamente al campo activo
    const usuario = estudiante.usuario || {};
    const estudianteData = estudiante.estudiante || estudiante;

    const activo = usuario.activo !== undefined ? usuario.activo :
                  estudianteData.activo !== undefined ? estudianteData.activo :
                  false; // Default a false si no existe el campo

    return activo === estadoBool;
  });
};

/**
 * Formatear datos del estudiante para visualización
 * @param {Object} data - Datos del estudiante (puede venir en formato anidado o plano)
 * @param {Array} programas - Lista opcional de programas para mapear códigos a nombres
 * @returns {Object} Datos formateados
 */
export const formatearEstudiante = (data, programas = []) => {
  // Detectar si los datos vienen en formato anidado (nuevo formato del backend)
  const estudiante = data.estudiante || data;
  const usuario = data.usuario || estudiante.usuario || {};

  // Buscar el programa por código si tenemos la lista de programas
  let nombrePrograma = 'Sin programa';
  if (estudiante.codigo_programa && programas.length > 0) {
    const programaEncontrado = programas.find(p => p.codigo === estudiante.codigo_programa);
    if (programaEncontrado) {
      nombrePrograma = `${programaEncontrado.nombre} - ${programaEncontrado.nivel}`;
    }
  }

  return {
    id: estudiante.id_estudiante,
    nombreCompleto: `${usuario.p_nombre || ''} ${usuario.p_apellido || ''}`.trim() || 'Sin nombre',
    identificacion: usuario.identificacion || 'N/A',
    email: usuario.correo || usuario.email || 'N/A',
    telefono: usuario.telefono || 'N/A',
    programa: nombrePrograma,
    codigoPrograma: estudiante.codigo_programa || 'N/A',
    semestre: estudiante.semestre || 0,
    periodo: estudiante.periodo,
    anioIngreso: estudiante.anio_ingreso,
    estado: usuario.activo !== undefined ? (usuario.activo ? 'Activo' : 'Inactivo') :
            estudiante.activo !== undefined ? (estudiante.activo ? 'Activo' : 'Inactivo') :
            'Inactivo',
    estadoBool: usuario.activo !== undefined ? usuario.activo :
                estudiante.activo !== undefined ? estudiante.activo :
                false,
    fechaCreacion: estudiante.fecha_creacion,
    fechaActualizacion: estudiante.fecha_actualizacion
  };
};