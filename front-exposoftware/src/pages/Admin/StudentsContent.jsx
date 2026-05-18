import { formatearEstudiante } from '../../Services/StudentAdminService';

export default function StudentsContent({
  cargando, estudiantes, estudiantesFiltrados, estudiantesActuales,
  busqueda, setBusqueda, filtroEstado, setFiltroEstado,
  paginaActual, totalPaginas, indexPrimerEstudiante, indexUltimoEstudiante,
  cambiarPagina, verDetalles, editarEstudiante, handleCambiarEstado,
  programas,
  mostrarConfirmacion, estudianteSeleccionado, accionPendiente,
  confirmarCambioEstado, setMostrarConfirmacion, setEstudianteSeleccionado, setAccionPendiente,
}) {
  if (cargando && estudiantes.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="text-center py-12">
          <span className="animate-spin inline-block w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full"></span>
          <p className="text-gray-600 mt-4">Cargando estudiantes...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Controles de búsqueda y filtros */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Buscar estudiante</label>
            <div className="relative">
              <i className="pi pi-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <input type="text" placeholder="Buscar por nombre, identificación, email o programa..."
                value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar por estado</label>
            <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="todos">Todos</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
            </select>
          </div>
        </div>
        <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
          <span>Mostrando {estudiantesActuales.length} de {estudiantesFiltrados.length} estudiantes</span>
          <span>Total: {estudiantes.length} estudiantes registrados</span>
        </div>
      </div>

      {/* Tabla de estudiantes */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                {["Identificación", "Nombre Completo", "Programa", "Semestre", "Estado", "Acciones"].map((col, i) => (
                  <th key={col} className={`py-3 px-4 font-semibold text-gray-700 ${i === 5 ? "text-center" : "text-left"}`}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {estudiantesActuales.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center">
                    <div className="text-gray-500">
                      <i className="pi pi-inbox text-4xl mb-4 block opacity-50"></i>
                      <p>{busqueda || filtroEstado !== 'todos' ? 'No se encontraron estudiantes con los criterios de búsqueda' : 'No hay estudiantes registrados'}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                estudiantesActuales.map((item) => {
                  const formateado = formatearEstudiante(item, programas);
                  const estudianteId = item.estudiante?.id_estudiante || item.id_estudiante || formateado.id;
                  return (
                    <tr key={estudianteId} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4 text-sm text-gray-800">{formateado.identificacion}</td>
                      <td className="py-4 px-4">
                        <div className="text-sm font-medium text-gray-900">{formateado.nombreCompleto}</div>
                        <div className="text-xs text-gray-500">{formateado.email}</div>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-800">
                        <div className="max-w-xs truncate" title={formateado.programa}>{formateado.programa}</div>
                        <div className="text-xs text-gray-500">{formateado.codigoPrograma}</div>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-900">{formateado.semestre}°</td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full ${formateado.estadoBool ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {formateado.estado}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => verDetalles(estudianteId)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Ver detalles">
                            <i className="pi pi-eye"></i>
                          </button>
                          <button onClick={() => editarEstudiante(estudianteId)} className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors" title="Editar">
                            <i className="pi pi-pencil"></i>
                          </button>
                          <button
                            onClick={() => handleCambiarEstado(item, formateado.estadoBool ? 'desactivar' : 'activar')}
                            className={`p-2 rounded-lg transition-colors ${formateado.estadoBool ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                            title={formateado.estadoBool ? 'Desactivar' : 'Activar'}
                          >
                            <i className={`pi ${formateado.estadoBool ? 'pi-lock' : 'pi-check-circle'}`}></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPaginas > 1 && (
          <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <button onClick={() => cambiarPagina(paginaActual - 1)} disabled={paginaActual === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >Anterior</button>
              <button onClick={() => cambiarPagina(paginaActual + 1)} disabled={paginaActual === totalPaginas}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >Siguiente</button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <p className="text-sm text-gray-700">
                Mostrando <span className="font-medium">{indexPrimerEstudiante + 1}</span> a{' '}
                <span className="font-medium">{Math.min(indexUltimoEstudiante, estudiantesFiltrados.length)}</span>{' '}
                de <span className="font-medium">{estudiantesFiltrados.length}</span> resultados
              </p>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button onClick={() => cambiarPagina(paginaActual - 1)} disabled={paginaActual === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >Anterior</button>
                {[...Array(totalPaginas)].map((_, index) => (
                  <button key={index + 1} onClick={() => cambiarPagina(index + 1)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${paginaActual === index + 1 ? 'z-10 bg-teal-50 border-teal-500 text-teal-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'}`}
                  >{index + 1}</button>
                ))}
                <button onClick={() => cambiarPagina(paginaActual + 1)} disabled={paginaActual === totalPaginas}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >Siguiente</button>
              </nav>
            </div>
          </div>
        )}
      </div>

      {/* Modal de confirmación */}
      {mostrarConfirmacion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg border border-gray-200 shadow-lg p-8 w-full max-w-md">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
                <i className="pi pi-exclamation-triangle text-yellow-600 text-xl"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Confirmar acción</h3>
              <div className="mb-6">
                <p className="text-sm text-gray-600">
                  ¿Está seguro que desea {accionPendiente} al estudiante{' '}
                  <strong className="text-gray-900">{formatearEstudiante(estudianteSeleccionado, programas).nombreCompleto}</strong>?
                </p>
              </div>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => { setMostrarConfirmacion(false); setEstudianteSeleccionado(null); setAccionPendiente(null); }}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
                >
                  <span className="flex items-center justify-center gap-2"><i className="pi pi-times"></i>Cancelar</span>
                </button>
                <button onClick={confirmarCambioEstado} disabled={cargando}
                  className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${accionPendiente === 'activar' ? 'bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500' : 'bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500'} disabled:opacity-50`}
                >
                  <span className="flex items-center justify-center gap-2">
                    {cargando ? (
                      <><span className="animate-spin inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full"></span>Procesando...</>
                    ) : (
                      <><i className="pi pi-check"></i>Confirmar</>
                    )}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
