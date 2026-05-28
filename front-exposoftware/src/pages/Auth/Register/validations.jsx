/**
 * Valida un campo individual del formulario
 */
export const validateField = (name, value, formData = {}, rol = "") => {
  let error = "";

  // Si viene de react-select, tomamos el value real
  const val = typeof value === "object" && value !== null ? value.value : value;

  // 💡 Lista de campos obligatorios
  const requiredFields = [
    "primerNombre",
    "primerApellido",
    "segundoApellido",
    "telefono",
    "genero",
    "orientacionSexual",
    "fechaNacimiento",
    "fechaIngreso",
    "fechaFinalizacion",
    "departamentoResidencia",
    "ciudadResidencia",
    "nacionalidad",
    "paisNacimiento",
    "direccionResidencia",
    "rol",
    "tipoDocumento",
    "numeroDocumento",
    "correo",
    "contraseña",
    "confirmarcontraseña",
    "programa",
    "semestre",
    "tipoDocente",
    "sector",
    "nombreEmpresa",
    "titulado",
    "periodo",
  ];

  // 🔥 CAMBIO CLAVE: Verificar si está vacío ANTES del switch
  const isEmpty = !val || String(val).trim() === "";

  // ⚙️ Validaciones específicas por campo
  switch (name) {
    case "primerNombre":
    case "segundoNombre":
    case "primerApellido":
    case "segundoApellido":
    case "intitucionOrigen":
      // Solo validar formato si hay valor
      if (!isEmpty) {
        // 🔹 Validar que NO contenga números
        if (/\d/.test(val)) {
          error = "No se permiten números en este campo.";
        } else if (!/^[a-zA-ZÁÉÍÓÚáéíóúñÑ\s]*$/.test(val)) {
          error = "Solo se permiten letras y espacios.";
        } else if (val.trim().length > 0 && val.trim().length < 3) {
          error = "Debe tener al menos 3 letras.";
        }
      }
      break;

case "direccionResidencia":
  if (!isEmpty) {
    // Expresión más flexible para direcciones colombianas
    const direccionRegex =
      /^(?=.*[A-Za-z])(?=.*\d)?[A-Za-z0-9áéíóúÁÉÍÓÚñÑ\s#.,-]{6,100}$/;

    if (!direccionRegex.test(val.trim())) {
      error =
        "Dirección inválida. Usa letras, números y separadores (ej: 'Calle 10 #15-30' o 'Vereda El Rosario Casa 12').";
    } else if (val.trim().length < 6) {
      error = "La dirección debe tener al menos 6 caracteres.";
    }
  }
  break;


    case "nombreEmpresa":
      if (!isEmpty && val.trim().length > 0 && val.trim().length < 3) {
        error = "Debe tener al menos 3 caracteres.";
      }
      break;

    case "telefono":
      if (!isEmpty) {
        const phoneStr = String(val || "");
        const digits = phoneStr.replace(/\D/g, "");
        
        const isColombia = digits.startsWith("57");
        
        if (isColombia) {
          const number = digits.slice(2);
          
          // Validar que comience con 3
          if (number.length > 0 && !number.startsWith("3")) {
            error = "El número colombiano debe comenzar con 3.";
          } else if (number.length > 0 && number.length !== 10) {
            error = "El número colombiano debe tener 10 dígitos.";
          }
        } else {
          if (digits.length < 8 || digits.length > 10) {
            error = "Debe tener entre 8 y 10 dígitos.";
          }
        }
      }
      break;

    case "numeroDocumento":
      if (!isEmpty) {
        const tipo = formData.tipoDocumento;

        // Validar que se haya seleccionado un tipo de documento
        if (!tipo) {
          error = "Primero selecciona el tipo de documento.";
          break;
        }

        // Rango alineado con el backend (Limits.IDENTIFICATION_MIN=6,
        // IDENTIFICATION_MAX=16). Cédulas colombianas viejas tienen 8 dígitos,
        // las nuevas 10 — por eso CC/TI van de 6 a 10.
        if (tipo === "CC" || tipo === "TI") {
          if (val.length < 6) {
            error = "Debe tener mínimo 6 dígitos.";
          } else if (val.length > 10) {
            error = "Máximo 10 dígitos.";
          }
        } else if (tipo === "CE" || tipo === "PTE" || tipo === "PAS") {
          if (val.length < 6) {
            error = "Debe tener mínimo 6 caracteres.";
          } else if (val.length > 16) {
            error = "Máximo 16 caracteres.";
          }
        }
      }
      break;

    case "correo":
      if (!isEmpty) {
        if (rol === "estudiante" || rol === "profesor" || rol === "egresado") {
          if (!/^[a-zA-Z0-9._%+-]+@unicesar\.edu\.co$/.test(val)) {
            error = "Debe ser correo institucional (@unicesar.edu.co)";
          }
        } else if (rol === "invitado") {
          if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val)) {
            error = "Correo inválido. Asegúrate de ingresar un correo válido.";
          }
        }
      }
      break;

    case "contraseña":
      if (!isEmpty) {
        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%?&#])[A-Za-z\d@$!%?&#]{8,}$/.test(val)) {
          error =
            "Debe tener 8+ caracteres, una mayúscula, una minúscula, un número y un carácter especial (@$!%*?&#).";
        }
      }
      break;

    case "confirmarcontraseña":
      if (!isEmpty) {
        if (val !== formData.contraseña) {
          error = "Las contraseñas no coinciden.";
        }
      }
      break;

    case "fechaNacimiento":
      if (!isEmpty && new Date(val) > new Date()) {
        error = "La fecha no puede ser futura.";
      }
      break;

    default:
      break;
  }

  if (!error && isEmpty && requiredFields.includes(name)) {
    error = "Este campo es obligatorio.";
  }

  return error;
};

