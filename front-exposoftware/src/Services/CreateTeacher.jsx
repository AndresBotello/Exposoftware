import { API_ENDPOINTS } from "../utils/constants";
import * as AuthService from "./AuthService";

export const TIPOS_DOCUMENTO = ["CC", "TI", "CE", "PEP", "Pasaporte"];

export const GENEROS = ["Hombre", "Mujer", "Hermafrodita"];

export const IDENTIDADES_SEXUALES = [
  "Heterosexual",
  "Homosexual",
  "Bisexual",
  "Pansexual",
  "Asexual",
  "Demisexual",
  "Sapiosexual",
  "Queer",
  "Graysexual",
  "Omnisexual",
  "Androsexual",
  "Gynesexual",
  "Polysexual"
];

export const CATEGORIAS_DOCENTE = ["Interno", "Invitado", "Externo"];

export const DEPARTAMENTOS_COLOMBIA = [
  "Amazonas", "Antioquia", "Arauca", "Atlántico", "Bolívar", "Boyacá",
  "Caldas", "Caquetá", "Casanare", "Cauca", "Cesar", "Chocó", "Córdoba",
  "Cundinamarca", "Guainía", "Guaviare", "Huila", "La Guajira", "Magdalena",
  "Meta", "Nariño", "Norte de Santander", "Putumayo", "Quindío", "Risaralda",
  "San Andrés y Providencia", "Santander", "Sucre", "Tolima", "Valle del Cauca",
  "Vaupés", "Vichada"
];

// Mapeos de valores UI a IDs de la API
const TIPO_DOCUMENTO_MAP = {
  "CC": 1,
  "TI": 2,
  "CE": 3,
  "PEP": 4,
  "Pasaporte": 5
};

const GENERO_MAP = {
  "Hombre": 1,
  "Mujer": 2,
  "Hermafrodita": 3
};

const IDENTIDAD_MAP = {
  "Heterosexual": 1,
  "Homosexual": 2,
  "Bisexual": 3,
  "Pansexual": 4,
  "Asexual": 5,
  "Demisexual": 6,
  "Sapiosexual": 7,
  "Queer": 8,
  "Graysexual": 9,
  "Omnisexual": 10,
  "Androsexual": 11,
  "Gynesexual": 12,
  "Polysexual": 13
};

const TIPO_VIA_MAP = {
  "Calle": 1,
  "Carrera": 2,
  "Diagonal": 3,
  "Transversal": 4,
  "Avenida": 5
};

// Mapeo de códigos ISO 2 a códigos ISO 3 para países
const PAIS_ISO_MAP = {
  "CO": "COL",
  "AR": "ARG",
  "BR": "BRA",
  "CL": "CHL",
  "EC": "ECU",
  "MX": "MEX",
  "PE": "PER",
  "VE": "VEN",
  "US": "USA",
  "ES": "ESP",
  "OTROS": "OTR"
};

/**
 * Convertir valores UI a IDs de la API
 */
const convertirAIds = (formData) => {
  // Si vienen nombres y apellidos como strings combinados, usarlos; si no, combinar desde campos separados
  const nombres = formData.nombres || `${formData.primerNombre || ""} ${formData.segundoNombre || ""}`.trim();
  const apellidos = formData.apellidos || `${formData.primerApellido || ""} ${formData.segundoApellido || ""}`.trim();

  // Separar nombres y apellidos
  const partesNombre = nombres.trim().split(/\s+/);
  const primerNombre = partesNombre[0] || "";
  const segundoNombre = partesNombre.slice(1).join(" ") || "";

  const partesApellido = apellidos.trim().split(/\s+/);
  const primerApellido = partesApellido[0] || "";
  const segundoApellido = partesApellido.slice(1).join(" ") || "";

  // Mapear códigos de país de ISO 2 a ISO 3
  const codigoPais = (codigoISO2) => PAIS_ISO_MAP[codigoISO2] || codigoISO2 || "COL";

  return {
    ...formData,
    primerNombre,
    segundoNombre,
    primerApellido,
    segundoApellido,
    tipoDocumento: TIPO_DOCUMENTO_MAP[formData.tipoDocumento] || formData.tipoDocumento,
    genero: GENERO_MAP[formData.genero] || formData.genero,
    identidadSexual: formData.identidadSexual ? IDENTIDAD_MAP[formData.identidadSexual] : null,
    tipoVia: TIPO_VIA_MAP[formData.tipoVia] || 2,
    codigoPaisNacimiento: codigoPais(formData.nacionalidad),
    codigoPaisNacionalidad: codigoPais(formData.nacionalidad),
  };
};

// ==================== FUNCIONES DE API ====================

/**
 * Separar nombres completos en primer y segundo nombre
 * @param {string} nombresCompletos - Nombres completos ingresados
 * @returns {Object} {primer_nombre, segundo_nombre}
 */
