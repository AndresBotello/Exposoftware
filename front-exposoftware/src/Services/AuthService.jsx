import { API_ENDPOINTS } from "../utils/constants";
import { fetchApi } from "../utils/apiClient";

const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  USER_ROLE: 'user_role',
  EXPIRES_AT: 'token_expires_at'
};

/**
 * Función auxiliar para procesar respuestas del backend
 */
const procesarRespuesta = async (response) => {
  const contentType = response.headers.get("content-type");
  let responseData = {};

  // Manejar errores de red/servidor antes de parsear
  if (response.status === 502 || response.status === 503 || response.status === 504) {
    throw new Error('El servidor no está disponible en este momento. Por favor, intenta más tarde.');
  }

  if (contentType && contentType.includes("application/json")) {
    try {
      responseData = await response.json();
    } catch (error) {

      // Si no podemos parsear el JSON, es probable que el servidor esté caído
      if (!response.ok) {
        const textResponse = await response.text();
        throw new Error(`Error del servidor (${response.status}): El servidor no respondió correctamente.`);
      }
    }
  } else {
    // Si no es JSON, intentar leer como texto para debugging
    const textResponse = await response.text();
    
    if (!response.ok) {
      throw new Error(`Error del servidor (${response.status}): ${textResponse.substring(0, 100)}`);
    }
  }

  if (response.ok) {
    return {
      success: true,
      data: responseData.data || responseData,
      message: responseData.message || 'Operación exitosa',
      code: responseData.code || 'SUCCESS'
    };
  }

  // Manejo mejorado de errores
  let errorMessage = responseData.message || `Error del servidor (${response.status})`;
  
  if (responseData.errors && Array.isArray(responseData.errors)) {
    const errorMessages = responseData.errors.map(err => 
      `${err.field}: ${err.message}`
    ).join('\n');
    errorMessage = errorMessages || errorMessage;
  }

  // Para 401, mostrar detalles específicos
  if (response.status === 401) {
    const backendMsg = responseData.message || '';
    const backendCode = responseData.code || '';
    // Detectar cuenta no verificada
    if (
      backendCode === 'ACCOUNT_NOT_VERIFIED' ||
      backendMsg.toLowerCase().includes('verif') ||
      backendMsg.toLowerCase().includes('confirm')
    ) {
      errorMessage = 'CUENTA_NO_VERIFICADA: ' + (backendMsg || 'Tu cuenta no ha sido verificada. Revisa tu correo.');
    } else {
      errorMessage = backendMsg || 'Credenciales inválidas. Verifica tu correo y contraseña.';
    }
  }

  throw new Error(errorMessage);
};

/**
 * Extraer información del JWT (sin verificar firma)
 * SOLO para desarrollo - en producción esto debe hacerse en el backend
 */
const extraerInfoJWT = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

/**
 * Obtener datos del usuario autenticado desde el endpoint /auth/me
 * @param {string} token - Token de autenticación (si está disponible)
 * @returns {Promise<Object>} Datos del usuario
 */
const fetchUserData = async (token) => {

  try {
    const headers = {
      'Accept': 'application/json'
    };

    // Si tenemos token, agregarlo al header
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetchApi(API_ENDPOINTS.AUTH_ME, {
      method: 'GET',
      headers: headers
    });


    const resultado = await procesarRespuesta(response);
    
    if (resultado.success) {
      return resultado.data;
    }
    
    throw new Error('No se pudieron obtener los datos del usuario');
  } catch (error) {
    throw error;
  }
};

/**
 * Login Universal para todos los roles
 * El backend detecta automáticamente el rol del usuario según el correo y contraseña
 * @param {Object} credentials - Credenciales de acceso
 * @param {string} credentials.correo - Correo electrónico
 * @param {string} credentials.password - Contraseña
 * @returns {Promise<Object>} Datos del usuario, token y rol detectado
 */