/**
 * Valida todos los campos del formulario según el rol
 */
export const validateAllFields = (formData, rol) => {
  const errors = {};

  // Campos básicos comunes
  const basicFields = [
    "primerNombre",
    "intitucionOrigen",
    "primerApellido",
    "segundoApellido",
    "telefono",
    "genero",
    "orientacionSexual",
    "fechaNacimiento",
    "nacionalidad",
    "paisNacimiento",
    "direccionResidencia",
    "rol",
    "tipoDocumento",
    "numeroDocumento",
    "contraseña",
    "confirmarcontraseña",
  ];

  // Validar campos básicos
  basicFields.forEach((field) => {
    const error = validateField(field, formData[field], formData, rol);
    if (error) errors[field] = error;
  });

  // Validar campos de residencia según nacionalidad (COL = Colombia en ISO alpha-3)
  if (formData.nacionalidad === "COL") {
    ["departamentoResidencia", "ciudadResidencia"].forEach((field) => {
      const error = validateField(field, formData[field], formData, rol);
      if (error) errors[field] = error;
    });
  }

  // Dependiendo del rol, se agregan campos extra
  if (rol === "estudiante") {
    ["correo", "semestre", "fechaIngreso", "periodo"].forEach(
      (f) => {
        const err = validateField(f, formData[f], formData, rol);
        if (err) errors[f] = err;
      }
    );
  }

  if (rol === "invitado") {
    ["correo", "sector", "nombreEmpresa", "intitucionOrigen"].forEach((f) => {
      const err = validateField(f, formData[f], formData, rol);
      if (err) errors[f] = err;
    });
  }

  if (rol === "egresado") {
    ["correo", "titulado", "fechaFinalizacion", "periodo"].forEach((f) => {
      const err = validateField(f, formData[f], formData, rol);
      if (err) errors[f] = err;
    });
  }

  // OPCIONALES que SI SE VALIDAN si el usuario los llena
  ["segundoNombre"].forEach((field) => {
    if (formData[field] && formData[field].trim() !== "") {
      const error = validateField(field, formData[field], formData, rol);
      if (error) errors[field] = error;
    }
  });

  return errors;
};

/**
 * Verifica si un campo es numérico
 */
export const isNumericField = (fieldName) => {
  return ["numeroDocumento", "semestre"].includes(fieldName);
};

/**
 * Verifica si un campo es alfabético
 */
export const isAlphabeticField = (fieldName) => {
  return ["primerNombre", "segundoNombre", "primerApellido", "segundoApellido"].includes(fieldName);
};

/**
 * Verifica si hay errores en el objeto de errores
 */
export const hasErrors = (errors) => {
  return Object.values(errors).some((error) => error !== "");
};