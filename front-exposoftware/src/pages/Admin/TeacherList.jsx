import { SearchBar } from "../../components/Admin/AdminComponents";

export default function TeacherList({
  profesoresFiltrados,
  searchTerm,
  setSearchTerm,
  handleEdit,
  handleDelete,
}) {
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

      {/* Tabla de Profesores Registrados */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Profesores Registrados</h3>
            <p className="text-sm text-gray-500 mt-1">
              {profesoresFiltrados.length} {profesoresFiltrados.length === 1 ? 'profesor' : 'profesores'} encontrados
            </p>
          </div>
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar profesores..."
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Identificación
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre Completo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Correo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categoría
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Programa
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {profesoresFiltrados.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                  <i className="pi pi-inbox text-4xl mb-3 block"></i>
                  <p className="text-sm">No se encontraron profesores</p>
                </td>
              </tr>
            ) : (
              profesoresFiltrados.map((profesor) => (
                <tr key={profesor.docente?.id_docente || profesor.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">
                      {profesor?.usuario?.identificacion || profesor?.identificacion || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {profesor?.usuario?.nombre_completo || profesor?.usuario?.nombres || profesor?.nombres || 'N/A'}
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
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      profesor?.usuario?.activo !== undefined ? profesor.usuario.activo : profesor?.activo
                        ? 'bg-teal-100 text-teal-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {profesor?.usuario?.activo !== undefined ? (profesor.usuario.activo ? 'Activo' : 'Inactivo') : (profesor?.activo ? 'Activo' : 'Inactivo')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEdit(profesor)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Editar"
                      >
                        <i className="pi pi-pencil"></i>
                      </button>
                      <button
                        onClick={() => handleDelete(profesor.docente?.id_docente || profesor.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
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
    </div>
  );
}
