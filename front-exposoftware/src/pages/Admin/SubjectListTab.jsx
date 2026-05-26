import { ID_CICLOS_MAP } from "./useSubjectManagement";

export default function SubjectListTab({
  materiasFiltradas, materias, searchTerm, setSearchTerm,
  gruposDisponibles, getDocenteNombre,
  handleEdit, handleDelete, handleAbrirAsignaciones,
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Editar Materias</h2>
        <p className="text-sm text-gray-600">Busca y edita la información de las materias registradas en el sistema.</p>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Materias Registradas</h3>
            <p className="text-sm text-gray-500 mt-1">
              {materiasFiltradas.length} {materiasFiltradas.length === 1 ? 'materia' : 'materias'} encontradas
            </p>
          </div>
          <div className="relative w-64">
            <input type="text" placeholder="Buscar materias..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
            <i className="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {["Código", "Nombre de la Materia", "Ciclo Semestral", "Acciones"].map((col, i) => (
                <th key={col} className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${i === 3 ? "text-center" : "text-left"}`}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {materiasFiltradas.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <i className="pi pi-inbox text-4xl text-gray-300 mb-3"></i>
                    <p className="text-gray-500 text-sm">
                      {searchTerm ? "No se encontraron materias con ese criterio de búsqueda" : "No hay materias registradas"}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              materiasFiltradas.map((materia) => (
                <tr key={materia?.id || Math.random()} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-teal-100 text-teal-800">
                      {materia?.codigo_materia || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{materia?.nombre_materia || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {ID_CICLOS_MAP[materia?.id_ciclo] || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      <button onClick={() => handleAbrirAsignaciones(materia)}
                        className="px-3 py-1.5 border border-teal-600 text-teal-600 rounded-lg hover:bg-teal-50 transition-colors text-xs font-medium"
                        title="Asignar grupos y docentes"
                      ><i className="pi pi-check-circle mr-1.5"></i>Asignaciones</button>
                      <button onClick={() => handleEdit(materia)}
                        className="px-3 py-1.5 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-xs font-medium"
                      ><i className="pi pi-pencil mr-1.5"></i>Editar</button>
                      <button onClick={() => handleDelete(materia.id)}
                        className="px-3 py-1.5 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-xs font-medium"
                      ><i className="pi pi-trash mr-1.5"></i>Eliminar</button>
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
