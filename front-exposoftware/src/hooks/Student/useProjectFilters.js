import { useState, useEffect, useMemo } from "react";

export function useProjectFilters(projects) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMateria, setFilterMateria] = useState('Todas');
  const [filterGrupo, setFilterGrupo] = useState('Todos');
  const [filteredProjects, setFilteredProjects] = useState([]);

  // Obtener lista única de materias
  const materias = useMemo(() => {
    const materiasUnicas = new Set();
    projects.forEach(p => {
      if (p.nombre_materia) materiasUnicas.add(p.nombre_materia);
      else if (p.codigo_materia) materiasUnicas.add(p.codigo_materia);
    });
    return Array.from(materiasUnicas).sort();
  }, [projects]);

  // Obtener lista única de grupos para la materia seleccionada
  const grupos = useMemo(() => {
    const gruposUnicos = new Set();
    projects.forEach(p => {
      const materia = p.nombre_materia || p.codigo_materia;

      // Si no hay filtro de materia o coincide con la materia actual
      if (filterMateria === 'Todas' || materia === filterMateria) {
        if (p.nombre_grupo) gruposUnicos.add(p.nombre_grupo);
        else if (p.id_grupo) gruposUnicos.add(`Grupo ${p.id_grupo}`);
      }
    });
    return Array.from(gruposUnicos).sort();
  }, [projects, filterMateria]);

  useEffect(() => {
    let filtered = projects;

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.titulo_proyecto?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por materia
    if (filterMateria && filterMateria !== 'Todas') {
      filtered = filtered.filter(p => {
        const materia = p.nombre_materia || p.codigo_materia;
        return materia === filterMateria;
      });
    }

    // Filtrar por grupo
    if (filterGrupo && filterGrupo !== 'Todos') {
      filtered = filtered.filter(p => {
        const grupo = p.nombre_grupo || (p.id_grupo ? `Grupo ${p.id_grupo}` : null);
        return grupo === filterGrupo;
      });
    }

    setFilteredProjects(filtered);
  }, [projects, searchTerm, filterMateria, filterGrupo]);

  const clearFilters = () => {
    setSearchTerm('');
    setFilterMateria('Todas');
    setFilterGrupo('Todos');
  };

  const hasFilters = searchTerm || (filterMateria && filterMateria !== 'Todas') || (filterGrupo && filterGrupo !== 'Todos');

  return {
    searchTerm,
    setSearchTerm,
    filterMateria,
    setFilterMateria,
    filterGrupo,
    setFilterGrupo,
    materias,
    grupos,
    filteredProjects,
    clearFilters,
    hasFilters
  };
}