const separarNombres = (nombresCompletos) => {
  if (!nombresCompletos) return { primer_nombre: "", segundo_nombre: "" };
  
  const nombres = nombresCompletos.trim().split(/\s+/);
  return {
    primer_nombre: nombres[0] || "",
    segundo_nombre: nombres.slice(1).join(" ") || ""
  };
};

/**
 * Separar apellidos completos en primer y segundo apellido
 * @param {string} apellidosCompletos - Apellidos completos ingresados
 * @returns {Object} {primer_apellido, segundo_apellido}
 */
const separarApellidos = (apellidosCompletos) => {
  if (!apellidosCompletos) return { primer_apellido: "", segundo_apellido: "" };
  
  const apellidos = apellidosCompletos.trim().split(/\s+/);
  return {
    primer_apellido: apellidos[0] || "",
    segundo_apellido: apellidos.slice(1).join(" ") || ""
  };
};

/**
 * Obtener todos los docentes desde el backend
 * @returns {Promise<Array>} Lista de docentes
 */
export const obtenerDocentes = async () => {
  try {
    console.log('📥 Cargando profesores desde:', API_ENDPOINTS.ADMIN_DOCENTES);
    const headers = AuthService.getAuthHeaders();
    console.log('🔑 Headers de autenticación:', headers);

    const response = await fetch(API_ENDPOINTS.ADMIN_DOCENTES, {
      credentials: 'include',
      method: 'GET',
      headers: headers
    });
    
    console.log('📡 Respuesta del servidor - Status:', response.status, response.statusText);
    
    if (response.ok) {
      const result = await response.json();
      console.log('📦 Respuesta completa:', result);
      // El backend retorna { status, message, data, code }
      const docentes = result.data || result;
      console.log('✅ Profesores cargados:', docentes.length);
      if (docentes.length > 0) {
        console.log('🔍 Estructura del primer profesor:', docentes[0]);
        console.log('🔍 Claves del primer profesor:', Object.keys(docentes[0]));
        if (docentes[0].usuario) {
          console.log('🔍 Usuario del primer profesor:', docentes[0].usuario);
        }
      }
      return Array.isArray(docentes) ? docentes : [];
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
 * Crear un nuevo docente en el backend
 * @param {Object} datosDocente - Datos completos del docente
 * @returns {Promise<Object>} Datos del docente creado
 */
export const crearDocente = async (datosDocente) => {
  // Validaciones básicas
  if (!datosDocente.id_tipo_doc || !datosDocente.identificacion) {
    throw new Error("El tipo de documento e identificación son obligatorios");
  }

  if (!datosDocente.p_nombre || !datosDocente.p_apellido) {
    throw new Error("El nombre y apellido son obligatorios");
  }

  if (!datosDocente.correo) {
    throw new Error("El correo institucional es obligatorio");
  }

  if (!datosDocente.correo.endsWith("@unicesar.edu.co")) {
    throw new Error("El correo debe ser institucional (@unicesar.edu.co)");
  }

  if (!datosDocente.contrasena) {
    throw new Error("La contraseña es obligatoria");
  }

  if (!datosDocente.categoria_docente) {
    throw new Error("La categoría del docente es obligatoria");
  }

  // Estructura del payload según el nuevo OpenAPI: TeacherCreate
  const payload = {
    usuario: {
      id_tipo_doc: datosDocente.id_tipo_doc,
      identificacion: datosDocente.identificacion,
      p_nombre: datosDocente.p_nombre,
      s_nombre: datosDocente.s_nombre || null,
      p_apellido: datosDocente.p_apellido,
      s_apellido: datosDocente.s_apellido || null,
      id_genero: datosDocente.id_genero,
      id_identidad: datosDocente.id_identidad || null,
      fecha_nacimiento: datosDocente.fecha_nacimiento,
      id_tipo_via: datosDocente.id_tipo_via,
      numero_via: datosDocente.numero_via,
      numero_cruce: datosDocente.numero_cruce,
      numero_placa: datosDocente.numero_placa,
      complemento: datosDocente.complemento || null,
      codigo_municipio_residencia: datosDocente.codigo_municipio_residencia,
      codigo_municipio_nacimiento: datosDocente.codigo_municipio_nacimiento,
      codigo_pais_nacimiento: datosDocente.codigo_pais_nacimiento,
      codigo_pais_nacionalidad: datosDocente.codigo_pais_nacionalidad,
      telefono: datosDocente.telefono || null,
      correo: datosDocente.correo,
      activo: true,
      contrasena: datosDocente.contrasena
    },
    perfil: {
      categoria_docente: datosDocente.categoria_docente,
      codigo_programa: datosDocente.codigo_programa || ""
    }
  };

  console.log('📤 Enviando docente al backend:', JSON.stringify(payload, null, 2));

  try {
    const response = await fetch(API_ENDPOINTS.ADMIN_DOCENTES, {
      credentials: 'include',
      method: 'POST',
      headers: AuthService.getAuthHeaders(),
      body: JSON.stringify(payload)
    });

    if (response.status === 201) {
      const data = await response.json();
      console.log('✅ Docente creado:', data);
      return { success: true, data };
    } else if (response.status === 400) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Solicitud incorrecta:', errorData);
      throw new Error(`Solicitud incorrecta: ${errorData.message || errorData.detail || 'Verifique los datos ingresados'}`);
    } else if (response.status === 401) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`No autorizado: ${errorData.message || errorData.detail || 'Debe iniciar sesión'}`);
    } else if (response.status === 403) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Sin permisos: ${errorData.message || errorData.detail || 'No tiene permisos para crear docentes'}`);
    } else if (response.status === 409) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Conflicto: ${errorData.message || errorData.detail || 'El docente ya existe'}`);
    } else if (response.status === 422) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Error de validación (422):', errorData);
      throw new Error(`Error de validación: ${errorData.message || errorData.detail || 'Los datos no son válidos'}`);
    } else {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Error al crear docente (${response.status}): ${errorData.message || errorData.detail || 'Error desconocido'}`);
    }
  } catch (error) {
    if (error.message) {
      throw error;
    }
    console.error('❌ Error al crear docente:', error);
    throw new Error("Error de conexión al crear el docente. Verifique su conexión a internet.");
  }
};

/**
 * Actualizar un docente existente
 * @param {string} idDocente - ID del docente a actualizar
 * @param {Object} datosDocente - Datos actualizados del docente
 * @returns {Promise<Object>} Datos del docente actualizado
 */
export const actualizarDocente = async (idDocente, datosDocente) => {
  // Validaciones
  if (!datosDocente.p_nombre || !datosDocente.p_apellido) {
    throw new Error("El nombre y apellido son obligatorios");
  }

  if (!datosDocente.correo) {
    throw new Error("El correo institucional es obligatorio");
  }

  if (!datosDocente.correo.endsWith("@unicesar.edu.co")) {
    throw new Error("El correo debe ser institucional (@unicesar.edu.co)");
  }

  // Payload para actualización - estructura TeacherUpdate
  const payload = {
    usuario: {
      identificacion: datosDocente.identificacion,
      p_nombre: datosDocente.p_nombre,
      s_nombre: datosDocente.s_nombre || null,
      p_apellido: datosDocente.p_apellido,
      s_apellido: datosDocente.s_apellido || null,
      id_genero: datosDocente.id_genero,
      id_identidad: datosDocente.id_identidad || null,
      fecha_nacimiento: datosDocente.fecha_nacimiento || "",
      id_tipo_via: datosDocente.id_tipo_via,
      numero_via: datosDocente.numero_via,
      numero_cruce: datosDocente.numero_cruce,
      numero_placa: datosDocente.numero_placa,
      complemento: datosDocente.complemento || null,
      codigo_municipio_residencia: datosDocente.codigo_municipio_residencia,
      codigo_municipio_nacimiento: datosDocente.codigo_municipio_nacimiento,
      codigo_pais_nacimiento: datosDocente.codigo_pais_nacimiento,
      codigo_pais_nacionalidad: datosDocente.codigo_pais_nacionalidad,
      telefono: datosDocente.telefono || null,
      correo: datosDocente.correo
    },
    perfil: {
      categoria_docente: datosDocente.categoria_docente,
      codigo_programa: datosDocente.codigo_programa || ""
    }
  };

  // Solo incluir contraseña si se proporcionó (para cambiarla)
  if (datosDocente.contrasena && datosDocente.contrasena.trim() !== "") {
    payload.usuario.contrasena = datosDocente.contrasena;
  }

  console.log('📤 Actualizando docente (ID: ' + idDocente + '):', JSON.stringify(payload, null, 2));

  try {
    const response = await fetch(`${API_ENDPOINTS.ADMIN_DOCENTES}/${idDocente}`, {
      credentials: 'include',
      method: 'PUT',
      headers: AuthService.getAuthHeaders(),
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Docente actualizado:', data);
      return { success: true, data };
    } else if (response.status === 400) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Solicitud incorrecta: ${errorData.message || errorData.detail || 'Verifique los datos'}`);
    } else if (response.status === 404) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`No encontrado: ${errorData.message || errorData.detail || 'El docente no existe'}`);
    } else {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Error al actualizar docente (${response.status}): ${errorData.message || errorData.detail || 'Error desconocido'}`);
    }
  } catch (error) {
    if (error.message) {
      throw error;
    }
    console.error('❌ Error al actualizar docente:', error);
    throw new Error("Error de conexión al actualizar el docente.");
  }
};

/**
 * Eliminar un docente
 * @param {string} idDocente - ID del docente a eliminar
 * @returns {Promise<Object>} Confirmación de eliminación
 */
export const eliminarDocente = async (idDocente) => {
  console.log('🗑️ Eliminando docente - ID:', idDocente);

  try {
    const response = await fetch(`${API_ENDPOINTS.ADMIN_DOCENTES}/${idDocente}`, {
      credentials: 'include',
      method: 'DELETE',
      headers: AuthService.getAuthHeaders()
    });

    if (response.ok) {
      console.log('✅ Docente eliminado del backend');
      return { success: true };
    } else if (response.status === 404) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`No encontrado: ${errorData.message || errorData.detail || 'El docente no existe'}`);
    } else {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Error al eliminar docente (${response.status}): ${errorData.message || errorData.detail || 'Error desconocido'}`);
    }
  } catch (error) {
    if (error.message) {
      throw error;
    }
    console.error('❌ Error al eliminar docente:', error);
    throw new Error("Error de conexión al eliminar el docente.");
  }
};

