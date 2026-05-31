import { API_ENDPOINTS } from "../utils/constants";
import * as AuthService from "./AuthService";

/**
 * Servicio para la gestión de grupos y clases (asignaciones)
 * Contiene todas las funciones de lógica de negocio y comunicación con el backend
 *
 * Estructura:
 * - Grupo: código único del grupo
 * - Clase: combinación de (Docente + Materia + Grupo)
 */

// ==================== FUNCIONES DE API ====================

/**
 * Obtener todos los grupos desde el backend
 * @returns {Promise<Array>} Lista de grupos
 */
export const obtenerGrupos = async () => {
  try {
    const headers = AuthService.getAuthHeaders();
    const allGrupos = [];
    let page = 1;
    const limit = 100;

    while (true) {
      const url = `${API_ENDPOINTS.GRUPOS}?page=${page}&limit=${limit}`;
      const response = await fetch(url, {
        credentials: 'include',
        method: 'GET',
        headers: headers
      });

      if (!response.ok) {
        throw new Error(`Error al cargar grupos: ${response.statusText}`);
      }

      const result = await response.json();
      const grupos = result.data || result;
      if (!Array.isArray(grupos)) break;

      allGrupos.push(...grupos);

      const pagination = result.pagination;
      if (!pagination?.has_next) break;
      page += 1;
    }

    return allGrupos;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtener todos los profesores desde el backend
 * @returns {Promise<Array>} Lista de profesores
 */
export const obtenerProfesores = async () => {
  try {
    // 🔥 IMPORTANTE: Backend solo acepta limit <= 100
    const url = `${API_ENDPOINTS.PROFESORES}?limit=100`;
    const headers = AuthService.getAuthHeaders();
    
    const response = await fetch(url, {
      credentials: 'include',
      method: 'GET',
      headers: headers
    });
    
    if (response.ok) {
      const result = await response.json();
      
      // El backend puede retornar { data: [...] } o directamente [...]
      const profesores = result.data || result;

      // 🔥 NO filtrar profesores - aceptar lo que el backend envía
      // El backend está usando id_usuario como id_docente, así que lo aceptamos
      
      // Cargar información de usuario para cada profesor
      const profesoresConUsuario = await Promise.all(
        profesores.map(async (profesor) => {
          try {
            if (profesor.id_usuario) {
              // Intentar obtener información del usuario
              const userResponse = await fetch(`${API_ENDPOINTS.USUARIOS}/${profesor.id_usuario}`, {
                credentials: 'include',
                method: 'GET',
                headers: headers
              });
              
              if (userResponse.ok) {
                const userData = await userResponse.json();
                const usuario = userData.data || userData;
                return { ...profesor, usuario };
              }
            }
            return profesor;
          } catch (error) {
            return profesor;
          }
        })
      );
      
      return Array.isArray(profesoresConUsuario) ? profesoresConUsuario : [];
    } else {
      throw new Error(`Error al cargar profesores: ${response.statusText}`);
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Crear un nuevo grupo en el backend
 * @param {number} codigoGrupo - Código/número del grupo
 * @returns {Promise<Object>} Datos del grupo creado
 */
export const crearGrupo = async (codigoGrupo) => {
  if (!codigoGrupo) {
    throw new Error("Por favor ingrese un código de grupo");
  }

  // Estructura exacta que espera el backend
  const payload = {
    nombre_grupo: String(codigoGrupo)
  };

  const headers = AuthService.getAuthHeaders();

  try {
    const response = await fetch(API_ENDPOINTS.GRUPOS, {
      credentials: 'include',
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload)
    });

    if (response.status === 201 || response.ok) {
      const data = await response.json();
      return { success: true, data };
    } else if (response.status === 400) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Solicitud incorrecta: ${errorData.message || errorData.detail || 'Verifique los datos ingresados'}`);
    } else if (response.status === 401) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`No autorizado: ${errorData.message || errorData.detail || 'Debe iniciar sesión'}`);
    } else if (response.status === 403) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Sin permisos: ${errorData.message || errorData.detail || 'No tiene permisos para crear grupos'}`);
    } else if (response.status === 409) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Conflicto: ${errorData.message || errorData.detail || 'El grupo ya existe'}`);
    } else if (response.status === 422) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Error detail completo:', JSON.stringify(errorData, null, 2));
      
      if (errorData.detail && Array.isArray(errorData.detail)) {
        const errorMessages = errorData.detail.map((err) => {
          return `• ${err.loc ? err.loc.join('.') : 'Campo'}: ${err.msg || err.message || 'Error de validación'}`;
        }).join('\n');
        throw new Error('Errores de validación:\n' + errorMessages);
      }
      
      if (typeof errorData.detail === 'string') {
        throw new Error(`Error de validación: ${errorData.detail}`);
      }
      
      throw new Error(`Error de validación: ${errorData.message || errorData.detail || 'Los datos no son válidos'}`);
    } else {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Error al crear el grupo (${response.status}): ${errorData.message || errorData.detail || 'Error desconocido'}`);
    }
  } catch (error) {
    if (error.message) throw error;
    throw new Error("Error de conexión al crear el grupo. Verifique su conexión a internet.");
  }
};

