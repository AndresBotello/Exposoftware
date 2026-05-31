import { API_ENDPOINTS } from "../utils/constants";
import * as AuthService from "./AuthService";
import { CICLOS_ID_MAP } from "../pages/Admin/useSubjectManagement";


/**
 * Función auxiliar para procesar respuestas del backend
 * @param {Response} response - Respuesta fetch
 * @returns {Promise<Object>} Datos procesados
 */
const procesarRespuesta = async (response) => {
  const contentType = response.headers.get("content-type");
  let responseData = {};

  // Intentar parsear JSON
  if (contentType && contentType.includes("application/json")) {
    try {
      responseData = await response.json();
    } catch (error) {
    }
  } else {
    // Si no es JSON, intentar leer como texto
    try {
      const text = await response.text();
      responseData = { message: text };
    } catch (error) {
    }
  }

  // Si la respuesta es exitosa (2xx)
  if (response.ok) {
    return {
      success: true,
      data: responseData.data || responseData,
      message: responseData.message || 'Operación exitosa',
      code: responseData.code || 'SUCCESS'
    };
  }

  // Si hay errores, extraer el mensaje apropiado
  let errorMessage = responseData.message || responseData.detail || 'Error desconocido';
  
  
  // Si hay un array de errores detallados, procesarlos
  if (responseData.errors && Array.isArray(responseData.errors)) {
    const errorMessages = responseData.errors.map(err => 
      `• ${err.field || 'Campo'}: ${err.message || err.msg || 'Error de validación'}`
    ).join('\n');
    errorMessage = errorMessages || errorMessage;
  }
  
  // Manejar errores de validación de FastAPI/Pydantic
  if (responseData.detail) {
    if (Array.isArray(responseData.detail)) {
      const errorMessages = responseData.detail.map(err => 
        `• ${err.loc ? err.loc.join('.') : 'Campo'}: ${err.msg || err.message || 'Error de validación'}`
      ).join('\n');
      errorMessage = 'Errores de validación:\n' + errorMessages;
    } else if (typeof responseData.detail === 'string') {
      errorMessage = responseData.detail;
    }
  }

  throw new Error(errorMessage);
};


/**
 * Obtener todas las materias desde el backend (sin paginar).
 *
 * Usa el endpoint /admin/materias/list que devuelve TODO el catálogo en
 * una sola llamada — ideal para selectores/dropdowns. El endpoint base
 * /admin/materias está paginado a 20 ítems y rompía los selectores que
 * necesitan ver todas las materias.
 *
 * @returns {Promise<Array>} Lista completa de materias
 */
export const obtenerMaterias = async () => {
  try {
    const headers = AuthService.getAuthHeaders();

    const response = await fetch(API_ENDPOINTS.ADMIN_MATERIAS_LIST, {
      credentials: 'include',
      method: 'GET',
      headers: headers
    });

    const resultado = await procesarRespuesta(response);
    return resultado.data || [];
  } catch (error) {
    throw error;
  }
};


/**
 * Obtener todos los grupos desde el backend
 * @returns {Promise<Array>} Lista de grupos
 */
export const obtenerGrupos = async () => {
  try {
    const allGrupos = [];
    let page = 1;
    const limit = 100;

    while (true) {
      const url = `${API_ENDPOINTS.GRUPOS}?page=${page}&limit=${limit}`;
      const response = await fetch(url, {
        credentials: 'include',
        method: 'GET',
        headers: AuthService.getAuthHeaders()
      });
      const resultado = await procesarRespuesta(response);
      const grupos = resultado.data || [];
      if (!Array.isArray(grupos)) break;

      allGrupos.push(...grupos);

      if (!resultado.pagination?.has_next) break;
      page += 1;
    }

    return allGrupos;
  } catch (error) {
    throw error;
  }
};


/**
 * Obtener todos los profesores desde el backend
 * @returns {Promise<Array>} Lista de profesores con estructura anidada {docente, usuario}
 */
