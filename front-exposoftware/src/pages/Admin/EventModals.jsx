export default function EventModals({
  showEditModal,
  setShowEditModal,
  nombreEvento, setNombreEvento,
  descripcion, setDescripcion,
  fechaInicio, setFechaInicio,
  fechaFin, setFechaFin,
  lugarEvento, setLugarEvento,
  cupoMaximo, setCupoMaximo,
  estado, setEstado,
  guardandoEvento,
  handleGuardarEvento,
  showCapacidadModal,
  setShowCapacidadModal,
  capacidadInfo,
}) {
  return (
    <>
      {/* Modal de Edición */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-teal-600 to-emerald-600">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <i className="pi pi-pencil text-xl text-white"></i>
                </div>
                <h3 className="text-2xl font-bold text-white">Editar Evento</h3>
              </div>
            </div>

            <form onSubmit={handleGuardarEvento} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Evento <span className="text-red-500">*</span></label>
                  <input type="text" value={nombreEvento} onChange={(e) => setNombreEvento(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Lugar <span className="text-red-500">*</span></label>
                  <input type="text" value={lugarEvento} onChange={(e) => setLugarEvento(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Inicio <span className="text-red-500">*</span></label>
                  <input type="datetime-local" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Fin <span className="text-red-500">*</span></label>
                  <input type="datetime-local" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cupo Máximo <span className="text-red-500">*</span></label>
                  <input type="number" value={cupoMaximo} onChange={(e) => setCupoMaximo(e.target.value)} min="1"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estado <span className="text-red-500">*</span></label>
                  <select value={estado} onChange={(e) => setEstado(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" required
                  >
                    <option value="ACTIVO">ACTIVO</option>
                    <option value="INACTIVO">INACTIVO</option>
                    <option value="CANCELADO">CANCELADO</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Descripción <span className="text-red-500">*</span></label>
                  <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" required
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button type="button" onClick={() => setShowEditModal(false)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition flex items-center gap-2"
                >
                  <i className="pi pi-times"></i> Cancelar
                </button>
                <button type="submit" disabled={guardandoEvento}
                  className={`px-6 py-3 text-white rounded-lg font-semibold transition flex items-center gap-2 ${guardandoEvento ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 shadow-md'}`}
                >
                  {guardandoEvento ? (
                    <><span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>Guardando...</>
                  ) : (
                    <><i className="pi pi-save"></i>Guardar Cambios</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Capacidad */}
      {showCapacidadModal && capacidadInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-cyan-600">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <i className="pi pi-chart-bar text-xl text-white"></i>
                </div>
                <h3 className="text-2xl font-bold text-white">Información de Capacidad</h3>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {[
                { label: "Cupo Máximo", value: capacidadInfo.cupo_maximo, color: "gray", icon: "pi-users" },
                { label: "Inscritos", value: capacidadInfo.inscritos, color: "blue", icon: "pi-user-plus" },
                { label: "Disponibles", value: capacidadInfo.disponibles, color: "green", icon: "pi-check-square" },
                { label: "Porcentaje Ocupado", value: `${capacidadInfo.porcentaje_ocupado}%`, color: "orange", icon: "pi-percentage" },
              ].map(({ label, value, color, icon }) => (
                <div key={label} className={`flex justify-between items-center p-4 bg-${color}-50 rounded-lg`}>
                  <span className="text-gray-600 font-medium flex items-center gap-2">
                    <i className={`pi ${icon} text-${color}-500`}></i>
                    {label}
                  </span>
                  <span className={`text-xl font-bold text-${color === 'gray' ? 'gray-900' : `${color}-600`}`}>{value}</span>
                </div>
              ))}
              <div className="pt-2">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progreso de ocupación</span>
                  <span className="font-semibold">{capacidadInfo.porcentaje_ocupado}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                  <div className="bg-gradient-to-r from-teal-500 to-emerald-500 h-3 rounded-full transition-all shadow-sm"
                    style={{ width: `${capacidadInfo.porcentaje_ocupado}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end bg-gray-50">
              <button onClick={() => setShowCapacidadModal(false)}
                className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg font-semibold hover:from-gray-700 hover:to-gray-800 transition shadow-md flex items-center gap-2"
              >
                <i className="pi pi-times"></i> Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
