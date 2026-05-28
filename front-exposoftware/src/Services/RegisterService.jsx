import { API_ENDPOINTS } from "../utils/constants";

/**
 * Servicio para el registro de usuarios
 * Endpoints públicos - NO requieren autenticación
 */

// Quitar tildes para el backend
const sanitizar = (str) =>
  (str || "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ñ/gi, "n").replace(/Ñ/g, "N");

// Mapas de IDs del catálogo del backend
const TIPO_DOC_IDS = { CC: 1, TI: 2, CE: 3, PTE: 4, PAS: 5 };
const GENERO_IDS   = { Hombre: 1, Mujer: 2, Otro: 3 };
const TIPO_VIA_IDS = { CL: 1, CR: 2, AV: 3, DG: 4, TV: 5, CIR: 6 };

// Parsear dirección colombiana "Calle 10 #15-30" en campos separados
const parsearDireccion = (direccion = "") => {
  const d = sanitizar(direccion).trim();
  const tipoMap = [
    [/^(calle|cl\.?)\s*/i,       "CL"],
    [/^(carrera|cra?\.?)\s*/i,   "CR"],
    [/^(avenida|av\.?)\s*/i,     "AV"],
    [/^(diagonal|dg\.?)\s*/i,    "DG"],
    [/^(transversal|tv\.?)\s*/i, "TV"],
    [/^(circular|cir\.?)\s*/i,   "CIR"],
  ];
  let tipoCod = "CL", resto = d;
  for (const [re, cod] of tipoMap) {
    if (re.test(d)) { tipoCod = cod; resto = d.replace(re, "").trim(); break; }
  }
  const idTipoVia = TIPO_VIA_IDS[tipoCod] || 1;
  const m = resto.match(/^(\d+[A-Za-z]?)\s*#\s*(\d+[A-Za-z]?)\s*-\s*(\d+[A-Za-z]?)/i);
  if (m) return { id_tipo_via: idTipoVia, numero_via: m[1], numero_cruce: m[2], numero_placa: m[3] };
  const nums = resto.match(/\d+[A-Za-z]?/gi) || ["0", "0", "0"];
  return { id_tipo_via: idTipoVia, numero_via: nums[0] || "0", numero_cruce: nums[1] || "0", numero_placa: nums[2] || "0" };
};

// Buscar ID de identidad sexual en el catálogo del backend
const getIdIdentidadSexual = async (orientacion) => {
  if (!orientacion) return null;
  try {
    const resp = await fetch(API_ENDPOINTS.CATALOGOS_IDENTIDADES_SEXUALES);
    if (!resp.ok) return null;
    const catalogo = await resp.json();
    const arr = Array.isArray(catalogo) ? catalogo : (catalogo.data || []);
    const found = arr.find(
      (i) => (i.nombre || i.name || "").toLowerCase() === orientacion.toLowerCase()
    );
    return found ? (found.id ?? found.codigo ?? null) : null;
  } catch {
    return null;
  }
};

// Manejar respuestas de error consistentemente
const handleErrorResponse = async (response) => {
  if (response.status === 400) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.detail || "Datos incorrectos");
  } else if (response.status === 409) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.detail || "El usuario ya existe");
  } else if (response.status === 422) {
    const errorData = await response.json().catch(() => ({}));
    console.error("❌ Error de validación (422):", JSON.stringify(errorData, null, 2));
    const errorList = errorData.errors || errorData.detail || [];
    if (Array.isArray(errorList) && errorList.length > 0) {
      const errorMessages = errorList
        .map((err) => {
          const campo = err.field || (err.loc ? err.loc.join(" > ") : "Desconocido");
          const mensaje = err.message || err.msg || "Error de validación";
          return `• Campo: ${campo}\n  ${mensaje}`;
        })
        .join("\n\n");
      throw new Error("Errores de validación:\n\n" + errorMessages);
    }
    throw new Error(errorData.message || "Datos no válidos");
  } else {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.detail || "Error al registrar");
  }
};

/**
 * Registrar un nuevo ESTUDIANTE
 */
