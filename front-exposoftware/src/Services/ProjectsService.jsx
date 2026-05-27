import { API_ENDPOINTS } from '../utils/constants';

const getAuthToken = () => {
  return localStorage.getItem('auth_token');
};

const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

/**
 * Obtener todos los proyectos
 */
export const obtenerProyectos = async () => {
  try {
    const response = await fetch(API_ENDPOINTS.PROYECTOS, {
      credentials: 'include',
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    return Array.isArray(data) ? data : (data.data || data.proyectos || []);
  } catch (error) {
    console.error('❌ Error obteniendo proyectos:', error);
    throw error;
  }
};

/**
 * Obtener proyectos del usuario actual (estudiante)
 * 
 * ⚠️ TEMPORAL: El backend NO devuelve id_usuario_creador en GET /proyectos
 * Por ahora devuelve TODOS los proyectos. 
 * 
 * TODO: Cuando el backend agregue id_usuario_creador a la respuesta,
 * descomentar el filtro para mostrar solo los proyectos del usuario.
 */
export const obtenerMisProyectos = async (idEstudiante) => {
  try {
    // Usar directamente el endpoint /api/v1/proyectos/mis-proyectos
    // Este endpoint trae los proyectos donde el usuario autenticado participa
    const response = await fetch(API_ENDPOINTS.MIS_PROYECTOS, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include'
    });

    if (response.ok) {
      const data = await response.json();
      const proyectos = Array.isArray(data) ? data : (data.data || data.proyectos || []);

      if (proyectos.length > 0) {
        // Debug info removed for security
      }

      return proyectos;
    } else if (response.status === 401) {
      throw new Error('No autorizado. Por favor, inicie sesión nuevamente');
    } else {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.message || `Error ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    console.error('❌ Error crítico obteniendo proyectos:', error);
    return [];
  }
};

/**
 * Obtener proyecto por ID
 */
export const obtenerProyectoPorId = async (projectId) => {
  try {
    console.log(`📊 Obteniendo proyecto ${projectId}...`);

    const response = await fetch(API_ENDPOINTS.PROYECTO_BY_ID(projectId), {
      method: 'GET',
      credentials: 'include',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`✅ Proyecto ${projectId} obtenido:`, data);
    
    return data.data || data;
  } catch (error) {
    console.error(`❌ Error obteniendo proyecto:`, error);
    throw error;
  }
};

/**
 * Obtener integrantes de un proyecto
 */
export const obtenerIntegrantesProyecto = async (proyectoId) => {
  try {
    console.log(`📊 Obteniendo integrantes del proyecto ${proyectoId}...`);

    const response = await fetch(API_ENDPOINTS.PROYECTO_INTEGRANTES(proyectoId), {
      method: 'GET',
      credentials: 'include',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      console.warn(`⚠️ Error obteniendo integrantes (${response.status})`);
      return [];
    }

    const data = await response.json();
    const integrantes = Array.isArray(data) ? data : (data.data || data.integrantes || []);
    console.log(`✅ Integrantes obtenidos: ${integrantes.length}`);

    return integrantes;
  } catch (error) {
    console.error(`❌ Error obteniendo integrantes:`, error);
    return [];
  }
};

/**
 * Crear un nuevo proyecto
 */
export const crearProyecto = async (projectData) => {
  try {
    console.log('📤 Creando nuevo proyecto...', projectData);

    const response = await fetch(API_ENDPOINTS.PROYECTOS, {
      credentials: 'include',
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(projectData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Proyecto creado:', data);

    return data.data || data;
  } catch (error) {
    console.error('❌ Error creando proyecto:', error);
    throw error;
  }
};

/**
 * Actualizar un proyecto
 */
export const actualizarProyecto = async (projectId, projectData) => {
  try {
    console.log(`📝 Actualizando proyecto ${projectId}...`, projectData);

    const response = await fetch(API_ENDPOINTS.PROYECTO_BY_ID(projectId), {
      method: 'PUT',
      credentials: 'include',
      headers: getAuthHeaders(),
      body: JSON.stringify(projectData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`✅ Proyecto ${projectId} actualizado:`, data);
    
    return data.data || data;
  } catch (error) {
    console.error(`❌ Error actualizando proyecto:`, error);
    throw error;
  }
};

/**
 * Obtener proyectos del docente autenticado
 *
 * Obtiene todos los proyectos y filtra por id_docente (session-based auth)
 * Filtra por id_docente.uid_docente (proyectos asignados al docente)
 */
export const getTeacherProjects = async (teacherId) => {
  try {
    console.log(`👨‍🏫 Obteniendo proyectos del docente...`, { teacherId });
    console.log(`📋 ID del docente a buscar: ${teacherId}`);

    console.log('🔄 GET /api/v1/proyectos (filtrar manualmente por docente)');

    const response = await fetch(API_ENDPOINTS.PROYECTOS, {
      method: 'GET',
      credentials: 'include',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const todosProyectos = Array.isArray(data) ? data : (data.data || data.proyectos || []);

    console.log('📋 Total de proyectos recibidos:', todosProyectos.length);
    console.log('🔍 Filtrando proyectos del docente:', teacherId);

    // Debug: Ver estructura del primer proyecto
    if (todosProyectos.length > 0) {
      console.log('🔍 DEBUG - Estructura del primer proyecto completo:', todosProyectos[0]);
      console.log('🔍 DEBUG - id_docente:', todosProyectos[0].id_docente);
      console.log('🔍 DEBUG - Tipo de id_docente:', typeof todosProyectos[0].id_docente);
      if (todosProyectos[0].id_docente?.uid_docente) {
        console.log('🔍 DEBUG - uid_docente:', todosProyectos[0].id_docente.uid_docente);
      }
    }

    console.log('🔍 DEBUG - ID que estamos buscando:', teacherId);

    // Filtrar proyectos donde el docente está asignado
    // id_docente puede ser un string o un objeto {uid_docente: string, nombre: string}
    const proyectosDocente = todosProyectos.filter(proyecto => {
      let esDelDocente = false;

      // Caso 1: id_docente es un objeto con uid_docente
      if (typeof proyecto.id_docente === 'object' && proyecto.id_docente !== null) {
        esDelDocente = proyecto.id_docente.uid_docente === teacherId;

        console.log(`   🔎 Comparando: "${proyecto.id_docente.uid_docente}" === "${teacherId}" -> ${esDelDocente}`);

        if (esDelDocente) {
          console.log('   ✅ Proyecto del docente (objeto):', proyecto.titulo_proyecto);
          console.log('      - uid_docente:', proyecto.id_docente.uid_docente);
          console.log('      - nombre:', proyecto.id_docente.nombre);
        }
      }
      // Caso 2: id_docente es un string simple
      else if (typeof proyecto.id_docente === 'string') {
        esDelDocente = proyecto.id_docente === teacherId;

        console.log(`   🔎 Comparando string: "${proyecto.id_docente}" === "${teacherId}" -> ${esDelDocente}`);

        if (esDelDocente) {
          console.log('   ✅ Proyecto del docente (string):', proyecto.titulo_proyecto);
        }
      }

      return esDelDocente;
    });

    console.log('✅ Proyectos del docente filtrados:', proyectosDocente.length);
    return proyectosDocente;

  } catch (error) {
    console.error('❌ Error obteniendo proyectos del docente:', error);
    throw error;
  }
};

/**
 * Actualizar estado de un proyecto
 */
export const updateProjectStatus = async (projectId, status) => {
  try {
    console.log(`🔄 Actualizando estado del proyecto ${projectId} a ${status}...`);

    const response = await fetch(API_ENDPOINTS.PROYECTO_ESTADO(projectId), {
      method: 'PATCH',
      credentials: 'include',
      headers: getAuthHeaders(),
      body: JSON.stringify({ estado: status })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`✅ Estado del proyecto ${projectId} actualizado:`, data);
    
    return data.data || data;
  } catch (error) {
    console.error(`❌ Error actualizando estado del proyecto:`, error);
    throw error;
  }
};

/**
 * Obtener miembros de un proyecto
 */
export const obtenerMiembrosProyecto = async (projectId) => {
  try {
    console.log(`👥 Obteniendo miembros del proyecto ${projectId}...`);

    const response = await fetch(API_ENDPOINTS.PROYECTO_INTEGRANTES(projectId), {
      method: 'GET',
      credentials: 'include',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Miembros obtenidos:', data);
    
    return Array.isArray(data) ? data : (data.data || data.miembros || []);
  } catch (error) {
    console.error('❌ Error obteniendo miembros:', error);
    throw error;
  }
};

/**
 * Eliminar un proyecto
 */
export const eliminarProyecto = async (projectId) => {
  try {
    console.log(`🗑️ Eliminando proyecto ${projectId}...`);

    const response = await fetch(API_ENDPOINTS.PROYECTO_BY_ID(projectId), {
      method: 'DELETE',
      credentials: 'include',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }

    console.log(`✅ Proyecto ${projectId} eliminado`);
    return true;
  } catch (error) {
    console.error(`❌ Error eliminando proyecto:`, error);
    throw error;
  }
};
