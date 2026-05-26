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
    console.log('📥 Cargando grupos desde:', API_ENDPOINTS.GRUPOS);
    const headers = AuthService.getAuthHeaders();
    console.log('🔑 Headers de autenticación:', headers);
    
    const response = await fetch(API_ENDPOINTS.GRUPOS, {
      credentials: 'include',
      method: 'GET',
      headers: headers
    });
    
    console.log('📡 Respuesta del servidor - Status:', response.status, response.statusText);
    
    if (response.ok) {
      const result = await response.json();
      console.log('� Respuesta completa:', result);
      
      // El backend puede retornar { data: [...] } o directamente [...]
      const grupos = result.data || result;
      console.log('✅ Grupos cargados:', grupos.length);
      
      if (grupos.length > 0) {
        console.log('🔍 Estructura del primer grupo:', grupos[0]);
        console.log('🔍 Claves del primer grupo:', Object.keys(grupos[0]));
      }
      
      return Array.isArray(grupos) ? grupos : [];
    } else {
      const errorText = await response.text();
      console.error('❌ Error al cargar grupos:', response.status, response.statusText, errorText);
      throw new Error(`Error al cargar grupos: ${response.statusText}`);
    }
  } catch (error) {
    console.error('❌ Error de conexión al cargar grupos:', error);
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
    console.log('📥 Cargando profesores desde:', url);
    const headers = AuthService.getAuthHeaders();
    console.log('🔑 Headers de autenticación:', headers);
    
    const response = await fetch(url, {
      credentials: 'include',
      method: 'GET',
      headers: headers
    });
    
    console.log('📡 Respuesta del servidor - Status:', response.status, response.statusText);
    
    if (response.ok) {
      const result = await response.json();
      console.log('📦 Respuesta completa profesores:', result);
      
      // El backend puede retornar { data: [...] } o directamente [...]
      const profesores = result.data || result;
      console.log('✅ Profesores cargados:', profesores.length);
      
      if (profesores.length > 0) {
        console.log('🔍 ESTRUCTURA COMPLETA DEL PRIMER PROFESOR:', profesores[0]);
        console.log('🔍 TODAS LAS CLAVES:', Object.keys(profesores[0]));
        console.log('🔍 ¿Tiene campo "id_docente"?', 'id_docente' in profesores[0], profesores[0].id_docente);
        console.log('🔍 ¿Tiene campo "id_usuario"?', 'id_usuario' in profesores[0], profesores[0].id_usuario);
        console.log('🔍 ¿Tiene campo "codigo_docente"?', 'codigo_docente' in profesores[0], profesores[0].codigo_docente);
        console.log('🔍 JSON COMPLETO:', JSON.stringify(profesores[0], null, 2));
        
        // 🚨 DIAGNÓSTICO: Ver si id_docente es igual a id_usuario
        if (profesores[0].id_docente === profesores[0].id_usuario) {
          console.warn('⚠️ PROBLEMA DETECTADO: id_docente es igual a id_usuario');
          console.warn('   Esto indica que el backend está usando el ID de Firebase como id_docente');
          console.warn('   SOLUCIÓN: Usaremos el id_usuario directamente ya que el backend lo acepta');
        }
      }
      
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
                console.log('✅ Usuario cargado para profesor:', profesor.id_docente, usuario);
                return { ...profesor, usuario };
              }
            }
            return profesor;
          } catch (error) {
            console.warn('⚠️ No se pudo cargar usuario para profesor:', profesor.id_docente, error);
            return profesor;
          }
        })
      );
      
      console.log('✅ Profesores con información de usuario:', profesoresConUsuario);
      return Array.isArray(profesoresConUsuario) ? profesoresConUsuario : [];
    } else {
      const errorText = await response.text();
      console.error('❌ Error al cargar profesores:', response.status, response.statusText, errorText);
      throw new Error(`Error al cargar profesores: ${response.statusText}`);
    }
  } catch (error) {
    console.error('❌ Error de conexión al cargar profesores:', error);
    throw error;
  }
};

/**
 * Crear un nuevo grupo en el backend
 * @param {number} codigoGrupo - Código/número del grupo
 * @returns {Promise<Object>} Datos del grupo creado
 */