/**
 * Actualizar un grupo existente
 * @param {string} idGrupo - ID del grupo a actualizar
 * @param {string} nombreGrupo - Nuevo nombre del grupo
 * @returns {Promise<Object>} Datos del grupo actualizado
 */
export const actualizarGrupo = async (idGrupo, nombreGrupo) => {
  if (!nombreGrupo) {
    throw new Error("Por favor complete todos los campos obligatorios");
  }

  const payload = {
    nombre_grupo: nombreGrupo
  };

  try {
    const response = await fetch(API_ENDPOINTS.ADMIN_GRUPO_BY_ID(idGrupo), {
      credentials: 'include',
      method: 'PATCH',
      headers: AuthService.getAuthHeaders(),
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, data };
    } else if (response.status === 400) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Solicitud incorrecta: ${errorData.message || errorData.detail || 'Verifique los datos'}`);
    } else if (response.status === 401) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`No autorizado: ${errorData.message || errorData.detail || 'Debe iniciar sesión'}`);
    } else if (response.status === 403) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Sin permisos: ${errorData.message || errorData.detail || 'No tiene permisos para editar grupos'}`);
    } else if (response.status === 404) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`No encontrado: ${errorData.message || errorData.detail || 'El grupo no existe'}`);
    } else if (response.status === 422) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Error de validación: ${errorData.message || errorData.detail || 'Los datos no son válidos'}`);
    } else {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Error al actualizar el grupo (${response.status}): ${errorData.message || errorData.detail || 'Error desconocido'}`);
    }
  } catch (error) {
    if (error.message) throw error;
    throw new Error("Error de conexión al actualizar el grupo. Verifique su conexión a internet.");
  }
};

/**
 * Eliminar un grupo
 * @param {string} codigoGrupo - Código/ID del grupo a eliminar
 * @returns {Promise<Object>} Confirmación de eliminación
 */
export const eliminarGrupo = async (codigoGrupo) => {
  try {
    const response = await fetch(API_ENDPOINTS.ADMIN_GRUPO_BY_ID(codigoGrupo), { 
      credentials: 'include',
      method: 'DELETE',
      headers: AuthService.getAuthHeaders()
    });
    
    if (response.ok) {
      return { success: true };
    } else if (response.status === 401) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`No autorizado: ${errorData.message || errorData.detail || 'Debe iniciar sesión'}`);
    } else if (response.status === 403) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Sin permisos: ${errorData.message || errorData.detail || 'No tiene permisos para eliminar grupos'}`);
    } else if (response.status === 404) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`No encontrado: ${errorData.message || errorData.detail || 'El grupo no existe'}`);
    } else {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Error al eliminar el grupo (${response.status}): ${errorData.message || errorData.detail || 'Error desconocido'}`);
    }
  } catch (error) {
    if (error.message) throw error;
    throw new Error("Error de conexión al eliminar el grupo. Verifique su conexión a internet.");
  }
};

// ==================== FUNCIONES AUXILIARES ====================