export const obtenerDocentes = async () => {
  try {
    const response = await fetch(API_ENDPOINTS.ADMIN_DOCENTES, {
      credentials: 'include',
      method: 'GET',
      headers: AuthService.getAuthHeaders()
    });
    const resultado = await procesarRespuesta(response);
    return resultado.data;
  } catch (error) {
    throw error;
  }
};


/**
 * Crear una nueva materia (sin grupos inicialmente)
 * @param {Object} materiaData - Datos de la materia
 * @param {string} materiaData.codigo_materia - Código de la materia
 * @param {string} materiaData.nombre_materia - Nombre de la materia
 * @param {string} materiaData.ciclo_semestral - Ciclo semestral
 * @returns {Promise<Object>} Materia creada
 */
export const crearMateria = async (materiaData) => {
  // Validaciones previas
  // Validar longitud del código
  if (materiaData.codigo_materia.length > 8) {
    throw new Error('El código de materia no puede exceder 8 caracteres');
  }
  
  // Validar patrón del código (solo mayúsculas, números y guiones bajos)
  const codigoPattern = /^[A-Z0-9_]+$/;
  const codigoUpper = materiaData.codigo_materia.toUpperCase();
  if (!codigoPattern.test(codigoUpper)) {
    throw new Error('El código solo puede contener letras mayúsculas, números y guiones bajos');
  }
  
  // Validar nombre
  if (materiaData.nombre_materia.length < 3 || materiaData.nombre_materia.length > 100) {
    throw new Error('El nombre debe tener entre 3 y 100 caracteres');
  }
  
  // Validar ciclo
  const ciclosValidos = ["Ciclo Básico", "Ciclo Profesional", "Ciclo de Profundización"];
  if (!ciclosValidos.includes(materiaData.ciclo_semestral)) {
    throw new Error(`Ciclo inválido. Debe ser uno de: ${ciclosValidos.join(', ')}`);
  }
  
  // Convertir nombre del ciclo a ID numérico
  const idCiclo = CICLOS_ID_MAP[materiaData.ciclo_semestral];
  if (!idCiclo) {
    throw new Error(`Ciclo inválido. Debe ser uno de: ${Object.keys(CICLOS_ID_MAP).join(', ')}`);
  }

  // El orden DEBE ser exactamente como aparece en el ejemplo de la documentación
  const payload = {
    codigo_materia: codigoUpper,
    id_ciclo: idCiclo,
    nombre_materia: materiaData.nombre_materia.trim()
  };

  const headers = AuthService.getAuthHeaders();
  
  // Verificar token
  const token = localStorage.getItem('auth_token');
  const expiresAt = localStorage.getItem('token_expires_at');
  if (expiresAt) {
    const isExpired = new Date(expiresAt) < new Date();
    if (isExpired) {
      throw new Error('Su sesión ha expirado. Por favor, inicie sesión nuevamente.');
    }
  }

  try {
    const response = await fetch(API_ENDPOINTS.MATERIAS, {
      credentials: 'include',
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload)
    });

    
    // Si es error 500, dar más información al usuario
    if (response.status === 500) {
      const errorData = await response.json().catch(() => ({}));
      
      throw new Error(
        '⚠️ ERROR INTERNO DEL SERVIDOR (500)\n\n' +
        'El backend tiene un problema al crear la materia.\n\n' +
        '📋 DATOS ENVIADOS (CORRECTOS):\n' +
        `• Código: ${payload.codigo_materia}\n` +
        `• Nombre: ${payload.nombre_materia}\n` +
        `• Ciclo: ${payload.ciclo_semestral}\n\n` +
        '🔧 POSIBLES CAUSAS DEL ERROR:\n' +
        '1. Código de materia duplicado en la base de datos\n' +
        '2. Error de conexión con la base de datos\n' +
        '3. Permisos insuficientes del usuario\n' +
        '4. Bug en el código del backend\n\n' +
        '💡 RECOMENDACIÓN:\n' +
        'Contacte al equipo de backend con este timestamp:\n' +
        `${errorData.timestamp || new Date().toISOString()}\n\n` +
        'Los datos del frontend están correctos.'
      );
    }
    
    const resultado = await procesarRespuesta(response);
    return resultado;
  } catch (error) {
    throw error;
  }
};


