import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getTeacherProjects } from "../../Services/ProjectsService.jsx";
import {
  calificarProyecto,
  getTeacherSubjects,
  getTeacherSubjectGroups,
} from "../../Services/TeacherService.jsx";
import ResearchLinesService from "../../Services/ResearchLinesService.jsx";
import { getEventosMap, getAllEventos } from "../../Services/EventosPublicService.jsx";
import {
  resolveDocenteId,
  getLineaName as getLineaNameUtil,
  getSublineaName as getSublineaNameUtil,
  getAreaName as getAreaNameUtil,
  getEventoName as getEventoNameUtil,
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
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        console.error("⚠️ Error cargando mapas:", err);
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

        const docenteId = await resolveDocenteId(user);
        if (!docenteId) {
          setError(
            "No se pudo identificar al docente. Por favor, cierre sesión e inicie sesión nuevamente."
          );
          return;
        }

        const data = await getTeacherProjects(docenteId);

        // Filtrar solo proyectos de eventos activos
        let eventosActivosSet = null;
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
        } catch {
          // Si falla la carga de eventos, mostrar todos los proyectos
        }

        const proyectosFiltrados =
          eventosActivosSet !== null
            ? data.filter((p) => p.id_evento && eventosActivosSet.has(p.id_evento))
            : data;

        setProjects(proyectosFiltrados);

        try {
          const materias = await getTeacherSubjects(docenteId, proyectosFiltrados);
          const normalized = (Array.isArray(materias) ? materias : []).map((m) => ({
            codigo: (
              m.codigo_materia || m.codigo || m.subject_code || m.id || m.code || ""
            ).toString(),
            nombre:
              m.nombre ||
              m.nombre_materia ||
              m.subject_name ||
              m.title ||
              m.name ||
              String(m.codigo_materia || m.codigo || m.id || ""),
          }));
          setMateriasList(normalized);
        } catch (err) {
          console.warn("⚠️ No se pudieron cargar las materias:", err.message || err);
          setMateriasList([]);
        }
      } catch (err) {
        console.error("❌ Error al cargar proyectos:", err);
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
        console.error("❌ Error cargando grupos:", err);
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

  const handleViewDetails = (project) => {
    setSelectedProject(project);
    setShowModal(true);
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
      console.error("❌ Error al calificar proyecto:", err);
      alert(`Error al calificar proyecto: ${err.message}`);
    } finally {
      setGradingProject(false);
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
    projects,
    filteredProjects,
    loading,
    error,
    handleLogout,
    handleViewDetails,
    closeModal,
    handleOpenGradeModal,
    closeGradeModal,
    handleGradeProject,
    getLineaName,
    getSublineaName,
    getAreaName,
    getEventoName,
  };
}
