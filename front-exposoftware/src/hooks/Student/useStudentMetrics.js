import { useState, useEffect, useMemo } from "react";
import { obtenerMisProyectos } from "../../Services/ProjectsService";

export function useStudentMetrics(user) {
  const [metricasEstudiante, setMetricasEstudiante] = useState({
    totalProyectos: 0,
    proyectosAprobados: 0,
    proyectosReprobados: 0,
    proyectosPendientes: 0,
  });
  const [cargandoMetricas, setCargandoMetricas] = useState(false);
  const [proyectos, setProyectos] = useState([]);

  useEffect(() => {
    const loadStudentMetrics = async () => {
      try {
        setCargandoMetricas(true);
        if (!user) return;

        let estudianteId = user.id_estudiante || user.id_usuario || user.uid;
        if (!estudianteId) return;

        const proyectosData = await obtenerMisProyectos(estudianteId);
        setProyectos(proyectosData);

        const totalProyectos = proyectosData.length;
        const proyectosAprobados = proyectosData.filter(p => {
          if (p.estado_calificacion) return p.estado_calificacion === 'aprobado';
          if (p.calificacion !== null && !isNaN(p.calificacion)) {
            return parseFloat(p.calificacion) >= 3.0;
          }
          return false;
        }).length;

        const proyectosReprobados = proyectosData.filter(p => {
          if (p.estado_calificacion) return p.estado_calificacion === 'reprobado';
          if (p.calificacion !== null && !isNaN(p.calificacion)) {
            return parseFloat(p.calificacion) < 3.0;
          }
          return false;
        }).length;

        const proyectosPendientes = totalProyectos - proyectosAprobados - proyectosReprobados;

        setMetricasEstudiante({ totalProyectos, proyectosAprobados, proyectosReprobados, proyectosPendientes });
      } catch (err) {
        console.error('❌ Error al cargar métricas:', err);
        setMetricasEstudiante({ totalProyectos: 0, proyectosAprobados: 0, proyectosReprobados: 0, proyectosPendientes: 0 });
        setProyectos([]);
      } finally {
        setCargandoMetricas(false);
      }
    };
    loadStudentMetrics();
  }, [user]);

  const proyectosPorMateriaData = useMemo(() => {
    const materiaCount = {};
    proyectos.forEach(proyecto => {
      // El backend devuelve codigo_materia (ej: "SIN", "PROG3")
      // nombre_materia puede venir enriquecido en algunos endpoints
      const materia =
        proyecto.nombre_materia ||
        proyecto.materia ||
        proyecto.asignatura ||
        proyecto.codigo_materia ||
        'Sin materia';
      materiaCount[materia] = (materiaCount[materia] || 0) + 1;
    });

    const coloresMaterias = [
      '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6',
      '#059669', '#2563EB', '#D97706', '#DC2626', '#7C3AED',
      '#047857', '#1D4ED8', '#B45309', '#B91C1C', '#6D28D9',
      '#065F46', '#1E40AF', '#92400E', '#991B1B', '#5B21B6',
    ];
    return Object.entries(materiaCount).map(([materia, count], index) => ({
      name: materia,
      value: count,
      color: coloresMaterias[index % coloresMaterias.length],
    })).sort((a, b) => b.value - a.value);
  }, [proyectos]);

  const proyectosPorSublineaData = useMemo(() => {
    const sublineaCount = {};
    proyectos.forEach(proyecto => {
      // El backend devuelve codigo_sublinea (número) o nombre_sublinea
      const sublinea =
        proyecto.nombre_sublinea ||
        proyecto.sublinea_investigacion ||
        (proyecto.codigo_sublinea != null ? `Sublínea ${proyecto.codigo_sublinea}` : null) ||
        'Sin sublínea';
      sublineaCount[sublinea] = (sublineaCount[sublinea] || 0) + 1;
    });

    const coloresSublineas = [
      '#244f0f', '#a2e689', '#0cedb1', '#10972e', '#979748',
      '#b28207', '#F59E0B', '#96932e', '#10B981', '#059669',
      '#047857', '#3B82F6', '#2563EB', '#1D4ED8', '#5b8b6d',
      '#15803D', '#EF4444', '#8B5CF6', '#F97316', '#06B6D4',
    ];
    return Object.entries(sublineaCount).map(([sublinea, count], index) => ({
      name: sublinea,
      value: count,
      color: coloresSublineas[index % coloresSublineas.length],
    })).sort((a, b) => b.value - a.value);
  }, [proyectos]);

  return { metricasEstudiante, cargandoMetricas, proyectos, proyectosPorMateriaData, proyectosPorSublineaData };
}
