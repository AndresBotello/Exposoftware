import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { getTeacherProjects } from '../Services/ProjectsService.jsx';
import { getTeacherProfile } from '../Services/TeacherService';
import ResearchLinesService from '../Services/ResearchLinesService.jsx';

// Crear el contexto de docente
const TeacherContext = createContext(null);

// Hook personalizado para usar el contexto de docente
export const useTeacher = () => {
  const context = useContext(TeacherContext);
  if (!context) {
    throw new Error('useTeacher debe ser usado dentro de un TeacherProvider');
  }
  return context;
};

// Provider del contexto de docente
export const TeacherProvider = ({ children }) => {
  const { user, hasRole } = useAuth();

  // Estados para datos del docente
  const [teacherProfile, setTeacherProfile] = useState(null);
  const [proyectos, setProyectos] = useState([]);
  const [lineasMap, setLineasMap] = useState(new Map());
  const [sublineasMap, setSublineasMap] = useState(new Map());
  const [areasMap, setAreasMap] = useState(new Map());
  const [eventosMap, setEventosMap] = useState(new Map());

  // Estados de carga
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingMaps, setLoadingMaps] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [mapasCargados, setMapasCargados] = useState(false);

  // Estados de métricas calculadas
  const [metricasProyectos, setMetricasProyectos] = useState({
    total: 0,
    aprobados: 0,
    pendientes: 0,
    reprobados: 0
  });

  // Función para cargar el perfil del docente
  const loadTeacherProfile = useCallback(async () => {
    if (!user || !hasRole('docente')) return;

    try {
      setLoadingProfile(true);

      const perfil = await getTeacherProfile();
      setTeacherProfile(perfil);
    } catch (error) {
    } finally {
      setLoadingProfile(false);
    }
  }, [user, hasRole]);

  // Función para cargar proyectos del docente
  const loadTeacherProjects = useCallback(async () => {
    if (!user || !hasRole('docente')) return;

    try {
      setLoadingProjects(true);

      let docenteId = user.id_docente || user.user?.id_usuario || user.id_usuario || user.uid;

      // Si no tenemos id_docente, intentar obtenerlo del perfil
      if (!user.id_docente && docenteId) {
        try {
          const perfilCompleto = await getTeacherProfile();
          if (perfilCompleto.id_docente) {
            docenteId = perfilCompleto.id_docente;
          } else if (perfilCompleto.docente?.id_docente) {
            docenteId = perfilCompleto.docente.id_docente;
          }
        } catch (err) {
        }
      }

      if (!docenteId) {
        return;
      }

      const data = await getTeacherProjects(docenteId);
      setProyectos(data);

      // Calcular métricas
      const total = data.length;
      const aprobados = data.filter(p => {
        if (p.estado_calificacion) {
          return p.estado_calificacion === 'aprobado';
        }
        if (p.calificacion !== null && p.calificacion !== undefined) {
          return p.calificacion >= 3.0;
        }
        return false;
      }).length;

      const pendientes = data.filter(p => {
        if (p.estado_calificacion) {
          return p.estado_calificacion === 'pendiente';
        }
        return !p.calificacion && !p.estado_calificacion;
      }).length;

      const reprobados = data.filter(p => {
        if (p.estado_calificacion) {
          return p.estado_calificacion === 'reprobado';
        }
        if (p.calificacion !== null && p.calificacion !== undefined) {
          return p.calificacion < 3.0;
        }
        return false;
      }).length;

      setMetricasProyectos({
        total,
        aprobados,
        pendientes,
        reprobados
      });

    } catch (error) {
    } finally {
      setLoadingProjects(false);
    }
  }, [user, hasRole]);

  // Función para cargar mapas de investigación
  const loadResearchMaps = useCallback(async () => {
    if (!user || !hasRole('docente')) return;

    try {
      setLoadingMaps(true);

      const mapas = await ResearchLinesService.obtenerMapasInvestigacion();
      setLineasMap(mapas.lineasMap);
      setSublineasMap(mapas.sublineasMap);
      setAreasMap(mapas.areasMap);
      setMapasCargados(true);

    } catch (error) {
      // Crear mapas básicos como fallback
      const lineasUnicas = new Map();
      const sublineasUnicas = new Map();
      const areasUnicas = new Map();

      proyectos.forEach(proyecto => {
        if (proyecto.codigo_linea && !lineasUnicas.has(proyecto.codigo_linea)) {
          lineasUnicas.set(proyecto.codigo_linea, `Línea ${proyecto.codigo_linea}`);
        }
        if (proyecto.codigo_sublinea && !sublineasUnicas.has(proyecto.codigo_sublinea)) {
          sublineasUnicas.set(proyecto.codigo_sublinea, `Sublínea ${proyecto.codigo_sublinea}`);
        }
        if (proyecto.codigo_area && !areasUnicas.has(proyecto.codigo_area)) {
          areasUnicas.set(proyecto.codigo_area, `Área ${proyecto.codigo_area}`);
        }
      });

      setLineasMap(lineasUnicas);
      setSublineasMap(sublineasUnicas);
      setAreasMap(areasUnicas);
    } finally {
      setLoadingMaps(false);
    }
  }, [user, hasRole, proyectos]);

  // Función para cargar todos los datos del docente
  const loadAllTeacherData = useCallback(async () => {
    if (!user || !hasRole('docente') || dataLoaded) return;


    // Cargar datos en paralelo para mejor rendimiento
    await Promise.all([
      loadTeacherProfile(),
      loadTeacherProjects()
    ]);

    // Una vez que tenemos los proyectos, cargar los mapas
    if (proyectos.length > 0) {
      await loadResearchMaps();
    }

    setDataLoaded(true);
  }, [user, hasRole, dataLoaded, loadTeacherProfile, loadTeacherProjects, loadResearchMaps, proyectos.length]);

  // Función para refrescar datos (útil después de cambios)
  const refreshTeacherData = useCallback(async () => {
    setDataLoaded(false);
    await loadAllTeacherData();
  }, [loadAllTeacherData]);

  // Función para limpiar datos (útil en logout)
  const clearTeacherData = useCallback(() => {
    setTeacherProfile(null);
    setProyectos([]);
    setLineasMap(new Map());
    setSublineasMap(new Map());
    setAreasMap(new Map());
    setEventosMap(new Map());
    setMetricasProyectos({
      total: 0,
      aprobados: 0,
      pendientes: 0,
      reprobados: 0
    });
    setDataLoaded(false);
    setMapasCargados(false);
  }, []);

  // Funciones helper para obtener nombres
  const getLineaName = useCallback((codigoLinea) => {
    if (!codigoLinea) return 'No asignada';
    return lineasMap.get(codigoLinea) || `Línea ${codigoLinea}`;
  }, [lineasMap]);

  const getSublineaName = useCallback((codigoSublinea) => {
    if (!codigoSublinea) return 'No asignada';
    return sublineasMap.get(codigoSublinea) || `Sublínea ${codigoSublinea}`;
  }, [sublineasMap]);

  const getAreaName = useCallback((codigoArea) => {
    if (!codigoArea) return 'No asignada';
    return areasMap.get(codigoArea) || `Área ${codigoArea}`;
  }, [areasMap]);

  const getEventoName = useCallback((idEvento) => {
    if (!idEvento) return 'No asignado';
    return eventosMap.get(idEvento) || `Evento ${idEvento}`;
  }, [eventosMap]);

  // Efecto para cargar datos cuando el usuario docente está disponible
  useEffect(() => {
    if (user && hasRole('docente') && !dataLoaded) {
      loadAllTeacherData();
    }
  }, [user, hasRole, dataLoaded, loadAllTeacherData]);

  // Efecto para limpiar datos cuando el usuario cambia o se desautentica
  useEffect(() => {
    if (!user || !hasRole('docente')) {
      clearTeacherData();
    }
  }, [user, hasRole, clearTeacherData]);

  const value = {
    // Datos
    teacherProfile,
    proyectos,
    lineasMap,
    sublineasMap,
    areasMap,
    eventosMap,
    metricasProyectos,

    // Estados de carga
    loadingProfile,
    loadingProjects,
    loadingMaps,
    dataLoaded,
    mapasCargados,

    // Funciones
    loadTeacherProfile,
    loadTeacherProjects,
    loadResearchMaps,
    loadAllTeacherData,
    refreshTeacherData,
    clearTeacherData,

    // Helpers
    getLineaName,
    getSublineaName,
    getAreaName,
    getEventoName,
  };

  return (
    <TeacherContext.Provider value={value}>
      {children}
    </TeacherContext.Provider>
  );
};

export default TeacherContext;