/**
 * Crear asignación docente-materia (asociar grupo con materia)
 * Usa el endpoint: POST /api/v1/admin/asignaciones-docentes
 * @param {Object} asignacionData
 * @param {number} asignacionData.codigo_grupo - Código del grupo
 * @param {string} asignacionData.codigo_materia - Código de la materia
 * @param {string} asignacionData.id_docente - ID del docente
 * @returns {Promise<Object>} Asignación creada
 */
export const crearAsignacionDocente = async (asignacionData) => {
  const payload = {
    codigo_grupo: asignacionData.codigo_grupo,
    codigo_materia: asignacionData.codigo_materia.toUpperCase(),
    id_docente: asignacionData.id_docente
  };

  try {
    const response = await fetch(API_ENDPOINTS.ASIGNACIONES_DOCENTE, {
      credentials: 'include',
      method: 'POST',
      headers: AuthService.getAuthHeaders(),
      body: JSON.stringify(payload)
    });

    const resultado = await procesarRespuesta(response);
    return resultado;
  } catch (error) {
    throw error;
  }
};

/**
 * Eliminar una asignación de docente a grupo
 * @param {string} idDocenteMateria - ID de la asignación (id_docente_materia)
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const eliminarAsignacionDocente = async (idDocenteMateria) => {
  try {
    const response = await fetch(API_ENDPOINTS.ADMIN_ASIGNACION_DELETE(idDocenteMateria), {
      credentials: 'include',
      method: 'DELETE',
      headers: AuthService.getAuthHeaders()
    });

    const resultado = await procesarRespuesta(response);
    return resultado;
  } catch (error) {
    throw error;
  }
};


/**
 * Actualizar una materia existente
 * @param {string} id - Código de la materia
 * @param {Object} materiaData - Datos de la materia
 * @param {string} materiaData.nombre_materia - Nombre de la materia
 * @param {number} materiaData.id_ciclo - ID del ciclo semestral
 * @returns {Promise<Object>} Materia actualizada
 */
export const actualizarMateria = async (id, materiaData) => {
  const payload = {
    nombre_materia: materiaData.nombre_materia,
    id_ciclo: materiaData.id_ciclo
  };

  try {
    const response = await fetch(API_ENDPOINTS.ADMIN_MATERIA_BY_CODE(id), {
      credentials: 'include',
      method: 'PATCH',
      headers: AuthService.getAuthHeaders(),
      body: JSON.stringify(payload)
    });

    const resultado = await procesarRespuesta(response);
    return resultado;
  } catch (error) {
    throw error;
  }
};


/**
 * Eliminar una materia
 * @param {string} id - ID de la materia
 * @returns {Promise<Object>} Confirmación de eliminación
 */
export const eliminarMateria = async (id) => {

  try {
    const response = await fetch(API_ENDPOINTS.MATERIA_BY_ID(id), { 
      credentials: 'include',
      method: 'DELETE',
      headers: AuthService.getAuthHeaders()
    });

    const resultado = await procesarRespuesta(response);
    return resultado;
  } catch (error) {
    throw error;
  }
};


/**
 * Agregar un grupo a una materia
 * Usa el endpoint: POST /api/v1/admin/materias/{subject_code}/grupos/{group_code}
 * @param {string} codigoMateria - Código de la materia
 * @param {string} codigoGrupo - Código del grupo
 * @returns {Promise<Object>} Resultado de la operación
 */