export const crearGrupo = async (codigoGrupo) => {
  // Validaciones
  if (!codigoGrupo) {
    throw new Error("Por favor ingrese un código de grupo");
  }

  // Estructura exacta que espera el backend
  // IMPORTANTE: codigo_grupo debe ser STRING con solo números
  const payload = {
    nombre_grupo: String(codigoGrupo)  // El servidor espera nombre_grupo, no codigo_grupo
  };

  console.log('📤 Creando grupo en backend:', JSON.stringify(payload, null, 2));
  console.log('🔗 Endpoint:', API_ENDPOINTS.GRUPOS);
  
  const headers = AuthService.getAuthHeaders();
  console.log('🔑 Headers:', headers);

  try {
    const response = await fetch(API_ENDPOINTS.GRUPOS, {
      credentials: 'include',
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload)
    });

    console.log('📡 Respuesta del servidor - Status:', response.status, response.statusText);

    // Manejo de códigos de estado HTTP
    if (response.status === 201 || response.ok) {
      const data = await response.json();
      console.log('✅ Grupo creado exitosamente:', data);
      return { success: true, data };
    } else if (response.status === 400) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Solicitud incorrecta:', errorData);
      throw new Error(`Solicitud incorrecta: ${errorData.message || errorData.detail || 'Verifique los datos ingresados'}`);
    } else if (response.status === 401) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ No autorizado:', errorData);
      throw new Error(`No autorizado: ${errorData.message || errorData.detail || 'Debe iniciar sesión'}`);
    } else if (response.status === 403) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Sin permisos:', errorData);
      throw new Error(`Sin permisos: ${errorData.message || errorData.detail || 'No tiene permisos para crear grupos'}`);
    } else if (response.status === 409) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Conflicto:', errorData);
      throw new Error(`Conflicto: ${errorData.message || errorData.detail || 'El grupo ya existe'}`);
    } else if (response.status === 422) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Error de validación:', errorData);
      console.error('❌ Error detail completo:', JSON.stringify(errorData, null, 2));
      
      // Manejar errores de validación de FastAPI
      if (errorData.detail && Array.isArray(errorData.detail)) {
        console.error('❌ Errores de validación (Array):', errorData.detail);
        const errorMessages = errorData.detail.map((err, index) => {
          console.error(`   Error ${index + 1}:`, err);
          return `• ${err.loc ? err.loc.join('.') : 'Campo'}: ${err.msg || err.message || 'Error de validación'}`;
        }).join('\n');
        throw new Error('Errores de validación:\n' + errorMessages);
      }
      
      // Si detail es un string
      if (typeof errorData.detail === 'string') {
        console.error('❌ Error detail (string):', errorData.detail);
        throw new Error(`Error de validación: ${errorData.detail}`);
      }
      
      throw new Error(`Error de validación: ${errorData.message || errorData.detail || 'Los datos no son válidos'}`);
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Error del servidor:', errorData);
      throw new Error(`Error al crear el grupo (${response.status}): ${errorData.message || errorData.detail || 'Error desconocido'}`);
    }
  } catch (error) {
    if (error.message) {
      throw error;
    }
    console.error('❌ Error al crear grupo:', error);
    throw new Error("Error de conexión al crear el grupo. Verifique su conexión a internet.");
  }
};

/**
 * Actualizar un grupo existente
 * @param {string} codigoGrupo - Código/ID del grupo a actualizar
 * @param {string} nombreGrupo - Nuevo nombre del grupo
 * @param {string} idDocente - Nuevo ID del docente asignado
 * @returns {Promise<Object>} Datos del grupo actualizado
 */
export const actualizarGrupo = async (idGrupo, nombreGrupo) => {
  // Validaciones
  if (!nombreGrupo) {
    throw new Error("Por favor complete todos los campos obligatorios");
  }

  const payload = {
    nombre_grupo: nombreGrupo
  };

  console.log('📤 Actualizando grupo en backend (id_grupo: ' + idGrupo + '):', JSON.stringify(payload, null, 2));

  try {
    const response = await fetch(API_ENDPOINTS.ADMIN_GRUPO_BY_ID(idGrupo), {
      credentials: 'include',
      method: 'PATCH',
      headers: AuthService.getAuthHeaders(),
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Respuesta del backend:', data);
      return { success: true, data };
    } else if (response.status === 400) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Solicitud incorrecta:', errorData);
      throw new Error(`Solicitud incorrecta: ${errorData.message || errorData.detail || 'Verifique los datos'}`);
    } else if (response.status === 401) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ No autorizado:', errorData);
      throw new Error(`No autorizado: ${errorData.message || errorData.detail || 'Debe iniciar sesión'}`);
    } else if (response.status === 403) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Sin permisos:', errorData);
      throw new Error(`Sin permisos: ${errorData.message || errorData.detail || 'No tiene permisos para editar grupos'}`);
    } else if (response.status === 404) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ No encontrado:', errorData);
      throw new Error(`No encontrado: ${errorData.message || errorData.detail || 'El grupo no existe'}`);
    } else if (response.status === 422) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Error de validación:', errorData);
      throw new Error(`Error de validación: ${errorData.message || errorData.detail || 'Los datos no son válidos'}`);
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Error del servidor:', errorData);
      throw new Error(`Error al actualizar el grupo (${response.status}): ${errorData.message || errorData.detail || 'Error desconocido'}`);
    }
  } catch (error) {
    if (error.message) {
      throw error;
    }
    console.error('❌ Error al actualizar grupo:', error);
    throw new Error("Error de conexión al actualizar el grupo. Verifique su conexión a internet.");
  }
};

