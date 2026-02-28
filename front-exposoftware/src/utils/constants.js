// Siempre usa rutas relativas: en dev el proxy de Vite las redirige, en producción el proxy de Netlify (_redirects)
export const API_BASE_URL = '';

// Endpoints de la API
export const API_ENDPOINTS = {
  // Autenticación - Login universal para todos los roles
  LOGIN: `${API_BASE_URL}/api/v1/auth/login`,
  AUTH_ME: `${API_BASE_URL}/api/v1/auth/me`,
  AUTH_REFRESH: `${API_BASE_URL}/api/v1/auth/refresh`,
  AUTH_LOGOUT: `${API_BASE_URL}/api/v1/auth/logout`,
  
  // Registro público
  REGISTRO_ESTUDIANTE: `${API_BASE_URL}/api/v1/estudiantes/registro`,
  REGISTRO_EGRESADO: `${API_BASE_URL}/api/v1/egresados`, // ✅ Corregido: POST sin /registro
  REGISTRO_INVITADO: `${API_BASE_URL}/api/v1/invitados`, // ✅ Corregido: POST sin /registro
  
  // Usuarios
  USUARIOS: `${API_BASE_URL}/api/v1/usuarios`,
  USUARIO_BY_ID: (id) => `${API_BASE_URL}/api/v1/usuarios/${id}`,
  
  // Materias
  MATERIAS: `${API_BASE_URL}/api/v1/admin/materias`,
  MATERIA_BY_ID: (id) => `${API_BASE_URL}/api/v1/admin/materias/${id}`,
  
  // Grupos
  GRUPOS: `${API_BASE_URL}/api/v1/admin/grupos`,
  GRUPO_BY_ID: (id) => `${API_BASE_URL}/api/v1/admin/grupos/${id}`,
  
  // Docentes/Profesores
  DOCENTES: `${API_BASE_URL}/api/v1/docentes`,
  PROFESORES: `${API_BASE_URL}/api/v1/admin/profesores`,
  DOCENTE_BY_ID: (id) => `${API_BASE_URL}/api/v1/docentes/${id}`,
  PROFESOR_BY_ID: (id) => `${API_BASE_URL}/api/v1/admin/profesores/${id}`,
  
  // Asignaciones Docente-Materia (para asociar grupos con materias)
  ASIGNACIONES_DOCENTE: `${API_BASE_URL}/api/v1/admin/asignaciones-docentes`,
  ASIGNACION_BY_ID: (id) => `${API_BASE_URL}/api/v1/admin/asignaciones-docentes/${id}`,
  
  // Estudiantes (Público)
  ESTUDIANTES: `${API_BASE_URL}/api/v1/estudiantes`,
  ESTUDIANTE_BY_ID: (id) => `${API_BASE_URL}/api/v1/estudiantes/${id}`,
  MI_PERFIL_ESTUDIANTE: `${API_BASE_URL}/api/v1/estudiantes/mi-perfil`,
  
  // Estudiantes (Admin) - Gestión administrativa
  ADMIN_ESTUDIANTES: `${API_BASE_URL}/api/v1/admin/estudiantes`,
  ADMIN_ESTUDIANTE_BY_ID: (id) => `${API_BASE_URL}/api/v1/admin/estudiantes/${id}`,
  ADMIN_ESTUDIANTE_COMPLETO: (id) => `${API_BASE_URL}/api/v1/admin/estudiantes/${id}/completo`,
  ADMIN_ESTUDIANTE_ACTIVAR: (id) => `${API_BASE_URL}/api/v1/admin/estudiantes/${id}/activar`,
  ADMIN_ESTUDIANTE_DESACTIVAR: (id) => `${API_BASE_URL}/api/v1/admin/estudiantes/${id}/desactivar`,
  ADMIN_ESTUDIANTES_POR_PROGRAMA: (codigoPrograma) => `${API_BASE_URL}/api/v1/admin/estudiantes/programa/${codigoPrograma}`,
  ADMIN_ESTUDIANTE_ASIGNAR_EXISTENTE: `${API_BASE_URL}/api/v1/admin/estudiantes/asignar-existente`,
  
  // Asistencias
  GENERAR_QR_EVENTO: (idEvento) => `${API_BASE_URL}/api/v1/asistencia/generar-qr/${idEvento}`,
  REGISTRAR_ASISTENCIA: (idEvento) => `${API_BASE_URL}/api/v1/asistencia/registrar/${idEvento}`,
  OBTENER_ASISTENCIAS_EVENTO: (idEvento) => `${API_BASE_URL}/api/v1/asistencia/evento/${idEvento}`,
  
  // Proyectos
  PROYECTOS: `${API_BASE_URL}/proyectos`,
  PROYECTO_BY_ID: (id) => `${API_BASE_URL}/proyectos/${id}`,
  
  // Líneas de Investigación
  LINEAS_INVESTIGACION: `${API_BASE_URL}/lineas-investigacion`,
  LINEA_BY_ID: (id) => `${API_BASE_URL}/lineas-investigacion/${id}`,
  
  // Sublíneas de Investigación
  SUBLINEAS_INVESTIGACION: `${API_BASE_URL}/sublineas-investigacion`,
  SUBLINEA_BY_ID: (id) => `${API_BASE_URL}/sublineas-investigacion/${id}`,
  
  // Áreas Temáticas
  AREAS_TEMATICAS: `${API_BASE_URL}/areas-tematicas`,
  AREA_BY_ID: (id) => `${API_BASE_URL}/areas-tematicas/${id}`,
  
  // Asistencias
  ASISTENCIAS: `${API_BASE_URL}/asistencias`,
  ASISTENCIA_BY_ID: (id) => `${API_BASE_URL}/asistencias/${id}`,
  
  // Eventos
  EVENTOS: `${API_BASE_URL}/eventos`,
  EVENTO_BY_ID: (id) => `${API_BASE_URL}/eventos/${id}`,

  // Facultades (Admin) - Gestión de facultades académicas
  FACULTADES: `${API_BASE_URL}/api/v1/admin/academico/facultades`,
  FACULTAD_BY_ID: (id) => `${API_BASE_URL}/api/v1/admin/academico/facultades/${id}`,
  
  // Facultades (Público) - Para registro sin autenticación
  FACULTADES_PUBLICO: `${API_BASE_URL}/api/v1/public-academico/facultades`,
  
  // Programas Académicos (Admin) - Asociados a Facultades
  PROGRAMAS_BY_FACULTAD: (facultadId) => `${API_BASE_URL}/api/v1/admin/academico/facultades/${facultadId}/programas`,
  PROGRAMA_BY_ID: (facultadId, codigoPrograma) => `${API_BASE_URL}/api/v1/admin/academico/facultades/${facultadId}/programas/${codigoPrograma}`,
  PROGRAMAS: `${API_BASE_URL}/api/v1/admin/academico/programas`, // Endpoint para listar todos los programas
  
  // Programas (Público) - Para registro sin autenticación
  PROGRAMAS_BY_FACULTAD_PUBLICO: (facultadId) => `${API_BASE_URL}/api/v1/public-academico/facultades/${facultadId}/programas`,
  PROGRAMAS_PUBLICO: `${API_BASE_URL}/api/v1/public-academico/programas`,
};