/**
 * Obtener nombre de profesor por ID
 * @param {string} idDocente - ID del docente
 * @param {Array} profesores - Lista de profesores
 * @returns {string} Nombre del profesor o 'Sin asignar'
 */
export const obtenerNombreProfesor = (idDocente, profesores) => {
  const profesor = profesores.find(p => p.id === idDocente);
  return profesor ? profesor.nombre : 'Sin asignar';
};

/**
 * Filtrar grupos por término de búsqueda
 * @param {Array} grupos - Lista de grupos
 * @param {string} searchTerm - Término de búsqueda
 * @param {Array} profesores - Lista de profesores
 * @returns {Array} Grupos filtrados
 */
export const filtrarGrupos = (grupos, searchTerm, profesores) => {
  if (!Array.isArray(grupos)) return [];
  if (!searchTerm || searchTerm.trim() === '') return grupos;

  const termino = searchTerm.toLowerCase();

  return grupos.filter(grupo => {
    try {
      const nombreGrupo = grupo?.nombre_grupo?.toLowerCase() || '';
      const nombreProfesor = obtenerNombreProfesor(grupo?.id_docente, profesores).toLowerCase();
      return nombreGrupo.includes(termino) || nombreProfesor.includes(termino);
    } catch (error) {
      return false;
    }
  });
};

// ==================== MATERIAS ====================

/**
 * Obtener todas las materias (catálogo completo, sin paginar).
 */
export const obtenerMaterias = async () => {
  try {
    const headers = AuthService.getAuthHeaders();
    const response = await fetch(API_ENDPOINTS.ADMIN_MATERIAS_LIST, {
      credentials: 'include',
      method: 'GET',
      headers: headers
    });

    if (response.ok) {
      const result = await response.json();
      const materias = result.data || result;
      return Array.isArray(materias) ? materias : [];
    } else {
      throw new Error(`Error al cargar materias: ${response.statusText}`);
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Obtener una materia por código
 * @param {string} codigoMateria - Código de la materia
 * @returns {Promise<Object>} Datos de la materia
 */
export const obtenerMateriaPorCodigo = async (codigoMateria) => {
  try {
    const headers = AuthService.getAuthHeaders();
    const response = await fetch(API_ENDPOINTS.ADMIN_MATERIA_BY_CODE(codigoMateria), {
      credentials: 'include',
      method: 'GET',
      headers: headers
    });

    if (response.ok) {
      const result = await response.json();
      return result.data || result;
    } else {
      throw new Error(`Error al cargar materia: ${response.statusText}`);
    }
  } catch (error) {
    throw error;
  }
};

// ==================== ASIGNACIONES (CLASES) ====================

/**
 * Crear una asignación única tradicional (Clase = Docente + Materia + Grupo)
 */
export const crearAsignacion = async (idDocente, codigoMateria, idGrupo) => {
  if (!idDocente || !codigoMateria || !idGrupo) {
    throw new Error("Por favor complete todos los campos obligatorios");
  }

  const payload = {
    id_docente: idDocente,
    codigo_materia: codigoMateria,
    id_grupo: idGrupo
  };

  const headers = AuthService.getAuthHeaders();

  try {
    const response = await fetch(API_ENDPOINTS.ADMIN_MATERIAS_ASIGNACIONES, {
      credentials: 'include',
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload)
    });

    if (response.status === 201 || response.ok) {
      const data = await response.json();
      return { success: true, data };
    } else if (response.status === 400) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Solicitud incorrecta: ${errorData.message || errorData.detail || 'Verifique los datos ingresados'}`);
    } else if (response.status === 409) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Esta clase ya existe: ${errorData.message || errorData.detail || 'La combinación de docente, materia y grupo ya existe'}`);
    } else if (response.status === 422) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Error de validación: ${errorData.message || errorData.detail || 'Los datos no son válidos'}`);
    } else {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Error al crear la asignación (${response.status}): ${errorData.message || errorData.detail || 'Error desconocido'}`);
    }
  } catch (error) {
    if (error.message) throw error;
    throw new Error("Error de conexión al crear la asignación. Verifique su conexión a internet.");
  }
};

