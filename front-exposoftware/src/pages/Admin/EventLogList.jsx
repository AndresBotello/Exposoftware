export default function EventLogList({
  filteredRegistros, selectedYear, setSelectedYear, availableYears,
  pdfViewer, setPdfViewer, showForm, setShowForm,
  handleViewPdf, handleDelete,
}) {
  return (
    <>
      {/* Filtro por Año */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <i className="pi pi-filter text-blue-600 text-lg"></i>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Filtrar por Año</h3>
              <p className="text-xs text-gray-500">
                {filteredRegistros.length} registro{filteredRegistros.length !== 1 ? "s" : ""} encontrado{filteredRegistros.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}
            className="border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none min-w-[180px]"
          >
            <option value="">Todos los años</option>
            {availableYears.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Lista de Registros */}
      <div className="space-y-4">
        {filteredRegistros.length > 0 ? (
          filteredRegistros.map((registro) => (
            <div key={registro.id}
              className={`bg-white rounded-lg border p-6 transition-all duration-200 ${pdfViewer?.id === registro.id ? "border-teal-400 shadow-md ring-2 ring-teal-100" : "border-gray-200 hover:shadow-sm"}`}
            >
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold text-lg">{registro.year}</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg font-semibold text-gray-900 truncate">{registro.title}</h4>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{registro.description}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                        <i className="pi pi-calendar text-xs"></i>
                        {new Date(registro.createdAt).toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" })}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                        <i className="pi pi-file-pdf text-xs text-red-500"></i>
                        {registro.pdfName}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => handleViewPdf(registro)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${pdfViewer?.id === registro.id ? "bg-teal-600 text-white hover:bg-teal-700" : "bg-teal-50 text-teal-700 hover:bg-teal-100"}`}
                  >
                    <i className="pi pi-eye"></i>
                    {pdfViewer?.id === registro.id ? "Viendo" : "Ver PDF"}
                  </button>
                  <button onClick={() => handleDelete(registro.id)}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors" title="Eliminar registro"
                  ><i className="pi pi-trash"></i></button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <i className="pi pi-folder-open text-gray-400 text-3xl"></i>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">No hay registros</p>
                <p className="text-xs text-gray-500 mt-1">
                  {selectedYear ? `No se encontraron registros para el año ${selectedYear}` : "Cree un nuevo registro para comenzar"}
                </p>
              </div>
              {!showForm && (
                <button onClick={() => setShowForm(true)}
                  className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
                ><i className="pi pi-plus"></i>Crear primer registro</button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Visor de PDF */}
      {pdfViewer && (
        <div className="bg-white rounded-lg border border-gray-200 mt-6 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-teal-50 to-cyan-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <i className="pi pi-file-pdf text-red-600 text-xl"></i>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{pdfViewer.title}</h3>
                  <p className="text-sm text-gray-500">{pdfViewer.pdfName} — Año {pdfViewer.year}</p>
                </div>
              </div>
              <button onClick={() => setPdfViewer(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Cerrar visor"
              ><i className="pi pi-times text-xl"></i></button>
            </div>
          </div>
          <div style={{ height: "700px", position: "relative" }}>
            <iframe src={pdfViewer.pdfBase64} width="100%" height="100%"
              style={{ border: "none", display: "block" }} title={`PDF - ${pdfViewer.title}`}
            />
          </div>
        </div>
      )}
    </>
  );
}
