import { API_ENDPOINTS } from "../utils/constants";
import * as AuthService from "./AuthService";
import CacheService from "./CacheService";

/**
 * Obtener información del docente autenticado desde /api/v1/docentes/mi-perfil
 * Este endpoint devuelve toda la información del docente autenticado
 * incluyendo su usuario asociado
 * @returns {Promise<Object>} Datos completos del docente autenticado
 */
export const getTeacherProfile = async () => {
  try {

    const url = API_ENDPOINTS.DOCENTE_MI_PERFIL;

    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include'
    });


    if (response.ok) {
      const result = await response.json();
      const docente = result.data || result;

      return docente;
    } else if (response.status === 404) {
      throw new Error("Perfil de docente no encontrado");
    } else if (response.status === 401) {
      throw new Error("No autorizado. Por favor, inicie sesión nuevamente");
    } else {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.message || `Error al cargar perfil: ${response.statusText}`);
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Obtener la carga del docente autenticado (clases que dicta)
 * GET /api/v1/docentes/mi-carga
 * Lista las clases (materia + grupo) que dicta el docente autenticado
 * @returns {Promise<Array>} Lista de clases del docente
 */
export const getMyTeachingLoad = async () => {
  return CacheService.withCache(
    'teaching_load',
    async () => {
      try {
        const headers = AuthService.getAuthHeaders();

        const url = API_ENDPOINTS.DOCENTE_MI_CARGA;

        const response = await fetch(url, {
          method: 'GET',
          headers: headers,
          credentials: 'include'
        });


        if (response.ok) {
          const result = await response.json();
          const carga = result.data || result;
          const clases = Array.isArray(carga) ? carga : (carga?.clases || []);
          return clases;
        } else if (response.status === 404) {
          return [];
        } else {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || errorData.message || 'Error al obtener mi carga');
        }
      } catch (error) {
        throw error;
      }
    },
    10 * 60 * 1000 // 10 minutos de caché
  );
};

/**
 * Obtener las asignaciones del docente autenticado
 * GET /api/v1/docentes/mis-materias
 * Devuelve las asignaciones (docente↔materia↔grupo) activas del docente autenticado
 * @returns {Promise<Array>} Lista de asignaciones del docente
 */
