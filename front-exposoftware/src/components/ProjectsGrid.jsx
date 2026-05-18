import React, { useState, useMemo } from 'react';
import { Search, Grid, List } from 'lucide-react';
import ProjectCard from './ProjectCard';

/**
 * ProjectsGrid - Componente para mostrar una lista de proyectos en formato grid o lista
 * @param {Array} projects - Lista de proyectos a mostrar
 * @param {boolean} loading - Si está cargando
 * @param {string} error - Mensaje de error si existe
 * @param {Function} onProjectClick - Callback cuando se hace clic en un proyecto
 * @param {number} columns - Número de columnas del grid (default: 3)
 */
export default function ProjectsGrid({
  projects = [],
  loading = false,
  error = null,
  onProjectClick,
  columns = 3
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' o 'list'

  // Filtrar proyectos según búsqueda
  const filteredProjects = useMemo(() => {
    if (!searchTerm.trim()) return projects;

    const term = searchTerm.toLowerCase();
    return projects.filter(project => {
      const titulo = (project.titulo || '').toLowerCase();
      const descripcion = (project.descripcion || '').toLowerCase();
      const tiposActividad = {
        1: 'proyecto',
        2: 'taller',
        3: 'ponencia',
        4: 'conferencia'
      };
      const tipo = tiposActividad[project.tipo_actividad] || '';

      return (
        titulo.includes(term) ||
        descripcion.includes(term) ||
        tipo.includes(term)
      );
    });
  }, [projects, searchTerm]);

  // Determinar columnas responsive
  const gridColsClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  }[columns] || 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';

  return (
    <div className="w-full">
      {/* Barra de búsqueda y controles */}
      <div className="mb-6 space-y-4">
        {/* Búsqueda */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar proyectos por título, descripción o tipo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
          />
        </div>

        {/* Controles de vista */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Mostrando <strong>{filteredProjects.length}</strong> de <strong>{projects.length}</strong> proyectos
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition ${
                viewMode === 'grid'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title="Vista de grid"
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition ${
                viewMode === 'list'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title="Vista de lista"
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Contenido */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-6">
          <p className="font-semibold">Error al cargar proyectos</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {loading ? (
        // Estado de carga
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Cargando proyectos...</p>
          </div>
        </div>
      ) : filteredProjects.length === 0 ? (
        // Sin proyectos
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <div className="text-gray-400 mb-3">
            <Grid size={48} className="mx-auto" />
          </div>
          <p className="text-gray-600 font-medium mb-2">
            {searchTerm ? 'No se encontraron proyectos' : 'No hay proyectos disponibles'}
          </p>
          {searchTerm && (
            <p className="text-sm text-gray-500 mb-4">
              Intenta con otros términos de búsqueda
            </p>
          )}
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-green-600 hover:text-green-700 font-medium text-sm"
            >
              Limpiar búsqueda
            </button>
          )}
        </div>
      ) : (
        // Grid de proyectos
        <div
          className={`grid ${
            viewMode === 'grid'
              ? gridColsClass
              : 'grid-cols-1'
          } gap-6`}
        >
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id_proyecto || Math.random()}
              project={project}
              onClick={() => onProjectClick?.(project)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
