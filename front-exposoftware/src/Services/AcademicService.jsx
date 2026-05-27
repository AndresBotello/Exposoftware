import { API_ENDPOINTS } from "../utils/constants";

/**
 * Servicio para gestión académica (Facultades y Programas)
 * Usa endpoints públicos (sin autenticación requerida)
 */

/**
 * Obtiene el token de autenticación si existe
 * @returns {string|null} Token de autenticación o null
 */
const getAuthToken = () => {
  try {
    return localStorage.getItem('auth_token');
  } catch (error) {
    return null;
  }
};

/**
 * Crea headers para peticiones, incluyendo token si está disponible
 * @param {boolean} requireAuth - Si requiere autenticación obligatoria
 * @returns {Object} Headers de la petición
 */
const createHeaders = (requireAuth = false) => {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else if (requireAuth) {
    throw new Error('Se requiere autenticación para esta operación');
  }

  return headers;
};

/**
 * Obtener todas las facultades (sin autenticación requerida)
 * El endpoint acepta authorization opcional para usuarios autenticados
 * @returns {Promise<Array>} Lista de facultades
 */
export const obtenerFacultades = async () => {
  try {
    const endpoint = `${API_ENDPOINTS.PUBLIC_FACULTADES}`;
    
    
    // Header opcional - si hay token lo incluye
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(endpoint, {
      credentials: 'include',
      method: 'GET',
      headers
    });


    if (response.ok) {
      const data = await response.json();
      
      // El backend devuelve { status: "success", data: [...] }
      const facultades = data.data || [];
      
      return facultades.map(facultad => ({
        id: facultad.id_facultad || facultad.id,
        nombre: facultad.nombre_facultad || facultad.nombre,
        codigo: facultad.codigo_facultad || facultad.codigo,
        descripcion: facultad.descripcion || ''
      }));
    } else {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error al cargar facultades');
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Obtener programas de una facultad específica (sin autenticación requerida)
 * El endpoint acepta authorization opcional para usuarios autenticados
 * @param {string|number} facultadId - ID de la facultad
 * @returns {Promise<Array>} Lista de programas
 */
export const obtenerProgramasPorFacultad = async (facultadId) => {
  try {
    if (!facultadId) {
      return [];
    }

    const endpoint = `${API_ENDPOINTS.PUBLIC_PROGRAMAS_BY_FACULTAD(facultadId)}`;

    
    // Header opcional - si hay token lo incluye
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(endpoint, {
      credentials: 'include',
      method: 'GET',
      headers
    });


    if (response.ok) {
      const data = await response.json();

      // El backend devuelve { status: "success", data: [...] } o { status: "success", data: { programas: [...] } }
      const programasData = Array.isArray(data.data) ? data.data : (data.data?.programas || []);
      const programas = programasData;
      
      
      return programas.map(programa => ({
        codigo: programa.codigo_programa || programa.codigo,
        nombre: programa.nombre_programa || programa.nombre,
        nivel: programa.nivel_formacion || programa.nivel || 'Pregrado',
        modalidad: programa.modalidad || 'Presencial',
        duracion: programa.duracion_semestres || programa.duracion,
        creditos: programa.creditos_totales || programa.creditos,
        facultadId: programa.id_facultad || facultadId
      }));
    } else {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error al cargar programas');
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Obtener todos los programas académicos (sin filtro de facultad)
 * Como el backend no tiene un endpoint directo, obtiene programas de todas las facultades
 * @returns {Promise<Array>} Lista de todos los programas
 */
export const obtenerTodosProgramas = async () => {
  try {
    
    // Primero obtenemos todas las facultades
    const facultades = await obtenerFacultades();
    
    // Luego obtenemos los programas de cada facultad
    const todasLasPromesas = facultades.map(facultad => 
      obtenerProgramasPorFacultad(facultad.id)
    );
    
    const resultadosPorFacultad = await Promise.all(todasLasPromesas);
    
    // Aplanar el array de arrays en un solo array de programas
    const todosProgramas = resultadosPorFacultad.flat();
    
    
    return todosProgramas;
  } catch (error) {
    throw error;
  }
};