// ==================== FUNCIONES AUXILIARES ====================

/**
 * Filtrar docentes por término de búsqueda
 * @param {Array} docentes - Lista de docentes
 * @param {string} searchTerm - Término de búsqueda
 * @returns {Array} Docentes filtrados
 */
export const filtrarDocentes = (docentes, searchTerm) => {
  // Validar que docentes sea un array
  if (!Array.isArray(docentes)) {
    console.warn('⚠️ filtrarDocentes: docentes no es un array:', docentes);
    return [];
  }
  
  if (!searchTerm) return docentes;

  const termino = searchTerm.toLowerCase();
  return docentes.filter(docente => {
    try {
      // El backend devuelve nombre_completo en el objeto usuario
      const nombreCompleto = docente?.usuario?.nombre_completo?.toLowerCase() || "";
      const identificacion = docente?.usuario?.identificacion?.toLowerCase() || "";
      const correo = docente?.usuario?.correo?.toLowerCase() || "";
      const programa = docente?.docente?.codigo_programa?.toLowerCase() || docente?.codigo_programa?.toLowerCase() || '';

      return (
        nombreCompleto.includes(termino) ||
        identificacion.includes(termino) ||
        correo.includes(termino) ||
        programa.includes(termino)
      );
    } catch (error) {
      console.error('Error filtrando docente:', error, docente);
      return false;
    }
  });
};

