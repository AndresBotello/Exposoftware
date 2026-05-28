import { API_ENDPOINTS } from '../utils/constants';

/**
 * Obtener el token de autenticación
 */
const getAuthToken = () => localStorage.getItem('auth_token');

/**
 * Headers comunes con autenticación
 */
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

/**
 * Headers para endpoints públicos (con autenticación)
 * Aunque se llamen "públicos", requieren token JWT válido
 */
const getPublicHeaders = () => {
  const token = getAuthToken();
  if (!token) {
  }
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

/**
 * Servicio para la gestión de proyectos
 */
class RegisterProjectService {
  /**
   * Obtener lista de estudiantes
   * ⚠️ NO HAY ENDPOINT PÚBLICO - Los estudiantes NO se pueden listar sin permisos de admin
   * Solución: El estudiante autenticado se agrega automáticamente al proyecto
   */
  static async obtenerEstudiantes() {
    try {
      
      // Retornar array vacío - el componente manejará esto
      return [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Obtener lista de docentes/profesores
   * ✅ Endpoint: /api/v1/admin/profesores (requiere autenticación)
   */
  static async obtenerDocentes() {
    try {
      
      // 🔥 Intentar primero endpoint público (para estudiantes)
      let response = await fetch(API_ENDPOINTS.ADMIN_DOCENTES, {
        method: 'GET',
        credentials: 'include',
        headers: getAuthHeaders(),
      });

      // Si falla con 403 o 405 (sin permisos / método no permitido), intentar endpoint de admin
      if (response.status === 403 || response.status === 405) {
        response = await fetch(API_ENDPOINTS.ADMIN_DOCENTES, {
          method: 'GET',
          credentials: 'include',
          headers: getAuthHeaders(),
        });
      }

      if (!response.ok) {
        return [];
      }

      const result = await response.json();

      // Verificar estructura de respuesta paginada
      let profesores = [];
      if (result.data && Array.isArray(result.data)) {
        profesores = result.data;
      } else if (Array.isArray(result)) {
        profesores = result;
      } else {
        return [];
      }


      return profesores.map(prof => ({
        id: prof.id_docente || prof.id,
        nombre: prof.nombre_completo || `${prof.primer_nombre || ''} ${prof.primer_apellido || ''}`.trim(),
        correo: prof.correo,
      }));
    } catch (error) {
      return [];
    }
  }

  /**
   * Obtener líneas de investigación con sublíneas y áreas (árbol completo)
   * ✅ Endpoint principal: /api/v1/public-investigacion/arbol-completo
   * 🔄 Fallback: /api/v1/public-investigacion/lineas/{line_code} para cada línea
   */
  static async obtenerArbolInvestigacion() {
    try {
      const token = getAuthToken();

      // INTENTO 1: Usar el endpoint del árbol completo
      const response = await fetch(API_ENDPOINTS.PUBLIC_ARBOL_COMPLETO_INVESTIGACION, {
        method: 'GET',
        headers: getPublicHeaders(),
      });


      // Si funciona, retornar el árbol completo
      if (response.ok) {
        const data = await response.json();

        // Manejar diferentes formatos de respuesta
        let arbol = data;
        
        if (!Array.isArray(data)) {
          
          // Intentar extraer el array de diferentes estructuras posibles
          if (data.data && Array.isArray(data.data)) {
            arbol = data.data;
          } else if (data.lineas && Array.isArray(data.lineas)) {
            arbol = data.lineas;
          } else if (data.status === 'success' && data.data) {
            // Formato {status: "success", data: [...]}
            arbol = Array.isArray(data.data) ? data.data : (data.data.lineas || []);
          } else {
            return await this.obtenerArbolInvestigacionAlternativo();
          }
        }

        if (!Array.isArray(arbol) || arbol.length === 0) {
          return await this.obtenerArbolInvestigacionAlternativo();
        }

        return arbol;
      }

      // Si falla por permisos o error del servidor, intentar método alternativo
      if (response.status === 401 || response.status === 403 || response.status === 500) {
        return await this.obtenerArbolInvestigacionAlternativo();
      }

      throw new Error(`Error ${response.status}: ${response.statusText}`);
      
    } catch (error) {
      
      // Último intento: método alternativo
      try {
        return await this.obtenerArbolInvestigacionAlternativo();
      } catch (fallbackError) {
        throw new Error('No se pudo cargar el árbol de investigación. Contacta al administrador.');
      }
    }
  }

  /**
   * Método alternativo para obtener el árbol de investigación
   * Usa endpoints individuales para construir el árbol manualmente
   */
  static async obtenerArbolInvestigacionAlternativo() {
    try {
      
      // Primero, obtener todas las líneas de investigación
      const lineasResponse = await fetch(API_ENDPOINTS.PUBLIC_LINEAS_INVESTIGACION, {
        method: 'GET',
        headers: getPublicHeaders(),
      });

      if (!lineasResponse.ok) {
        throw new Error(`Error obteniendo líneas: ${lineasResponse.status}`);
      }

      const lineasData = await lineasResponse.json();
      const lineas = Array.isArray(lineasData) ? lineasData : (lineasData.data || lineasData.lineas || []);
      

      // Para cada línea, obtener su jerarquía completa
      const arbolCompleto = [];
      
      for (const linea of lineas) {
        try {
          const codigoLinea = linea.codigo_linea || linea.codigo;
          
          const jerarquiaResponse = await fetch(
            API_ENDPOINTS.PUBLIC_LINEA_BY_CODE(codigoLinea),
            {
              method: 'GET',
              headers: getPublicHeaders(),
            }
          );

          if (jerarquiaResponse.ok) {
            const jerarquia = await jerarquiaResponse.json();
            arbolCompleto.push(jerarquia);
          } else {
            // Si falla, agregar línea sin sublíneas
            arbolCompleto.push({
              codigo_linea: codigoLinea,
              nombre_linea: linea.nombre_linea || linea.nombre,
              sublineas: []
            });
          }
        } catch (lineaError) {
          // Continuar con la siguiente línea
        }
      }

      return arbolCompleto;
      
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener líneas de investigación
   * ✅ Extraído del árbol completo
   */
  static async obtenerLineasInvestigacion() {
    try {
      const arbol = await this.obtenerArbolInvestigacion();

      return arbol.map(linea => ({
        codigo: linea.codigo_linea,
        nombre: linea.nombre_linea,
        sublineas: linea.sublineas || [],
      }));
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener sublíneas de investigación
   * ✅ Extraído del árbol completo con referencia a línea padre
   */
  static async obtenerSublineasInvestigacion() {
    try {
      const arbol = await this.obtenerArbolInvestigacion();

      const sublineas = [];
      arbol.forEach(linea => {
        if (Array.isArray(linea.sublineas)) {
          linea.sublineas.forEach(sublinea => {
            sublineas.push({
              codigo: sublinea.codigo_sublinea,
              nombre: sublinea.nombre_sublinea,
              codigoLinea: linea.codigo_linea,
              nombreLinea: linea.nombre_linea, // Para mostrar jerarquía
              areas: sublinea.areas_tematicas || [],
            });
          });
        }
      });

      return sublineas;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener áreas temáticas
   * ✅ Extraído del árbol completo con referencia a sublínea padre
   */
  static async obtenerAreasTematicas() {
    try {
      const arbol = await this.obtenerArbolInvestigacion();

      const areas = [];
      arbol.forEach(linea => {
        linea.sublineas?.forEach(sublinea => {
          sublinea.areas_tematicas?.forEach(area => {
            areas.push({
              codigo: area.codigo_area,
              nombre: area.nombre_area,
              codigoSublinea: sublinea.codigo_sublinea,
              nombreSublinea: sublinea.nombre_sublinea, // Para mostrar jerarquía
              nombreLinea: linea.nombre_linea,
            });
          });
        });
      });

      return areas;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Crear un nuevo proyecto
   * ✅ Endpoint: /api/v1/api/v1/proyectos/
   * Nota: Sin calificación (la asigna el profesor después)
   * @param {string} idUsuarioCreador - ID del usuario que crea el proyecto (será marcado como líder)
   */
  static async crearProyecto(proyectoData, archivoPDF, archivoExtra = null, idUsuarioCreador = null) {
    try {
      // Validaciones previas
      const required = [
        'titulo_proyecto',
        'id_docente',
        'id_grupo',
        'codigo_area',
        'codigo_linea',
        'codigo_sublinea',
        'tipo_actividad',
      ];

      for (const field of required) {
        if (!proyectoData[field]) {
          throw new Error(`El campo ${field.replace('_', ' ')} es obligatorio`);
        }
      }

      // Validar archivos según tipo de actividad
      if (!archivoPDF) {
        throw new Error('Debe adjuntar el archivo PDF del proyecto');
      }


      // Preparar FormData para envío multipart
      const formData = new FormData();

      // Preparar payload del proyecto según el NUEVO FORMATO del backend
      const payload = {
        // ✅ NUEVO: id_docente como objeto con uid_docente y nombre
        id_docente: {
          uid_docente: proyectoData.id_docente,
          nombre: proyectoData.nombre_docente || "" // Necesitamos el nombre del docente
        },
        // ✅ NUEVO: integrantes (no id_estudiantes) como array de objetos con id_usuario, nombre y es_lider
        integrantes: proyectoData.id_estudiantes.map((id, index) => ({
          id_usuario: id,
          nombre: proyectoData.nombres_estudiantes?.[index] || "",
          es_lider: id === idUsuarioCreador // Marcar como líder si es el creador
        })),
        // ✅ id_docente_materia identifica la clase (docente + materia + grupo)
        id_docente_materia: proyectoData.id_grupo.toString(),
        codigo_area: parseInt(proyectoData.codigo_area),
        id_evento: proyectoData.id_evento || '1jAZE5TKXakRd9ymq1Xu',
        codigo_materia: proyectoData.codigo_materia,
        codigo_linea: parseInt(proyectoData.codigo_linea),
        codigo_sublinea: parseInt(proyectoData.codigo_sublinea),
        titulo_proyecto: proyectoData.titulo_proyecto.trim(),
        id_tipo_actividad: parseInt(proyectoData.tipo_actividad),
        // Campos opcionales (el backend los puede llenar)
        estado_calificacion: "Pendiente",
        // No incluir calificacion - la asigna el profesor después
      };

      // Agregar proyecto_data como JSON string
      formData.append('proyecto_data', JSON.stringify(payload));

      // Agregar archivos
      formData.append('archivo', archivoPDF);
      if (archivoExtra) {
        formData.append('archivo_extra', archivoExtra);
      }

      const response = await fetch(API_ENDPOINTS.PROYECTOS, {
        method: 'POST',
        headers: {
          // NO incluir Content-Type, lo maneja FormData automáticamente
        },
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        console.error('❌ Error completo (JSON):', JSON.stringify(err, null, 2));
        
        // Extraer mensaje de error detallado
        let errorMessage = 'Error desconocido';
        if (err.detail) {
          if (typeof err.detail === 'string') {
            errorMessage = err.detail;
          } else if (Array.isArray(err.detail)) {
            errorMessage = err.detail.map(e => e.msg || e.message || JSON.stringify(e)).join(', ');
          } else {
            errorMessage = JSON.stringify(err.detail);
          }
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        
        // 🔥 Si el error es "docente no existe", dar mensaje más claro
        if (errorMessage.includes('No existe ningún docente')) {
          throw new Error(
            `❌ El docente asignado al grupo no existe en el sistema.\n\n` +
            `Esto es un problema del backend. Contacta al administrador.\n\n` +
            `ID del docente: ${proyectoData.id_docente}\n` +
            `Grupo: ${proyectoData.id_grupo}`
          );
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();

      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener todas las materias disponibles
   * Intenta el endpoint admin; retorna [] si no tiene permisos
   */
  static async obtenerMaterias() {
    try {
      const response = await fetch(API_ENDPOINTS.ADMIN_MATERIAS_LIST, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        console.warn(`⚠️ No se pudieron cargar las materias (${response.status})`);
        return [];
      }

      const data = await response.json();
      let materias = [];

      if (Array.isArray(data)) {
        materias = data;
      } else if (data.data && Array.isArray(data.data)) {
        materias = data.data;
      } else if (data.materias && Array.isArray(data.materias)) {
        materias = data.materias;
      }

      return materias.map(m => ({
        codigo: m.codigo_materia || m.codigo,
        nombre: m.nombre_materia || m.nombre,
      }));
    } catch (error) {
      return [];
    }
  }

  /**
   * Obtener materias del programa del estudiante
   * ✅ Endpoint: /api/v1/public-academico/facultades/{faculty_id}/programas/{program_code}
   * @param {string} facultyId - Código de la facultad (ej: "ING")
   * @param {string} programCode - Código del programa (ej: "ING_SIS")
   */
  static async obtenerMateriasPorPrograma(facultyId, programCode) {
    try {
      if (!facultyId || !programCode) {
        return [];
      }

      // INTENTO 1: Endpoint público completo
      let response = await fetch(
        API_ENDPOINTS.PUBLIC_PROGRAMA_MATERIAS(facultyId, programCode),
        {
          method: 'GET',
          headers: getPublicHeaders(),
        }
      );

      // INTENTO 2: Endpoint admin de materias directamente
      if (!response.ok) {
        response = await fetch(API_ENDPOINTS.ADMIN_MATERIAS_LIST, {
          method: 'GET',
          headers: getAuthHeaders(),
        });
      }

      if (!response.ok) {
        return [];
      }

      const data = await response.json();

      // La respuesta puede venir en diferentes formatos
      let materias = [];
      
      if (Array.isArray(data)) {
        materias = data;
      } else if (data.data) {
        // Puede ser {data: {materias: []}} o {data: []}
        if (Array.isArray(data.data)) {
          materias = data.data;
        } else if (data.data.materias && Array.isArray(data.data.materias)) {
          materias = data.data.materias;
        } else if (data.data.programa && data.data.programa.materias) {
          materias = data.data.programa.materias;
        }
      } else if (data.materias && Array.isArray(data.materias)) {
        materias = data.materias;
      }

      if (!Array.isArray(materias)) {
        return [];
      }


      return materias.map(m => ({
        codigo: m.codigo_materia || m.codigo,
        nombre: m.nombre_materia || m.nombre,
      }));
    } catch (error) {
      return [];
    }
  }

  /**
   * Obtener grupos por materia
   * ✅ Endpoint: /api/v1/admin/grupos/materia/{subject_code}
   */
  static async obtenerGruposPorMateria(codigoMateria) {
    try {
      if (!codigoMateria) {
        return [];
      }

      const response = await fetch(
        API_ENDPOINTS.ADMIN_MATERIA_ASIGNACIONES(codigoMateria),
        {
          method: 'GET',
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        console.warn(`⚠️ No se pudieron cargar las asignaciones de la materia ${codigoMateria} (${response.status})`);
        return [];
      }

      const result = await response.json();

      // Extraer asignaciones del objeto materia
      const asignaciones = result.data?.asignaciones || result.asignaciones || [];

      // Mapear asignaciones a formato compatible
      return asignaciones.map(asignacion => {
        const docente = asignacion.docente || {};
        const usuario = docente.usuario || asignacion.usuario || {};
        const grupo = asignacion.grupo || {};

        const nombreDocente = usuario.nombre_completo ||
                             `${usuario.p_nombre || ''} ${usuario.p_apellido || ''}`.trim() ||
                             'Sin nombre';

        return {
          id: grupo.id || grupo.id_grupo,
          nombre: grupo.nombre_grupo || `Grupo ${grupo.codigo_grupo}`,
          codigoMateria: codigoMateria,
          idDocente: docente.id_docente || asignacion.id_docente,
          nombreDocente: nombreDocente,
          idAsignacion: asignacion.id_docente_materia || asignacion.id,
        };
      });
    } catch (error) {
      return [];
    }
  }

  /**
   * Obtener grupos asignados a un docente específico
   * ✅ Endpoint: /api/v1/admin/grupos/profesor/{teacher_id}
   * @param {string} idDocente - ID del docente
   * @returns {Promise<Array>} Lista de grupos con información de materia
   */
  static async obtenerGruposPorDocente(idDocente) {
    try {
      if (!idDocente) {
        return [];
      }

      
      // Intentar endpoint público primero
      let response = await fetch(
        API_ENDPOINTS.GRUPOS_BY_TEACHER(idDocente),
        {
          method: 'GET',
          headers: getAuthHeaders(),
        }
      );

      // Si falla (403), intentar endpoint de admin
      if (response.status === 403) {
        response = await fetch(
          API_ENDPOINTS.ADMIN_GRUPOS_BY_TEACHER(idDocente),
          {
            method: 'GET',
            headers: getAuthHeaders(),
          }
        );
      }

      if (!response.ok) {
        console.warn(`⚠️ No se pudieron cargar los grupos del docente ${idDocente} (${response.status})`);
        return [];
      }

      const result = await response.json();

      // La respuesta puede venir en result.data o directamente
      let grupos = [];
      if (result.data && Array.isArray(result.data)) {
        grupos = result.data;
      } else if (Array.isArray(result)) {
        grupos = result;
      } else {
        return [];
      }


      // Formatear respuesta con información completa
      return grupos.map(g => ({
        id: g.codigo_grupo || g.id_grupo,
        codigoGrupo: g.codigo_grupo,
        nombre: g.nombre_grupo || `Grupo ${g.codigo_grupo}`,
        codigoMateria: g.codigo_materia || g.materia_codigo,
        nombreMateria: g.nombre_materia || g.materia_nombre,
        idDocente: g.id_docente,
        nombreDocente: g.nombre_docente,
        activo: g.activo,
        totalEstudiantes: g.total_estudiantes || 0,
      }));
    } catch (error) {
      return [];
    }
  }

  /**
   * Obtener todos los estudiantes
   * Intenta primero endpoint público, luego admin si es necesario
   */
  static async obtenerTodosLosEstudiantes() {
    try {
      
      // Intentar endpoint admin (el que realmente existe en el backend)
      let response = await fetch(API_ENDPOINTS.ADMIN_ESTUDIANTES, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      // Si falla con 403 o 404, intentar endpoint público con prefijo correcto
      if (response.status === 403 || response.status === 404) {
        response = await fetch(API_ENDPOINTS.ADMIN_ESTUDIANTES, {
          method: 'GET',
          headers: getAuthHeaders(),
        });
      }

      if (!response.ok) {
        return [];
      }

      const result = await response.json();

      // Verificar estructura de respuesta paginada
      let estudiantes = [];
      if (result.data && Array.isArray(result.data)) {
        estudiantes = result.data;
      } else if (Array.isArray(result)) {
        estudiantes = result;
      } else {
        return [];
      }


      return estudiantes.map(est => {
        // Manejar estructura anidada {estudiante: {...}, usuario: {...}}
        const estudianteData = est.estudiante || est;
        const usuarioData = est.usuario || estudianteData.usuario || {};

        return {
          id: estudianteData.id_estudiante || estudianteData.id,
          nombreCompleto: usuarioData.nombre_completo || 
                         `${usuarioData.nombres} ${usuarioData.apellidos}`.trim() ||
                         'Sin nombre',
          correo: usuarioData.correo || usuarioData.email,
          codigoEstudiante: estudianteData.codigo_estudiante,
          programa: estudianteData.codigo_programa,
        };
      });
    } catch (error) {
      return [];
    }
  }
}

export default RegisterProjectService;
