export default function ProjectCard({ proyecto, onViewDetails }) {
  const obtenerNombreTipoActividad = (tipoId) => {
    const tipos = {
      1: 'Proyecto (Exposoftware)',
      2: 'Taller',
      3: 'Ponencia',
      4: 'Conferencia'
    };
    return tipos[tipoId] || 'Tipo desconocido';
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-2xl hover:shadow-emerald-100/50 transition-all duration-500 hover:-translate-y-2 group flex flex-col cursor-pointer">
      {/* Header de la tarjeta */}
      <div className="relative bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600 p-5">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative">
          {proyecto.tipo_actividad && (
            <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full font-semibold mb-3 border border-white/10">
              <i className="pi pi-tag text-[10px]"></i>
              {obtenerNombreTipoActividad(proyecto.tipo_actividad)}
            </span>
          )}
          <h3 className="text-base font-bold text-white leading-snug line-clamp-2 min-h-[2.75rem]">
            {proyecto.titulo_proyecto || proyecto.nombre_proyecto || 'Proyecto sin título'}
          </h3>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Información del proyecto */}
        <div className="space-y-3 mb-5 flex-1">
          {proyecto.id_docente?.nombre && (
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <i className="pi pi-user text-emerald-600 text-xs"></i>
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">Docente</p>
                <p className="text-sm text-gray-700 font-medium truncate">
                  {proyecto.id_docente.nombre || proyecto.id_docente}
                </p>
              </div>
            </div>
          )}

          {proyecto.id_estudiantes && proyecto.id_estudiantes.length > 0 && (
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <i className="pi pi-users text-blue-600 text-xs"></i>
              </div>
              <div>
                <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">Equipo</p>
                <p className="text-sm text-gray-700 font-medium">
                  {proyecto.id_estudiantes.length} estudiante{proyecto.id_estudiantes.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          )}

          {proyecto.nombre_linea && (
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                <i className="pi pi-bookmark text-purple-600 text-xs"></i>
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">Línea</p>
                <p className="text-sm text-gray-700 font-medium truncate">{proyecto.nombre_linea}</p>
              </div>
            </div>
          )}

          {proyecto.nombre_materia && (
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                <i className="pi pi-book text-orange-600 text-xs"></i>
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">Materia</p>
                <p className="text-sm text-gray-700 font-medium truncate">{proyecto.nombre_materia}</p>
              </div>
            </div>
          )}
        </div>

        {/* Estado y calificación */}
        {(proyecto.estado_calificacion || proyecto.calificacion !== undefined) && (
          <div className="flex items-center justify-between mb-4 p-3 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-100">
            {proyecto.estado_calificacion && (
              <div className="flex items-center gap-1.5 text-xs">
                <span className={`w-2 h-2 rounded-full ${
                  proyecto.estado_calificacion.toLowerCase().includes('aprobado')
                    ? 'bg-emerald-500'
                    : proyecto.estado_calificacion.toLowerCase().includes('pendiente')
                    ? 'bg-amber-500'
                    : 'bg-gray-400'
                }`}></span>
                <span className={`font-semibold ${
                  proyecto.estado_calificacion.toLowerCase().includes('aprobado')
                    ? 'text-emerald-700'
                    : proyecto.estado_calificacion.toLowerCase().includes('pendiente')
                    ? 'text-amber-700'
                    : 'text-gray-600'
                }`}>
                  {proyecto.estado_calificacion}
                </span>
              </div>
            )}

            {proyecto.calificacion !== undefined && (
              <div className="flex items-center gap-1.5 text-xs">
                <i className="pi pi-star-fill text-amber-400 text-[10px]"></i>
                <span className="font-bold text-gray-700">{proyecto.calificacion}<span className="text-gray-400 font-normal">/5</span></span>
              </div>
            )}
          </div>
        )}

        {/* Botón */}
        <button
          onClick={() => onViewDetails(proyecto)}
          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-emerald-200/40 group-hover:shadow-xl group-hover:shadow-emerald-200/60 mt-auto text-sm"
        >
          <i className="pi pi-eye text-sm"></i>
          Ver Detalles
          <i className="pi pi-arrow-right text-xs ml-1 group-hover:translate-x-1 transition-transform duration-300"></i>
        </button>
      </div>
    </div>
  );
}
