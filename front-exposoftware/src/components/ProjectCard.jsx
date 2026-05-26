export default function ProjectCard({ proyecto, onViewDetails }) {
  const obtenerNombreTipoActividad = (tipoId) => {
    const tipos = {
      1: '📚 Proyecto',
      2: '🛠️ Taller',
      3: '🎤 Ponencia',
      4: '🎭 Conferencia'
    };
    return tipos[tipoId] || 'Tipo desconocido';
  };

  const getEstadoBadgeColor = (estado) => {
    if (!estado) return 'bg-gray-100 text-gray-700';
    const lower = estado.toLowerCase();
    if (lower.includes('aprobado')) return 'bg-emerald-100 text-emerald-700';
    if (lower.includes('pendiente')) return 'bg-amber-100 text-amber-700';
    if (lower.includes('reprobado')) return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-700';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  };

  return (
    <div className="group bg-white rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-emerald-200/40 transition-all duration-300 hover:-translate-y-1 flex flex-col cursor-pointer border border-gray-150 hover:border-emerald-300">
      {/* Header con fondo verde y estado */}
      <div className="relative bg-gradient-to-r from-emerald-500 to-teal-600 p-5 text-white">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="text-lg font-bold leading-snug line-clamp-2 flex-1">
            {proyecto.titulo_proyecto || proyecto.nombre_proyecto || 'Proyecto sin título'}
          </h3>
          {proyecto.estado_calificacion && (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold whitespace-nowrap flex-shrink-0 ${getEstadoBadgeColor(proyecto.estado_calificacion)}`}>
              {proyecto.estado_calificacion}
            </span>
          )}
        </div>

        {/* Fecha */}
        {(proyecto.fecha_subida || proyecto.created_at) && (
          <div className="flex items-center gap-2 text-white/90 text-sm">
            <i className="pi pi-calendar text-sm"></i>
            <span>{formatDate(proyecto.fecha_subida || proyecto.created_at)}</span>
          </div>
        )}
      </div>

      {/* Contenido principal */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Información en cards compactas */}
        <div className="space-y-3 mb-5 flex-1">
          {/* Estudiantes */}
          {proyecto.integrantes && proyecto.integrantes.length > 0 && (
            <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-emerald-200 flex items-center justify-center flex-shrink-0">
                <i className="pi pi-users text-emerald-700 text-sm"></i>
              </div>
              <span className="text-sm text-gray-800 font-medium">
                {proyecto.integrantes.length} estudiante{proyecto.integrantes.length !== 1 ? '(s)' : ''}
              </span>
            </div>
          )}

          {/* Materia */}
          {proyecto.nombre_materia && (
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0">
                <i className="pi pi-book text-blue-700 text-sm"></i>
              </div>
              <span className="text-sm text-gray-800 font-medium line-clamp-1">
                {proyecto.nombre_materia}
              </span>
            </div>
          )}

          {/* Tipo de actividad */}
          {proyecto.tipo_actividad && (
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-purple-200 flex items-center justify-center flex-shrink-0">
                <i className="pi pi-tag text-purple-700 text-sm"></i>
              </div>
              <span className="text-sm text-gray-800 font-medium">
                {obtenerNombreTipoActividad(proyecto.tipo_actividad)}
              </span>
            </div>
          )}

          {/* Línea de investigación */}
          {proyecto.nombre_linea && (
            <div className="space-y-1.5 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
                Línea de investigación
              </p>
              <p className="text-sm text-gray-900 font-semibold line-clamp-1">
                {proyecto.nombre_linea}
              </p>
            </div>
          )}

          {/* Docente */}
          {proyecto.id_docente?.nombre && (
            <div className="text-xs text-gray-600 p-2 bg-gray-50 rounded">
              <span className="font-medium">{proyecto.id_docente.nombre}</span>
            </div>
          )}
        </div>

        {/* Botón Ver Detalles */}
        <button
          onClick={() => onViewDetails(proyecto)}
          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-2.5 px-4 rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-emerald-200/40 group-hover:shadow-xl group-hover:shadow-emerald-300/50 text-sm mt-auto"
        >
          <i className="pi pi-eye text-sm"></i>
          Ver Detalles
          <i className="pi pi-arrow-right text-xs opacity-70 group-hover:translate-x-1 transition-transform duration-300"></i>
        </button>
      </div>
    </div>
  );
}