export const registrarEstudiante = async (studentData) => {
  const dir = parsearDireccion(studentData.direccionResidencia);
  const idIdentidadSexual = await getIdIdentidadSexual(studentData.orientacionSexual);
  const idTipoDoc = TIPO_DOC_IDS[studentData.tipoDocumento] ?? null;
  const idGenero  = GENERO_IDS[studentData.genero] ?? null;

  const payload = {
    usuario: {
      id_tipo_doc:               idTipoDoc,
      identificacion:            studentData.numeroDocumento,
      p_nombre:                  sanitizar(studentData.primerNombre),
      s_nombre:                  studentData.segundoNombre ? sanitizar(studentData.segundoNombre) : null,
      p_apellido:                sanitizar(studentData.primerApellido),
      s_apellido:                studentData.segundoApellido ? sanitizar(studentData.segundoApellido) : null,
      id_genero:                 idGenero,
      id_identidad_sexual:       idIdentidadSexual,
      fecha_nacimiento:          studentData.fechaNacimiento,
      telefono:                  studentData.telefono,
      correo:                    studentData.correo,
      contrasena:                sanitizar(studentData.contraseña),
      id_tipo_via:               dir.id_tipo_via,
      numero_via:                dir.numero_via,
      numero_cruce:              dir.numero_cruce,
      numero_placa:              dir.numero_placa,
      codigo_municipio_residencia:  studentData.ciudadResidencia,
      codigo_municipio_nacimiento:  studentData.ciudadResidencia,
      codigo_pais_nacimiento:       studentData.paisNacimiento,
      codigo_pais_nacionalidad:     studentData.nacionalidad,
    },
    perfil: {
      codigo_programa: studentData.programa || "5095",
      semestre:        parseInt(studentData.semestre),
      periodo:         String(studentData.periodo),
      anio_ingreso:    parseInt(studentData.fechaIngreso),
    },
  };


  try {
    const response = await fetch(API_ENDPOINTS.REGISTRO_ESTUDIANTE, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });
    if (response.status === 201 || response.ok) {
      const data = await response.json();
      return { success: true, data, message: data.message || "Registro exitoso" };
    } else {
      await handleErrorResponse(response);
    }
  } catch (error) {
    if (error.message) throw error;
    throw new Error("Error de conexión. Verifique su conexión a internet.");
  }
};

/**
 * Registrar un nuevo EGRESADO
 */
export const registrarEgresado = async (graduateData) => {
  const dir = parsearDireccion(graduateData.direccionResidencia);
  const idIdentidadSexual = await getIdIdentidadSexual(graduateData.orientacionSexual);
  const idTipoDoc = TIPO_DOC_IDS[graduateData.tipoDocumento] ?? null;
  const idGenero  = GENERO_IDS[graduateData.genero] ?? null;

  const payload = {
    usuario: {
      id_tipo_doc:               idTipoDoc,
      identificacion:            graduateData.numeroDocumento,
      p_nombre:                  sanitizar(graduateData.primerNombre),
      s_nombre:                  graduateData.segundoNombre ? sanitizar(graduateData.segundoNombre) : null,
      p_apellido:                sanitizar(graduateData.primerApellido),
      s_apellido:                graduateData.segundoApellido ? sanitizar(graduateData.segundoApellido) : null,
      id_genero:                 idGenero,
      id_identidad_sexual:       idIdentidadSexual,
      fecha_nacimiento:          graduateData.fechaNacimiento,
      telefono:                  graduateData.telefono,
      correo:                    graduateData.correo,
      contrasena:                sanitizar(graduateData.contraseña),
      id_tipo_via:               dir.id_tipo_via,
      numero_via:                dir.numero_via,
      numero_cruce:              dir.numero_cruce,
      numero_placa:              dir.numero_placa,
      codigo_municipio_residencia:  graduateData.ciudadResidencia,
      codigo_municipio_nacimiento:  graduateData.ciudadResidencia,
      codigo_pais_nacimiento:       graduateData.paisNacimiento,
      codigo_pais_nacionalidad:     graduateData.nacionalidad,
    },
    perfil: {
      codigo_programa:    graduateData.programa || "5095",
      titulado:           graduateData.titulado === "true" || graduateData.titulado === true,
      titulo_obtenido:    graduateData.tituloObtenido || null,
      anio_graduacion:    graduateData.fechaFinalizacion ? parseInt(graduateData.fechaFinalizacion) : null,
      periodo_graduacion: graduateData.periodo ? String(graduateData.periodo) : null,
    },
  };


  try {
    const response = await fetch(API_ENDPOINTS.REGISTRO_EGRESADO, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });
    if (response.status === 201 || response.ok) {
      const data = await response.json();
      return { success: true, data, message: data.message || "Registro exitoso" };
    } else {
      await handleErrorResponse(response);
    }
  } catch (error) {
    if (error.message) throw error;
    throw new Error("Error de conexión. Verifique su conexión a internet.");
  }
};