/**
 * Validar formato de correo institucional
 * @param {string} correo - Correo a validar
 * @returns {boolean} True si es válido
 */
export const validarCorreoInstitucional = (correo) => {
  return correo.endsWith("@unicesar.edu.co");
};

/**
 * Validar formato de teléfono colombiano
 * @param {string} telefono - Teléfono a validar
 * @returns {boolean} True si es válido
 */
export const validarTelefono = (telefono) => {
  // Debe tener 10 dígitos y comenzar con 3
  return /^3\d{9}$/.test(telefono);
};

/**
 * Formatear datos del formulario para envío al backend
 * @param {Object} formData - Datos del formulario (con nombres de forma antigua)
 * @returns {Object} Datos formateados para la API nueva
 */
export const formatearDatosDocente = (formData) => {
  // Convertir valores UI a IDs
  const datosConIds = convertirAIds(formData);

  return {
    id_tipo_doc: datosConIds.tipoDocumento,
    identificacion: datosConIds.identificacion,
    p_nombre: datosConIds.primerNombre || "",
    s_nombre: datosConIds.segundoNombre || null,
    p_apellido: datosConIds.primerApellido || "",
    s_apellido: datosConIds.segundoApellido || null,
    id_genero: datosConIds.genero,
    id_identidad: datosConIds.identidadSexual || null,
    fecha_nacimiento: datosConIds.fechaNacimiento || "",
    id_tipo_via: datosConIds.tipoVia || 2, // Carrera por defecto
    numero_via: datosConIds.numeroVia || "0",
    numero_cruce: datosConIds.numeroCruce || "0",
    numero_placa: datosConIds.numeroPlaca || "0",
    complemento: datosConIds.complemento || null,
    codigo_municipio_residencia: datosConIds.codigoMunicipioResidencia || "08001", // Valledupar por defecto
    codigo_municipio_nacimiento: datosConIds.codigoMunicipioNacimiento || "08001",
    codigo_pais_nacimiento: datosConIds.codigoPaisNacimiento || "COL",
    codigo_pais_nacionalidad: datosConIds.codigoPaisNacionalidad || "COL",
    telefono: datosConIds.telefono || null,
    correo: datosConIds.correo,
    contrasena: datosConIds.contrasena || datosConIds.contraseña,
    categoria_docente: datosConIds.categoriaDocente,
    codigo_programa: datosConIds.codigoPrograma || ""
  };
};
