export default function ProjectCard({ proyecto, onViewDetails }) {
  // Guard: retornar nada si proyecto es undefined o null
  if (!proyecto) {
    return null;
  }

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const getEstadoBadgeColor = (estado) => {
    if (!estado) return 'bg-gray-100 text-gray-700';
    const lower = estado.toLowerCase();
    if (lower.includes('aprobado')) return 'bg-emerald-100 text-emerald-700';
    if (lower.includes('pendiente')) return 'bg-amber-100 text-amber-700';
    if (lower.includes('reprobado')) return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="group bg-white rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-emerald-200/50 transition-all duration-300 hover:-translate-y-2 flex flex-col cursor-pointer border border-gray-200 hover:border-emerald-400 h-full">
      {/* Imagen del Proyecto - Protagonista */}
      <div className="relative w-full h-56 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden flex items-center justify-center">
        {proyecto.url_preview_png ? (
          <img
            src={proyecto.url_preview_png}
            alt={proyecto.titulo_proyecto || 'Proyecto'}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : proyecto.url_cloudinary ? (
          <div className="flex items-center justify-center h-full w-full bg-gray-200">
            <i className="pi pi-file-pdf text-gray-400 text-5xl"></i>
          </div>
        ) : (
          <i className="pi pi-image text-gray-300 text-5xl"></i>
        )}

        {/* Badge de Estado - Esquina Superior */}
        {proyecto.estado && (
          <span className={`absolute top-3 right-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${getEstadoBadgeColor(proyecto.estado)}`}>
            {proyecto.estado.charAt(0).toUpperCase() + proyecto.estado.slice(1)}
          </span>
        )}
      </div>

      {/* Contenido - Información Compacta */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        {/* Título y Fecha */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900 leading-snug line-clamp-2 mb-2">
            {proyecto.titulo_proyecto || proyecto.nombre_proyecto || 'Proyecto sin título'}
          </h3>

          {(proyecto.fecha_subida || proyecto.created_at) && (
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <i className="pi pi-calendar text-sm"></i>
              <span>{formatDate(proyecto.fecha_subida || proyecto.created_at)}</span>
            </div>
          )}
        </div>

        {/* Información Compacta */}
        <div className="space-y-2 mb-4 text-sm text-gray-600">
          {proyecto.integrantes && proyecto.integrantes.length > 0 && (
            <div className="flex items-center gap-2">
              <i className="pi pi-users text-emerald-600 text-sm"></i>
              <span>{proyecto.integrantes.length} estudiante{proyecto.integrantes.length !== 1 ? '(s)' : ''}</span>
            </div>
          )}

          {proyecto.nombre_materia && (
            <div className="flex items-center gap-2">
              <i className="pi pi-book text-blue-600 text-sm"></i>
              <span className="line-clamp-1">{proyecto.nombre_materia}</span>
            </div>
          )}
        </div>

        {/* Botón Ver Detalles */}
        <button
          onClick={() => onViewDetails(proyecto)}
          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-2.5 px-4 rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-emerald-200/40 group-hover:shadow-xl group-hover:shadow-emerald-300/60 text-sm"
        >
          <i className="pi pi-eye text-sm"></i>
          Ver Detalles
        </button>
      </div>
    </div>
  );
}
