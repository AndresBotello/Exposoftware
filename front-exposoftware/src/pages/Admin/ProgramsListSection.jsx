export default function ProgramsListSection({
  facultadSeleccionada, loadingProgramas, programasFiltrados, programas,
  searchTerm, setSearchTerm, cargando,
  handleEditarPrograma, handleEliminarPrograma,
  showEditModal, nombreEditado, setNombreEditado, error,
  handleGuardarEdicion, handleCancelarEdicion,
}) {
  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Programas {facultadSeleccionada && `de ${facultadSeleccionada}`}
          </h2>
          <p className="text-sm text-gray-600">Gestiona los programas académicos disponibles.</p>
        </div>

        {!facultadSeleccionada ? (
          <div className="text-center py-12 text-gray-500">
            <i className="pi pi-inbox text-4xl mb-4 block opacity-50"></i>
            <p>Selecciona una facultad para ver sus programas</p>
          </div>
        ) : loadingProgramas ? (
          <div className="text-center py-12">
            <span className="animate-spin inline-block w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full"></span>
            <p className="text-gray-600 mt-4">Cargando programas...</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <div className="relative">
                <i className="pi pi-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                <input type="text" placeholder="Buscar por nombre o código..." value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>

            {programasFiltrados.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <i className="pi pi-inbox text-4xl mb-4 block opacity-50"></i>
                <p>{programas.length === 0 ? 'No hay programas registrados aún' : 'No se encontraron programas coincidentes'}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      {["Código", "Nombre", "Acciones"].map((col, i) => (
                        <th key={col} className={`py-3 px-4 font-semibold text-gray-700 ${i === 2 ? "text-center" : "text-left"}`}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {programasFiltrados.map((programa) => (
                      <tr key={programa.codigo_programa} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4 font-mono text-sm text-gray-800">{programa.codigo_programa}</td>
                        <td className="py-4 px-4 text-sm text-gray-800">{programa.nombre_programa}</td>
                        <td className="py-4 px-4">
                          <div className="flex justify-center gap-2">
                            <button onClick={() => handleEditarPrograma(programa)} disabled={cargando}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed" title="Editar"
                            ><i className="pi pi-pencil"></i></button>
                            <button onClick={() => handleEliminarPrograma(programa)} disabled={cargando}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed" title="Eliminar"
                            ><i className="pi pi-trash"></i></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg border border-gray-200 shadow-lg p-8 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Editar Programa</h3>
            <form onSubmit={handleGuardarEdicion} className="space-y-6">
              <div>
                <label htmlFor="nombreEdit" className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Programa <span className="text-red-500">*</span>
                </label>
                <input type="text" id="nombreEdit" value={nombreEditado}
                  onChange={(e) => setNombreEditado(e.target.value)}
                  maxLength="40"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">Máximo 40 caracteres: letras y espacios</p>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
              )}

              <div className="flex gap-3 justify-end pt-4">
                <button type="button" onClick={handleCancelarEdicion} disabled={cargando}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50"
                >
                  <span className="flex items-center justify-center gap-2"><i className="pi pi-times"></i>Cancelar</span>
                </button>
                <button type="submit" disabled={cargando}
                  className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${cargando ? 'bg-gray-400 cursor-not-allowed text-white' : 'bg-teal-600 text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2'}`}
                >
                  <span className="flex items-center justify-center gap-2">
                    {cargando ? (
                      <><span className="animate-spin inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full"></span>Guardando...</>
                    ) : (
                      <><i className="pi pi-save"></i>Guardar</>
                    )}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