/**
 * Eliminar un grupo
 * @param {string} codigoGrupo - Código/ID del grupo a eliminar
 * @returns {Promise<Object>} Confirmación de eliminación
 */
export const eliminarGrupo = async (codigoGrupo) => {
  console.log('🗑️ Eliminando del backend - codigo_grupo:', codigoGrupo);

  try {
    const response = await fetch(API_ENDPOINTS.ADMIN_GRUPO_BY_ID(codigoGrupo), { 
      credentials: 'include',
      method: 'DELETE',
      headers: AuthService.getAuthHeaders()
    });
    
    if (response.ok) {
      console.log('✅ Grupo eliminado del backend');
      return { success: true };
    } else if (response.status === 401) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ No autorizado:', errorData);
      throw new Error(`No autorizado: ${errorData.message || errorData.detail || 'Debe iniciar sesión'}`);
    } else if (response.status === 403) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Sin permisos:', errorData);
      throw new Error(`Sin permisos: ${errorData.message || errorData.detail || 'No tiene permisos para eliminar grupos'}`);
    } else if (response.status === 404) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ No encontrado:', errorData);
      throw new Error(`No encontrado: ${errorData.message || errorData.detail || 'El grupo no existe'}`);
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Error del servidor:', errorData);
      throw new Error(`Error al eliminar el grupo (${response.status}): ${errorData.message || errorData.detail || 'Error desconocido'}`);
    }
  } catch (error) {
    if (error.message) {
      throw error;
    }
    console.error('❌ Error al eliminar grupo:', error);
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
  // Validar que grupos sea un array
  if (!Array.isArray(grupos)) {
    console.warn('⚠️ filtrarGrupos: grupos no es un array:', grupos);
    return [];
  }

  if (!searchTerm || searchTerm.trim() === '') {
    return grupos;
  }

  const termino = searchTerm.toLowerCase();

  return grupos.filter(grupo => {
    try {
      const nombreGrupo = grupo?.nombre_grupo?.toLowerCase() || '';
      const nombreProfesor = obtenerNombreProfesor(grupo?.id_docente, profesores).toLowerCase();

      return nombreGrupo.includes(termino) || nombreProfesor.includes(termino);
    } catch (error) {
      console.error('Error filtrando grupo:', error, grupo);
      return false;
    }
  });
};

// ==================== MATERIAS ====================

/**
 * Obtener todas las materias
 * @returns {Promise<Array>} Lista de materias
 */
export const obtenerMaterias = async () => {
  try {
    console.log('📥 Cargando materias desde:', API_ENDPOINTS.ADMIN_MATERIAS);
    const headers = AuthService.getAuthHeaders();

    const response = await fetch(API_ENDPOINTS.ADMIN_MATERIAS, {
      credentials: 'include',
      method: 'GET',
      headers: headers
    });

    console.log('📡 Respuesta del servidor - Status:', response.status);

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Materias obtenidas:', result);

      const materias = result.data || result;
      return Array.isArray(materias) ? materias : [];
    } else {
      const errorText = await response.text();
      console.error('❌ Error al cargar materias:', response.status, errorText);
      throw new Error(`Error al cargar materias: ${response.statusText}`);
    }
  } catch (error) {
    console.error('❌ Error de conexión al cargar materias:', error);
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
    console.log('📥 Cargando materia:', codigoMateria);
    const headers = AuthService.getAuthHeaders();

    const response = await fetch(API_ENDPOINTS.ADMIN_MATERIA_BY_CODE(codigoMateria), {
      credentials: 'include',
      method: 'GET',
      headers: headers
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Materia obtenida:', result);
      return result.data || result;
    } else {
      throw new Error(`Error al cargar materia: ${response.statusText}`);
    }
  } catch (error) {
    console.error('❌ Error al cargar materia:', error);
    throw error;
  }
};

// ==================== ASIGNACIONES (CLASES) ====================

