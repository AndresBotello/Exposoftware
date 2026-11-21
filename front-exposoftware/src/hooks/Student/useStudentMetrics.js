import { useState, useEffect, useMemo } from "react";
import { obtenerMisProyectos } from "../../Services/ProjectsService";
import MisClasesService from "../../Services/MisClasesService";
import InvestigacionService from "../../Services/InvestigacionService";
import EventosService from "../../Services/EventosService";
import {
  EVENTO_AUTO,
  EVENTO_TODOS,
  elegirEventoActual,
  construirEventosDisponibles,
  idEvento as idEventoDe,
} from "../../utils/eventoActual";

export function useStudentMetrics(user) {
  const [cargandoMetricas, setCargandoMetricas] = useState(true);
  const [proyectosTodos, setProyectosTodos] = useState([]);
  const [eventosRaw, setEventosRaw] = useState([]);
  const [eventoElegido, setEventoElegido] = useState(EVENTO_AUTO);
  // Hasta conocer los eventos no se sabe cuál es el actual: se mantiene la carga para no mostrar datos viejos
  const [eventosCargados, setEventosCargados] = useState(false);

  // Eventos (para saber cuál es el actual)
  useEffect(() => {
    let cancelado = false;
    (async () => {
      try {
        const lista = await EventosService.obtenerEventos();
        if (!cancelado) setEventosRaw(Array.isArray(lista) ? lista : []);
      } catch {
        if (!cancelado) setEventosRaw([]);
      } finally {
        if (!cancelado) setEventosCargados(true);
      }
    })();
    return () => {
      cancelado = true;
    };
  }, []);

  const eventosDisponibles = useMemo(
    () => construirEventosDisponibles(eventosRaw, proyectosTodos),
    [eventosRaw, proyectosTodos]
  );

  // Evento actual: inscripciones abiertas > en curso > cerradas > finalizado
  const eventoActualId = useMemo(() => {
    const actual = elegirEventoActual(eventosRaw);
    if (actual) return String(idEventoDe(actual));
    return eventosDisponibles.length > 0 ? eventosDisponibles[0].id : null;
  }, [eventosRaw, eventosDisponibles]);

  const eventoEfectivo = eventoElegido === EVENTO_AUTO ? eventoActualId || EVENTO_TODOS : eventoElegido;

  // Proyectos del evento elegido (antes se contaban los de todos los eventos, incluidos los anteriores)
  const proyectos = useMemo(
    () =>
      eventoEfectivo === EVENTO_TODOS
        ? proyectosTodos
        : proyectosTodos.filter((p) => String(p.id_evento) === String(eventoEfectivo)),
    [proyectosTodos, eventoEfectivo]
  );

  const metricasEstudiante = useMemo(() => {
    const totalProyectos = proyectos.length;
    const proyectosAprobados = proyectos.filter((p) => {
      if (p.estado_calificacion) return p.estado_calificacion === 'aprobado';
      if (p.estado === 'aprobado') return true;
      if (p.calificacion !== null && !isNaN(p.calificacion)) {
        return parseFloat(p.calificacion) >= 3.0;
      }
      return false;
    }).length;

    const proyectosReprobados = proyectos.filter((p) => {
      if (p.estado_calificacion) return p.estado_calificacion === 'reprobado';
      if (p.estado === 'rechazado') return true;
      if (p.calificacion !== null && !isNaN(p.calificacion)) {
        return parseFloat(p.calificacion) < 3.0;
      }
      return false;
    }).length;

    const proyectosPendientes = totalProyectos - proyectosAprobados - proyectosReprobados;
    return { totalProyectos, proyectosAprobados, proyectosReprobados, proyectosPendientes };
  }, [proyectos]);

  useEffect(() => {
    const loadStudentMetrics = async () => {
      try {
        setCargandoMetricas(true);
        if (!user) return;

        let estudianteId = user.id_estudiante || user.id_usuario || user.uid;
        if (!estudianteId) return;

        let proyectosData = await obtenerMisProyectos(estudianteId);

        // Enriquecer proyectos con nombres de materia
        proyectosData = await Promise.all(
          proyectosData.map(async (proyecto) => {
            const enriched = { ...proyecto };

            // Obtener nombre de materia
            if (proyecto.id_docente_materia && !proyecto.nombre_materia) {
              try {
                const detalles = await MisClasesService.obtenerDetallesDocente(proyecto.id_docente_materia);
                if (detalles) {
                  enriched.nombre_materia = detalles.nombre_materia;
                }
              } catch (error) {
              }
            }

            // Obtener nombre de sublínea
            if (proyecto.codigo_sublinea && !proyecto.nombre_sublinea) {
              try {
                const nombres = await InvestigacionService.obtenerNombresInvestigacion(
                  proyecto.codigo_linea,
                  proyecto.codigo_sublinea
                );
                if (nombres.sublinea) {
                  enriched.nombre_sublinea = nombres.sublinea;
                }
              } catch (error) {
              }
            }

            return enriched;
          })
        );

        setProyectosTodos(proyectosData);
      } catch (err) {
        setProyectosTodos([]);
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

  return {
    metricasEstudiante,
    cargandoMetricas: cargandoMetricas || !eventosCargados,
    proyectos,
    proyectosPorMateriaData,
    proyectosPorSublineaData,
    eventosDisponibles,
    eventoActualId,
    selectedEvento: eventoEfectivo,
    setSelectedEvento: setEventoElegido,
  };
}