export const getMySubjectAssignments = async () => {
  try {
    const headers = AuthService.getAuthHeaders();

    const url = API_ENDPOINTS.DOCENTE_MIS_MATERIAS;

    const response = await fetch(url, {
      method: 'GET',
      headers: headers,
      credentials: 'include'
    });


    if (response.ok) {
      const result = await response.json();
      const asignaciones = result.data || result;
      return Array.isArray(asignaciones) ? asignaciones : [];
    } else if (response.status === 404) {
      return [];
    } else {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.message || 'Error al obtener mis asignaciones');
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Obtener los grupos del docente autenticado
 * GET /api/v1/docentes/mis-grupos
 * Devuelve los grupos distintos donde el docente autenticado tiene asignación.
 * Derivado de sus DocenteMateria, deduplicado por id_grupo.
 * @returns {Promise<Array>} Lista de grupos del docente
 */
export const getMyGroups = async () => {
  return CacheService.withCache(
    'my_groups',
    async () => {
      try {
        const headers = AuthService.getAuthHeaders();

        const url = API_ENDPOINTS.DOCENTE_MIS_GRUPOS;

        const response = await fetch(url, {
          method: 'GET',
          headers: headers,
          credentials: 'include'
        });


        if (response.ok) {
          const result = await response.json();
          const grupos = result.data || result;
          return Array.isArray(grupos) ? grupos : [];
        } else if (response.status === 404) {
          return [];
        } else {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || errorData.message || 'Error al obtener mis grupos');
        }
      } catch (error) {
        throw error;
      }
    },
    10 * 60 * 1000 // 10 minutos de caché
  );
};

/**
 * Obtener informacion detallada del docente por id_docente
 * GET /api/v1/teachers/{teacher_id}/profile
 * @param {string} teacherId - ID del docente
 * @returns {Promise<Object>} Perfil detallado del docente
 */
export const getTeacherProfileById = async (teacherId) => {
  try {
    const headers = AuthService.getAuthHeaders();
    
    const url = API_ENDPOINTS.TEACHER_PROFILE_BY_ID(teacherId);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: headers
    });

    if (response.ok) {
      const result = await response.json();
      const perfil = result.data || result;
      return perfil;
    } else if (response.status === 404) {
      throw new Error("Docente no encontrado");
    } else {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.message || 'Error al obtener perfil');
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Obtener perfil completo del docente desde admin endpoint
 * GET /api/v1/admin/profesores/{teacher_id}
 * @param {string} teacherId - ID del docente (puede ser id_usuario de Firebase)
 * @returns {Promise<Object>} Perfil completo del docente con id_docente
 */
export const getTeacherProfileByAdmin = async (teacherId) => {
  try {
    const headers = AuthService.getAuthHeaders();
    
    const url = API_ENDPOINTS.ADMIN_DOCENTE_BY_ID(teacherId);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: headers
    });


    if (response.ok) {
      const result = await response.json();
      
      const perfil = result.data || result;
      
      return perfil;
    } else if (response.status === 404) {
      throw new Error("Docente no encontrado en el sistema");
    } else if (response.status === 401) {
      throw new Error("No autorizado para acceder a esta información");
    } else {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.message || 'Error al obtener perfil del docente');
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Obtener todas las materias asignadas al docente
 * ✅ ESTRATEGIA MÚLTIPLE (en orden de preferencia):
 * 1. Intenta obtener grupos del docente y extraer materias
 * 2. Si falla (404), extrae materias únicas de los proyectos proporcionados
 * @param {string} teacherId - ID del docente (id_docente)
 * @param {Array} proyectos - Array de proyectos del docente (opcional, para estrategia 2)
 * @returns {Promise<Array>} Lista de materias únicas del docente
 */
export const getTeacherSubjects = async (teacherId, proyectos = null) => {
  try {
    const headers = AuthService.getAuthHeaders();
    
    // ESTRATEGIA 1: Intentar obtener grupos del docente
    let url = API_ENDPOINTS.GRUPOS_BY_TEACHER(teacherId);
    
    let response = await fetch(url, {
      method: 'GET',
      headers: headers
    });

    // Si falla con 403, intentar endpoint admin
    if (response.status === 403) {
      url = API_ENDPOINTS.ADMIN_GRUPOS_BY_TEACHER(teacherId);
      
      response = await fetch(url, {
        method: 'GET',
        headers: headers
      });
    }


    // Si obtuvimos grupos exitosamente, extraer materias
    if (response.ok) {
      const result = await response.json();
      
      let grupos = [];
      if (result.data && Array.isArray(result.data)) {
        grupos = result.data;
      } else if (Array.isArray(result)) {
        grupos = result;
      }
      
      if (grupos.length > 0) {
        
        // Extraer materias únicas de los grupos
        const materiasMap = new Map();
        grupos.forEach(grupo => {
          const codigoMateria = grupo.codigo_materia || grupo.materia_codigo;
          const nombreMateria = grupo.nombre_materia || grupo.materia_nombre;
          
          if (codigoMateria && !materiasMap.has(codigoMateria)) {
            materiasMap.set(codigoMateria, {
              codigo_materia: codigoMateria,
              codigo: codigoMateria,
              nombre_materia: nombreMateria || codigoMateria,
              nombre: nombreMateria || codigoMateria
            });
          }
        });
        
        const materias = Array.from(materiasMap.values());
        return materias;
      }
    }
    
    
    if (!proyectos || !Array.isArray(proyectos) || proyectos.length === 0) {
      return [];
    }
    
    
    // Extraer materias únicas de los proyectos
    const materiasMap = new Map();
    proyectos.forEach(proyecto => {
      const codigoMateria = proyecto.codigo_materia;
      const nombreMateria = proyecto.nombre_materia || proyecto.materia || codigoMateria;
      
      if (codigoMateria && !materiasMap.has(codigoMateria)) {
        materiasMap.set(codigoMateria, {
          codigo_materia: codigoMateria,
          codigo: codigoMateria,
          nombre_materia: nombreMateria,
          nombre: nombreMateria
        });
      }
    });
    
    const materias = Array.from(materiasMap.values());
    
    return materias;
    
  } catch (error) {
    return [];
  }
};

/**
 * Obtener grupos de una materia específica del docente
 * ✅ ESTRATEGIA MÚLTIPLE (en orden de preferencia):
 * 1. Intenta obtener grupos del docente y filtrar por materia
 * 2. Si falla (404), extrae grupos de los proyectos proporcionados filtrados por materia
 * @param {string} teacherId - ID del docente
 * @param {string} subjectCode - Código de la materia
 * @param {Array} proyectos - Array de proyectos del docente (opcional, para estrategia 2)
 * @returns {Promise<Array>} Lista de grupos de la materia del docente
 */
export const getTeacherSubjectGroups = async (teacherId, subjectCode, proyectos = null) => {
  try {
    const headers = AuthService.getAuthHeaders();
    
    // ESTRATEGIA 1: Intentar obtener grupos del endpoint
    let url = API_ENDPOINTS.GRUPOS_BY_TEACHER(teacherId);
    
    let response = await fetch(url, {
      method: 'GET',
      headers: headers
    });

    // Si falla con 403, intentar endpoint admin
    if (response.status === 403) {
      url = API_ENDPOINTS.ADMIN_GRUPOS_BY_TEACHER(teacherId);
      
      response = await fetch(url, {
        method: 'GET',
        headers: headers
      });
    }


    // Si obtuvimos grupos exitosamente, filtrar por materia
    if (response.ok) {
      const result = await response.json();
      
      let grupos = [];
      if (result.data && Array.isArray(result.data)) {
        grupos = result.data;
      } else if (Array.isArray(result)) {
        grupos = result;
      }
      
      if (grupos.length > 0) {
        
        // Filtrar grupos por código de materia
        const gruposFiltrados = grupos.filter(g => {
          const codigoMateria = g.codigo_materia || g.materia_codigo;
          return codigoMateria === subjectCode;
        });
        
        
        // Formatear respuesta
        return gruposFiltrados.map(g => ({
          id_grupo: g.codigo_grupo || g.id_grupo,
          id: g.codigo_grupo || g.id_grupo,
          codigo_grupo: g.codigo_grupo,
          nombre_grupo: g.nombre_grupo || `Grupo ${g.codigo_grupo}`,
          nombre: g.nombre_grupo || `Grupo ${g.codigo_grupo}`,
          codigo_materia: g.codigo_materia || g.materia_codigo,
          nombre_materia: g.nombre_materia || g.materia_nombre,
          activo: g.activo
        }));
      }
    }
    

    
    if (!proyectos || !Array.isArray(proyectos) || proyectos.length === 0) {
      return [];
    }
    
    
    // Filtrar proyectos por código de materia
    const proyectosFiltrados = proyectos.filter(p => p.codigo_materia === subjectCode);
    
    if (proyectosFiltrados.length === 0) {
      return [];
    }
    
    // Extraer grupos únicos de los proyectos
    const gruposMap = new Map();
    proyectosFiltrados.forEach(proyecto => {
      const idGrupo = proyecto.id_grupo;
      const nombreGrupo = proyecto.nombre_grupo || proyecto.grupo || `Grupo ${idGrupo}`;
      
      if (idGrupo && !gruposMap.has(idGrupo)) {
        gruposMap.set(idGrupo, {
          id_grupo: idGrupo,
          id: idGrupo,
          codigo_grupo: idGrupo,
          nombre_grupo: nombreGrupo,
          nombre: nombreGrupo,
          codigo_materia: subjectCode,
          nombre_materia: proyecto.nombre_materia || proyecto.materia,
          activo: true
        });
      }
    });
    
    const grupos = Array.from(gruposMap.values());
    
    return grupos;
    
  } catch (error) {
    return [];
  }
};

/**
 * Obtener todos los proyectos del docente
 * GET /api/v1/docentes/{id_docente}/proyectos
 * @param {string} teacherId - ID del docente
 * @returns {Promise<Array>} Lista de proyectos del docente
 */
export const getTeacherProjects = async (teacherId) => {
  try {
    const headers = AuthService.getAuthHeaders();
    
    const url = API_ENDPOINTS.TEACHER_PROYECTOS(teacherId);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: headers
    });


    if (response.ok) {
      const result = await response.json();
      const proyectos = result.data || result;
      return proyectos;
    } else if (response.status === 404) {
      return [];
    } else {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.message || 'Error al obtener proyectos');
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Obtener mis proyectos (del docente autenticado)
 * GET /api/v1/proyectos/mis-proyectos
 * @returns {Promise<Array>} Lista de proyectos asignados al docente
 */
export const getMyProjects = async () => {
  return CacheService.withCache(
    'my_projects',
    async () => {
      try {
        const headers = AuthService.getAuthHeaders();

        const url = `${API_ENDPOINTS.MIS_PROYECTOS}?page=1&limit=100`;

        const response = await fetch(url, {
          method: 'GET',
          headers: headers,
          credentials: 'include'
        });


        if (response.ok) {
          const result = await response.json();
          const proyectos = result.data || result;
          return Array.isArray(proyectos) ? proyectos : [];
        } else if (response.status === 404) {
          return [];
        } else {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || errorData.message || 'Error al obtener mis proyectos');
        }
      } catch (error) {
        throw error;
      }
    },
    10 * 60 * 1000 // 10 minutos de caché
  );
};

