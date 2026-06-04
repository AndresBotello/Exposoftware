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
import { fetchApi } from "../../utils/apiClient";
import { getAuthHeaders } from "../../Services/AuthService";

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
  const [approvingProject, setApprovingProject] = useState(false);
  const [projectCalificacionPopular, setProjectCalificacionPopular] = useState(null);
  const [loadingCalificacionPopular, setLoadingCalificacionPopular] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [myProjects, setMyProjects] = useState([]);
  const [myProjectsCount, setMyProjectsCount] = useState(0);
  const [projectsForApproval, setProjectsForApproval] = useState([]);
  const [projectsApproved, setProjectsApproved] = useState([]);
  const [rejectingProject, setRejectingProject] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [projectForAction, setProjectForAction] = useState(null);
  const [showRejectReason, setShowRejectReason] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const [lineasMap, setLineasMap] = useState(new Map());
  const [sublineasMap, setSublineasMap] = useState(new Map());
  const [areasMap, setAreasMap] = useState(new Map());
  const [eventosMap, setEventosMap] = useState(new Map());
  const [materiaGruposMap, setMateriaGruposMap] = useState(new Map());

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
        let materiaGruposMapLocal = new Map(); // Mapa de codigo_materia -> [grupos]
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

              // Mapear materia -> grupos
              if (clase.codigo_materia && clase.id_grupo && clase.nombre_grupo) {
                const codigoMateria = clase.codigo_materia.toString().toLowerCase();
                if (!materiaGruposMapLocal.has(codigoMateria)) {
                  materiaGruposMapLocal.set(codigoMateria, []);
                }
                const gruposDeMateria = materiaGruposMapLocal.get(codigoMateria);
                if (!gruposDeMateria.some(g => g.id_grupo === clase.id_grupo)) {
                  gruposDeMateria.push({
                    id_grupo: clase.id_grupo,
                    nombre_grupo: clase.nombre_grupo
                  });
                }
              }
            }
          });

          setMateriaGruposMap(materiaGruposMapLocal);
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
            // Extraer materia del primer docente asignado
            const docente_materia = p.docentes_materias?.[0] || {};
            const materiaInfo = teachingLoadMap.get(p.id_docente_materia) || docente_materia || {};

            // Obtener nombre del grupo del mapa si no está en la materia info
            let nombreGrupo = materiaInfo.nombre_grupo || p.nombre_grupo;
            let idGrupo = materiaInfo.id_grupo || p.id_grupo;

            if (!nombreGrupo && idGrupo) {
              nombreGrupo = gruposMap.get(idGrupo) || p.nombre_grupo;
            }

            // Si no tenemos idGrupo pero sí tenemos nombreGrupo, buscar en materiaGruposMap
            if (!idGrupo && nombreGrupo && materiaInfo.codigo_materia) {
              const codigoMateria = materiaInfo.codigo_materia.toString().toLowerCase();
              const gruposDeMateria = materiaGruposMapLocal.get(codigoMateria) || [];
              const grupoCoincidente = gruposDeMateria.find(g =>
                g.nombre_grupo?.toLowerCase() === nombreGrupo.toLowerCase() ||
                g.nombre_grupo?.toLowerCase().includes(nombreGrupo.toLowerCase())
              );
              if (grupoCoincidente) {
                idGrupo = grupoCoincidente.id_grupo;
              }
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

          // Proyectos para aprobación: Los proyectos del docente con estado pendiente
          const proyectosPendientes = transformedProjects.filter(p => p.estado === "pendiente");
          setProjectsForApproval(proyectosPendientes);

          // Proyectos aprobados: Los proyectos del docente con estado aprobado
          const proyectosAprobados = transformedProjects.filter(p => p.estado === "aprobado");
          setProjectsApproved(proyectosAprobados);

          transformedProjects.forEach(p => {
          });
        } catch (err) {
          setMyProjects([]);
          setMyProjectsCount(0);
          setProjectsForApproval([]);
        }

        // Filtrar solo proyectos de eventos activos que pertenecen a los grupos del docente
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

          // Cargar proyectos de eventos activos y filtrar solo los que pertenecen a grupos del docente
          for (const eventoId of eventosActivosSet) {
            try {
              const proyectosEvento = await getProyectosByEvento(eventoId);
              const proyectosFiltrados = (Array.isArray(proyectosEvento) ? proyectosEvento : [])
                .filter(p => {
                  // Solo incluir proyectos cuyos grupos están en la carga docente del profesor
                  const idGrupo = p.id_grupo || p.grupo_id;
                  return idGrupo && gruposMap.has(idGrupo);
                });
              allProjects = [...allProjects, ...proyectosFiltrados];
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
          // Extraer materia del primer docente asignado
          const docente_materia = p.docentes_materias?.[0] || {};
          const materiaInfo = teachingLoadMap.get(p.id_docente_materia) || docente_materia || {};

          // Obtener nombre del grupo del mapa si no está en la materia info
          let nombreGrupo = materiaInfo.nombre_grupo || p.nombre_grupo;
          let idGrupo = materiaInfo.id_grupo || p.id_grupo;

          if (!nombreGrupo && idGrupo) {
            nombreGrupo = gruposMap.get(idGrupo) || p.nombre_grupo;
          }

          // Si no tenemos idGrupo pero sí tenemos nombreGrupo, buscar en materiaGruposMap
          if (!idGrupo && nombreGrupo && materiaInfo.codigo_materia) {
            const codigoMateria = materiaInfo.codigo_materia.toString().toLowerCase();
            const gruposDeMateria = materiaGruposMapLocal.get(codigoMateria) || [];
            const grupoCoincidente = gruposDeMateria.find(g =>
              g.nombre_grupo?.toLowerCase() === nombreGrupo.toLowerCase() ||
              g.nombre_grupo?.toLowerCase().includes(nombreGrupo.toLowerCase())
            );
            if (grupoCoincidente) {
              idGrupo = grupoCoincidente.id_grupo;
            }
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
            id_grupo: idGrupo || 'N/A',
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
    try {
      if (!selectedMateria || selectedMateria === "Filtrar por materia") {
        setGruposList([]);
        return;
      }

      const materiaSeleccionada = selectedMateria.toString().toLowerCase();

      // Primero intentar obtener del mapa de materia -> grupos (del teaching load)
      let gruposDeMateria = materiaGruposMap.get(materiaSeleccionada);

      // Si no encuentra en el mapa, buscar en myProjects (retrocompatibilidad)
      if (!gruposDeMateria || gruposDeMateria.length === 0) {
        const gruposDeMateriaMapa = new Map();
        if (myProjects && myProjects.length > 0) {
          myProjects.forEach((project) => {
            const codigoMateria = (project.codigo_materia || "").toString().toLowerCase();

            if (codigoMateria === materiaSeleccionada && project.id_grupo) {
              if (!gruposDeMateriaMapa.has(project.id_grupo)) {
                gruposDeMateriaMapa.set(project.id_grupo, {
                  id_grupo: project.id_grupo,
                  nombre_grupo: project.nombre_grupo || `Grupo ${project.id_grupo}`
                });
              }
            }
          });
        }
        gruposDeMateria = Array.from(gruposDeMateriaMapa.values());
      }

      setGruposList(gruposDeMateria || []);
    } catch (err) {
      setGruposList([]);
    }
  }, [selectedMateria, materiaGruposMap, myProjects]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch {
      navigate("/login");
    }
  };

  // Función para filtrar proyectos
  const filterProjects = (projectsToFilter) => {
    return projectsToFilter.filter((project) => {
      const titulo = project.titulo_proyecto?.toLowerCase() || "";
      const materia = (project.codigo_materia || "").toString().toLowerCase();
      const grupo = (project.id_grupo || "").toString();
      const query = searchQuery.toLowerCase();

      // Búsqueda por título, materia o estudiantes
      const matchesQuery =
        titulo.includes(query) ||
        materia.includes(query) ||
        (project.integrantes && project.integrantes.some(est =>
          (est.nombre_completo?.toLowerCase() || "").includes(query) ||
          (est.nombre?.toLowerCase() || "").includes(query)
        ));

      const materiaFilterActive =
        selectedMateria && selectedMateria !== "Filtrar por materia";
      const matchesMateria =
        !materiaFilterActive || materia === selectedMateria.toString().toLowerCase();

      const groupFilterActive =
        selectedGroup && selectedGroup !== "Filtrar por grupo";
      const matchesGroup =
        !groupFilterActive || grupo === selectedGroup;

      return matchesQuery && matchesMateria && matchesGroup;
    });
  };

  const filteredProjects = filterProjects(projects);
  const filteredMyProjects = filterProjects(myProjects);
  const filteredApprovalProjects = filterProjects(projectsForApproval);
  const filteredApprovedProjects = filterProjects(projectsApproved);

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

      // Actualizar el proyecto en todas las listas
      setProjects((prev) =>
        prev.map((p) =>
          p.id_proyecto === proyectoActualizado.id_proyecto ? proyectoActualizado : p
        )
      );

      setMyProjects((prev) =>
        prev.map((p) =>
          p.id_proyecto === proyectoActualizado.id_proyecto ? proyectoActualizado : p
        )
      );

      setProjectsApproved((prev) =>
        prev.map((p) =>
          p.id_proyecto === proyectoActualizado.id_proyecto ? proyectoActualizado : p
        )
      );

      setProjectToGrade(proyectoActualizado);

      alert(`✅ Nota registrada exitosamente: ${nota}`);
      closeGradeModal();
    } catch (err) {
      alert(`Error al calificar proyecto: ${err.message}`);
    } finally {
      setGradingProject(false);
    }
  };

  const handleApproveProjectFromModal = async () => {
    if (!projectToGrade) return;

    try {
      setApprovingProject(true);
      const endpoint = `/api/v1/proyectos/${projectToGrade.id_proyecto}`;

      const response = await fetchApi(endpoint, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ estado: 'aprobado' })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al aprobar proyecto');
      }

      const responseData = await response.json();

      const proyectoActualizado = responseData.data || responseData;

      // Actualizar en todas las listas
      setProjects((prev) =>
        prev.map((p) =>
          p.id_proyecto === proyectoActualizado.id_proyecto
            ? proyectoActualizado
            : p
        )
      );

      setMyProjects((prev) =>
        prev.map((p) =>
          p.id_proyecto === proyectoActualizado.id_proyecto
            ? proyectoActualizado
            : p
        )
      );

      setProjectsForApproval((prev) =>
        prev.map((p) =>
          p.id_proyecto === proyectoActualizado.id_proyecto
            ? proyectoActualizado
            : p
        )
      );

      setProjectsApproved((prev) =>
        prev.map((p) =>
          p.id_proyecto === proyectoActualizado.id_proyecto
            ? proyectoActualizado
            : p
        )
      );

      setProjectToGrade(proyectoActualizado);
      alert(`✅ Proyecto aprobado exitosamente`);
    } catch (err) {
      alert(`Error al aprobar proyecto: ${err.message}`);
    } finally {
      setApprovingProject(false);
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

      setProjectsApproved((prev) =>
        prev.map((p) =>
          p.id_proyecto === proyectoTransformado.id_proyecto ? proyectoTransformado : p
        )
      );

      // Actualizar el proyecto en el modal también
      setProjectForAction(proyectoTransformado);

      alert(`✅ Nota registrada exitosamente: ${nota}`);
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

      setProjectsApproved((prev) =>
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

      setProjectsApproved((prev) =>
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
    filteredMyProjects,
    myProjectsCount,
    projectsForApproval,
    filteredApprovalProjects,
    projectsApproved,
    filteredApprovedProjects,
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
    handleApproveProjectFromModal,
    approvingProject,
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
