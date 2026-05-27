// Detectar el ambiente y configurar la URL de la API
const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
const isDevelopment = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('localhost');
export const API_BASE_URL = isDevelopment ? '' : 'https://exposoftware.duckdns.org';


// ============================================================
// ENDPOINTS DE LA API v1 - Basado en OpenAPI
// ============================================================
export const API_ENDPOINTS = {
  
  // ═══════════════════════════════════════════════════════════
  // 🔐 AUTENTICACIÓN - /api/v1/auth/...
  // ═══════════════════════════════════════════════════════════
  LOGIN: `${API_BASE_URL}/api/v1/auth/login`,
  AUTH_LOGOUT: `${API_BASE_URL}/api/v1/auth/logout`,
  AUTH_LOGOUT_ALL: `${API_BASE_URL}/api/v1/auth/logout/all`,
  AUTH_ME: `${API_BASE_URL}/api/v1/auth/me`,
  AUTH_REFRESH: `${API_BASE_URL}/api/v1/auth/refresh`,
  AUTH_VERIFICAR_CUENTA: `${API_BASE_URL}/api/v1/auth/verificar-cuenta`,
  AUTH_REENVIAR_VERIFICACION: `${API_BASE_URL}/api/v1/auth/reenviar-verificacion`,
  
  // ═══════════════════════════════════════════════════════════
  // 📚 CATÁLOGOS - /api/v1/catalogos/...
  // ═══════════════════════════════════════════════════════════
  CATALOGOS_TIPOS_DOCUMENTO: `${API_BASE_URL}/api/v1/catalogos/tipos-documento`,
  CATALOGOS_GENEROS: `${API_BASE_URL}/api/v1/catalogos/generos`,
  CATALOGOS_IDENTIDADES_SEXUALES: `${API_BASE_URL}/api/v1/catalogos/identidades-sexuales`,
  CATALOGOS_TIPOS_VIA: `${API_BASE_URL}/api/v1/catalogos/tipos-via`,
  CATALOGOS_CICLOS_SEMESTRALES: `${API_BASE_URL}/api/v1/catalogos/ciclos-semestrales`,
  CATALOGOS_TIPOS_ACTIVIDAD: `${API_BASE_URL}/api/v1/catalogos/tipos-actividad`,
  CATALOGOS_PAISES: `${API_BASE_URL}/api/v1/catalogos/paises`,
  CATALOGOS_DEPARTAMENTOS: `${API_BASE_URL}/api/v1/catalogos/departamentos`,
  CATALOGOS_PAISES_DEPARTAMENTOS: (codigoPais) => `${API_BASE_URL}/api/v1/catalogos/paises/${codigoPais}/departamentos`,
  CATALOGOS_MUNICIPIOS: (codigoDepartamento) => `${API_BASE_URL}/api/v1/catalogos/departamentos/${codigoDepartamento}/municipios`,
  
  // ═══════════════════════════════════════════════════════════
  // 🏫 ACADÉMICO - Facultades, Programas, Materias
  // ═══════════════════════════════════════════════════════════
  
  // Facultades (Admin)
  ADMIN_FACULTADES: `${API_BASE_URL}/api/v1/admin/academico/facultades`,
  ADMIN_FACULTAD_BY_ID: (facultyId) => `${API_BASE_URL}/api/v1/admin/academico/facultades/${facultyId}`,
  
  // Facultades (Público)
  PUBLIC_FACULTADES: `${API_BASE_URL}/api/v1/public-academico/facultades`,
  PUBLIC_FACULTAD_BY_ID: (facultyId) => `${API_BASE_URL}/api/v1/public-academico/facultades/${facultyId}`,
  PUBLIC_ARBOL_COMPLETO_ACADEMICO: `${API_BASE_URL}/api/v1/public-academico/arbol-completo`,
  
  // Programas (Admin)
  ADMIN_PROGRAMAS_BY_FACULTAD: (facultyId) => `${API_BASE_URL}/api/v1/admin/academico/facultades/${facultyId}/programas`,
  ADMIN_PROGRAMA_BY_CODE: (facultyId, programCode) => `${API_BASE_URL}/api/v1/admin/academico/facultades/${facultyId}/programas/${programCode}`,
  ADMIN_PROGRAMA_COMPLETO: (facultyId, programCode) => `${API_BASE_URL}/api/v1/admin/academico/facultades/${facultyId}/programas/${programCode}/completo`,
  
  // Programas (Público)
  PUBLIC_PROGRAMAS_BY_FACULTAD: (facultyId) => `${API_BASE_URL}/api/v1/public-academico/facultades/${facultyId}/programas`,
  PUBLIC_PROGRAMA_BY_CODE: (facultyId, programCode) => `${API_BASE_URL}/api/v1/public-academico/facultades/${facultyId}/programas/${programCode}`,
  PUBLIC_MATERIAS_BY_PROGRAMA: (programCode) => `${API_BASE_URL}/api/v1/public-academico/programas/${programCode}/materias`,
  
  // Materias (Admin)
  MATERIAS: `${API_BASE_URL}/api/v1/admin/materias`,
  ADMIN_MATERIAS: `${API_BASE_URL}/api/v1/admin/materias`,
  MATERIA_BY_ID: (id) => `${API_BASE_URL}/api/v1/admin/materias/${id}`,
  ADMIN_MATERIA_BY_CODE: (materiaCode) => `${API_BASE_URL}/api/v1/admin/materias/${materiaCode}`,
  ADMIN_MATERIA_ASIGNACIONES: (materiaCode) => `${API_BASE_URL}/api/v1/admin/materias/${materiaCode}/asignaciones`,
  ADMIN_MATERIAS_ASIGNACIONES: `${API_BASE_URL}/api/v1/admin/materias/asignaciones`,
  ASIGNACIONES_DOCENTE: `${API_BASE_URL}/api/v1/admin/asignaciones-docentes`,
  ADMIN_MATERIA_DOCENTES: (materiaCode) => `${API_BASE_URL}/api/v1/admin/materias/${materiaCode}/asignaciones/docentes`,
  ADMIN_DOCENTES_ASIGNACIONES: (docenteId) => `${API_BASE_URL}/api/v1/admin/materias/docentes/${docenteId}/asignaciones`,
  ADMIN_ASIGNACION_DELETE: (asignacionId) => `${API_BASE_URL}/api/v1/admin/materias/asignaciones/${asignacionId}`,
  
  // Grupos (Admin)
  GRUPOS: `${API_BASE_URL}/api/v1/admin/grupos/groups`,
  ADMIN_GRUPOS: `${API_BASE_URL}/api/v1/admin/grupos/groups`,
  ADMIN_GRUPOS_LIST: `${API_BASE_URL}/api/v1/admin/grupos/groups/list`,
  ADMIN_GRUPO_BY_ID: (groupId) => `${API_BASE_URL}/api/v1/admin/grupos/groups/${groupId}`,
  ADMIN_GRUPO_BY_CODE: (codigoMateria, codigoGrupo) => `${API_BASE_URL}/api/v1/admin/materias/${codigoMateria}/grupos/${codigoGrupo}`,
  
  // ═══════════════════════════════════════════════════════════
  // 👨‍🎓 ESTUDIANTES - /api/v1/admin/estudiantes, /api/v1/estudiantes/...
  // ═══════════════════════════════════════════════════════════
  
  // Estudiantes (Admin)
  ADMIN_ESTUDIANTES: `${API_BASE_URL}/api/v1/admin/estudiantes`,
  ADMIN_ESTUDIANTE_BY_ID: (estudianteId) => `${API_BASE_URL}/api/v1/admin/estudiantes/${estudianteId}`,
  ADMIN_ESTUDIANTE_ACTIVAR: (estudianteId) => `${API_BASE_URL}/api/v1/admin/estudiantes/${estudianteId}/activar`,
  ADMIN_ESTUDIANTE_DESACTIVAR: (estudianteId) => `${API_BASE_URL}/api/v1/admin/estudiantes/${estudianteId}/desactivar`,
  
  // Estudiantes (Público - Perfil Propio)
  ESTUDIANTE_REGISTRO: `${API_BASE_URL}/api/v1/estudiantes/registro`,
  REGISTRO_ESTUDIANTE: `${API_BASE_URL}/api/v1/estudiantes/registro`,
  ESTUDIANTE_MI_PERFIL: `${API_BASE_URL}/api/v1/estudiantes/mi-perfil`,
  ESTUDIANTE_MIS_CLASES: `${API_BASE_URL}/api/v1/estudiantes/mis-clases-disponibles`,
  
  // ═══════════════════════════════════════════════════════════
  // 👨‍🏫 DOCENTES - /api/v1/admin/profesores, /api/v1/docentes/...
  // ═══════════════════════════════════════════════════════════
  
  // Docentes (Admin)
  ADMIN_DOCENTES: `${API_BASE_URL}/api/v1/admin/profesores`,
  ADMIN_DOCENTE_BY_ID: (docenteId) => `${API_BASE_URL}/api/v1/admin/profesores/${docenteId}`,
  ADMIN_DOCENTE_ACTIVAR: (docenteId) => `${API_BASE_URL}/api/v1/admin/profesores/${docenteId}/activar`,
  ADMIN_DOCENTE_CARGA: (docenteId) => `${API_BASE_URL}/api/v1/admin/profesores/${docenteId}/carga`,
  ADMIN_DOCENTE_PROGRAMAS: (docenteId) => `${API_BASE_URL}/api/v1/admin/profesores/${docenteId}/programas`,
  ADMIN_DOCENTE_PROGRAMA_ADD: (docenteId, programCode) => `${API_BASE_URL}/api/v1/admin/profesores/${docenteId}/programas/${programCode}`,
  ADMIN_DOCENTES_POR_PROGRAMA: (programCode) => `${API_BASE_URL}/api/v1/admin/profesores/programa/${programCode}`,
  
  // Docentes (Público - Perfil Propio)
  DOCENTE_MI_PERFIL: `${API_BASE_URL}/api/v1/docentes/mi-perfil`,
  DOCENTE_MI_CARGA: `${API_BASE_URL}/api/v1/docentes/mi-carga`,
  DOCENTE_MIS_MATERIAS: `${API_BASE_URL}/api/v1/docentes/mis-materias`,
  DOCENTE_MIS_GRUPOS: `${API_BASE_URL}/api/v1/docentes/mis-grupos`,
  
  // ═══════════════════════════════════════════════════════════
  // 🎓 EGRESADOS - /api/v1/admin/egresados, /api/v1/egresados/...
  // ═══════════════════════════════════════════════════════════
  
  // Egresados (Admin)
  ADMIN_EGRESADOS: `${API_BASE_URL}/api/v1/admin/egresados`,
  ADMIN_EGRESADO_BY_ID: (egresadoId) => `${API_BASE_URL}/api/v1/admin/egresados/${egresadoId}`,
  ADMIN_EGRESADO_ACTIVAR: (egresadoId) => `${API_BASE_URL}/api/v1/admin/egresados/${egresadoId}/activar`,
  ADMIN_EGRESADO_DESACTIVAR: (egresadoId) => `${API_BASE_URL}/api/v1/admin/egresados/${egresadoId}/desactivar`,
  
  // Egresados (Público - Perfil Propio)
  EGRESADO_MI_PERFIL: `${API_BASE_URL}/api/v1/egresados/mi-perfil`,
  REGISTRO_EGRESADO: `${API_BASE_URL}/api/v1/egresados/registro`,
  
  // ═══════════════════════════════════════════════════════════
  // 👥 INVITADOS/GUESTS - /api/v1/admin/invitados, /api/v1/invitados/...
  // ═══════════════════════════════════════════════════════════
  
  // Invitados (Admin)
  ADMIN_INVITADOS: `${API_BASE_URL}/api/v1/admin/invitados`,
  ADMIN_INVITADO_BY_ID: (invitadoId) => `${API_BASE_URL}/api/v1/admin/invitados/${invitadoId}`,
  ADMIN_INVITADO_ACTIVAR: (invitadoId) => `${API_BASE_URL}/api/v1/admin/invitados/${invitadoId}/activar`,
  ADMIN_INVITADO_DESACTIVAR: (invitadoId) => `${API_BASE_URL}/api/v1/admin/invitados/${invitadoId}/desactivar`,
  
  // Invitados (Público - Perfil Propio)
  INVITADO_MI_PERFIL: `${API_BASE_URL}/api/v1/invitados/mi-perfil`,
  REGISTRO_INVITADO: `${API_BASE_URL}/api/v1/invitados/registro`,
  
  // ═══════════════════════════════════════════════════════════
  // 🎯 PROYECTOS - /api/v1/proyectos/...
  // ═══════════════════════════════════════════════════════════
  PROYECTOS: `${API_BASE_URL}/api/v1/proyectos`,
  MIS_PROYECTOS: `${API_BASE_URL}/api/v1/proyectos/mis-proyectos`,
  PROYECTOS_BY_EVENTO: (eventoId) => `${API_BASE_URL}/api/v1/proyectos/evento/${eventoId}`,
  PROYECTO_BY_ID: (proyectoId) => `${API_BASE_URL}/api/v1/proyectos/${proyectoId}`,
  PROYECTO_CALIFICACION: (proyectoId) => `${API_BASE_URL}/api/v1/proyectos/${proyectoId}/calificacion`,
  PROYECTO_INTEGRANTES: (proyectoId) => `${API_BASE_URL}/api/v1/proyectos/${proyectoId}/integrantes`,
  
  // ═══════════════════════════════════════════════════════════
  // 🔬 INVESTIGACIÓN - Líneas, Sublíneas, Áreas Temáticas
  // ═══════════════════════════════════════════════════════════
  
  // Líneas de Investigación (Admin)
  ADMIN_LINEAS_INVESTIGACION: `${API_BASE_URL}/api/v1/admin/investigacion/lineas`,
  ADMIN_LINEA_BY_CODE: (lineCode) => `${API_BASE_URL}/api/v1/admin/investigacion/lineas/${lineCode}`,
  ADMIN_SUBLINEAS_BY_LINE: (lineCode) => `${API_BASE_URL}/api/v1/admin/investigacion/lineas/${lineCode}/sublineas`,
  ADMIN_SUBLINEA_BY_CODE: (lineCode, sublineCode) => `${API_BASE_URL}/api/v1/admin/investigacion/lineas/${lineCode}/sublineas/${sublineCode}`,
  ADMIN_AREAS_BY_SUBLINEA: (lineCode, sublineCode) => `${API_BASE_URL}/api/v1/admin/investigacion/lineas/${lineCode}/sublineas/${sublineCode}/areas-tematicas`,
  ADMIN_AREA_BY_CODE: (lineCode, sublineCode, areaCode) => `${API_BASE_URL}/api/v1/admin/investigacion/lineas/${lineCode}/sublineas/${sublineCode}/areas-tematicas/${areaCode}`,
  
  // Líneas de Investigación (Público)
  PUBLIC_LINEAS_INVESTIGACION: `${API_BASE_URL}/api/v1/public-investigacion/lineas`,
  PUBLIC_LINEA_BY_CODE: (lineCode) => `${API_BASE_URL}/api/v1/public-investigacion/lineas/${lineCode}`,
  PUBLIC_SUBLINEAS_BY_LINE: (lineCode) => `${API_BASE_URL}/api/v1/public-investigacion/lineas/${lineCode}/sublineas`,
  PUBLIC_SUBLINEA_BY_CODE: (lineCode, sublineCode) => `${API_BASE_URL}/api/v1/public-investigacion/lineas/${lineCode}/sublineas/${sublineCode}`,
  PUBLIC_AREAS_BY_SUBLINEA: (lineCode, sublineCode) => `${API_BASE_URL}/api/v1/public-investigacion/lineas/${lineCode}/sublineas/${sublineCode}/areas-tematicas`,
  PUBLIC_AREA_BY_CODE: (lineCode, sublineCode, areaCode) => `${API_BASE_URL}/api/v1/public-investigacion/lineas/${lineCode}/sublineas/${sublineCode}/areas-tematicas/${areaCode}`,
  PUBLIC_ARBOL_COMPLETO_INVESTIGACION: `${API_BASE_URL}/api/v1/public-investigacion/arbol-completo`,
  
  // ═══════════════════════════════════════════════════════════
  // 📅 EVENTOS - /api/v1/eventos/..., /api/v1/admin/eventos/...
  // ═══════════════════════════════════════════════════════════
  
  // Eventos (Admin)
  ADMIN_EVENTOS: `${API_BASE_URL}/api/v1/admin/eventos`,
  ADMIN_EVENTO_BY_ID: (eventoId) => `${API_BASE_URL}/api/v1/admin/eventos/${eventoId}`,
  ADMIN_EVENTO_ESTADO: (eventoId) => `${API_BASE_URL}/api/v1/admin/eventos/${eventoId}/estado`,
  ADMIN_EVENTO_ARCHIVAR: (eventoId) => `${API_BASE_URL}/api/v1/admin/eventos/${eventoId}/archivar`,
  ADMIN_EVENTO_CAPACIDAD: (eventoId) => `${API_BASE_URL}/api/v1/admin/eventos/${eventoId}/capacidad`,
  ADMIN_EVENTOS_PROXIMOS: `${API_BASE_URL}/api/v1/admin/eventos/proximos`,
  ADMIN_EVENTOS_EN_CURSO: `${API_BASE_URL}/api/v1/admin/eventos/en-curso`,
  ADMIN_EVENTOS_ESTADISTICAS: `${API_BASE_URL}/api/v1/admin/eventos/estadisticas`,
  
  // Eventos (Público)
  EVENTOS: `${API_BASE_URL}/api/v1/eventos`,
  EVENTOS_PROXIMOS: `${API_BASE_URL}/api/v1/eventos/proximos`,
  EVENTOS_EN_CURSO: `${API_BASE_URL}/api/v1/eventos/en-curso`,
  EVENTO_BY_ID: (eventoId) => `${API_BASE_URL}/api/v1/eventos/${eventoId}`,
  EVENTO_PROYECTOS: (eventoId) => `${API_BASE_URL}/api/v1/eventos/${eventoId}/proyectos`,
  
  // ═══════════════════════════════════════════════════════════
  // ✅ ASISTENCIAS - /api/v1/asistencia/...
  // ═══════════════════════════════════════════════════════════
  MIS_ASISTENCIAS: `${API_BASE_URL}/api/v1/asistencia/mis-asistencias`,
  GENERAR_QR: (eventoId) => `${API_BASE_URL}/api/v1/asistencia/generar-qr/${eventoId}`,
  REGISTRAR_ASISTENCIA: (eventoId) => `${API_BASE_URL}/api/v1/asistencia/registrar/${eventoId}`,
  ASISTENCIAS_EVENTO: (eventoId) => `${API_BASE_URL}/api/v1/asistencia/evento/${eventoId}`,
  
  // ═══════════════════════════════════════════════════════════
  // 🎫 CERTIFICADOS Y REPORTES - /api/v1/admin/reportes/...
  // ═══════════════════════════════════════════════════════════
  
  // Certificados
  CERTIFICADO_PREVIEW: `${API_BASE_URL}/api/v1/certificados/preview`,
  MIS_CERTIFICADOS: `${API_BASE_URL}/api/v1/certificados/mis-certificados`,
  CERTIFICADO_DESCARGAR: (certificadoId) => `${API_BASE_URL}/api/v1/certificados/mis-certificados/${certificadoId}/descargar`,
  
  // Reportes - Certificados
  ADMIN_GENERAR_CERTIFICADO_POR_PROYECTO: `${API_BASE_URL}/api/v1/admin/reportes/certificados/generar-por-proyecto`,
  ADMIN_GENERAR_CERTIFICADO_INDIVIDUAL: `${API_BASE_URL}/api/v1/admin/reportes/certificados/generar-individual`,
  ADMIN_ENVIAR_CERTIFICADOS: `${API_BASE_URL}/api/v1/admin/reportes/certificados/enviar-por-correo`,
  ADMIN_DESCARGAR_CERTIFICADO: (certificadoId) => `${API_BASE_URL}/api/v1/admin/reportes/certificados/descargar/${certificadoId}`,
  ADMIN_DESCARGAR_CERTIFICADOS_ZIP: (proyectoId) => `${API_BASE_URL}/api/v1/admin/reportes/certificados/descargar-zip/${proyectoId}`,
  ADMIN_LOTES_CERTIFICADOS: `${API_BASE_URL}/api/v1/admin/reportes/certificados/lotes`,
  
  // Reportes - PDF
  ADMIN_GENERAR_PDF: `${API_BASE_URL}/api/v1/admin/reportes/generar-pdf`,
  ADMIN_ENVIAR_PDF: `${API_BASE_URL}/api/v1/admin/reportes/enviar-pdf`,
  ADMIN_GENERAR_ENVIAR_PDF: `${API_BASE_URL}/api/v1/admin/reportes/generar-y-enviar-pdf`,
  ADMIN_DESCARGAR_REPORTE: (reporteId) => `${API_BASE_URL}/api/v1/admin/reportes/descargar/${reporteId}`,
  ADMIN_HISTORIAL_REPORTES: `${API_BASE_URL}/api/v1/admin/reportes/historial`,
  ADMIN_ELIMINAR_REPORTE: (reporteId) => `${API_BASE_URL}/api/v1/admin/reportes/eliminar/${reporteId}`,
  
  // ═══════════════════════════════════════════════════════════
  // 🏢 SECTORES - /api/v1/admin/sectores/...
  // ═══════════════════════════════════════════════════════════
  ADMIN_SECTORES: `${API_BASE_URL}/api/v1/admin/sectores`,
  ADMIN_SECTOR_BY_ID: (sectorId) => `${API_BASE_URL}/api/v1/admin/sectores/${sectorId}`,
  
  // ═══════════════════════════════════════════════════════════
  // 🗑️ USUARIOS - Limpieza
  // ═══════════════════════════════════════════════════════════
  ADMIN_LIMPIAR_NO_VERIFICADOS: `${API_BASE_URL}/api/v1/admin/usuarios/limpiar-no-verificados`,

  // ═══════════════════════════════════════════════════════════
  // ALIAS ENDPOINTS (para compatibilidad)
  // ═══════════════════════════════════════════════════════════
  FACULTADES: `${API_BASE_URL}/api/v1/admin/academico/facultades`,
  PROGRAMAS_BY_FACULTAD: (facultyId) => `${API_BASE_URL}/api/v1/admin/academico/facultades/${facultyId}/programas`,
  PROFESORES: `${API_BASE_URL}/api/v1/admin/profesores`,
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