/**
 * NUEVO: Enviar una asignación masiva de un docente a múltiples grupos para una materia.
 * @param {Object} payload - Objeto estructurado { id_docente, codigo_materia, id_grupos }
 * @returns {Promise<Object>} Resumen del conteo de registros procesados
 */
export const crearAsignacionBulk = async (payload) => {
  if (!payload || !payload.id_docente || !payload.codigo_materia || !payload.id_grupos) {
    throw new Error("Por favor asigne un docente, una materia y al menos un grupo.");
  }

  const headers = AuthService.getAuthHeaders();

  try {
    const response = await fetch(API_ENDPOINTS.ADMIN_MATERIAS_ASIGNACIONES_BULK, {
      credentials: "include",
      method: "POST",
      headers: headers,
      body: JSON.stringify(payload),
    });

    if (response.status === 201 || response.ok) {
      const data = await response.json();
      return { success: true, data };
    } else if (response.status === 400) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Solicitud incorrecta: ${errorData.message || errorData.detail || 'Error al procesar la asignación en bloque.'}`);
    } else if (response.status === 401) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`No autorizado: Debe iniciar sesión nuevamente.`);
    } else if (response.status === 422) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Error de validación: Los campos enviados no coinciden con el esquema requerido.`);
    } else {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Error en asignación masiva (${response.status}): ${errorData.message || errorData.detail || 'Error desconocido'}`);
    }
  } catch (error) {
    if (error.message) throw error;
    throw new Error("Error de conexión en la asignación por lotes. Verifique su red.");
  }
};

/**
 * Obtener todas las clases de una materia
 */
export const obtenerClasesMateria = async (codigoMateria, profesores = [], grupos = []) => {
  try {
    const headers = AuthService.getAuthHeaders();
    const response = await fetch(API_ENDPOINTS.ADMIN_MATERIA_ASIGNACIONES(codigoMateria), {
      credentials: 'include',
      method: 'GET',
      headers: headers
    });

    if (response.ok) {
      const result = await response.json();
      const asignaciones = result.data?.asignaciones || result.asignaciones || [];

      return asignaciones.map(asignacion => {
        const idDocente = asignacion.docente?.id_docente || asignacion.id_docente;
        const idGrupo = asignacion.grupo?.id || asignacion.id_grupo;

        const profesorInfo = profesores.find(p => {
          const docente = p?.docente || p;
          const usuario = p?.usuario || {};
          return docente?.id_docente === idDocente || usuario?.id_usuario === idDocente;
        });

        let docente_nombre = '';
        if (profesorInfo?.usuario) {
          const { p_nombre, p_apellido } = profesorInfo.usuario;
          docente_nombre = `${p_nombre || ''} ${p_apellido || ''}`.trim();
        } else if (asignacion.docente?.usuario) {
          const { p_nombre, p_apellido } = asignacion.docente.usuario;
          docente_nombre = `${p_nombre || ''} ${p_apellido || ''}`.trim();
        }

        if (!docente_nombre) {
          docente_nombre = asignacion.docente_nombre || 'Sin nombre';
        }

        const grupoInfo = grupos.find(g => g?.id_grupo === idGrupo);
        const nombre_grupo = grupoInfo?.nombre_grupo || asignacion.grupo?.nombre_grupo || '';

        return {
          id_asignacion: asignacion.id_docente_materia || asignacion.id,
          id_docente: idDocente,
          docente_nombre: docente_nombre,
          id_grupo: idGrupo,
          nombre_grupo: nombre_grupo
        };
      });
    } else {
      throw new Error(`Error al cargar clases: ${response.statusText}`);
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Obtener todas las clases de un docente
 */
export const obtenerClasesDocente = async (idDocente) => {
  try {
    const headers = AuthService.getAuthHeaders();
    const response = await fetch(API_ENDPOINTS.ADMIN_DOCENTES_ASIGNACIONES(idDocente), {
      credentials: 'include',
      method: 'GET',
      headers: headers
    });

    if (response.ok) {
      const result = await response.json();
      const clases = result.data || result;
      return Array.isArray(clases) ? clases : [];
    } else {
      throw new Error(`Error al cargar clases: ${response.statusText}`);
    }
  } catch (error) {
    throw error;
  }
};