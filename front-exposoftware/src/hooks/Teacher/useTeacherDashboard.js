import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getTeacherProjects } from "../../Services/ProjectsService.jsx";
import {
  getMyProjects,
  getMyTeachingLoad,
  getMySubjectAssignments,
  getMyGroups
} from "../../Services/TeacherService.jsx";
import ResearchLinesService from "../../Services/ResearchLinesService.jsx";
import { getAllEventos } from "../../Services/EventosPublicService.jsx";
import ReportGenerator from "../../components/ReportGenerator";
import {
  resolveDocenteId,
  getLineaName,
  getSublineaName,
  getAreaName,
  getEventoName,
} from "../../utils/teacherHelpers";

export function useTeacherDashboard() {
  const { user, getFullName, getInitials, logout, loading } = useAuth();
  const navigate = useNavigate();

  const [selectedMateria, setSelectedMateria] = useState("Todas");
  const [selectedGrupo, setSelectedGrupo] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [proyectos, setProyectos] = useState([]);
  const [metricasProyectos, setMetricasProyectos] = useState({
    total: 0,
    aprobados: 0,
    pendientes: 0,
    reprobados: 0,
    asignados: 0,
  });
  const [cargandoProyectos, setCargandoProyectos] = useState(false);
  const [error, setError] = useState(null);
  const [lineasMap, setLineasMap] = useState(new Map());
  const [sublineasMap, setSublineasMap] = useState(new Map());
  const [areasMap, setAreasMap] = useState(new Map());
  const [eventosMap, setEventosMap] = useState(new Map());
  const [mapasCargados, setMapasCargados] = useState(false);
  const [teachingLoad, setTeachingLoad] = useState([]);
  const [myGroups, setMyGroups] = useState([]);

  // Datos para la gráfica de estado de proyectos
  const pieChartData = useMemo(() => {
    return [
      { name: "Aprobados", value: metricasProyectos.aprobados, color: "#10B981" },
      { name: "Reprobados", value: metricasProyectos.reprobados, color: "#e40606ff" },
      { name: "Pendientes", value: metricasProyectos.pendientes, color: "#F97316" },
    ].filter((item) => item.value > 0);
  }, [metricasProyectos]);

  // Datos para la gráfica de líneas de investigación
  const lineasChartData = useMemo(() => {
    const lineasCount = {};
    proyectos.forEach((proyecto) => {
      if (proyecto.codigo_linea) {
        const lineaNombre = getLineaName(lineasMap, proyecto.codigo_linea);
        lineasCount[lineaNombre] = (lineasCount[lineaNombre] || 0) + 1;
      }
    });

    const colores = [
      "#08973fff", "#decb3fff", "#06B6D4", "#10B981",
      "#F59E0B", "#EF4444", "#48d3ecff", "#63f189ff",
    ];

    return Object.entries(lineasCount)
      .map(([lineaNombre, count], index) => ({
        name: lineaNombre,
        value: count,
        color: colores[index % colores.length],
      }))
      .sort((a, b) => b.value - a.value);
  }, [proyectos, lineasMap, mapasCargados]);

  // Cargar proyectos y métricas
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setCargandoProyectos(true);
        setError(null);

        if (!user) return;

        // Cargar proyectos asignados usando endpoint /api/v1/proyectos/mis-proyectos
        let asignadosCount = 0;
        let myProjectsData = [];
        try {
          myProjectsData = await getMyProjects();
          asignadosCount = Array.isArray(myProjectsData) ? myProjectsData.length : 0;
        } catch (err) {
          asignadosCount = 0;
          myProjectsData = [];
        }

        // Cargar carga docente (clases que dicta)
        try {
          const load = await getMyTeachingLoad();
          setTeachingLoad(Array.isArray(load) ? load : []);
        } catch (err) {
          setTeachingLoad([]);
        }

        // Cargar grupos del docente
        try {
          const grupos = await getMyGroups();
          setMyGroups(Array.isArray(grupos) ? grupos : []);
        } catch (err) {
          setMyGroups([]);
        }

        // Usar directamente myProjectsData para los proyectos asignados
        // Intentar cargar todos los proyectos, pero si falla, usar myProjectsData como fallback
        let allProjects = [];
        try {
          const docenteId = await resolveDocenteId(user);
          if (docenteId) {
            const data = await getTeacherProjects(docenteId);
            allProjects = Array.isArray(data) ? data : [];
          } else {
            allProjects = myProjectsData;
          }
        } catch (err) {
          // Usar myProjectsData como fallback
          allProjects = myProjectsData;
        }

        // Filtrar solo proyectos que pertenecen a eventos activos
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
          // Si falla la carga de eventos, mostrar todos los proyectos del docente
        }

        const proyectosActivos =
          eventosActivosSet !== null
            ? allProjects.filter((p) => p.id_evento && eventosActivosSet.has(p.id_evento))
            : allProjects;

        setProyectos(proyectosActivos);

        // Calcular métricas basadas en proyectos asignados (myProjectsData)
        // para asegurar que se muestren correctamente incluso si el filtro de eventos no funciona
        const metricsSource = proyectosActivos.length > 0 ? proyectosActivos : myProjectsData;

        const total = metricsSource.length;

        const aprobados = metricsSource.filter((p) => {
          if (p.estado_calificacion) return p.estado_calificacion === "aprobado";
          if (p.estado === "aprobado") return true;
          if (p.calificacion !== null && p.calificacion !== undefined)
            return p.calificacion >= 3.0;
          return false;
        }).length;

        const pendientes = metricsSource.filter((p) => {
          if (p.estado_calificacion) return p.estado_calificacion === "pendiente";
          if (p.estado === "aprobado" || p.estado === "rechazado") return false;
          return !p.calificacion && !p.estado_calificacion;
        }).length;

        const reprobados = metricsSource.filter((p) => {
          if (p.estado_calificacion) return p.estado_calificacion === "reprobado";
          if (p.estado === "rechazado") return true;
          if (p.calificacion !== null && p.calificacion !== undefined)
            return p.calificacion < 3.0;
          return false;
        }).length;

        setMetricasProyectos({ total, aprobados, pendientes, reprobados, asignados: asignadosCount });

        if (proyectosActivos.length > 0) {
          ResearchLinesService.obtenerMapasInvestigacion()
            .then((mapas) => {
              setLineasMap(mapas.lineasMap);
              setSublineasMap(mapas.sublineasMap);
              setAreasMap(mapas.areasMap);
              setMapasCargados(true);
            })
            .catch(() => {
              const lineasUnicas = new Map();
              const sublineasUnicas = new Map();
              const areasUnicas = new Map();
              const eventosUnicos = new Map();

              proyectosActivos.forEach((proyecto) => {
                if (proyecto.codigo_linea && !lineasUnicas.has(proyecto.codigo_linea))
                  lineasUnicas.set(proyecto.codigo_linea, `Línea ${proyecto.codigo_linea}`);
                if (proyecto.codigo_sublinea && !sublineasUnicas.has(proyecto.codigo_sublinea))
                  sublineasUnicas.set(proyecto.codigo_sublinea, `Sublínea ${proyecto.codigo_sublinea}`);
                if (proyecto.codigo_area && !areasUnicas.has(proyecto.codigo_area))
                  areasUnicas.set(proyecto.codigo_area, `Área ${proyecto.codigo_area}`);
                if (proyecto.id_evento && !eventosUnicos.has(proyecto.id_evento))
                  eventosUnicos.set(proyecto.id_evento, `Evento ${proyecto.id_evento}`);
              });

              setLineasMap(lineasUnicas);
              setSublineasMap(sublineasUnicas);
              setAreasMap(areasUnicas);
              setEventosMap(eventosUnicos);
              setMapasCargados(true);
            });
        }
      } catch (err) {
        setError(err.message);
        setMetricasProyectos({ total: 0, aprobados: 0, pendientes: 0, reprobados: 0, asignados: 0 });
      } finally {
        setCargandoProyectos(false);
      }
    };

    loadProjects();
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch {
      navigate("/login");
    }
  };

  const exportarGraficaComoImagen = (chartId, fileName) => {
    ReportGenerator.exportarGraficaComoImagen(chartId, fileName);
  };

  const exportarGraficaComoPDF = (chartId, title, data) => {
    ReportGenerator.exportarGraficaComoPDF(chartId, title, data, {
      name: getFullName(),
      category: user?.categoria_docente || "No especificada",
    });
  };

  const exportarReporteCompleto = () => {
    ReportGenerator.exportarReporteCompleto({
      userInfo: {
        name: getFullName(),
        role: "Profesor",
        category: user?.categoria_docente || "No especificada",
        programCode: user?.codigo_programa || "No especificado",
      },
      estadisticas: metricasProyectos,
      chartIds: ["estado-proyectos-chart", "lineas-investigacion-chart"],
      chartTitles: ["Estado de Proyectos", "Líneas de Investigación"],
      chartData: [pieChartData, lineasChartData],
      institutionName: "Universidad Popular del Cesar",
      eventName: "Expo-software 2025",
    });
  };

  return {
    user,
    getFullName,
    getInitials,
    loading,
    selectedMateria,
    setSelectedMateria,
    selectedGrupo,
    setSelectedGrupo,
    searchQuery,
    setSearchQuery,
    proyectos,
    metricasProyectos,
    cargandoProyectos,
    error,
    mapasCargados,
    pieChartData,
    lineasChartData,
    teachingLoad,
    myGroups,
    handleLogout,
    exportarGraficaComoImagen,
    exportarGraficaComoPDF,
    exportarReporteCompleto,
  };
}
