import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getTeacherProjects } from "../../Services/ProjectsService.jsx";
import ResearchLinesService from "../../Services/ResearchLinesService.jsx";
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
  });
  const [cargandoProyectos, setCargandoProyectos] = useState(false);
  const [error, setError] = useState(null);
  const [lineasMap, setLineasMap] = useState(new Map());
  const [sublineasMap, setSublineasMap] = useState(new Map());
  const [areasMap, setAreasMap] = useState(new Map());
  const [eventosMap, setEventosMap] = useState(new Map());
  const [mapasCargados, setMapasCargados] = useState(false);

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

        const docenteId = await resolveDocenteId(user);
        if (!docenteId) {
          setError(
            "No se pudo identificar al docente. Por favor, cierre sesión e inicie sesión nuevamente."
          );
          return;
        }

        const data = await getTeacherProjects(docenteId);
        setProyectos(data);

        const total = data.length;

        const aprobados = data.filter((p) => {
          if (p.estado_calificacion) return p.estado_calificacion === "aprobado";
          if (p.calificacion !== null && p.calificacion !== undefined)
            return p.calificacion >= 3.0;
          return false;
        }).length;

        const pendientes = data.filter((p) => {
          if (p.estado_calificacion) return p.estado_calificacion === "pendiente";
          return !p.calificacion && !p.estado_calificacion;
        }).length;

        const reprobados = data.filter((p) => {
          if (p.estado_calificacion) return p.estado_calificacion === "reprobado";
          if (p.calificacion !== null && p.calificacion !== undefined)
            return p.calificacion < 3.0;
          return false;
        }).length;

        setMetricasProyectos({ total, aprobados, pendientes, reprobados });

        if (data.length > 0) {
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

              data.forEach((proyecto) => {
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
        console.error("❌ Error al cargar proyectos:", err);
        setError(err.message);
        setMetricasProyectos({ total: 0, aprobados: 0, pendientes: 0, reprobados: 0 });
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
    handleLogout,
    exportarGraficaComoImagen,
    exportarGraficaComoPDF,
    exportarReporteCompleto,
  };
}
