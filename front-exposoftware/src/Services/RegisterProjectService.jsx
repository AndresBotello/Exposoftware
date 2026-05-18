import { API_BASE_URL } from '../utils/constants';

const API_URL = API_BASE_URL;

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
    console.warn('⚠️ No hay token de autenticación disponible');
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
      console.warn('⚠️ No hay endpoint público para listar estudiantes');
      console.warn('💡 Solución: Usar estudiante autenticado o permitir agregar por ID manual');
      
      // Retornar array vacío - el componente manejará esto
      return [];
    } catch (error) {
      console.error('❌ Error obteniendo estudiantes:', error);
      return [];
    }
  }

  /**
   * Obtener lista de docentes/profesores
   * ✅ Endpoint: /api/v1/admin/profesores (requiere autenticación)
   */
  static async obtenerDocentes() {
    try {
      console.log('🔍 Obteniendo lista de profesores...');
      
      // 🔥 Intentar primero endpoint público (para estudiantes)
      console.log('🔄 Intentando endpoint público: /api/v1/docentes');
      let response = await fetch(`${API_URL}/api/v1/docentes?limit=100`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      // Si falla con 403 o 405 (sin permisos / método no permitido), intentar endpoint de admin
      if (response.status === 403 || response.status === 405) {
        console.log('⚠️ Endpoint público falló (403), intentando endpoint admin...');
        response = await fetch(`${API_URL}/api/v1/admin/profesores?limit=100`, {
          method: 'GET',
          headers: getAuthHeaders(),
        });
      }

      if (!response.ok) {
        console.warn(`⚠️ Error al cargar profesores: ${response.status}`);
        return [];
      }

      const result = await response.json();
      console.log('📚 Respuesta de profesores:', result);

      // Verificar estructura de respuesta paginada
      let profesores = [];
      if (result.data && Array.isArray(result.data)) {
        profesores = result.data;
      } else if (Array.isArray(result)) {
        profesores = result;
      } else {
        console.warn('⚠️ Formato inesperado de respuesta de profesores:', result);
        return [];
      }

      console.log(`✅ ${profesores.length} profesores cargados`);

      return profesores.map(prof => ({
        id: prof.id_docente || prof.id,
        nombre: prof.nombre_completo || `${prof.primer_nombre || ''} ${prof.primer_apellido || ''}`.trim(),
        correo: prof.correo,
      }));
    } catch (error) {
      console.error('❌ Error obteniendo docentes:', error);
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
      console.log('🔑 Token disponible:', token ? `${token.substring(0, 30)}...` : 'NO HAY TOKEN');
      
      // INTENTO 1: Usar el endpoint del árbol completo
      console.log('🔄 Intentando obtener árbol completo desde /arbol-completo...');
      const response = await fetch(`${API_URL}/api/v1/public-investigacion/arbol-completo`, {
        method: 'GET',
        headers: getPublicHeaders(),
      });

      console.log('📡 Respuesta del servidor:', response.status, response.statusText);

      // Si funciona, retornar el árbol completo
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Árbol de investigación completo obtenido:', data);
        console.log('📊 Tipo de respuesta:', typeof data, '¿Es array?', Array.isArray(data));

        // Manejar diferentes formatos de respuesta
        let arbol = data;
        
        if (!Array.isArray(data)) {
          console.log('🔄 Respuesta no es array, extrayendo datos...');
          
          // Intentar extraer el array de diferentes estructuras posibles
          if (data.data && Array.isArray(data.data)) {
            arbol = data.data;
            console.log('✅ Árbol extraído de data.data');
          } else if (data.lineas && Array.isArray(data.lineas)) {
            arbol = data.lineas;
            console.log('✅ Árbol extraído de data.lineas');
          } else if (data.status === 'success' && data.data) {
            // Formato {status: "success", data: [...]}
            arbol = Array.isArray(data.data) ? data.data : (data.data.lineas || []);
            console.log('✅ Árbol extraído de formato success');
          } else {
            console.warn('⚠️ Formato inesperado de respuesta, intentando método alternativo...');
            return await this.obtenerArbolInvestigacionAlternativo();
          }
        }

        if (!Array.isArray(arbol) || arbol.length === 0) {
          console.warn('⚠️ Árbol vacío o formato inválido, intentando método alternativo...');
          return await this.obtenerArbolInvestigacionAlternativo();
        }

        console.log('✅ Árbol procesado correctamente:', arbol.length, 'líneas');
        return arbol;
      }

      // Si falla por permisos o error del servidor, intentar método alternativo
      if (response.status === 401 || response.status === 403 || response.status === 500) {
        console.warn('⚠️ Árbol completo no disponible, usando método alternativo...');
        return await this.obtenerArbolInvestigacionAlternativo();
      }

      throw new Error(`Error ${response.status}: ${response.statusText}`);
      
    } catch (error) {
      console.error('❌ Error obteniendo árbol de investigación:', error);
      
      // Último intento: método alternativo
      try {
        console.log('🔄 Último intento con método alternativo...');
        return await this.obtenerArbolInvestigacionAlternativo();
      } catch (fallbackError) {
        console.error('❌ Método alternativo también falló:', fallbackError);
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
      console.log('🔄 Construyendo árbol de investigación desde endpoints individuales...');
      
      // Primero, obtener todas las líneas de investigación
      const lineasResponse = await fetch(`${API_URL}/api/v1/public-investigacion/lineas`, {
        method: 'GET',
        headers: getPublicHeaders(),
      });

      if (!lineasResponse.ok) {
        throw new Error(`Error obteniendo líneas: ${lineasResponse.status}`);
      }

      const lineasData = await lineasResponse.json();
      const lineas = Array.isArray(lineasData) ? lineasData : (lineasData.data || lineasData.lineas || []);
      
      console.log('📋 Líneas obtenidas:', lineas.length);

      // Para cada línea, obtener su jerarquía completa
      const arbolCompleto = [];
      
      for (const linea of lineas) {
        try {
          const codigoLinea = linea.codigo_linea || linea.codigo;
          console.log(`🔍 Obteniendo jerarquía para línea ${codigoLinea}...`);
          
          const jerarquiaResponse = await fetch(
            `${API_URL}/api/v1/public-investigacion/lineas/${codigoLinea}`, 
            {
              method: 'GET',
              headers: getPublicHeaders(),
            }
          );

          if (jerarquiaResponse.ok) {
            const jerarquia = await jerarquiaResponse.json();
            arbolCompleto.push(jerarquia);
            console.log(`✅ Jerarquía de línea ${codigoLinea} obtenida`);
          } else {
            // Si falla, agregar línea sin sublíneas
            console.warn(`⚠️ No se pudo obtener jerarquía de línea ${codigoLinea}, agregando sin sublíneas`);
            arbolCompleto.push({
              codigo_linea: codigoLinea,
              nombre_linea: linea.nombre_linea || linea.nombre,
              sublineas: []
            });
          }
        } catch (lineaError) {
          console.error(`❌ Error procesando línea:`, lineaError);
          // Continuar con la siguiente línea
        }
      }

      console.log('✅ Árbol de investigación construido desde endpoints individuales:', arbolCompleto.length, 'líneas');
      return arbolCompleto;
      
    } catch (error) {
      console.error('❌ Error en método alternativo:', error);
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
      console.error('❌ Error obteniendo líneas de investigación:', error);
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
      console.error('❌ Error obteniendo sublíneas de investigación:', error);
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
      console.error('❌ Error obteniendo áreas temáticas:', error);
      throw error;
    }
  }

  /**
   * Crear un nuevo proyecto
   * ✅ Endpoint: /api/v1/api/v1/proyectos/
   * Nota: Sin calificación (la asigna el profesor después)
   */
  static async crearProyecto(proyectoData, archivoPDF, archivoExtra = null) {
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

      console.log('🔍 DATOS DEL PROYECTO ANTES DE ENVIAR:');
      console.log('   - id_docente:', proyectoData.id_docente);
      console.log('   - id_grupo:', proyectoData.id_grupo);
      console.log('   - tipo id_docente:', typeof proyectoData.id_docente);

      // Preparar FormData para envío multipart
      const formData = new FormData();

      // Preparar payload del proyecto según el NUEVO FORMATO del backend
      const payload = {
        // ✅ NUEVO: id_docente como objeto con uid_docente y nombre
        id_docente: {
          uid_docente: proyectoData.id_docente,
          nombre: proyectoData.nombre_docente || "" // Necesitamos el nombre del docente
        },
        // ✅ NUEVO: id_estudiantes como array de objetos con id_estudiante y nombre
        id_estudiantes: proyectoData.id_estudiantes.map((id, index) => ({
          id_estudiante: id,
          nombre: proyectoData.nombres_estudiantes?.[index] || "" // Necesitamos los nombres
        })),
        // ✅ NUEVO: id_grupo es STRING, no number
        id_grupo: proyectoData.id_grupo.toString(),
        codigo_area: parseInt(proyectoData.codigo_area),
        id_evento: proyectoData.id_evento || '1jAZE5TKXakRd9ymq1Xu',
        codigo_materia: proyectoData.codigo_materia,
        codigo_linea: parseInt(proyectoData.codigo_linea),
        codigo_sublinea: parseInt(proyectoData.codigo_sublinea),
        titulo_proyecto: proyectoData.titulo_proyecto.trim(),
        tipo_actividad: parseInt(proyectoData.tipo_actividad),
        // Campos opcionales (el backend los puede llenar)
        estado_calificacion: "Pendiente",
        // No incluir calificacion - la asigna el profesor después
      };
      
      console.log('🔍 VERIFICACIÓN FINAL (NUEVO FORMATO):');
      console.log('   - id_docente:', payload.id_docente);
      console.log('   - id_estudiantes:', payload.id_estudiantes);
      console.log('   - id_grupo:', payload.id_grupo, '(tipo:', typeof payload.id_grupo + ')');
      console.log('');

      console.log('📦 PAYLOAD COMPLETO A ENVIAR:');
      console.log(JSON.stringify(payload, null, 2));
      console.log('');
      console.log('📋 VALIDACIÓN DEL PAYLOAD:');
      console.log('   ✓ id_docente:', payload.id_docente, '(tipo:', typeof payload.id_docente + ')');
      console.log('   ✓ id_estudiantes:', payload.id_estudiantes, '(cantidad:', payload.id_estudiantes.length + ')');
      console.log('   ✓ id_grupo:', payload.id_grupo, '(tipo:', typeof payload.id_grupo + ')');
      console.log('   ✓ codigo_area:', payload.codigo_area, '(tipo:', typeof payload.codigo_area + ')');
      console.log('   ✓ id_evento:', payload.id_evento);
      console.log('   ✓ codigo_materia:', payload.codigo_materia);
      console.log('   ✓ codigo_linea:', payload.codigo_linea, '(tipo:', typeof payload.codigo_linea + ')');
      console.log('   ✓ codigo_sublinea:', payload.codigo_sublinea, '(tipo:', typeof payload.codigo_sublinea + ')');
      console.log('   ✓ titulo_proyecto:', payload.titulo_proyecto);
      console.log('   ✓ tipo_actividad:', payload.tipo_actividad, '(tipo:', typeof payload.tipo_actividad + ')');
      console.log('');

      // Agregar proyecto_data como JSON string
      formData.append('proyecto_data', JSON.stringify(payload));

      // Agregar archivos
      formData.append('archivo', archivoPDF);
      if (archivoExtra) {
        formData.append('archivo_extra', archivoExtra);
      }

      console.log('📤 Enviando proyecto (FormData):', payload);
      console.log('📤 JSON que se envía:', JSON.stringify(payload, null, 2));

      const response = await fetch(`${API_URL}/api/v1/proyectos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          // NO incluir Content-Type, lo maneja FormData automáticamente
        },
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        console.error('❌ Error del backend:', err);
        console.error('❌ Error completo (JSON):', JSON.stringify(err, null, 2));
        console.error('❌ Status:', response.status);
        console.error('❌ StatusText:', response.statusText);
        
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
        
        console.error('❌ Mensaje de error procesado:', errorMessage);
        
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
      console.log('✅ Proyecto creado exitosamente!');
      console.log('');
      console.log('📊 RESPUESTA DEL BACKEND:');
      console.log(JSON.stringify(result, null, 2));
      console.log('');
      console.log('📋 DATOS DEL PROYECTO CREADO:');
      console.log('   ✓ id_proyecto:', result.id_proyecto);
      console.log('   ✓ titulo_proyecto:', result.titulo_proyecto);
      console.log('   ✓ id_docente:', result.id_docente);
      console.log('   ✓ id_estudiantes:', result.id_estudiantes);
      console.log('   ✓ archivo_pdf:', result.archivo_pdf);
      console.log('   ✓ fecha_subida:', result.fecha_subida);
      console.log('   ✓ activo:', result.activo);
      console.log('');
      
      return result;
    } catch (error) {
      console.error('❌ Error creando proyecto:', error);
      throw error;
    }
  }

  /**
   * Obtener todas las materias disponibles
   * Intenta el endpoint admin; retorna [] si no tiene permisos
   */
  static async obtenerMaterias() {
    try {
      const response = await fetch(`${API_URL}/api/v1/admin/materias?limit=200`, {
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
      console.error('❌ Error obteniendo materias:', error);
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
        console.warn('⚠️ Se requiere facultyId y programCode para obtener materias');
        return [];
      }

      // INTENTO 1: Endpoint público completo
      console.log(`🔍 Intentando obtener materias de ${programCode} desde endpoint público...`);
      let response = await fetch(
        `${API_URL}/api/v1/public-academico/facultades/${facultyId}/programas/${programCode}`,
        {
          method: 'GET',
          headers: getPublicHeaders(),
        }
      );

      // INTENTO 2: Endpoint admin de materias directamente
      if (!response.ok) {
        console.log('⚠️ Endpoint público falló, intentando obtener todas las materias...');
        response = await fetch(`${API_URL}/api/v1/admin/materias`, {
          method: 'GET',
          headers: getAuthHeaders(),
        });
      }

      if (!response.ok) {
        console.warn(`⚠️ No se pudieron cargar las materias del programa ${programCode}`);
        return [];
      }

      const data = await response.json();
      console.log('📚 Datos de materias obtenidos:', data);

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
        console.warn('⚠️ Formato inesperado de materias:', data);
        return [];
      }

      console.log(`✅ ${materias.length} materias encontradas`);

      return materias.map(m => ({
        codigo: m.codigo_materia || m.codigo,
        nombre: m.nombre_materia || m.nombre,
      }));
    } catch (error) {
      console.error('❌ Error obteniendo materias del programa:', error);
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
        console.warn('⚠️ Se requiere código de materia para obtener grupos');
        return [];
      }

      console.log(`🔍 Obteniendo grupos de la materia: ${codigoMateria}`);
      const response = await fetch(
        `${API_URL}/api/v1/admin/grupos/materia/${codigoMateria}`,
        {
          method: 'GET',
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        console.warn(`⚠️ No se pudieron cargar los grupos de la materia ${codigoMateria} (${response.status})`);
        return [];
      }

      const result = await response.json();
      console.log('👥 Respuesta de grupos:', result);

      // La respuesta puede venir en result.data o directamente
      let grupos = [];
      if (result.data && Array.isArray(result.data)) {
        grupos = result.data;
      } else if (Array.isArray(result)) {
        grupos = result;
      } else {
        console.warn('⚠️ Formato inesperado de grupos:', result);
        return [];
      }

      console.log(`✅ ${grupos.length} grupos encontrados para la materia ${codigoMateria}`);

      return grupos.map(g => ({
        id: g.codigo_grupo || g.id_grupo,
        nombre: g.nombre_grupo || `Grupo ${g.codigo_grupo}`,
        codigoMateria: codigoMateria,
        idDocente: g.id_docente,
        nombreDocente: g.nombre_docente,
      }));
    } catch (error) {
      console.error('❌ Error obteniendo grupos:', error);
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
        console.warn('⚠️ Se requiere ID de docente para obtener grupos');
        return [];
      }

      console.log(`🔍 Obteniendo grupos del docente: ${idDocente}`);
      
      // Intentar endpoint público primero
      let response = await fetch(
        `${API_URL}/api/v1/grupos/profesor/${idDocente}?limit=100`,
        {
          method: 'GET',
          headers: getAuthHeaders(),
        }
      );

      // Si falla (403), intentar endpoint de admin
      if (response.status === 403) {
        console.log('⚠️ Endpoint público falló, intentando endpoint admin...');
        response = await fetch(
          `${API_URL}/api/v1/admin/grupos/profesor/${idDocente}?limit=100`,
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
      console.log('👥 Respuesta de grupos del docente:', result);

      // La respuesta puede venir en result.data o directamente
      let grupos = [];
      if (result.data && Array.isArray(result.data)) {
        grupos = result.data;
      } else if (Array.isArray(result)) {
        grupos = result;
      } else {
        console.warn('⚠️ Formato inesperado de grupos del docente:', result);
        return [];
      }

      console.log(`✅ ${grupos.length} grupos encontrados para el docente ${idDocente}`);

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
      console.error('❌ Error obteniendo grupos del docente:', error);
      return [];
    }
  }

  /**
   * Obtener todos los estudiantes
   * Intenta primero endpoint público, luego admin si es necesario
   */
  static async obtenerTodosLosEstudiantes() {
    try {
      console.log('🔍 Obteniendo lista de todos los estudiantes...');
      
      // Intentar endpoint admin (el que realmente existe en el backend)
      console.log('🔄 Intentando endpoint: /api/v1/admin/estudiantes');
      let response = await fetch(`${API_URL}/api/v1/admin/estudiantes?limit=100`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      // Si falla con 403 o 404, intentar endpoint público con prefijo correcto
      if (response.status === 403 || response.status === 404) {
        console.log('⚠️ Endpoint admin falló, intentando endpoint público...');
        response = await fetch(`${API_URL}/api/v1/estudiantes?limit=100`, {
          method: 'GET',
          headers: getAuthHeaders(),
        });
      }

      if (!response.ok) {
        console.warn(`⚠️ Error al cargar estudiantes: ${response.status}`);
        return [];
      }

      const result = await response.json();
      console.log('👥 Respuesta de estudiantes:', result);

      // Verificar estructura de respuesta paginada
      let estudiantes = [];
      if (result.data && Array.isArray(result.data)) {
        estudiantes = result.data;
      } else if (Array.isArray(result)) {
        estudiantes = result;
      } else {
        console.warn('⚠️ Formato inesperado de respuesta de estudiantes:', result);
        return [];
      }

      console.log(`✅ ${estudiantes.length} estudiantes cargados`);

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
      console.error('❌ Error obteniendo estudiantes:', error);
      return [];
    }
  }
}

export default RegisterProjectService;
