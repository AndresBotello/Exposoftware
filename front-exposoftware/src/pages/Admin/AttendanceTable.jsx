export default function AttendanceTable({
  filteredPeople,
  currentItems,
  searchTerm,
  setSearchTerm,
  setCurrentPage,
  eventoSeleccionado,
  registeredPeople,
  currentPage,
  totalPages,
  indexOfFirstItem,
  indexOfLastItem,
  goToPage,
  prevPage,
  nextPage,
  formatearFechaHora,
  exportarAsistenciasExcel,
  exportarGraficaComoImagen,
  eventoNombre,
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <i className="pi pi-users text-purple-600 text-xl"></i>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Personas Registradas</h3>
            <p className="text-sm text-gray-500">
              {filteredPeople.length}{" "}
              {filteredPeople.length === 1 ? "persona registrada" : "personas registradas"}
            </p>
          </div>
        </div>

        <div className="relative">
          <i className="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
          <input
            type="text"
            placeholder="Buscar por nombre, ID o correo..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent w-80"
          />
        </div>
      </div>

      {registeredPeople.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-3 justify-center">
          <button
            onClick={exportarAsistenciasExcel}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
          >
            <i className="pi pi-file-excel"></i>
            Exportar a Excel
          </button>
          <button
            onClick={() => exportarGraficaComoImagen('asistencias-chart', `Asistencias_${eventoNombre}`)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
          >
            <i className="pi pi-image"></i>
            Gráfica como Imagen
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">#</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nombre Completo</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Correo Electrónico</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Fecha y Hora</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentItems.length > 0 ? (
              currentItems.map((person, index) => (
                <tr key={person.id_asistencia || index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 text-sm text-gray-900 font-medium">{indexOfFirstItem + index + 1}</td>
                  <td className="px-4 py-4 text-sm text-gray-900">{person.nombre_completo}</td>
                  <td className="px-4 py-4 text-sm text-gray-600">{person.correo}</td>
                  <td className="px-4 py-4 text-sm text-gray-600">
                    {(() => {
                      const { fecha, hora } = formatearFechaHora(person.fecha_asistencia);
                      return (
                        <div className="flex flex-col">
                          <span>{fecha}</span>
                          <span className="text-xs text-gray-500">{hora}</span>
                        </div>
                      );
                    })()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                      <i className="pi pi-users text-gray-400 text-3xl"></i>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">No se encontraron registros</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {searchTerm
                          ? "Intenta con otros términos de búsqueda"
                          : eventoSeleccionado
                          ? "Aún no hay personas registradas en este evento"
                          : "Selecciona un evento para ver las asistencias"}
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
          <div className="text-sm text-gray-600">
            Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, filteredPeople.length)} de {filteredPeople.length} registros
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <i className="pi pi-chevron-left"></i>
            </button>
            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, index) => {
                const pageNumber = index + 1;
                if (pageNumber === 1 || pageNumber === totalPages || (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)) {
                  return (
                    <button key={pageNumber} onClick={() => goToPage(pageNumber)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentPage === pageNumber ? "bg-teal-600 text-white" : "border border-gray-300 text-gray-700 hover:bg-gray-50"}`}
                    >
                      {pageNumber}
                    </button>
                  );
                } else if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
                  return <span key={pageNumber} className="px-2 text-gray-500">...</span>;
                }
                return null;
              })}
            </div>
            <button
              onClick={nextPage}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <i className="pi pi-chevron-right"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
