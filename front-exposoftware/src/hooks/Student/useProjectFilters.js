import { useState, useEffect } from "react";
export function useProjectFilters(projects) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMateria, setFilterMateria] = useState('');
  const [filteredProjects, setFilteredProjects] = useState([]);

  useEffect(() => {
    let filtered = projects;
    if (searchTerm) filtered = filtered.filter(p => p.titulo_proyecto?.toLowerCase().includes(searchTerm.toLowerCase()));
    if (filterMateria) filtered = filtered.filter(p => p.codigo_materia?.toLowerCase().includes(filterMateria.toLowerCase()));
    setFilteredProjects(filtered);
  }, [projects, searchTerm, filterMateria]);

  return { searchTerm, setSearchTerm, filterMateria, setFilterMateria, filteredProjects, clearFilters: () => { setSearchTerm(''); setFilterMateria(''); }, hasFilters: searchTerm || filterMateria };
}