/**
 * Obtener proyectos de un evento específico
 * GET /api/v1/proyectos/evento/{id_evento}
 * @param {string} eventoId - ID del evento
 * @returns {Promise<Array>} Lista de proyectos del evento
 */
export const getProyectosByEvento = async (eventoId) => {
  try {
    const headers = AuthService.getAuthHeaders();

    const url = `${API_ENDPOINTS.PROYECTOS_BY_EVENTO(eventoId)}?page=1&limit=100`;

    const response = await fetch(url, {
      method: 'GET',
      headers: headers,
      credentials: 'include'
    });


    if (response.ok) {
      const result = await response.json();
      const proyectos = result.data || result;
      return Array.isArray(proyectos) ? proyectos : [];
    } else if (response.status === 404) {
      return [];
    } else {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.message || 'Error al obtener proyectos del evento');
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Actualizar estado de un proyecto (aprobar/rechazar)
 * PATCH /api/v1/proyectos/{id_proyecto}
 * @param {string} proyectId - ID del proyecto
 * @param {Object} datosActualizacion - Datos a actualizar (ej: { estado: 'aprobado' })
 * @returns {Promise<Object>} Proyecto actualizado
 */
export const updateProyectoStatus = async (proyectId, datosActualizacion) => {
  try {
    const headers = AuthService.getAuthHeaders();

    const url = `${API_ENDPOINTS.PROYECTO_BY_ID(proyectId)}/estado`;

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(datosActualizacion),
      credentials: 'include'
    });


    if (response.ok) {
      const result = await response.json();
      const proyecto = result.data || result;
      return proyecto;
    } else {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.message || 'Error al actualizar proyecto');
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Actualizar proyecto (título, estado, área, archivo)
 * PATCH /api/v1/proyectos/{id_proyecto}
 * @param {string} proyectId - ID del proyecto
 * @param {Object} datosActualizacion - Datos a actualizar
 * @param {File} archivo - Archivo PDF opcional
 * @returns {Promise<Object>} Proyecto actualizado
 */
export const actualizarProyectoCompleto = async (proyectId, datosActualizacion, archivo = null) => {
  try {
    const headers = AuthService.getAuthHeaders();

    const url = `${API_ENDPOINTS.PROYECTO_BY_ID(proyectId)}`;

    const formData = new FormData();
    formData.append('proyecto_data', JSON.stringify(datosActualizacion));

    if (archivo) {
      formData.append('archivo', archivo);
    }

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        ...headers,
        // NO incluir Content-Type para multipart/form-data, el navegador lo setea automáticamente
      },
      body: formData,
      credentials: 'include'
    });

    if (response.ok) {
      const result = await response.json();
      const proyecto = result.data || result;
      return proyecto;
    } else {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.message || 'Error al actualizar proyecto');
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Calificar un proyecto como asistente (voto popular)
 * POST /api/v1/proyectos/{id_proyecto}/calificar_asistente
 * @param {string} proyectId - ID del proyecto
 * @param {number} calificacion - Calificación del proyecto (rango 0.0 - 5.0)
 * @param {string} comentario - Comentario opcional sobre el proyecto
 * @returns {Promise<Object>} Respuesta del servidor
 *
 * Nota:
 * - Solo usuarios autenticados que asistieron al evento
 * - Los integrantes del proyecto NO pueden auto-calificarse
 * - Un usuario califica una vez por proyecto (actualiza si vuelve a llamar)
 * - Pesos: Administrativo/Docente: 3.0 | Egresado: 1.5 | Estudiante/Invitado: 1.0
 */
export const calificarProyecto = async (proyectId, calificacion, comentario = '') => {
  try {
    const headers = AuthService.getAuthHeaders();

    const url = API_ENDPOINTS.PROYECTO_CALIFICACION(proyectId);

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        calificacion: parseFloat(calificacion),
        comentario: comentario || ''
      }),
      credentials: 'include'
    });


    if (response.ok) {
      const result = await response.json();
      const data = result.data || result;
      return data;
    } else {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.message || 'Error al calificar proyecto');
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Obtener detalle de un proyecto especifico del docente
 * GET /api/v1/teachers/{teacher_id}/projects/{project_id}
 * @param {string} teacherId - ID del docente
 * @param {string} projectId - ID del proyecto
 * @returns {Promise<Object>} Detalle completo del proyecto
 */
