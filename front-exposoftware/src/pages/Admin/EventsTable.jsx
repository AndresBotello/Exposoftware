export default function EventsTable({
  loadingEventos,
  eventosFiltrados,
  eventos,
  filtroEstado,
  setFiltroEstado,
  estadisticas,
  formatearFechaDisplay,
  getEstadoBadgeColor,
  cargarEventos,
  handleEditarEvento,
  handleVerCapacidad,
  handleCambiarEstado,
  handleArchivarEvento,
}) {
  return (
    <div className="space-y-6">
      {/* Estadísticas - Filtros Clicables */}
      {estadisticas && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { key: "TODOS", label: "Total Eventos", value: estadisticas.total_eventos || 0, color: "blue", icon: "pi-calendar" },
            { key: "cancelado", label: "Cancelados", value: eventos.filter(e => e.estado === 'cancelado').length, color: "red", icon: "pi-times-circle" },
            { key: "finalizado", label: "Finalizados", value: eventos.filter(e => e.estado === 'finalizado').length, color: "gray", icon: "pi-check-circle" },
            { key: "borrador", label: "Borradores", value: eventos.filter(e => e.estado === 'borrador').length, color: "yellow", icon: "pi-pencil" },
          ].map(({ key, label, value, color, icon }) => (
            <button
              key={key}
              onClick={() => setFiltroEstado(key)}
              className={`bg-white rounded-xl shadow-sm border p-6 hover:shadow-lg transition-all text-left ${filtroEstado === key ? `border-${color}-500 ring-2 ring-${color}-200` : 'border-gray-100'}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
                  <p className={`text-3xl font-bold ${color === 'blue' ? 'text-gray-900' : `text-${color}-600`} mt-2`}>{value}</p>
                </div>
                <div className={`w-14 h-14 bg-gradient-to-br from-${color}-500 to-${color}-600 rounded-xl flex items-center justify-center shadow-lg`}>
                  <i className={`pi ${icon} text-2xl text-white`}></i>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Lista de Eventos */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {filtroEstado === "TODOS" ? "Todos los Eventos" : `Eventos ${filtroEstado.charAt(0).toUpperCase() + filtroEstado.slice(1)}`}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Mostrando {eventosFiltrados.length} de {eventos.length} eventos
              </p>
            </div>
            <div className="flex gap-2">
              {filtroEstado !== "TODOS" && (
                <button
                  onClick={() => setFiltroEstado("TODOS")}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium text-sm flex items-center gap-2"
                >
                  <i className="pi pi-times"></i>
                  Limpiar filtro
                </button>
              )}
              <button
                onClick={cargarEventos}
                className="px-5 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-lg hover:from-teal-700 hover:to-emerald-700 transition shadow-md font-medium text-sm flex items-center gap-2"
              >
                <i className="pi pi-refresh"></i>
                Actualizar
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loadingEventos ? (
            <div className="p-8 text-center text-gray-500">
              <div className="animate-spin inline-block w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full"></div>
              <p className="mt-2">Cargando eventos...</p>
            </div>
          ) : eventosFiltrados.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <i className="pi pi-inbox text-4xl text-gray-300 mb-3"></i>
              <p className="font-medium">No hay eventos {filtroEstado !== "TODOS" ? `con estado ${filtroEstado}` : 'registrados'}</p>
              {filtroEstado !== "TODOS" && (
                <button onClick={() => setFiltroEstado("TODOS")} className="mt-3 text-teal-600 hover:text-teal-700 text-sm font-medium">
                  Ver todos los eventos
                </button>
              )}
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {["Evento", "Fechas", "Lugar", "Estado", "Acciones"].map(col => (
                    <th key={col} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {eventosFiltrados.map((evento) => (
                  <tr key={evento.id_evento} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{evento.nombre_evento}</p>
                      <p className="text-xs text-gray-500">{evento.descripcion}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <p className="text-xs">Inicio: {formatearFechaDisplay(evento.fecha_inicio)}</p>
                      <p className="text-xs">Fin: {formatearFechaDisplay(evento.fecha_fin)}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{evento.lugar}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoBadgeColor(evento.estado)}`}>
                        {evento.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEditarEvento(evento)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                          <i className="pi pi-pencil"></i>
                        </button>
                        <button onClick={() => handleVerCapacidad(evento.id_evento)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Ver Capacidad">
                          <i className="pi pi-chart-bar"></i>
                        </button>
                        {evento.estado !== 'cancelado' && evento.estado !== 'finalizado' && (
                          <button onClick={() => handleCambiarEstado(evento.id_evento, 'cancelado')} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Cancelar">
                            <i className="pi pi-times-circle"></i>
                          </button>
                        )}
                        {evento.estado === 'cancelado' && (
                          <button onClick={() => handleCambiarEstado(evento.id_evento, 'borrador')} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Reagendar">
                            <i className="pi pi-refresh"></i>
                          </button>
                        )}
                        <button onClick={() => handleArchivarEvento(evento.id_evento)} className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors" title="Archivar">
                          <i className="pi pi-folder"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
