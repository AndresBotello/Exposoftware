import { API_ENDPOINTS, API_BASE_URL } from '../utils/constants';
import { fetchApi } from '../utils/apiClient';

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
    const response = await fetchApi(API_ENDPOINTS.PROYECTOS, {
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
    const response = await fetchApi(API_ENDPOINTS.MIS_PROYECTOS, {
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
    const response = await fetchApi(API_ENDPOINTS.PROYECTO_BY_ID(projectId), {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

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
    const response = await fetchApi(API_ENDPOINTS.PROYECTO_INTEGRANTES(proyectoId), {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    const integrantes = Array.isArray(data) ? data : (data.data || data.integrantes || []);

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
    const response = await fetchApi(API_ENDPOINTS.PROYECTOS, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(projectData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

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
    const response = await fetchApi(API_ENDPOINTS.PROYECTO_BY_ID(projectId), {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(projectData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    return data.data || data;
  } catch (error) {
    console.error(`❌ Error actualizando proyecto:`, error);
    throw error;
  }
};

/**
 * Actualizar proyecto con archivo (PATCH)
 * Permite actualizar título, estado, área y reemplazar archivo PDF
 */
export const actualizarProyectoConArchivo = async (projectId, datosActualizacion, archivo = null) => {
  try {
    const url = API_ENDPOINTS.PROYECTO_BY_ID(projectId);
    const headers = getAuthHeaders();

    let requestBody;
    let finalHeaders = { ...headers };

    if (archivo) {
      const formData = new FormData();
      formData.append('proyecto_data', JSON.stringify(datosActualizacion));
      formData.append('archivo', archivo);
      requestBody = formData;
      delete finalHeaders['Content-Type'];
    } else {
      requestBody = datosActualizacion;
      finalHeaders['Content-Type'] = 'application/json';
    }

    const response = await fetchApi(url, {
      method: 'PATCH',
      headers: finalHeaders,
      body: archivo ? requestBody : JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error('❌ Error en actualizarProyectoConArchivo:', error);
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
    const response = await fetchApi(API_ENDPOINTS.PROYECTOS, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const todosProyectos = Array.isArray(data) ? data : (data.data || data.proyectos || []);

    // Filtrar proyectos donde el docente está asignado
    // id_docente puede ser un string o un objeto {uid_docente: string, nombre: string}
    const proyectosDocente = todosProyectos.filter(proyecto => {
      let esDelDocente = false;

      // Caso 1: id_docente es un objeto con uid_docente
      if (typeof proyecto.id_docente === 'object' && proyecto.id_docente !== null) {
        esDelDocente = proyecto.id_docente.uid_docente === teacherId;
      }
      // Caso 2: id_docente es un string simple
      else if (typeof proyecto.id_docente === 'string') {
        esDelDocente = proyecto.id_docente === teacherId;
      }

      return esDelDocente;
    });

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
    const response = await fetchApi(API_ENDPOINTS.PROYECTO_ESTADO(projectId), {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ estado: status })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

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
    const response = await fetchApi(API_ENDPOINTS.PROYECTO_INTEGRANTES(projectId), {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

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
    const response = await fetchApi(API_ENDPOINTS.PROYECTO_BY_ID(projectId), {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error(`❌ Error eliminando proyecto:`, error);
    throw error;
  }
};

/**
 * Eliminar proyecto de forma permanente (SOLO ADMIN)
 * DELETE /api/v1/admin/proyectos/{id_proyecto}/eliminar
 * Elimina el proyecto y todos sus datos relacionados
 */
export const eliminarProyectoPermanentemente = async (projectId) => {
  try {
    const headers = getAuthHeaders();
    const url = `${API_BASE_URL}/api/v1/admin/proyectos/${projectId}/eliminar`;

    const response = await fetchApi(url, {
      method: 'DELETE',
      headers: headers
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = await response.text();
      }
      throw new Error(errorData?.message || errorData || `Error ${response.status}: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    throw error;
  }
};

/**
 * Generar código QR para calificar un proyecto
 * POST /api/v1/proyectos/{id_proyecto}/generar-qr
 * @param {string} projectId - ID del proyecto
 * @param {string} urlFront - URL base del frontend (opcional, por default toma la actual)
 * @returns {Promise<Object>} QR base64 y datos
 */
export const generarQRCalificacion = async (projectId, urlFront = null) => {
  try {
    // Si no se proporciona urlFront, usar la actual
    const baseUrl = urlFront || window.location.origin;

    const url = new URL(`${API_ENDPOINTS.PROYECTOS}/${projectId}/generar-qr`, window.location.origin);
    url.searchParams.append('url_front', baseUrl);

    const response = await fetchApi(url.toString(), {
      method: 'POST',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.detail || `Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    return data.data || data;
  } catch (error) {
    console.error(`❌ Error generando QR de calificación:`, error);
    throw error;
  }
};