export const getTeacherProjectDetail = async (teacherId, projectId) => {
  try {
    const headers = AuthService.getAuthHeaders();
    
    const url = API_ENDPOINTS.TEACHER_PROYECTO_BY_ID(teacherId, projectId);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: headers
    });

    if (response.ok) {
      const result = await response.json();
      const proyecto = result.data || result;
      return proyecto;
    } else if (response.status === 404) {
      throw new Error("Proyecto no encontrado");
    } else {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.message || 'Error al obtener detalle del proyecto');
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Obtener todos los proyectos (endpoint general)
 * GET /api/v1/teachers/projects
 * @returns {Promise<Array>} Lista de todos los proyectos
 */
export const getAllProjects = async () => {
  try {
    const headers = AuthService.getAuthHeaders();
    
    const url = API_ENDPOINTS.TEACHER_PROYECTOS;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: headers
    });

    if (response.ok) {
      const result = await response.json();
      const proyectos = result.data || result;
      return proyectos;
    } else if (response.status === 404) {
      return [];
    } else {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.message || 'Error al obtener proyectos');
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Procesar datos del docente desde el backend
 * Convierte los datos anidados del backend al formato que espera el frontend
 * @param {Object} datosCrudos - Datos directos del backend
 * @returns {Object} Datos procesados para el formulario
 */
