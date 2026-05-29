import React from "react";

// 🎨 Mapeo de tarjetas alineado perfectamente con los estados de tu BD/Backend
const ESTADOS_CARDS = {
  TODOS: {
    label: "Total Eventos",
    icon: "pi-calendar",
    styles: "border-blue-500 ring-2 ring-blue-200",
    text: "text-gray-900",
    gradient: "from-blue-500 to-blue-600",
  },
  inscripciones_abiertas: {
    label: "Abiertos",
    icon: "pi-calendar-plus",
    styles: "border-green-500 ring-2 ring-green-200",
    text: "text-green-600",
    gradient: "from-green-500 to-green-600",
  },
  en_curso: {
    label: "En Curso",
    icon: "pi-sync",
    styles: "border-purple-500 ring-2 ring-purple-200",
    text: "text-purple-600",
    gradient: "from-purple-500 to-purple-600",
  },
  cancelado: {
    label: "Cancelados",
    icon: "pi-times-circle",
    styles: "border-red-500 ring-2 ring-red-200",
    text: "text-red-600",
    gradient: "from-red-500 to-red-600",
  },
};

export default function EventsTable({
  loadingEventos,
  eventosFiltrados = [],
  eventos = [],
  filtroEstado = "TODOS",
  setFiltroEstado,
  formatearFechaDisplay,
  getEstadoBadgeColor,
  cargarEventos,
  handleEditarEvento,
  handleVerCapacidad,
  handleCambiarEstado,
  handleArchivarEvento,
}) {
  
  const obtenerTituloFiltro = () => {
    if (filtroEstado === "TODOS" || !filtroEstado) return "Todos los Eventos";
    return `Eventos en Estado: ${filtroEstado.replace("_", " ")}`;
  };

  return (
    <div className="space-y-6">
      
      {/* 📊 BARRA DE FILTROS SUPERIORES (SIEMPRE FIJA Y VISIBLE) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.entries(ESTADOS_CARDS).map(([key, config]) => {
          // Calculamos los totales usando el arreglo completo e inmutable 'eventos'
          const totalItems = key === "TODOS" 
            ? eventos.length 
            : eventos.filter((e) => e.estado === key).length;

          const esActivo = filtroEstado === key;

          return (
            <button
              key={key}
              type="button"
              onClick={() => setFiltroEstado(key)}
              className={`bg-white rounded-xl shadow-sm border p-6 hover:shadow-lg transition-all text-left cursor-pointer ${
                esActivo ? config.styles : "border-gray-100"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {config.label}
                  </p>
                  <p className={`text-3xl font-bold mt-2 ${config.text}`}>
                    {totalItems}
                  </p>
                </div>
                <div className={`w-14 h-14 bg-gradient-to-br ${config.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                  <i className={`pi ${config.icon} text-2xl text-white`}></i>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* 📋 SECCIÓN TABLA O CONTEXTO DE ERROR */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900 capitalize">
                {obtenerTituloFiltro()}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Mostrando {eventosFiltrados.length} de {eventos.length} eventos
              </p>
            </div>
            
            <div className="flex gap-2">
              {filtroEstado !== "TODOS" && (
                <button
                  onClick={() => setFiltroEstado("TODOS")}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium text-sm flex items-center gap-2 cursor-pointer"
                >
                  <i className="pi pi-times"></i>
                  Limpiar filtro
                </button>
              )}
              <button
                onClick={cargarEventos}
                className="px-5 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-lg hover:from-teal-700 hover:to-emerald-700 transition shadow-md font-medium text-sm flex items-center gap-2 cursor-pointer"
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
            /* INTERFAZ EN CASO DE ESTADO SIN REGISTROS */
            <div className="p-12 text-center text-gray-500">
              <i className="pi pi-inbox text-4xl text-gray-300 mb-3 block"></i>
              <p className="font-semibold text-gray-700">No hay proyectos o eventos en este estado</p>
              <p className="text-xs text-gray-400 mt-1">Prueba seleccionando otra de las categorías superiores.</p>
              {filtroEstado !== "TODOS" && (
                <button 
                  onClick={() => setFiltroEstado("TODOS")} 
                  className="mt-4 text-sm font-medium text-teal-600 hover:text-teal-700 bg-teal-50 px-4 py-2 rounded-lg transition-colors inline-block"
                >
                  Ver todos los eventos
                </button>
              )}
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {["Evento", "Fechas", "Lugar", "Estado", "Acciones"].map((col) => (
                    <th key={col} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {eventosFiltrados.map((evento) => {
                  const { id_evento, nombre_evento, descripcion, fecha_inicio, fecha_fin, lugar, estado } = evento;
                  const esEspecial = estado === "cancelado" || estado === "finalizado";

                  return (
                    <tr key={id_evento} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">{nombre_evento}</p>
                        <p className="text-xs text-gray-500 line-clamp-1">{descripcion}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <p className="text-xs">Inicio: {formatearFechaDisplay(fecha_inicio)}</p>
                        <p className="text-xs">Fin: {formatearFechaDisplay(fecha_fin)}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{lugar}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoBadgeColor(estado)}`}>
                          {estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleEditarEvento(evento)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                            <i className="pi pi-pencil"></i>
                          </button>
                          <button onClick={() => handleVerCapacidad(id_evento)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Ver Capacidad">
                            <i className="pi pi-chart-bar"></i>
                          </button>

                          {!esEspecial ? (
                            <button onClick={() => handleCambiarEstado(id_evento, "cancelado")} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Cancelar">
                              <i className="pi pi-times-circle"></i>
                            </button>
                          ) : estado === "cancelado" ? (
                            <button onClick={() => handleCambiarEstado(id_evento, "borrador")} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Reagendar">
                              <i className="pi pi-refresh"></i>
                            </button>
                          ) : null}

                          <button onClick={() => handleArchivarEvento(id_evento)} className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors" title="Archivar">
                            <i className="pi pi-folder"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}