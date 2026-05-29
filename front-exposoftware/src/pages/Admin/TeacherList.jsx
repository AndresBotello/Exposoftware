import { SearchBar } from "../../components/Admin/AdminComponents";

export default function TeacherList({
  profesoresFiltrados = [],
  searchTerm,
  setSearchTerm,
  filtroEstado,
  setFiltroEstado,
  handleEdit,
  handleDelete,
  handleToggleActivo,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  limit = 5,
  onLimitChange,
}) {

  // Función interna para calcular los rangos de las páginas con elipsis (...)
  const renderBotoneraPaginacion = () => {
    const rango = [];
    const maximaDistancia = 1; // Páginas visibles a los lados de la página actual

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 || 
        i === totalPages || 
        (i >= currentPage - maximaDistancia && i <= currentPage + maximaDistancia)
      ) {
        rango.push(i);
      } else if (rango[rango.length - 1] !== '...') {
        rango.push('...');
      }
    }

    return rango.map((num, idx) => {
      if (num === '...') {
        return (
          <span 
            key={`dots-${idx}`} 
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-400 select-none"
          >
            ...
          </span>
        );
      }

      return (
        <button
          key={num}
          type="button"
          onClick={() => onPageChange && onPageChange(num)}
          className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold rounded-md transition cursor-pointer shadow-sm ${
            currentPage === num
              ? 'z-10 bg-teal-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600 font-bold'
              : 'text-gray-900 bg-white ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
          }`}
        >
          {num}
        </button>
      );
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Editar Profesores
        </h2>
        <p className="text-sm text-gray-600">
          Busca y edita la información de los profesores registrados en el sistema.
        </p>
      </div>

      {/* Barra superior de controles y filtros */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Profesores Registrados</h3>
            <p className="text-sm text-gray-500 mt-1">
              {profesoresFiltrados.length} {profesoresFiltrados.length === 1 ? 'profesor' : 'profesores'} encontrados
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            
            {/* Selector dinámico de Registros por Página */}
            <select
              value={limit}
              onChange={(e) => onLimitChange && onLimitChange(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white cursor-pointer shadow-sm"
              title="Registros por página"
            >
              <option value={5}>5 filas</option>
              <option value={10}>10 filas</option>
              <option value={20}>20 filas</option>
              <option value={50}>50 filas</option>
            </select>

            {/* Selector de Estado */}
            <select
              value={filtroEstado || 'todos'}
              onChange={(e) => setFiltroEstado && setFiltroEstado(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white cursor-pointer"
              title="Filtrar por estado"
            >
              <option value="todos">Todos los estados</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos (pendientes)</option>
            </select>

            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Buscar profesores..."
            />
          </div>
        </div>
      </div>

      {/* Contenedor de la Tabla */}
      <div className="overflow-x-auto rounded-lg border border-gray-100">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Identificación</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre Completo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Correo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Programa</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {profesoresFiltrados.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                  <i className="pi pi-inbox text-4xl mb-3 block text-gray-300"></i>
                  <p className="text-sm font-medium">No se encontraron profesores registrados</p>
                </td>
              </tr>
            ) : (
              profesoresFiltrados.map((profesor) => (
                <tr key={profesor.docente?.id_docente || profesor.id || Math.random()} className="hover:bg-gray-50/70 transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-gray-900">
                      {profesor?.usuario?.identificacion || profesor?.identificacion || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {profesor?.usuario ? `${profesor.usuario.p_nombre || ''} ${profesor.usuario.p_apellido || ''}`.trim() : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">{profesor?.usuario?.correo || profesor?.correo || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {profesor?.docente?.categoria_docente || profesor?.categoria_docente || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {profesor?.docente?.codigo_programa || profesor?.codigo_programa || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {(() => {
                      const activo = profesor?.usuario?.activo ?? profesor?.activo ?? false;
                      const cls = activo ? 'bg-teal-100 text-teal-800' : 'bg-red-100 text-red-800';
                      const texto = activo ? 'Activo' : 'Pendiente verificación';
                      return (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
                          {texto}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEdit && handleEdit(profesor)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                        title="Editar"
                      >
                        <i className="pi pi-pencil"></i>
                      </button>
                      {handleToggleActivo && (
                        <button
                          onClick={() => handleToggleActivo(profesor)}
                          className={`p-2 rounded-lg transition cursor-pointer ${
                            (profesor?.usuario?.activo ?? profesor?.activo) ? 'text-yellow-600 hover:bg-yellow-50' : 'text-green-600 hover:bg-green-50'
                          }`}
                          title={ (profesor?.usuario?.activo ?? profesor?.activo) ? 'Desactivar' : 'Activar' }
                        >
                          <i className={`pi ${(profesor?.usuario?.activo ?? profesor?.activo) ? 'pi-lock' : 'pi-check-circle'}`}></i>
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete && handleDelete(profesor.docente?.id_docente || profesor.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                        title="Eliminar"
                      >
                        <i className="pi pi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Controles de Paginación Modificada e Inteligente */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-4 sm:px-6 mt-6">
          
          {/* Vista Móvil (Responsive) */}
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => {
                if (currentPage > 1 && onPageChange) onPageChange(currentPage - 1);
              }}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition shadow-sm cursor-pointer disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              onClick={() => {
                if (currentPage < totalPages && onPageChange) onPageChange(currentPage + 1);
              }}
              disabled={currentPage >= totalPages}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition shadow-sm cursor-pointer disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>

          {/* Vista Escritorio (Desktop) */}
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Mostrando página <span className="font-semibold text-gray-900">{currentPage}</span> de{' '}
                <span className="font-semibold text-gray-900">{totalPages || 1}</span>
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm gap-1" aria-label="Pagination">
                
                {/* Botón Flecha Izquierda - Retroceder */}
                <button
                  onClick={() => {
                    if (currentPage > 1 && onPageChange) onPageChange(currentPage - 1);
                  }}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-md px-3 py-2 text-gray-500 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-40 transition cursor-pointer disabled:cursor-not-allowed shadow-sm"
                >
                  <span className="sr-only">Anterior</span>
                  <i className="pi pi-angle-left text-sm"></i>
                </button>
                
                {/* Números de Páginas Dinámicos (...) */}
                {renderBotoneraPaginacion()}

                {/* Botón Flecha Derecha - Avanzar */}
                <button
                  onClick={() => {
                    if (currentPage < totalPages && onPageChange) onPageChange(currentPage + 1);
                  }}
                  disabled={currentPage >= totalPages}
                  className="relative inline-flex items-center rounded-md px-3 py-2 text-gray-500 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-40 transition cursor-pointer disabled:cursor-not-allowed shadow-sm"
                >
                  <span className="sr-only">Siguiente</span>
                  <i className="pi pi-angle-right text-sm"></i>
                </button>
              </nav>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}