export const procesarDatosDocente = (datosCrudos) => {
  if (!datosCrudos) {
    return {};
  }


  // Extraer objetos anidados
  const docente = datosCrudos.docente || datosCrudos;
  const usuario = datosCrudos.usuario || {};
  
  // Combinar nombres
  const nombres = [usuario.primer_nombre, usuario.segundo_nombre]
    .filter(Boolean)
    .join(' ');
  
  // Combinar apellidos
  const apellidos = [usuario.primer_apellido, usuario.segundo_apellido]
    .filter(Boolean)
    .join(' ');

  // Mapear sexo del backend al formato del formulario
  // Backend: "Mujer"/"Hombre" -> Formulario: "Femenino"/"Masculino"
  let sexoMapeado = usuario.sexo || "";
  if (sexoMapeado === "Mujer") sexoMapeado = "Femenino";
  if (sexoMapeado === "Hombre") sexoMapeado = "Masculino";

  // Formatear fecha de nacimiento a YYYY-MM-DD
  let fechaNacimiento = usuario.fecha_nacimiento || "";
  if (fechaNacimiento && fechaNacimiento.includes('T')) {
    // Si viene en formato ISO (2002-05-22T00:00:00), extraer solo la fecha
    fechaNacimiento = fechaNacimiento.split('T')[0];
  }

  const datosProcesados = {
    // Datos del docente
    id_docente: docente.id_docente || "",
    id_usuario: docente.id_usuario || usuario.id_usuario || "",
    categoria_docente: docente.categoria_docente || "Interno",
    codigo_programa: docente.codigo_programa || "",
    
    // Datos personales del usuario
    tipo_documento: usuario.tipo_documento || "CC",
    identificacion: usuario.identificacion || "",
    nombres: nombres || "",
    apellidos: apellidos || "",
    sexo: sexoMapeado,
    identidad_sexual: usuario.identidad_sexual || "",
    fecha_nacimiento: fechaNacimiento,
    telefono: usuario.telefono || "",
    
    // Ubicación - NOTA: Backend usa 'departamento' y 'municipio'
    pais: usuario.pais_residencia || "CO",
    nacionalidad: usuario.nacionalidad || "CO",
    departamento_residencia: usuario.departamento || "",  // ✅ Mapeo correcto
    ciudad_residencia: usuario.municipio || "",           // ✅ Mapeo correcto
    direccion_residencia: usuario.direccion_residencia || "",
    departamento: usuario.departamento || "",
    municipio: usuario.municipio || "",
    ciudad: usuario.ciudad_residencia || usuario.municipio || "",
    
    // Institucional
    correo: usuario.correo || "",
    anio_ingreso: new Date().getFullYear(),
    periodo: 1,
    rol: usuario.rol || "Docente"
  };

  return datosProcesados;
};