export const agregarGrupoAMateria = async (codigoMateria, codigoGrupo) => {
  const url = API_ENDPOINTS.ADMIN_GRUPO_BY_CODE(codigoMateria, codigoGrupo);
  

  try {
    const response = await fetch(url, {
      credentials: 'include',
      method: 'POST',
      headers: AuthService.getAuthHeaders()
    });

    const resultado = await procesarRespuesta(response);
    return resultado;
  } catch (error) {
    throw error;
  }
};


/**
 * Eliminar un grupo de una materia
 * Usa el endpoint: DELETE /api/v1/admin/materias/{subject_code}/grupos/{group_code}
 * @param {string} codigoMateria - Código de la materia
 * @param {string} codigoGrupo - Código del grupo
 * @returns {Promise<Object>} Resultado de la operación
 */
export const eliminarGrupoDeMateria = async (codigoMateria, codigoGrupo) => {
  const url = API_ENDPOINTS.ADMIN_GRUPO_BY_CODE(codigoMateria, codigoGrupo);
  

  try {
    const response = await fetch(url, {
      credentials: 'include',
      method: 'DELETE',
      headers: AuthService.getAuthHeaders()
    });

    const resultado = await procesarRespuesta(response);
    return resultado;
  } catch (error) {
    throw error;
  }
};


/**
 * Filtrar materias por término de búsqueda
 * @param {Array} materias - Lista de materias
 * @param {string} searchTerm - Término de búsqueda
 * @returns {Array} Materias filtradas
 */
export const filtrarMaterias = (materias, searchTerm) => {
  if (!searchTerm || searchTerm.trim() === '') {
    return materias;
  }

  const termino = searchTerm.toLowerCase();
  return materias.filter(materia => {
    const codigo = (materia.codigo_materia || '').toLowerCase();
    const nombre = (materia.nombre_materia || '').toLowerCase();
    const ciclo = (materia.ciclo_semestral || '').toLowerCase();

    return codigo.includes(termino) || nombre.includes(termino) || ciclo.includes(termino);
  });
};


/**
 * Validar que los grupos seleccionados no estén duplicados
 * @param {Array} grupos - Array de grupos seleccionados
 * @returns {boolean} true si no hay duplicados
 */
export const validarGruposUnicos = (grupos) => {
  const codigosUnicos = new Set(grupos.map(g => g.codigo_grupo));
  return codigosUnicos.size === grupos.length;
};


/**
 * Obtener las asignaciones (grupos y docentes) de una materia
 * Usa el endpoint: GET /api/v1/admin/materias/{codigo_materia}/asignaciones_docentes
 * Retorna todas las clases (docente+grupo) asociadas a una materia de forma optimizada
 * @param {string} codigoMateria - Código de la materia
 * @returns {Promise<Array>} Lista de asignaciones con grupos y docentes
 */
export const obtenerAsignacionesMateria = async (codigoMateria) => {
  try {
    const url = API_ENDPOINTS.ADMIN_MATERIA_DOCENTES(codigoMateria);

    const response = await fetch(url, {
      credentials: 'include',
      method: 'GET',
      headers: AuthService.getAuthHeaders()
    });

    const resultado = await procesarRespuesta(response);

    return resultado.data || [];
  } catch (error) {
    throw error;
  }
};


/**
 * Validar datos de materia antes de enviar al backend
 * @param {Object} materiaData - Datos de la materia
 * @returns {Object} { valido: boolean, errores: Array }
 */
export const validarDatosMateria = (materiaData) => {
  const errores = [];

  if (!materiaData.codigo_materia || materiaData.codigo_materia.trim() === '') {
    errores.push('El código de la materia es obligatorio');
  }

  if (!materiaData.nombre_materia || materiaData.nombre_materia.trim() === '') {
    errores.push('El nombre de la materia es obligatorio');
  }

  if (!materiaData.ciclo_semestral || materiaData.ciclo_semestral.trim() === '') {
    errores.push('El ciclo semestral es obligatorio');
  }

  return {
    valido: errores.length === 0,
    errores
  };
};