// Power BI Configuration
export const POWER_BI_CONFIG = {
  // URL del reporte de Power BI
  REPORT_URL: 'https://app.powerbi.com/groups/me/reports/7b4c14dc-cbf5-45dc-b61e-563a4c940115/465c14b0268e55932d6f?experience=power-bi',
  
  // IDs extraídos de la URL
  REPORT_ID: '7b4c14dc-cbf5-45dc-b61e-563a4c940115',
  PAGE_ID: '465c14b0268e55932d6f',
  
  // IDs de visuals específicos con URLs completas incluyendo bookmarks
  VISUALS: {
    CALIFICACIONES: {
      id: 'd8ce33b98a17ce9af097',
      url: 'https://app.powerbi.com/reportEmbed?reportId=7b4c14dc-cbf5-45dc-b61e-563a4c940115&autoAuth=true&ctid=e2bf1c48-1dae-47ba-9808-67da61e2588d&pageName=465c14b0268e55932d6f&filterPaneEnabled=false&navContentPaneEnabled=false&bookmarkGuid=7c373d80-61dc-4ca4-a4e8-9636bf0bbaef'
    },
    DOCENTES_CATEGORIA: {
      id: '9ce531d154f2e5e372c9',
      url: 'https://app.powerbi.com/reportEmbed?reportId=7b4c14dc-cbf5-45dc-b61e-563a4c940115&autoAuth=true&ctid=e2bf1c48-1dae-47ba-9808-67da61e2588d&pageName=465c14b0268e55932d6f&filterPaneEnabled=false&navContentPaneEnabled=false&bookmarkGuid=445d18bf-9e02-4396-a0d9-64bf2b3470c9'
    }
  },
  
  // URL para embed (iframe) con autenticación automática
  EMBED_URL: 'https://app.powerbi.com/reportEmbed?reportId=7b4c14dc-cbf5-45dc-b61e-563a4c940115&autoAuth=true&ctid=e2bf1c48-1dae-47ba-9808-67da61e2588d',
  
  // Si tienes un workspace específico, ponlo aquí
  WORKSPACE_ID: null, // Cambiar si conoces el workspace ID
  
  // Configuración para iframe
  EMBED_CONFIG: {
    navContentPaneEnabled: false,  // Ocultar navegación
    filterPaneEnabled: false,      // Ocultar filtros
    hideErrors: true,              // Ocultar errores
    autoAuth: false                // No intentar auth automática
  }
};