export const login = async (credentials) => {

  // Limpiar localStorage primero para remover token de invitado anterior
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER_DATA);
  localStorage.removeItem(STORAGE_KEYS.USER_ROLE);
  localStorage.removeItem(STORAGE_KEYS.EXPIRES_AT);

  const payload = {
    correo: credentials.correo,
    password: credentials.password
  };


  try {
    // PASO 1: Enviar credenciales
    const loginResponse = await fetchApi(API_ENDPOINTS.LOGIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    // Verificar si el login fue exitoso
    if (!loginResponse.ok) {
      const errorData = await loginResponse.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Error en login (${loginResponse.status})`
      );
    }


    // PASO 2: Obtener el token de la respuesta
    let token = null;

    // Primero intentar leer el body JSON (FastAPI devuelve { access_token, token_type })
    let loginResponseBody = null;
    try {
      loginResponseBody = await loginResponse.clone().json();
    } catch (e) {
    }

    if (loginResponseBody) {
      token = loginResponseBody.access_token
        || loginResponseBody.token
        || loginResponseBody.data?.access_token
        || loginResponseBody.data?.token
        || null;
    }

    // Fallback: buscar en Authorization header
    if (!token) {
      const authHeader = loginResponse.headers.get('Authorization');
      if (authHeader) {
        token = authHeader.replace('Bearer ', '');
      }
    }

    if (!token) {
    }

    // PASO 3: Obtener datos del usuario
    let userData;
    try {
      userData = await fetchUserData(token);
    } catch (error) {
      // Si no podemos obtener datos, usar un objeto mínimo
      userData = {
        correo: credentials.correo,
        rol: credentials.correo.includes('admin') ? 'admin' : 'user'
      };
    }
    
    // Guardar datos en localStorage
    if (userData) {
      

      // Extraer el rol - puede estar en varios lugares
      let rol = userData.rol || 
                userData.role || 
                userData.usuario?.rol ||
                userData.user?.rol ||
                userData.tipo_usuario || 
                userData.tipoUsuario ||
                userData.tipo ||
                userData.user_role ||
                userData.perfil ||
                'user';
      
      // Limpiar espacios y caracteres invisibles
      rol = String(rol).trim().replace(/\s+/g, ' ');
                  
      
      // Si no se detecta el rol pero el correo contiene "admin", asignar rol admin
      let rolFinal = rol;
      if ((rol === 'user' || rol === 'User') && credentials.correo.toLowerCase().includes('admin')) {
        rolFinal = 'Administrador';
      }
      
      
      // Guardar token si se obtuvo. Si NO se obtuvo (el backend hoy responde
      // solo con cookie HttpOnly), eliminamos el TOKEN viejo de localStorage
      // para evitar que `getAuthHeaders()` siga mandando un Bearer rancio
      // que el backend prioriza sobre la cookie nueva y rechaza con 401.
      if (token) {
        localStorage.setItem(STORAGE_KEYS.TOKEN, token);

        // Intentar extraer el nombre del JWT
        const jwtInfo = extraerInfoJWT(token);
        if (jwtInfo && jwtInfo.name) {
          userData.name = jwtInfo.name;
          userData.nombre_completo = jwtInfo.name;
        }
      } else {
        // No vino token en el body → backend usa solo cookie HttpOnly.
        // BORRAR el token viejo para que getAuthHeaders() NO mande Bearer
        // rancio (el backend prioriza Bearer sobre cookie y un Bearer
        // invalido tira 401 INVALID_TOKEN aunque la cookie sea valida).
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
      }

      // Guardar datos del usuario (ahora incluye el nombre si estaba en el JWT)
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));

      // Guardar rol normalizado (admin, docente, estudiante)
      const rolNormalizado = normalizarRol(rolFinal);
      localStorage.setItem(STORAGE_KEYS.USER_ROLE, rolNormalizado);
      
      // Guardar tiempo de expiración (24 horas por defecto)
      const expiresAt = Date.now() + (24 * 60 * 60 * 1000);
      localStorage.setItem(STORAGE_KEYS.EXPIRES_AT, expiresAt.toString());
      
    }
    
    return {
      success: true,
      data: userData,
      message: 'Login exitoso',
      code: 'SUCCESS'
    };
  } catch (error) {
    
    // Mejorar mensajes de error para el usuario
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('No se puede conectar con el servidor. Verifica tu conexión a internet.');
    }
    
    throw error;
  }
};

/**
 * Login como Invitado - Acceso sin credenciales
 * Crea una sesión temporal para usuario invitado que puede ver proyectos públicos
 * @returns {Promise<Object>} Datos del usuario invitado, token y rol
 */
export const loginAsGuest = async () => {
  
  try {
    // Generar ID único para invitado
    const guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();
    
    // Crear datos del usuario invitado
    const guestData = {
      id: guestId,
      correo: `invitado@temporal.local`,
      nombre: 'Invitado',
      primer_nombre: 'Invitado',
      apellido: 'Usuario',
      primer_apellido: 'Usuario',
      rol: 'invitado',
      tipo_usuario: 'invitado',
      estado: 'activo',
      fecha_creacion: timestamp,
      es_invitado: true
    };
    
    // Token simple para invitado (puede ser enhebrado con datos del usuario)
    const token = `guest_${guestId}_token`;

    // Guardar en sessionStorage en lugar de localStorage para no interferir con autenticación real
    sessionStorage.setItem(STORAGE_KEYS.TOKEN, token);
    sessionStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(guestData));
    sessionStorage.setItem(STORAGE_KEYS.USER_ROLE, 'invitado');

    // Guardar tiempo de expiración (24 horas)
    const expiresAt = Date.now() + (24 * 60 * 60 * 1000);
    sessionStorage.setItem(STORAGE_KEYS.EXPIRES_AT, expiresAt.toString());

    // IMPORTANTE: No guardar en localStorage para no interferir con login real
    
    
    return {
      success: true,
      data: guestData,
      token: token,
      message: 'Login como invitado exitoso',
      code: 'GUEST_LOGIN_SUCCESS'
    };
  } catch (error) {
    throw new Error(`Error al iniciar sesión como invitado: ${error.message}`);
  }
};

/**
 * Normalizar rol del usuario para consistencia interna
 * @param {string} rol - Rol recibido del backend
 * @returns {string} Rol normalizado: 'admin', 'docente', 'estudiante'
 */
const normalizarRol = (rol) => {
  if (!rol) {
    return 'user';
  }
  
  const rolOriginal = String(rol);
  const rolLower = rolOriginal.toLowerCase().trim();
  
  // Administrador
  if (rolLower.includes('admin') || 
      rolLower.includes('administrador') || 
      rolLower === 'administrativo') {
    return 'admin';
  }
  
  // Docente/Profesor
  if (rolLower.includes('docente') || 
      rolLower.includes('profesor') || 
      rolLower.includes('teacher')) {
    return 'docente';
  }
  
  // Estudiante (la palabra "estudiante" en español)
  if (rolLower.includes('estudiante') ||
      rolLower.includes('alumno') ||
      rolLower.includes('student')) {
    return 'estudiante';
  }
  
  // Egresado
  if (rolLower.includes('egresado') || 
      rolLower.includes('graduate')) {
    return 'egresado';
  }
  
  // Invitado
  if (rolLower.includes('invitado') ||
      rolLower.includes('guest')) {
    return 'invitado';
  }

  // User genérico
  if (rolLower === 'user') {
    return 'user';
  }

  return rolLower; // Retornar como está si no coincide
};

/**
 * Login de Administrador (DEPRECATED - usar login())
 * @deprecated Usar login() en su lugar
 */
export const loginAdmin = async (credentials) => {
  return await login(credentials);
};

/**
 * Login de Estudiante (DEPRECATED - usar login())
 * @deprecated Usar login() en su lugar
 */
export const loginEstudiante = async (credentials) => {
  return await login(credentials);
};

/**
 * Login de Docente (DEPRECATED - usar login())
 * @deprecated Usar login() en su lugar
 */
export const loginDocente = async (credentials) => {
  return await login(credentials);
};

/**
 * Cerrar sesión en el backend y limpiar localStorage
 */
export const logout = async () => {

  const token = getToken();

  // Intentar cerrar sesión en el backend siempre (con o sin token)
  // Para eliminar las cookies de sesión
  try {
    const response = await fetchApi(API_ENDPOINTS.AUTH_LOGOUT, {
      method: 'POST',
      headers: getAuthHeaders()
    });

    if (response.ok) {
    } else {
    }
  } catch (error) {
    // Continuar con la limpieza incluso si hay error
  }

  // Limpiar localStorage siempre
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER_DATA);
  localStorage.removeItem(STORAGE_KEYS.USER_ROLE);
  localStorage.removeItem(STORAGE_KEYS.EXPIRES_AT);

  // También limpiar sessionStorage por si acaso
  sessionStorage.clear();

};

/**
 * Obtener información del usuario actual desde el backend
 * @returns {Promise<Object>} Datos actualizados del usuario
 */
export const getCurrentUserInfo = async () => {

  try {
    const response = await fetchApi(API_ENDPOINTS.AUTH_ME, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    const resultado = await procesarRespuesta(response);

    // Actualizar datos en localStorage
    if (resultado.success && resultado.data) {
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(resultado.data));
    }
    
    return resultado;
  } catch (error) {
    throw error;
  }
};

/**
 * Refrescar el token de acceso
 * @returns {Promise<Object>} Nuevo token
 */
export const refreshToken = async () => {

  try {
    const response = await fetchApi(API_ENDPOINTS.AUTH_REFRESH, {
      method: 'POST',
      headers: getAuthHeaders()
    });

    const resultado = await procesarRespuesta(response);

    // Actualizar token en localStorage
    if (resultado.success && resultado.data) {
      const newToken = resultado.data.token || resultado.data.access_token;
      if (newToken) {
        localStorage.setItem(STORAGE_KEYS.TOKEN, newToken);

        // Actualizar tiempo de expiración
        const expiresAt = Date.now() + (24 * 60 * 60 * 1000);
        localStorage.setItem(STORAGE_KEYS.EXPIRES_AT, expiresAt.toString());

      }
    }

    return resultado;
  } catch (error) {
    // Solo cerrar sesión si es error 401 (credenciales inválidas/expiradas)
    if (error.message && error.message.includes('401')) {
      console.warn('⚠️ Token expirado o inválido, cerrando sesión...');
      logout();
    } else {
      // Para otros errores (error de red, servidor caído, etc), solo loguear
      console.warn('⚠️ Error en refresh token:', error.message);
      console.warn('   La sesión se mantendrá. Próximo intento en 20 minutos.');
    }
    throw error;
  }
};

/**
 * Verificar si el usuario está autenticado
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  // Primero buscar en localStorage (autenticación real)
  let expiresAt = localStorage.getItem(STORAGE_KEYS.EXPIRES_AT);

  // Si no hay en localStorage, buscar en sessionStorage (invitado)
  if (!expiresAt) {
    expiresAt = sessionStorage.getItem(STORAGE_KEYS.EXPIRES_AT);
  }

  if (!expiresAt) {
    return false;
  }

  if (Date.now() > parseInt(expiresAt)) {
    logout();
    return false;
  }

  // Verificar que hay datos de usuario (sesión válida, con o sin token JWT local)
  let userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);

  // Si no hay en localStorage, buscar en sessionStorage (invitado)
  if (!userData) {
    userData = sessionStorage.getItem(STORAGE_KEYS.USER_DATA);
  }

  return !!userData;
};

/**
 * Obtener token actual
 * @returns {string|null}
 */
export const getToken = () => {
  // Primero buscar en localStorage (autenticación real)
  let token = localStorage.getItem(STORAGE_KEYS.TOKEN);

  // Si no hay en localStorage, buscar en sessionStorage (invitado)
  if (!token) {
    token = sessionStorage.getItem(STORAGE_KEYS.TOKEN);
  }

  return token;
};

/**
 * Obtener datos del usuario actual
 * @returns {Object|null}
 */
export const getUserData = () => {
  // Primero buscar en localStorage (autenticación real)
  let userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);

  // Si no hay en localStorage, buscar en sessionStorage (invitado)
  if (!userData) {
    userData = sessionStorage.getItem(STORAGE_KEYS.USER_DATA);
  }

  if (!userData) return null;

  try {
    return JSON.parse(userData);
  } catch (error) {
    return null;
  }
};

/**
 * Obtener rol del usuario actual
 * @returns {string|null} 'admin' | 'estudiante' | 'docente' | 'invitado'
 */
export const getUserRole = () => {
  // Primero buscar en localStorage (autenticación real)
  let role = localStorage.getItem(STORAGE_KEYS.USER_ROLE);

  // Si no hay en localStorage, buscar en sessionStorage (invitado)
  if (!role) {
    role = sessionStorage.getItem(STORAGE_KEYS.USER_ROLE);
  }

  return role;
};

/**
 * Verificar si el usuario es administrador
 * @returns {boolean}
 */
export const isAdmin = () => {
  return getUserRole() === 'admin' && isAuthenticated();
};

/**
 * Verificar si el usuario es estudiante
 * @returns {boolean}
 */
export const isEstudiante = () => {
  return getUserRole() === 'estudiante' && isAuthenticated();
};

/**
 * Verificar si el usuario es docente
 * @returns {boolean}
 */
export const isDocente = () => {
  return getUserRole() === 'docente' && isAuthenticated();
};

/**
 * Obtener headers con autorización para peticiones
 * @returns {Object} Headers con token
 */
export const getAuthHeaders = () => {
  const token = getToken();
  
  if (!token) {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }
  
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

/**
 * Validar formato de correo
 * @param {string} correo
 * @returns {boolean}
 */
export const validarCorreo = (correo) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(correo);
};

/**
 * Validar formato de contraseña
 * @param {string} password
 * @returns {Object} { valido: boolean, errores: Array }
 */
export const validarPassword = (password) => {
  const errores = [];

  if (password.length < 8) {
    errores.push('La contraseña debe tener al menos 8 caracteres');
  }

  if (!/[A-Z]/.test(password)) {
    errores.push('Debe contener al menos una mayúscula');
  }

  if (!/[a-z]/.test(password)) {
    errores.push('Debe contener al menos una minúscula');
  }

  if (!/[0-9]/.test(password)) {
    errores.push('Debe contener al menos un número');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errores.push('Debe contener al menos un carácter especial');
  }

  return {
    valido: errores.length === 0,
    errores
  };
};

/**
 * Exportar fetchApi para uso en otros servicios
 */
export { fetchApi };