/**
 * Crear una asignación (Clase = Docente + Materia + Grupo)
 * @param {string} idDocente - ID del docente
 * @param {string} codigoMateria - Código de la materia
 * @param {string} idGrupo - ID del grupo (UUID)
 * @returns {Promise<Object>} Datos de la asignación creada
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

  console.log('📤 Creando asignación (clase) en backend:', JSON.stringify(payload, null, 2));
  console.log('🔗 Endpoint:', API_ENDPOINTS.ADMIN_MATERIAS_ASIGNACIONES);

  const headers = AuthService.getAuthHeaders();

  try {
    const response = await fetch(API_ENDPOINTS.ADMIN_MATERIAS_ASIGNACIONES, {
      credentials: 'include',
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload)
    });

    console.log('📡 Respuesta del servidor - Status:', response.status);

    if (response.status === 201 || response.ok) {
      const data = await response.json();
      console.log('✅ Asignación creada exitosamente:', data);
      return { success: true, data };
    } else if (response.status === 400) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Solicitud incorrecta:', errorData);
      throw new Error(`Solicitud incorrecta: ${errorData.message || errorData.detail || 'Verifique los datos ingresados'}`);
    } else if (response.status === 409) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Conflicto:', errorData);
      throw new Error(`Esta clase ya existe: ${errorData.message || errorData.detail || 'La combinación de docente, materia y grupo ya existe'}`);
    } else if (response.status === 422) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Error de validación:', errorData);
      throw new Error(`Error de validación: ${errorData.message || errorData.detail || 'Los datos no son válidos'}`);
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Error del servidor:', errorData);
      throw new Error(`Error al crear la asignación (${response.status}): ${errorData.message || errorData.detail || 'Error desconocido'}`);
    }
  } catch (error) {
    if (error.message) {
      throw error;
    }
    console.error('❌ Error al crear asignación:', error);
    throw new Error("Error de conexión al crear la asignación. Verifique su conexión a internet.");
  }
};

/**
 * Obtener todas las clases de una materia
 * @param {string} codigoMateria - Código de la materia
 * @param {Array} profesores - Lista de profesores para buscar nombres
 * @param {Array} grupos - Lista de grupos para buscar información
 * @returns {Promise<Array>} Lista de clases/asignaciones
 */
export const obtenerClasesMateria = async (codigoMateria, profesores = [], grupos = []) => {
  try {
    console.log('📥 Cargando clases de materia:', codigoMateria);
    const headers = AuthService.getAuthHeaders();

    const response = await fetch(API_ENDPOINTS.ADMIN_MATERIA_ASIGNACIONES(codigoMateria), {
      credentials: 'include',
      method: 'GET',
      headers: headers
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Clases obtenidas con asignaciones:', result);
      console.log('🔍 Estructura de result.data:', result.data);
      console.log('🔍 Claves de result.data:', Object.keys(result.data || {}));

      // El endpoint devuelve la materia con sus asignaciones anidadas
      const asignaciones = result.data?.asignaciones || result.asignaciones || [];

      console.log('📋 Asignaciones encontradas:', asignaciones);
      console.log('📊 Cantidad de asignaciones:', asignaciones.length);

      if (asignaciones.length > 0) {
        console.log('🔍 Estructura primera asignación:', asignaciones[0]);
        console.log('🔍 JSON COMPLETO asignación:', JSON.stringify(asignaciones[0], null, 2));
        console.log('🔍 Claves de asignación:', Object.keys(asignaciones[0]));
      }

      // Transformar asignaciones a formato compatible con la UI
      return asignaciones.map(asignacion => {
        const idDocente = asignacion.docente?.id_docente || asignacion.id_docente;
        const idGrupo = asignacion.grupo?.id || asignacion.id_grupo;

        // Buscar el profesor en la lista para obtener el nombre completo
        const profesorInfo = profesores.find(p => {
          const docente = p?.docente || p;
          const usuario = p?.usuario || {};
          return docente?.id_docente === idDocente || usuario?.id_usuario === idDocente;
        });

        // Construir el nombre completo del docente
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

        console.log(`🧑 Docente encontrado para ${idDocente}:`, docente_nombre);

        // Buscar el grupo en la lista para obtener su información
        const grupoInfo = grupos.find(g => g?.id_grupo === idGrupo);
        const nombre_grupo = grupoInfo?.nombre_grupo || asignacion.grupo?.nombre_grupo || '';

        console.log(`📚 Grupo encontrado para ${idGrupo}:`, grupoInfo);
        console.log(`📚 Nombre del grupo: ${nombre_grupo}`);

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
    console.error('❌ Error al cargar clases:', error);
    throw error;
  }
};

/**
 * Obtener todas las clases de un docente
 * @param {string} idDocente - ID del docente
 * @returns {Promise<Array>} Lista de clases/asignaciones
 */
export const obtenerClasesDocente = async (idDocente) => {
  try {
    console.log('📥 Cargando clases del docente:', idDocente);
    const headers = AuthService.getAuthHeaders();

    const response = await fetch(API_ENDPOINTS.ADMIN_DOCENTES_ASIGNACIONES(idDocente), {
      credentials: 'include',
      method: 'GET',
      headers: headers
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Clases del docente obtenidas:', result);
      const clases = result.data || result;
      return Array.isArray(clases) ? clases : [];
    } else {
      throw new Error(`Error al cargar clases: ${response.statusText}`);
    }
  } catch (error) {
    console.error('❌ Error al cargar clases del docente:', error);
    throw error;
  }
};