/**
 * Registrar un nuevo INVITADO
 */
export const registrarInvitado = async (guestData) => {
  const dir = parsearDireccion(guestData.direccionResidencia);
  const idIdentidadSexual = await getIdIdentidadSexual(guestData.orientacionSexual);
  const idTipoDoc = TIPO_DOC_IDS[guestData.tipoDocumento] ?? null;
  const idGenero  = GENERO_IDS[guestData.genero] ?? null;

  const payload = {
    usuario: {
      id_tipo_doc:               idTipoDoc,
      identificacion:            guestData.numeroDocumento,
      p_nombre:                  sanitizar(guestData.primerNombre),
      s_nombre:                  guestData.segundoNombre ? sanitizar(guestData.segundoNombre) : null,
      p_apellido:                sanitizar(guestData.primerApellido),
      s_apellido:                guestData.segundoApellido ? sanitizar(guestData.segundoApellido) : null,
      id_genero:                 idGenero,
      id_identidad_sexual:       idIdentidadSexual,
      fecha_nacimiento:          guestData.fechaNacimiento,
      telefono:                  guestData.telefono,
      correo:                    guestData.correo,
      contrasena:                sanitizar(guestData.contraseña),
      id_tipo_via:               dir.id_tipo_via,
      numero_via:                dir.numero_via,
      numero_cruce:              dir.numero_cruce,
      numero_placa:              dir.numero_placa,
      codigo_municipio_residencia:  guestData.ciudadResidencia,
      codigo_municipio_nacimiento:  guestData.ciudadResidencia,
      codigo_pais_nacimiento:       guestData.paisNacimiento,
      codigo_pais_nacionalidad:     guestData.nacionalidad,
    },
    perfil: {
      sector:          guestData.sector || null,
      nombre_empresa:  guestData.nombreEmpresa || null,
      institucion:     guestData.intitucionOrigen || null,
    },
  };


  try {
    const response = await fetch(API_ENDPOINTS.REGISTRO_INVITADO, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });
    if (response.status === 201 || response.ok) {
      const data = await response.json();
      return { success: true, data, message: data.message || "Registro exitoso" };
    } else {
      await handleErrorResponse(response);
    }
  } catch (error) {
    if (error.message) throw error;
    throw new Error("Error de conexión. Verifique su conexión a internet.");
  }
};

/**
 * Validar datos del formulario - ESTUDIANTE
 */
export const validarDatosEstudiante = (formData) => {
  const errores = [];
  if (!formData.primerNombre?.trim()) errores.push("El primer nombre es requerido");
  if (!formData.primerApellido?.trim()) errores.push("El primer apellido es requerido");
  if (!formData.correo?.trim()) errores.push("El correo es requerido");
  if (!formData.contraseña?.trim()) errores.push("La contraseña es requerida");
  if (!formData.tipoDocumento) errores.push("El tipo de documento es requerido");
  if (!formData.numeroDocumento?.trim()) errores.push("El número de documento es requerido");
  if (!formData.semestre) errores.push("El semestre es requerido");
  return { valido: errores.length === 0, errores };
};
