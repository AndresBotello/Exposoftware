import { CICLOS_SEMESTRALES } from "./useSubjectManagement";

export default function SubjectEditModal({
  showEditModal,
  codigoMateria, setCodigoMateria,
  nombreMateria, setNombreMateria,
  cicloSemestral, setCicloSemestral,
  gruposDisponibles, gruposSeleccionados,
  agregarGrupoSeleccionado, eliminarGrupoSeleccionado,
  getDocenteNombre,
  handleSaveEdit, handleCancelEdit,
}) {
  if (!showEditModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="bg-teal-600 px-6 py-4 rounded-t-lg flex items-center justify-between">
          <h3 className="text-xl font-bold text-white">Editar Materia</h3>
          <button onClick={handleCancelEdit} className="text-white hover:text-gray-200 transition-colors">
            <i className="pi pi-times text-xl"></i>
          </button>
        </div>

        <form onSubmit={handleSaveEdit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          <p className="text-sm text-gray-600">Modifique los campos necesarios y guarde los cambios.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="editCodigoMateria" className="block text-sm font-medium text-gray-700 mb-2">
                Código de la Materia <span className="text-red-500">*</span>
              </label>
              <input type="text" id="editCodigoMateria" value={codigoMateria}
                onChange={(e) => setCodigoMateria(e.target.value)}
                placeholder="Ej: PROG3, BD2, IA1"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 uppercase"
                required
              />
            </div>
            <div>
              <label htmlFor="editCicloSemestral" className="block text-sm font-medium text-gray-700 mb-2">
                Ciclo Semestral <span className="text-red-500">*</span>
              </label>
              <select id="editCicloSemestral" value={cicloSemestral}
                onChange={(e) => setCicloSemestral(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                required
              >
                <option value="">Seleccione un ciclo</option>
                {CICLOS_SEMESTRALES.map((ciclo) => <option key={ciclo} value={ciclo}>{ciclo}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="editNombreMateria" className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de la Materia <span className="text-red-500">*</span>
            </label>
            <input type="text" id="editNombreMateria" value={nombreMateria}
              onChange={(e) => setNombreMateria(e.target.value)}
              placeholder="Ingrese el nombre completo de la materia"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>

          <div className="border-t pt-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Asignar Grupos a la Materia <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-500 mb-4">Selecciona un grupo de la lista. El docente asignado se mostrará automáticamente.</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Grupos Disponibles</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white mb-2"
                  onChange={(e) => { if (e.target.value) { agregarGrupoSeleccionado(e.target.value); e.target.value = ""; } }}
                >
                  <option value="">Seleccionar grupo...</option>
                  {gruposDisponibles.filter(g => !gruposSeleccionados.find(gs => gs.codigo_grupo === g.codigo_grupo)).map((grupo) => (
                    <option key={grupo.id} value={grupo.codigo_grupo}>
                      Grupo {grupo.codigo_grupo} - {getDocenteNombre(grupo.id_docente)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Grupos Asignados ({gruposSeleccionados.length})</label>
                <div className="border border-gray-300 rounded-lg p-3 bg-gray-50 min-h-[120px] max-h-[200px] overflow-y-auto">
                  {gruposSeleccionados.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-4">No hay grupos asignados</p>
                  ) : (
                    <div className="space-y-2">
                      {gruposSeleccionados.map((grupo) => (
                        <div key={grupo.codigo_grupo} className="flex items-center justify-between bg-white p-2 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-xs font-bold bg-teal-100 text-teal-800">{grupo.codigo_grupo}</span>
                            <span className="text-xs text-gray-600">{getDocenteNombre(grupo.id_docente)}</span>
                          </div>
                          <button type="button" onClick={() => eliminarGrupoSeleccionado(grupo.codigo_grupo)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <i className="pi pi-times text-xs"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 sticky bottom-0 bg-white">
            <button type="button" onClick={handleCancelEdit}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-all"
            >Cancelar</button>
            <button type="submit"
              className="flex-1 bg-teal-600 text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-teal-700 transition-all shadow-md"
            >Guardar Cambios</button>
          </div>
        </form>
      </div>
    </div>
  );
}
