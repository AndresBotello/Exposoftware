import { API_ENDPOINTS } from "../utils/constants";
import * as AuthService from "./AuthService";

export const TIPOS_DOCUMENTO = ["CC", "TI", "CE", "PEP", "Pasaporte"];

export const GENEROS = ["Hombre", "Mujer", "Prefiero no decirlo"];

export const IDENTIDADES_SEXUALES = [
  "Heterosexual",
  "Homosexual",
  "Bisexual",
  "Transgénero",
  "Intersexual",
  "Queer",
  "Asexual",
  "Pansexual",
  "Prefiero no decirlo"
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
  "Prefiero no decirlo": 3
};

const IDENTIDAD_MAP = {
  "Heterosexual": 1,
  "Homosexual": 2,
  "Bisexual": 3,
  "Transgénero": 4,
  "Intersexual": 5,
  "Queer": 6,
  "Asexual": 7,
  "Pansexual": 8,
  "Prefiero no decirlo": 9
};

const TIPO_VIA_MAP = {
  "Calle": 1,
  "Carrera": 2,
  "Diagonal": 3,
  "Transversal": 4,
  "Avenida": 5
};

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

const convertirAIds = (formData) => {
  const nombres = formData.nombres || `${formData.primerNombre || ""} ${formData.segundoNombre || ""}`.trim();
  const apellidos = formData.apellidos || `${formData.primerApellido || ""} ${formData.segundoApellido || ""}`.trim();

  const partesNombre = nombres.trim().split(/\s+/);
  const primerNombre = partesNombre[0] || "";
  const segundoNombre = partesNombre.slice(1).join(" ") || "";

  const partesApellido = apellidos.trim().split(/\s+/);
  const primerApellido = partesApellido[0] || "";
  const segundoApellido = partesApellido.slice(1).join(" ") || "";

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

const separarNombres = (nombresCompletos) => {
  if (!nombresCompletos) return { primer_nombre: "", segundo_nombre: "" };
  
  const nombres = nombresCompletos.trim().split(/\s+/);
  return {
    primer_nombre: nombres[0] || "",
    segundo_nombre: nombres.slice(1).join(" ") || ""
  };
};

const separarApellidos = (apellidosCompletos) => {
  if (!apellidosCompletos) return { primer_apellido: "", segundo_apellido: "" };
  
  const apellidos = apellidosCompletos.trim().split(/\s+/);
  return {
    primer_apellido: apellidos[0] || "",
    segundo_apellido: apellidos.slice(1).join(" ") || ""
  };
};


// Obtener los docentes con paginacion 
// En tu archivo de servicios (ej. src/Services/createtecacher.js)
  export const obtenerDocentes = async (page = 1, limit = 50) => {
    try {
      const url = `${API_ENDPOINTS.ADMIN_DOCENTES}?page=${page}&limit=${limit}`;
      
      const response = await fetch(url, {
        credentials: 'include',
        headers: AuthService.getAuthHeaders()
      });

      if (!response.ok) throw new Error('Error al obtener los docentes');
      return await response.json(); 
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

export const crearDocente = async (datosDocente) => {
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

  try {
    const response = await fetch(API_ENDPOINTS.ADMIN_DOCENTES, {
      credentials: 'include',
      method: 'POST',
      headers: AuthService.getAuthHeaders(),
      body: JSON.stringify(payload)
    });

    if (response.status === 201) {
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
      throw new Error(`Sin permisos: ${errorData.message || errorData.detail || 'No tiene permisos para crear docentes'}`);
    } else if (response.status === 409) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Conflicto: ${errorData.message || errorData.detail || 'El docente ya existe'}`);
    } else if (response.status === 422) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Error de validación: ${errorData.message || errorData.detail || 'Los datos no son válidos'}`);
    } else {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Error al crear docente (${response.status}): ${errorData.message || errorData.detail || 'Error desconocido'}`);
    }
  } catch (error) {
    if (error.message) {
      throw error;
    }
    throw new Error("Error de conexión al crear el docente. Verifique su conexión a internet.");
  }
};

export const actualizarDocente = async (idDocente, datosDocente) => {
  if (!idDocente) {
    throw new Error("ID del docente no especificado");
  }

  // Si el payload ya viene estructurado con usuario y perfil, usarlo tal cual
  if (datosDocente.usuario && datosDocente.perfil) {
    try {
      const url = `${API_ENDPOINTS.ADMIN_DOCENTES}/${idDocente}`;

      const response = await fetch(url, {
        credentials: 'include',
        method: 'PATCH',
        headers: {
          ...AuthService.getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(datosDocente)
      });

      const responseText = await response.text();

      if (response.ok) {
        try {
          const data = JSON.parse(responseText);
          return { success: true, data };
        } catch {
          return { success: true, data: null };
        }
      } else if (response.status === 400) {
        let errorData = {};
        try { errorData = JSON.parse(responseText); } catch {}
        throw new Error(`Solicitud incorrecta: ${errorData.message || errorData.detail || 'Verifique los datos'}`);
      } else if (response.status === 404) {
        let errorData = {};
        try { errorData = JSON.parse(responseText); } catch {}
        throw new Error(`No encontrado: ${errorData.message || errorData.detail || 'El docente no existe'}`);
      } else if (response.status === 422) {
        let errorData = {};
        try { errorData = JSON.parse(responseText); } catch {}
        throw new Error(`Error de validación: ${errorData.message || errorData.detail || 'Los datos enviados no son válidos'}`);
      } else {
        let errorData = {};
        try { errorData = JSON.parse(responseText); } catch {}
        throw new Error(`Error al actualizar docente (${response.status}): ${errorData.message || errorData.detail || 'Error desconocido'}`);
      }
    } catch (error) {
      if (error.message) {
        throw error;
      }
      throw new Error("Error de conexión al actualizar el docente.");
    }
  }

  // Formato antiguo: para compatibilidad con llamadas que pasan un objeto con todos los campos
  if (!datosDocente.p_nombre || !datosDocente.p_apellido) {
    throw new Error("El nombre y apellido son obligatorios");
  }

  if (!datosDocente.correo) {
    throw new Error("El correo institucional es obligatorio");
  }

  if (!datosDocente.correo.endsWith("@unicesar.edu.co")) {
    throw new Error("El correo debe ser institucional (@unicesar.edu.co)");
  }

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

  if (datosDocente.contrasena && datosDocente.contrasena.trim() !== "") {
    payload.usuario.contrasena = datosDocente.contrasena;
  }

  try {
    const response = await fetch(`${API_ENDPOINTS.ADMIN_DOCENTES}/${idDocente}`, {
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
    throw new Error("Error de conexión al actualizar el docente.");
  }
};

export const eliminarDocente = async (idDocente) => {
  try {
    const response = await fetch(`${API_ENDPOINTS.ADMIN_DOCENTES}/${idDocente}`, {
      credentials: 'include',
      method: 'DELETE',
      headers: AuthService.getAuthHeaders()
    });

    if (response.ok) {
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
    throw new Error("Error de conexión al eliminar el docente.");
  }
};

export const activarDocente = async (idDocente) => {
  try {
    const response = await fetch(API_ENDPOINTS.ADMIN_DOCENTE_ACTIVAR(idDocente), {
      credentials: 'include',
      method: 'POST',
      headers: AuthService.getAuthHeaders(),
    });
    if (response.ok) return { success: true };
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.detail || `Error al activar docente (${response.status})`);
  } catch (error) {
    if (error.message) throw error;
    throw new Error('Error de conexion al activar el docente.');
  }
};

export const desactivarDocente = async (idDocente, razon = 'Desactivado por administrador') => {
  try {
    const url = `${API_ENDPOINTS.ADMIN_DOCENTES}/${idDocente}?reason=${encodeURIComponent(razon)}`;
    const response = await fetch(url, {
      credentials: 'include',
      method: 'DELETE',
      headers: AuthService.getAuthHeaders(),
    });
    if (response.ok) return { success: true };
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.detail || `Error al desactivar docente (${response.status})`);
  } catch (error) {
    if (error.message) throw error;
    throw new Error('Error de conexion al desactivar el docente.');
  }
};

export const filtrarDocentesPorEstado = (estado, docentes) => {
  if (!Array.isArray(docentes)) return [];
  if (estado === 'todos' || !estado) return docentes;

  const queremosActivos = estado === 'activo';
  return docentes.filter(d => {
    const activo = d?.usuario?.activo ?? d?.activo ?? false;
    return Boolean(activo) === queremosActivos;
  });
};

export const filtrarDocentes = (docentes, searchTerm) => {
  if (!Array.isArray(docentes)) {
    return [];
  }
  
  if (!searchTerm) return docentes;

  const termino = searchTerm.toLowerCase();
  return docentes.filter(docente => {
    try {
      const nombreCompleto = docente?.usuario?.nombre_completo?.toLowerCase() || "";
      const identificacion = docente?.usuario?.identificacion?.toLowerCase() || "";
      const correo = docente?.usuario?.correo?.toLowerCase() || "";
      const programme = docente?.docente?.codigo_programa?.toLowerCase() || docente?.codigo_programa?.toLowerCase() || '';

      return (
        nombreCompleto.includes(termino) ||
        identificacion.includes(termino) ||
        correo.includes(termino) ||
        programme.includes(termino)
      );
    } catch (error) {
      return false;
    }
  });
};

export const validarCorreoInstitucional = (correo) => {
  return correo.endsWith("@unicesar.edu.co");
};

export const validarTelefono = (telefono) => {
  return /^3\d{9}$/.test(telefono);
};

export const formatearDatosDocente = (formData) => {
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
    fecha_nacimiento: datosConIds.fechaNacimiento,
    id_tipo_via: datosConIds.tipoVia || 2,
    numero_via: datosConIds.numeroVia || "0",
    numero_cruce: datosConIds.numeroCruce || "0",
    numero_placa: datosConIds.numeroPlaca || "0",
    complemento: datosConIds.complemento || null,
    codigo_municipio_residencia: datosConIds.codigoMunicipioResidencia || "08001",
    codigo_municipio_nacimiento: datosConIds.codigoMunicipioNacimiento || "08001",
    codigo_pais_nacimiento: datosConIds.codigoPaisNacimiento || "COL",
    codigo_pais_nacionalidad: datosConIds.codigoPaisNacionalidad || "COL",
    telefono: datosConIds.telefono || null,
    correo: datosConIds.correo,
    activo: true,
    contrasena: datosConIds.contrasena || datosConIds.contraseña,
    categoria_docente: datosConIds.categoriaDocente,
    codigo_programa: datosConIds.codigoPrograma || ""
  };
};