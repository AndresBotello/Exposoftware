import { CICLOS_SEMESTRALES } from "./useSubjectManagement";

export default function SubjectEditModal({
  showEditModal,
  codigoMateria,
  nombreMateria,
  cicloSemestral, setCicloSemestral,
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

        <form onSubmit={handleSaveEdit} className="p-6 space-y-6">
          <p className="text-sm text-gray-600">Modifique el ciclo semestral y guarde los cambios.</p>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-700 mb-3">Información de la Materia</p>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Código:</span>
                <span className="text-sm font-semibold text-gray-900">{codigoMateria}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Nombre:</span>
                <span className="text-sm font-semibold text-gray-900">{nombreMateria}</span>
              </div>
            </div>
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
