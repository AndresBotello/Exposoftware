import { API_ENDPOINTS } from '../utils/constants';

// ==================== SISTEMA DE CACHÉ Y DEDUPLICACIÓN ====================

// Caché de respuestas con timestamps
const cache = {
  arbolCompleto: null,
  arbolCompletoTime: 0,
  CACHE_DURATION: 30000 // 30 segundos
};

// Promesas pendientes para evitar solicitudes duplicadas
let arbolCompletoPromise = null;

/**
 * Limpiar caché si ha expirado
 */
const limpiarCacheSiExpiro = () => {
  if (cache.arbolCompleto && Date.now() - cache.arbolCompletoTime > cache.CACHE_DURATION) {
    console.log('♻️ Caché del árbol completo expirado');
    cache.arbolCompleto = null;
    cache.arbolCompletoTime = 0;
  }
};

/**
 * Invalidar caché manualmente (después de crear/actualizar/eliminar)
 */
export const invalidarCache = () => {
  console.log('🔄 Invalidando caché del árbol completo...');
  cache.arbolCompleto = null;
  cache.arbolCompletoTime = 0;
  arbolCompletoPromise = null;
};

/**
 * Obtener el árbol completo con deduplicación de solicitudes
 */
const obtenerArbolCompletoConDedup = async () => {
  limpiarCacheSiExpiro();
  
  // Si ya hay una solicitud en progreso, esperar a que termine
  if (arbolCompletoPromise) {
    console.log('⏳ Esperando solicitud previa de árbol completo...');
    return arbolCompletoPromise;
  }
  
  // Si el resultado está en caché, devolverlo
  if (cache.arbolCompleto) {
    console.log('📦 Devolviendo árbol completo desde caché');
    return cache.arbolCompleto;
  }
  
  // Crear nueva solicitud
  arbolCompletoPromise = (async () => {
    try {
      console.log('🔍 Obteniendo árbol completo desde API...');
      const response = await fetch(API_ENDPOINTS.PUBLIC_ARBOL_COMPLETO_INVESTIGACION, {
        credentials: 'include',
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📦 Respuesta RAW árbol completo:', data);
      console.log('📦 Tipo de data:', Array.isArray(data) ? 'Array' : typeof data);
      console.log('📦 data.lineas:', data.lineas);
      
      const arbol = Array.isArray(data) ? data : (data.lineas || data.data || []);
      console.log('📦 Árbol procesado:', arbol);
      console.log('📦 Cantidad de líneas en árbol:', arbol.length);
      
      // Almacenar en caché
      cache.arbolCompleto = arbol;
      cache.arbolCompletoTime = Date.now();
      
      console.log('✅ Árbol completo cacheado');
      return arbol;
    } catch (error) {
      console.error('❌ Error obteniendo árbol completo:', error);
      throw error;
    } finally {
      arbolCompletoPromise = null;
    }
  })();
  
  return arbolCompletoPromise;
};

/**
 * Obtener el token de autenticación
 */
const getAuthToken = () => {
  return localStorage.getItem('auth_token');
};

/**
 * Headers comunes con autenticación
 */
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// ==================== LÍNEAS DE INVESTIGACIÓN ====================

/**
 * Obtener todas las líneas de investigación
 * GET /api/v1/public-investigacion/arbol-completo
 */
export const obtenerLineas = async () => {
  try {
    console.log('🔍 Obteniendo líneas desde:', API_ENDPOINTS.PUBLIC_ARBOL_COMPLETO_INVESTIGACION);
    
    const response = await fetch(API_ENDPOINTS.PUBLIC_ARBOL_COMPLETO_INVESTIGACION, {
      credentials: 'include',
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      // Si es error 500, probablemente no hay datos aún
      if (response.status === 500) {
        console.warn('⚠️ El árbol de investigación aún no tiene datos. Retornando array vacío.');
        return [];
      }
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('📦 Respuesta completa del árbol de investigación:', data);
    
    // Extraer las líneas del árbol completo
    let lineas = [];
    if (Array.isArray(data)) {
      // Si data es un array, son las líneas directamente
      lineas = data.map(linea => ({
        ...linea,
        // Incluir fecha de creación si está disponible
        fechaCreacion: linea.created_at || linea.fecha_creacion || linea.fecha_registro || null
      }));
    } else if (data.lineas && Array.isArray(data.lineas)) {
      // Si viene en formato {lineas: [...]}
      lineas = data.lineas.map(linea => ({
        ...linea,
        // Incluir fecha de creación si está disponible
        fechaCreacion: linea.created_at || linea.fecha_creacion || linea.fecha_registro || null
      }));
    } else if (data.data && Array.isArray(data.data)) {
      // Si viene en formato {data: [...]}
      lineas = data.data.map(linea => ({
        ...linea,
        // Incluir fecha de creación si está disponible
        fechaCreacion: linea.created_at || linea.fecha_creacion || linea.fecha_registro || null
      }));
    }
    
    console.log('✅ Líneas extraídas del árbol:', lineas);
    return lineas;
    
  } catch (error) {
    console.error('❌ Error obteniendo líneas:', error);
    // En lugar de lanzar error, retornar array vacío para permitir crear las primeras líneas
    console.warn('⚠️ Retornando array vacío para permitir crear las primeras líneas');
    return [];
  }
};

/**
 * Obtener línea de investigación por ID
 * GET /api/v1/admin/investigacion/lineas/{lineaId}
 */
export const obtenerLineaPorId = async (lineaId) => {
  try {
    console.log(`🔍 Obteniendo línea ${lineaId} desde:`, API_ENDPOINTS.ADMIN_LINEA_BY_CODE(lineaId));
    
    const response = await fetch(API_ENDPOINTS.ADMIN_LINEA_BY_CODE(lineaId), {
      credentials: 'include',
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`✅ Línea ${lineaId} obtenida:`, data);
    
    return data.data || data;
    
  } catch (error) {
    console.error(`❌ Error obteniendo línea ${lineaId}:`, error);
    throw error;
  }
};

/**
 * Crear una nueva línea de investigación
 * POST /api/v1/admin/investigacion/lineas
 * 
 * @param {Object} lineaData - Datos de la línea
 * @param {string} lineaData.nombre_linea - Nombre de la línea (máximo 15 caracteres - LIMITACIÓN DEL BACKEND)
 * @param {number} lineaData.codigo_linea - Código de la línea (OBLIGATORIO)
 */
export const crearLinea = async (lineaData) => {
  try {
    // Validaciones
    if (!lineaData.nombre_linea || !lineaData.nombre_linea.trim()) {
      throw new Error('El nombre de la línea es obligatorio');
    }

    if (!lineaData.codigo_linea) {
      throw new Error('El código de la línea es obligatorio');
    }

    const nombreTrimmed = lineaData.nombre_linea.trim();
    if (nombreTrimmed.length > 15) {
      throw new Error(`El nombre de la línea debe tener máximo 15 caracteres (limitación del backend). Actual: ${nombreTrimmed.length}`);
    }

    const payload = {
      nombre_linea: nombreTrimmed,
      codigo_linea: typeof lineaData.codigo_linea === 'string' ? parseInt(lineaData.codigo_linea) : lineaData.codigo_linea
    };

    console.log('📤 Creando línea - Payload enviado:', JSON.stringify(payload, null, 2));
    console.log('📤 Headers:', getAuthHeaders());

    const response = await fetch(API_ENDPOINTS.ADMIN_LINEAS_INVESTIGACION, {
      credentials: 'include',
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });

    console.log('📡 Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('📄 Response RAW text:', errorText);
      
      let errorData = {};
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        console.error('⚠️ No se pudo parsear el error como JSON');
        errorData = { message: errorText };
      }
      
      console.error('❌ Error del servidor:', {
        status: response.status,
        statusText: response.statusText,
        errorData: errorData,
        errorDataStringified: JSON.stringify(errorData, null, 2)
      });
      
      // Mostrar detalles específicos del error
      if (errorData.detail) {
        throw new Error(`Error: ${errorData.detail}`);
      } else if (errorData.message) {
        throw new Error(`Error: ${errorData.message}`);
      } else {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
    }

    const resultado = await response.json();
    console.log('✅ Línea creada:', resultado);
    
    return resultado;
    
  } catch (error) {
    console.error('❌ Error creando línea:', error);
    throw error;
  }
};

/**
 * Actualizar una línea de investigación
 * PUT /api/v1/admin/investigacion/lineas/{lineaId}
 */
export const actualizarLinea = async (lineaId, lineaData) => {
  try {
    if (!lineaData.nombre_linea || !lineaData.nombre_linea.trim()) {
      throw new Error('El nombre de la línea es obligatorio');
    }

    const payload = {
      nombre_linea: lineaData.nombre_linea.trim()
    };

    console.log(`📤 Actualizando línea ${lineaId}:`, payload);

    const response = await fetch(API_ENDPOINTS.ADMIN_LINEA_BY_CODE(lineaId), {
      credentials: 'include',
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`);
    }

    const resultado = await response.json();
    console.log(`✅ Línea ${lineaId} actualizada:`, resultado);
    
    return resultado;
    
  } catch (error) {
    console.error('❌ Error actualizando línea:', error);
    throw error;
  }
};

/**
 * Eliminar una línea de investigación
 * DELETE /api/v1/admin/investigacion/lineas/{lineaId}
 */
export const eliminarLinea = async (lineaId) => {
  try {
    console.log(`🗑️ Eliminando línea ${lineaId}`);

    const response = await fetch(API_ENDPOINTS.ADMIN_LINEA_BY_CODE(lineaId), {
      credentials: 'include',
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`);
    }

    console.log('✅ Línea eliminada');
    return true;
    
  } catch (error) {
    console.error('❌ Error eliminando línea:', error);
    throw error;
  }
};

// ==================== SUBLÍNEAS ====================

/**
 * Obtener sublíneas de una línea específica
 * GET /api/v1/public-investigacion/lineas/{lineaId}/sublineas
 */
export const obtenerSublineas = async (lineaId) => {
  try {
    const response = await fetch(API_ENDPOINTS.PUBLIC_SUBLINEAS_BY_LINE(lineaId), {
      credentials: 'include',
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const sublineas = Array.isArray(data) ? data : (data.data || data.sublineas || []);
    return sublineas;
    
  } catch (error) {
    console.error(`Error obteniendo sublíneas de línea ${lineaId}:`, error);
    throw new Error('No se pudieron cargar las sublíneas');
  }
};

/**
 * Obtener sublínea por ID
 * GET /api/v1/public-investigacion/lineas/{lineaId}/sublineas/{sublineaId}
 */
export const obtenerSublineaPorId = async (lineaId, sublineaId) => {
  try {
    const response = await fetch(API_ENDPOINTS.PUBLIC_SUBLINEA_BY_CODE(lineaId, sublineaId), {
      credentials: 'include',
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || data;
    
  } catch (error) {
    console.error(`Error obteniendo sublínea ${sublineaId}:`, error);
    throw error;
  }
};

/**
 * Obtener todas las sublíneas (de todas las líneas)
 */
export const obtenerTodasSublineas = async () => {
  try {
    console.log('🔍 Obteniendo todas las sublíneas...');
    
    // Usar el árbol completo cacheado con deduplicación
    const arbol = await obtenerArbolCompletoConDedup();
    console.log('📦 Árbol recibido para sublíneas:', arbol);
    console.log('📦 Cantidad de líneas en árbol:', arbol.length);
    
    // Extraer todas las sublíneas
    const sublineas = [];
    arbol.forEach((linea, index) => {
      console.log(`📦 Línea ${index}:`, {
        codigo_linea: linea.codigo_linea,
        nombre_linea: linea.nombre_linea,
        tiene_sublineas: !!linea.sublineas,
        cantidad_sublineas: linea.sublineas?.length || 0
      });
      
      if (linea.sublineas && Array.isArray(linea.sublineas)) {
        linea.sublineas.forEach(sublinea => {
          sublineas.push({
            ...sublinea,
            codigo_linea: linea.codigo_linea,
            nombre_linea: linea.nombre_linea,
            // Incluir fecha de creación si está disponible
            fechaCreacion: sublinea.created_at || sublinea.fecha_creacion || sublinea.fecha_registro || null
          });
        });
      }
    });
    
    console.log(`✅ ${sublineas.length} sublíneas extraídas del árbol`);
    console.log('📦 Sublíneas extraídas:', sublineas);
    return sublineas;
    
  } catch (error) {
    console.error('❌ Error obteniendo todas las sublíneas:', error);
    throw new Error('No se pudieron cargar las sublíneas');
  }
};

/**
 * Crear una sublínea
 * POST /api/v1/admin/investigacion/lineas/{lineaId}/sublineas
 */
export const crearSublinea = async (lineaId, sublineaData) => {
  try {
    if (!sublineaData.nombre_sublinea || !sublineaData.nombre_sublinea.trim()) {
      throw new Error('El nombre de la sublínea es obligatorio');
    }

    const payload = {
      nombre_sublinea: sublineaData.nombre_sublinea.trim(),
      codigo_linea: typeof lineaId === 'string' ? parseInt(lineaId) : lineaId
    };

    console.log(`📤 Creando sublínea en línea ${lineaId}:`, payload);

    const response = await fetch(API_ENDPOINTS.ADMIN_SUBLINEAS_BY_LINE(lineaId), {
      credentials: 'include',
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`);
    }

    const resultado = await response.json();
    console.log('✅ Sublínea creada:', resultado);
    
    return resultado;
    
  } catch (error) {
    console.error('❌ Error creando sublínea:', error);
    throw error;
  }
};

/**
 * Actualizar una sublínea
 * PUT /api/v1/admin/investigacion/lineas/{lineaId}/sublineas/{sublineaId}
 */
export const actualizarSublinea = async (lineaId, sublineaId, sublineaData) => {
  try {
    if (!sublineaData.nombre_sublinea || !sublineaData.nombre_sublinea.trim()) {
      throw new Error('El nombre de la sublínea es obligatorio');
    }

    const payload = {
      nombre_sublinea: sublineaData.nombre_sublinea.trim()
    };

    console.log(`📤 Actualizando sublínea ${sublineaId}:`, payload);

    const response = await fetch(API_ENDPOINTS.ADMIN_SUBLINEA_BY_CODE(lineaId, sublineaId), {
      credentials: 'include',
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`);
    }

    const resultado = await response.json();
    console.log(`✅ Sublínea ${sublineaId} actualizada:`, resultado);
    
    return resultado;
    
  } catch (error) {
    console.error('❌ Error actualizando sublínea:', error);
    throw error;
  }
};

/**
 * Eliminar una sublínea
 * DELETE /api/v1/admin/investigacion/lineas/{lineaId}/sublineas/{sublineaId}
 */
export const eliminarSublinea = async (lineaId, sublineaId) => {
  try {
    console.log(`🗑️ Eliminando sublínea ${sublineaId}`);

    const response = await fetch(API_ENDPOINTS.ADMIN_SUBLINEA_BY_CODE(lineaId, sublineaId), {
      credentials: 'include',
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`);
    }

    console.log('✅ Sublínea eliminada');
    return true;
    
  } catch (error) {
    console.error('❌ Error eliminando sublínea:', error);
    throw error;
  }
};

// ==================== ÁREAS TEMÁTICAS ====================

/**
 * Obtener áreas temáticas de una sublínea específica
 * GET /api/v1/public-investigacion/lineas/{lineaId}/sublineas/{sublineaId}/areas-tematicas
 */
export const obtenerAreas = async (lineaId, sublineaId) => {
  try {
    const response = await fetch(API_ENDPOINTS.PUBLIC_AREAS_BY_SUBLINEA(lineaId, sublineaId), {
      credentials: 'include',
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const areas = Array.isArray(data) ? data : (data.data || data.areas || []);
    return areas;
    
  } catch (error) {
    console.error(`Error obteniendo áreas de sublínea ${sublineaId}:`, error);
    throw new Error('No se pudieron cargar las áreas temáticas');
  }
};

/**
 * Obtener área temática por ID
 * GET /api/v1/public-investigacion/lineas/{lineaId}/sublineas/{sublineaId}/areas-tematicas/{areaId}
 */
export const obtenerAreaPorId = async (lineaId, sublineaId, areaId) => {
  try {
    const response = await fetch(API_ENDPOINTS.PUBLIC_AREA_BY_CODE(lineaId, sublineaId, areaId), {
      credentials: 'include',
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || data;
    
  } catch (error) {
    console.error(`Error obteniendo área ${areaId}:`, error);
    throw error;
  }
};

/**
 * Obtener todas las áreas temáticas (de todas las sublíneas)
 */
export const obtenerTodasAreas = async () => {
  try {
    console.log('🔍 Obteniendo todas las áreas temáticas...');
    
    // Usar el árbol completo cacheado con deduplicación
    const arbol = await obtenerArbolCompletoConDedup();
    
    // Extraer todas las áreas
    const areas = [];
    arbol.forEach(linea => {
      if (linea.sublineas && Array.isArray(linea.sublineas)) {
        linea.sublineas.forEach(sublinea => {
          if (sublinea.areas_tematicas && Array.isArray(sublinea.areas_tematicas)) {
            sublinea.areas_tematicas.forEach(area => {
              areas.push({
                ...area,
                codigo_sublinea: sublinea.codigo_sublinea,
                nombre_sublinea: sublinea.nombre_sublinea,
                codigo_linea: linea.codigo_linea,
                nombre_linea: linea.nombre_linea,
                // Incluir fecha de creación si está disponible
                fechaCreacion: area.created_at || area.fecha_creacion || area.fecha_registro || null
              });
            });
          }
        });
      }
    });
    
    console.log(`✅ ${areas.length} áreas extraídas del árbol`);
    return areas;
    
  } catch (error) {
    console.error('❌ Error obteniendo todas las áreas temáticas:', error);
    throw new Error('No se pudieron cargar las áreas temáticas');
  }
};

/**
 * Crear un área temática
 * POST /api/v1/admin/investigacion/lineas/{lineaId}/sublineas/{sublineaId}/areas-tematicas
 */
export const crearArea = async (lineaId, sublineaId, areaData) => {
  try {
    if (!areaData.nombre_area || !areaData.nombre_area.trim()) {
      throw new Error('El nombre del área temática es obligatorio');
    }

    const payload = {
      nombre_area: areaData.nombre_area.trim(),
      codigo_sublinea: typeof sublineaId === 'string' ? parseInt(sublineaId) : sublineaId
    };

    console.log(`📤 Creando área en sublínea ${sublineaId}:`, payload);

    const response = await fetch(API_ENDPOINTS.ADMIN_AREAS_BY_SUBLINEA(lineaId, sublineaId), {
      credentials: 'include',
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`);
    }

    const resultado = await response.json();
    console.log('✅ Área temática creada:', resultado);
    
    return resultado;
    
  } catch (error) {
    console.error('❌ Error creando área temática:', error);
    throw error;
  }
};

/**
 * Actualizar un área temática
 * PUT /api/v1/admin/investigacion/lineas/{lineaId}/sublineas/{sublineaId}/areas-tematicas/{areaId}
 */
export const actualizarArea = async (lineaId, sublineaId, areaId, areaData) => {
  try {
    if (!areaData.nombre_area || !areaData.nombre_area.trim()) {
      throw new Error('El nombre del área temática es obligatorio');
    }

    const payload = {
      nombre_area: areaData.nombre_area.trim()
    };

    console.log(`📤 Actualizando área ${areaId}:`, payload);

    const response = await fetch(API_ENDPOINTS.ADMIN_AREA_BY_CODE(lineaId, sublineaId, areaId), {
      credentials: 'include',
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`);
    }

    const resultado = await response.json();
    console.log(`✅ Área temática ${areaId} actualizada:`, resultado);
    
    return resultado;
    
  } catch (error) {
    console.error('❌ Error actualizando área temática:', error);
    throw error;
  }
};

/**
 * Eliminar un área temática
 * DELETE /api/v1/admin/investigacion/lineas/{lineaId}/sublineas/{sublineaId}/areas-tematicas/{areaId}
 */
export const eliminarArea = async (lineaId, sublineaId, areaId) => {
  try {
    console.log(`🗑️ Eliminando área ${areaId}`);

    const response = await fetch(API_ENDPOINTS.ADMIN_AREA_BY_CODE(lineaId, sublineaId, areaId), {
      credentials: 'include',
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`);
    }

    console.log('✅ Área temática eliminada');
    return true;
    
  } catch (error) {
    console.error('❌ Error eliminando área temática:', error);
    throw error;
  }
};
