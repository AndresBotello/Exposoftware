import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getTeacherProjects } from "../../Services/ProjectsService.jsx";
import {
  calificarProyecto,
  getTeacherSubjectGroups,
  getMyProjects,
  getProyectosByEvento,
  updateProyectoStatus,
  getMyTeachingLoad,
  getMyGroups,
  getUsersInfo,
  obtenerCalificacionPopular,
} from "../../Services/TeacherService.jsx";
import ResearchLinesService from "../../Services/ResearchLinesService.jsx";
import { getEventosMap, getAllEventos } from "../../Services/EventosPublicService.jsx";
import {
  getLineaName as getLineaNameUtil,
  getSublineaName as getSublineaNameUtil,
  getAreaName as getAreaNameUtil,
  getEventoName as getEventoNameUtil,
  resolveDocenteId,
} from "../../utils/teacherHelpers";

export function useStudentProjects() {
  const { user, getFullName, getInitials, logout } = useAuth();
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState("grid");
  const [selectedGroup, setSelectedGroup] = useState("Filtrar por grupo");
  const [selectedMateria, setSelectedMateria] = useState("Filtrar por materia");
  const [materiasList, setMateriasList] = useState([]);
  const [gruposList, setGruposList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [projectToGrade, setProjectToGrade] = useState(null);
  const [gradeValue, setGradeValue] = useState("");
  const [gradingProject, setGradingProject] = useState(false);
  const [projectCalificacionPopular, setProjectCalificacionPopular] = useState(null);
  const [loadingCalificacionPopular, setLoadingCalificacionPopular] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [myProjects, setMyProjects] = useState([]);
  const [myProjectsCount, setMyProjectsCount] = useState(0);
  const [projectsForApproval, setProjectsForApproval] = useState([]);
  const [approvingProject, setApprovingProject] = useState(false);
  const [rejectingProject, setRejectingProject] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [projectForAction, setProjectForAction] = useState(null);
  const [showRejectReason, setShowRejectReason] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const [lineasMap, setLineasMap] = useState(new Map());
  const [sublineasMap, setSublineasMap] = useState(new Map());
  const [areasMap, setAreasMap] = useState(new Map());
  const [eventosMap, setEventosMap] = useState(new Map());

  // Wrappers de un solo argumento para los consumidores (componentes)
  const getLineaName = (code) => getLineaNameUtil(lineasMap, code);
  const getSublineaName = (code) => getSublineaNameUtil(sublineasMap, code);
  const getAreaName = (code) => getAreaNameUtil(areasMap, code);
  const getEventoName = (id) => getEventoNameUtil(eventosMap, id);

  // Cargar mapas de nombres (líneas, sublíneas, áreas, eventos)
  useEffect(() => {
    const loadMaps = async () => {
      try {
        const { lineasMap: lm, sublineasMap: slm, areasMap: am } =
          await ResearchLinesService.obtenerMapasInvestigacion();
        setLineasMap(lm);
        setSublineasMap(slm);
        setAreasMap(am);
        const em = await getEventosMap();
        setEventosMap(em);
      } catch (err) {
      }
    };
    loadMaps();
  }, []);

  // Cargar proyectos del docente
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!user) return;

        // Cargar mi carga docente (materias y grupos que dicto)
        let teachingLoadMap = new Map(); // Mapa de id_docente_materia -> {codigo_materia, nombre_materia, nombre_grupo, id_grupo}
        let gruposMap = new Map(); // Mapa de id_grupo -> nombre_grupo
        try {
          const carga = await getMyTeachingLoad();

          // La respuesta puede ser un objeto con clases o un array
          const clases = Array.isArray(carga) ? carga : (carga?.clases || []);

          clases.forEach(clase => {
            if (clase.id_docente_materia) {
              teachingLoadMap.set(clase.id_docente_materia, {
                codigo_materia: clase.codigo_materia,
                nombre_materia: clase.nombre_materia,
                nombre_grupo: clase.nombre_grupo,
                id_grupo: clase.id_grupo
              });
              // También mapear el grupo
              if (clase.id_grupo && clase.nombre_grupo) {
                gruposMap.set(clase.id_grupo, clase.nombre_grupo);
              }
            }
          });
        } catch (err) {
          // Fallback: cargar grupos por separado si la carga docente falla
          try {
            const grupos = await getMyGroups();
            const gruposArray = Array.isArray(grupos) ? grupos : (grupos?.data || []);
            gruposArray.forEach(grupo => {
              if (grupo.id_grupo && grupo.nombre_grupo) {
                gruposMap.set(grupo.id_grupo, grupo.nombre_grupo);
              }
            });
          } catch (groupErr) {
          }
        }

        // Cargar mis proyectos (proyectos asignados al docente)
        try {
          const myProjectsData = await getMyProjects();

          // Helper: detectar si un string es un UUID
          const isUUID = (str) => {
            if (!str) return false;
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            return uuidRegex.test(String(str));
          };

          // Transformar datos: mapear integrantes a id_estudiantes y asociar materias
          const transformedProjects = (Array.isArray(myProjectsData) ? myProjectsData : []).map((p, idx) => {
            const materiaInfo = teachingLoadMap.get(p.id_docente_materia) || {};

            // Obtener nombre del grupo del mapa si no está en la materia info
            let nombreGrupo = materiaInfo.nombre_grupo || p.nombre_grupo;
            let idGrupo = materiaInfo.id_grupo || p.id_grupo;

            if (!nombreGrupo && idGrupo) {
              nombreGrupo = gruposMap.get(idGrupo) || p.nombre_grupo;
            }

            // Si nombreGrupo parece un UUID, no mostrarlo
            if (isUUID(nombreGrupo)) {
              nombreGrupo = null;
            }

            // Log de detalles del primer proyecto
            if (idx === 0) {
              // Debug info removed for security
            }

            return {
              ...p,
              id_estudiantes: p.integrantes || [],
              codigo_materia: materiaInfo.codigo_materia || p.codigo_materia,
              nombre_materia: materiaInfo.nombre_materia || p.nombre_materia,
              nombre_grupo: nombreGrupo || 'N/A',
              id_grupo: idGrupo || 'N/A',
              activo: p.estado !== 'inactivo' && p.estado !== 'rechazado'
            };
          });
          setMyProjects(transformedProjects);
          setMyProjectsCount(transformedProjects.length);
          transformedProjects.forEach(p => {
          });
        } catch (err) {
          setMyProjects([]);
          setMyProjectsCount(0);
        }

        // Cargar proyectos de eventos para aprobación
        try {
          const eventos = await getAllEventos();
          const eventosAbiertosList = eventos.filter(
            (e) =>
              e.estado === "inscripciones_abiertas" ||
              (typeof e.estado === "string" && e.estado.toLowerCase() === "inscripciones_abiertas")
          );

          let projectosAprobacion = [];
          for (const evento of eventosAbiertosList) {
            const eventoId = evento.id || evento.id_evento || evento.evento_id;
            if (eventoId) {
              const proyectosEvento = await getProyectosByEvento(eventoId);
              projectosAprobacion = [...projectosAprobacion, ...(Array.isArray(proyectosEvento) ? proyectosEvento : [])];
            }
          }
          setProjectsForApproval(projectosAprobacion);
        } catch (err) {
          setProjectsForApproval([]);
        }

        // Filtrar solo proyectos de eventos activos para tab "Todos"
        let eventosActivosSet = null;
        let allProjects = [];
        try {
          const eventos = await getAllEventos();
          eventosActivosSet = new Set(
            eventos
              .filter(
                (e) =>
                  e.activo === true ||
                  (typeof e.estado === "string" && e.estado.toLowerCase() === "activo")
              )
              .map((e) => e.id || e.id_evento || e.evento_id)
              .filter(Boolean)
          );

          // Cargar todos los proyectos de eventos activos
          for (const eventoId of eventosActivosSet) {
            try {
              const proyectosEvento = await getProyectosByEvento(eventoId);
              allProjects = [...allProjects, ...(Array.isArray(proyectosEvento) ? proyectosEvento : [])];
            } catch (err) {
            }
          }
        } catch (err) {
        }

        // Transformar proyectos de eventos para enriquecer con información de materias/grupos
        const isUUID = (str) => {
          if (!str) return false;
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          return uuidRegex.test(String(str));
        };

        const transformedAllProjects = allProjects.map((p) => {
          const materiaInfo = teachingLoadMap.get(p.id_docente_materia) || {};

          // Obtener nombre del grupo del mapa si no está en la materia info
          let nombreGrupo = materiaInfo.nombre_grupo || p.nombre_grupo;
          if (!nombreGrupo && p.id_grupo) {
            nombreGrupo = gruposMap.get(p.id_grupo) || p.nombre_grupo;
          }

          // Si nombreGrupo parece un UUID, no mostrarlo
          if (isUUID(nombreGrupo)) {
            nombreGrupo = null;
          }

          return {
            ...p,
            id_estudiantes: p.integrantes || [],
            codigo_materia: materiaInfo.codigo_materia || p.codigo_materia,
            nombre_materia: materiaInfo.nombre_materia || p.nombre_materia,
            nombre_grupo: nombreGrupo || 'N/A',
            id_grupo: materiaInfo.id_grupo || p.id_grupo,
            activo: p.estado !== 'inactivo' && p.estado !== 'rechazado'
          };
        });

        setProjects(transformedAllProjects);

        // Extraer materias únicas del teaching load (más confiables que de proyectos)
        const materiasUnicas = new Map();

        // Primero añadir del teaching load
        teachingLoadMap.forEach((info, id) => {
          const codigo = info.codigo_materia;
          if (codigo && !materiasUnicas.has(codigo)) {
            materiasUnicas.set(codigo, info.nombre_materia || `Materia ${codigo}`);
          }
        });

        // Luego añadir de proyectos si no están en el mapa (para proyectos sin asignación)
        allProjects.forEach((proyecto) => {
          if (proyecto.codigo_materia) {
            const codigo = proyecto.codigo_materia.toString();
            if (!materiasUnicas.has(codigo)) {
              materiasUnicas.set(codigo, proyecto.nombre_materia || `Materia ${codigo}`);
            }
          }
        });

        const normalized = Array.from(materiasUnicas, ([codigo, nombre]) => ({
          codigo,
          nombre
        }));
        setMateriasList(normalized);
      } catch (err) {
        setError(err.message);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, [user]);

  // Cargar grupos cuando cambia la materia seleccionada
  useEffect(() => {
    const loadGrupos = async () => {
      try {
        if (!selectedMateria || selectedMateria === "Filtrar por materia") {
          setGruposList([]);
          return;
        }

        const docenteId = await resolveDocenteId(user);
        if (!docenteId) {
          setGruposList([]);
          return;
        }

        const grupos = await getTeacherSubjectGroups(docenteId, selectedMateria, projects);
        const normalized = (Array.isArray(grupos) ? grupos : []).map((g) => ({
          id: g.id_grupo || g.id || g.codigo || g.group_code || "",
          nombre:
            g.nombre ||
            g.nombre_grupo ||
            g.name ||
            String(g.id_grupo || g.id || g.codigo),
        }));
        setGruposList(normalized);
      } catch (err) {
        setGruposList([]);
      }
    };

    loadGrupos();
  }, [selectedMateria, user, projects]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch {
      navigate("/login");
    }
  };

  const filteredProjects = projects.filter((project) => {
    const titulo = project.titulo_proyecto?.toLowerCase() || "";
    const materia = (project.codigo_materia || "").toString().toLowerCase();
    const grupo = (project.id_grupo || project.grupo || "").toString();
    const query = searchQuery.toLowerCase();

    const matchesQuery = titulo.includes(query) || materia.includes(query);

    const materiaFilterActive =
      selectedMateria && selectedMateria !== "Filtrar por materia";
    const matchesMateria =
      !materiaFilterActive || materia === selectedMateria.toString().toLowerCase();

    const groupFilterActive =
      selectedGroup && selectedGroup !== "Filtrar por grupo";
    const matchesGroup =
      !groupFilterActive || grupo === selectedGroup.toString();

    return matchesQuery && matchesMateria && matchesGroup;
  });

  const handleViewDetails = async (project) => {
    setSelectedProject(project);
    setShowModal(true);

    // Cargar calificación popular del proyecto
    try {
      setLoadingCalificacionPopular(true);
      const calificacion = await obtenerCalificacionPopular(project.id_proyecto);
      setProjectCalificacionPopular(calificacion);
    } catch (err) {
      setProjectCalificacionPopular(null);
    } finally {
      setLoadingCalificacionPopular(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProject(null);
  };

  const handleOpenGradeModal = (project) => {
    setProjectToGrade(project);
    setGradeValue(project.calificacion || "");
    setShowGradeModal(true);
  };

  const closeGradeModal = () => {
    setShowGradeModal(false);
    setProjectToGrade(null);
    setGradeValue("");
  };

  const handleGradeProject = async () => {
    try {
      setGradingProject(true);
      const nota = parseFloat(gradeValue);

      if (isNaN(nota)) {
        alert("Por favor ingrese una calificación válida");
        return;
      }
      if (nota < 0 || nota > 5) {
        alert("La calificación debe estar entre 0 y 5");
        return;
      }

      const proyectoActualizado = await calificarProyecto(
        projectToGrade.id_proyecto,
        nota
      );

      setProjects((prev) =>
        prev.map((p) =>
          p.id_proyecto === proyectoActualizado.id_proyecto ? proyectoActualizado : p
        )
      );

      alert(`✅ Proyecto calificado exitosamente con nota ${nota}`);
      closeGradeModal();
    } catch (err) {
      alert(`Error al calificar proyecto: ${err.message}`);
    } finally {
      setGradingProject(false);
    }
  };

  const handleOpenActionModal = async (project) => {
    setProjectForAction(project);
    setShowActionModal(true);
    setGradeValue(project.calificacion || "");
    setShowRejectReason(false);
    setRejectReason("");

    // Cargar calificación popular del proyecto
    try {
      setLoadingCalificacionPopular(true);
      const calificacion = await obtenerCalificacionPopular(project.id_proyecto);
      setProjectCalificacionPopular(calificacion);
    } catch (err) {
      setProjectCalificacionPopular(null);
    } finally {
      setLoadingCalificacionPopular(false);
    }
  };

  const handleCloseActionModal = () => {
    setShowActionModal(false);
    setProjectForAction(null);
    setGradeValue("");
    setShowRejectReason(false);
    setRejectReason("");
  };

  const handleGradeProjectAction = async () => {
    if (!projectForAction) return;
    try {
      setGradingProject(true);
      const nota = parseFloat(gradeValue);

      if (isNaN(nota)) {
        alert("Por favor ingrese una calificación válida");
        return;
      }
      if (nota < 0 || nota > 5) {
        alert("La calificación debe estar entre 0 y 5");
        return;
      }

      const proyectoActualizado = await calificarProyecto(
        projectForAction.id_proyecto,
        nota
      );

      // Transformar proyecto con activo basado en estado
      const proyectoTransformado = {
        ...proyectoActualizado,
        activo: proyectoActualizado.estado !== 'inactivo' && proyectoActualizado.estado !== 'rechazado'
      };

      // Actualizar todos los arrays que contienen el proyecto
      setProjects((prev) =>
        prev.map((p) =>
          p.id_proyecto === proyectoTransformado.id_proyecto ? proyectoTransformado : p
        )
      );

      setMyProjects((prev) =>
        prev.map((p) =>
          p.id_proyecto === proyectoTransformado.id_proyecto ? proyectoTransformado : p
        )
      );

      setProjectsForApproval((prev) =>
        prev.map((p) =>
          p.id_proyecto === proyectoTransformado.id_proyecto ? proyectoTransformado : p
        )
      );

      // Actualizar el proyecto en el modal también
      setProjectForAction(proyectoTransformado);

      alert(`✅ Proyecto calificado exitosamente con nota ${nota}`);
    } catch (err) {
      alert(`Error al calificar proyecto: ${err.message}`);
    } finally {
      setGradingProject(false);
    }
  };

  const handleApproveProjectAction = async () => {
    if (!projectForAction) return;
    try {
      setApprovingProject(true);
      const proyectoActualizado = await updateProyectoStatus(
        projectForAction.id_proyecto,
        { estado: "aprobado" }
      );

      // Transformar proyecto con activo basado en estado
      const proyectoTransformado = {
        ...proyectoActualizado,
        activo: proyectoActualizado.estado !== 'inactivo' && proyectoActualizado.estado !== 'rechazado'
      };

      // Actualizar todos los arrays que contienen el proyecto
      setProjects((prev) =>
        prev.map((p) =>
          p.id_proyecto === proyectoTransformado.id_proyecto ? proyectoTransformado : p
        )
      );

      setMyProjects((prev) =>
        prev.map((p) =>
          p.id_proyecto === proyectoTransformado.id_proyecto ? proyectoTransformado : p
        )
      );

      setProjectsForApproval((prev) =>
        prev.map((p) =>
          p.id_proyecto === proyectoTransformado.id_proyecto ? proyectoTransformado : p
        )
      );

      // Actualizar el proyecto en el modal también
      setProjectForAction(proyectoTransformado);

      alert(`✅ Proyecto aprobado exitosamente`);
      handleCloseActionModal();
    } catch (err) {
      alert(`Error al aprobar proyecto: ${err.message}`);
    } finally {
      setApprovingProject(false);
    }
  };

  const handleRejectProjectAction = async () => {
    if (!projectForAction) return;
    try {
      setRejectingProject(true);
      const payload = { estado: "rechazado" };
      if (rejectReason.trim()) {
        payload.razon_rechazo = rejectReason;
      }

      const proyectoActualizado = await updateProyectoStatus(
        projectForAction.id_proyecto,
        payload
      );

      // Transformar proyecto con activo basado en estado
      const proyectoTransformado = {
        ...proyectoActualizado,
        activo: proyectoActualizado.estado !== 'inactivo' && proyectoActualizado.estado !== 'rechazado'
      };

      // Actualizar todos los arrays que contienen el proyecto
      setProjects((prev) =>
        prev.map((p) =>
          p.id_proyecto === proyectoTransformado.id_proyecto ? proyectoTransformado : p
        )
      );

      setMyProjects((prev) =>
        prev.map((p) =>
          p.id_proyecto === proyectoTransformado.id_proyecto ? proyectoTransformado : p
        )
      );

      setProjectsForApproval((prev) =>
        prev.map((p) =>
          p.id_proyecto === proyectoTransformado.id_proyecto ? proyectoTransformado : p
        )
      );

      // Actualizar el proyecto en el modal también
      setProjectForAction(proyectoTransformado);

      alert(`✅ Proyecto rechazado exitosamente`);
      handleCloseActionModal();
    } catch (err) {
      alert(`Error al rechazar proyecto: ${err.message}`);
    } finally {
      setRejectingProject(false);
    }
  };

  const handleApproveProject = async (project) => {
    try {
      setApprovingProject(true);
      const proyectoActualizado = await updateProyectoStatus(
        project.id_proyecto,
        { estado: "aprobado" }
      );

      // Transformar proyecto con activo basado en estado
      const proyectoTransformado = {
        ...proyectoActualizado,
        activo: proyectoActualizado.estado !== 'inactivo' && proyectoActualizado.estado !== 'rechazado'
      };

      setProjectsForApproval((prev) =>
        prev.map((p) =>
          p.id_proyecto === proyectoTransformado.id_proyecto ? proyectoTransformado : p
        )
      );

      alert(`✅ Proyecto aprobado exitosamente`);
    } catch (err) {
      alert(`Error al aprobar proyecto: ${err.message}`);
    } finally {
      setApprovingProject(false);
    }
  };

  const handleRejectProject = async (project) => {
    try {
      setApprovingProject(true);
      const proyectoActualizado = await updateProyectoStatus(
        project.id_proyecto,
        { estado: "rechazado" }
      );

      // Transformar proyecto con activo basado en estado
      const proyectoTransformado = {
        ...proyectoActualizado,
        activo: proyectoActualizado.estado !== 'inactivo' && proyectoActualizado.estado !== 'rechazado'
      };

      setProjectsForApproval((prev) =>
        prev.map((p) =>
          p.id_proyecto === proyectoTransformado.id_proyecto ? proyectoTransformado : p
        )
      );

      alert(`✅ Proyecto rechazado exitosamente`);
    } catch (err) {
      alert(`Error al rechazar proyecto: ${err.message}`);
    } finally {
      setApprovingProject(false);
    }
  };

  return {
    user,
    getFullName,
    getInitials,
    viewMode,
    setViewMode,
    selectedGroup,
    setSelectedGroup,
    selectedMateria,
    setSelectedMateria,
    materiasList,
    gruposList,
    searchQuery,
    setSearchQuery,
    selectedProject,
    showModal,
    showGradeModal,
    projectToGrade,
    gradeValue,
    setGradeValue,
    gradingProject,
    projectCalificacionPopular,
    loadingCalificacionPopular,
    projects,
    filteredProjects,
    myProjects,
    myProjectsCount,
    projectsForApproval,
    approvingProject,
    rejectingProject,
    showActionModal,
    projectForAction,
    showRejectReason,
    setShowRejectReason,
    rejectReason,
    setRejectReason,
    loading,
    error,
    handleLogout,
    handleViewDetails,
    closeModal,
    handleOpenGradeModal,
    closeGradeModal,
    handleGradeProject,
    handleOpenActionModal,
    handleCloseActionModal,
    handleGradeProjectAction,
    handleApproveProjectAction,
    handleRejectProjectAction,
    handleApproveProject,
    handleRejectProject,
    getLineaName,
    getSublineaName,
    getAreaName,
    getEventoName,
  };
}