/**
 * Actualizar perfil del docente
 * PUT /api/v1/teachers/{teacher_id}/profile
 * @param {string} identificacion - Identificacion del docente
 * @param {Object} datosActualizados - Datos a actualizar
 * @returns {Promise<Object>} Datos actualizados
 */
export const updateTeacherProfile = async (identificacion, datosActualizados) => {
  try {
    const headers = AuthService.getAuthHeaders();

    const nombres = datosActualizados.nombres?.split(' ') || [];
    const apellidos = datosActualizados.apellidos?.split(' ') || [];

    const payload = {
      tipo_documento: datosActualizados.tipo_documento,
      identificacion: identificacion,
      primer_nombre: nombres[0] || "",
      segundo_nombre: nombres.slice(1).join(' ') || "",
      primer_apellido: apellidos[0] || "",
      segundo_apellido: apellidos.slice(1).join(' ') || "",
      sexo: datosActualizados.genero,
      identidad_sexual: datosActualizados.identidad_sexual || "",
      fecha_nacimiento: datosActualizados.fecha_nacimiento || "",
      nacionalidad: datosActualizados.nacionalidad || "CO",
      pais_residencia: datosActualizados.pais || "CO",
      departamento_residencia: datosActualizados.departamento_residencia || "",
      ciudad_residencia: datosActualizados.ciudad_residencia || "",
      direccion_residencia: datosActualizados.direccion_residencia || "",
      telefono: datosActualizados.telefono,
      correo: datosActualizados.correo,
      rol: "Docente",
      activo: true,
      categoria_docente: datosActualizados.categoria_docente,
      codigo_programa: datosActualizados.codigo_programa || ""
    };


    const response = await fetch(
      API_ENDPOINTS.TEACHER_PROFILE_BY_IDENTIFICATION(identificacion),
      {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(payload)
      }
    );

    if (response.ok) {
      const data = await response.json();
      return { success: true, data };
    } else {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Error al actualizar perfil (${response.status}): ${errorData.message || errorData.detail || 'Error desconocido'}`);
    }
  } catch (error) {
    throw error;
  }
};

// Cache para información de usuarios (estudiantes)
const userInfoCache = new Map();

/**
 * Obtener información de un usuario por ID
 * Busca en el endpoint de búsqueda de usuarios
 * @param {string} userId - ID del usuario
 * @returns {Promise<Object>} Información del usuario con p_nombre, p_apellido, etc.
 */
export const getUserInfo = async (userId) => {
  if (!userId) return null;

  // Retornar del cache si existe
  if (userInfoCache.has(userId)) {
    return userInfoCache.get(userId);
  }

  try {

    const response = await fetch(`/api/v1/usuarios/buscar?q=${userId}`, {
      method: 'GET',
      credentials: 'include'
    });

    let usuarios = [];

    if (response.ok) {
      const result = await response.json();
      usuarios = result.data || result.results || (Array.isArray(result) ? result : []);

      // Buscar el usuario exacto por ID
      const usuario = usuarios.find(u => u.id === userId || u.id_usuario === userId);

      if (usuario) {
        userInfoCache.set(userId, usuario);
        return usuario;
      } else {
        console.warn(`⚠️ Usuario ${userId} no encontrado en resultados. IDs encontrados:`, usuarios.map(u => u.id || u.id_usuario));
      }
    } else {
      const errorData = await response.json().catch(() => ({}));
    }

    return null;
  } catch (error) {
    return null;
  }
};

/**
 * Obtener múltiples usuarios en paralelo con caché
 * @param {string[]} userIds - Array de IDs de usuarios
 * @returns {Promise<Object[]>} Array de información de usuarios
 */
export const getUsersInfo = async (userIds) => {
  const promises = userIds.map(userId => getUserInfo(userId));
  return Promise.all(promises);
};

/**
 * Obtener calificación popular de un proyecto
 * GET /api/v1/proyectos/{id}/calificacion-popular
 * Devuelve promedio ponderado, total de votos y desglose por rol
 * @param {string} projectId - ID del proyecto
 * @returns {Promise<Object>} Datos de calificación popular
 */
export const obtenerCalificacionPopular = async (projectId) => {
  try {
    if (!projectId) {
      throw new Error("El ID del proyecto es obligatorio");
    }

    const headers = AuthService.getAuthHeaders();
    const url = `${API_ENDPOINTS.PROYECTOS}/${projectId}/calificacion-popular`;

    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: headers
    });

    if (response.ok) {
      const data = await response.json();
      const calificacionPopular = data.data || data;
      return calificacionPopular;
    } else if (response.status === 404) {
      return {
        promedio_ponderado: 0,
        total_votos: 0,
        desglose_por_rol: {}
      };
    } else {
      throw new Error(`Error al obtener calificación popular: ${response.statusText}`);
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Calificar un proyecto como asistente (voto popular)
 * POST /api/v1/proyectos/{id_proyecto}/calificar-asistente
 * @param {string} proyectId - ID del proyecto
 * @param {number} calificacion - Calificación del proyecto (0-5)
 * @param {string} comentario - Comentario opcional
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const calificarProyectoAsistente = async (proyectId, calificacion, comentario = '') => {
  try {
    const headers = AuthService.getAuthHeaders();

    const url = `${API_ENDPOINTS.PROYECTOS}/${proyectId}/calificar-asistente`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        calificacion: parseFloat(calificacion),
        comentario: comentario || ''
      }),
      credentials: 'include'
    });

    if (response.ok) {
      const result = await response.json();
      const data = result.data || result;
      return data;
    } else {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.message || 'Error al calificar proyecto');
    }
  } catch (error) {
    console.error(`❌ Error calificando proyecto:`, error);
    throw error;
  }
};
