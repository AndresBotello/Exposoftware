import { useEffect, useState } from "react";
import * as AuthService from "../../Services/AuthService";
import { API_ENDPOINTS } from "../../utils/constants";
import { CATEGORIAS_DOCENTE } from "./useTeacherManagement";

export default function EditTeacherModal({
  show, onSave, onCancel,
  programas = [], loadingProgramas = false,
  identificacion, setIdentificacion,
  primerNombre, setPrimerNombre,
  primerApellido, setPrimerApellido,
  telefono, setTelefono,
  correo, setCorreo,
  categoriaDocente, setCategoriaDocente,
  codigoPrograma, setCodigoPrograma,
}) {
  // Estado para programa específico si no está en la lista
  const [programaEspecifico, setProgramaEspecifico] = useState(null);
  const [loadingPrograma, setLoadingPrograma] = useState(false);

  // Cargar programa específico si no se encuentra en la lista
  useEffect(() => {
    if (show && codigoPrograma && programas.length > 0) {
      const existe = programas.find(p => String(p.codigo_programa) === String(codigoPrograma));
      if (!existe && !loadingPrograma) {
        setLoadingPrograma(true);
        // Intentar cargar el programa por su código usando el endpoint correcto
        const headers = AuthService.getAuthHeaders();
        fetch(`${API_ENDPOINTS.ADMIN_PROGRAMA_BY_CODE('temp', codigoPrograma)}`, {
          credentials: 'include',
          headers: headers
        })
          .then(r => r.json())
          .then(data => {
            setProgramaEspecifico(data.data || data);
          })
          .catch(err => {
            console.log('No se pudo cargar programa específico:', err);
          })
          .finally(() => setLoadingPrograma(false));
      } else if (existe) {
        setProgramaEspecifico(null);
      }
    }
  }, [show, codigoPrograma, programas]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 bg-teal-600">
          <h3 className="text-xl font-bold text-white">Editar Profesor</h3>
        </div>

        <form onSubmit={onSave} className="p-6 space-y-6">
          {/* Información Personal */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Información del Profesor</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Identificación</label>
                <input
                  type="text"
                  value={identificacion}
                  onChange={(e) => { const v = e.target.value.replace(/\D/g, ''); if (v.length <= 12) setIdentificacion(v); }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                  required
                  maxLength={12}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Primer Nombre <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={primerNombre}
                  onChange={(e) => setPrimerNombre(e.target.value)}
                  maxLength={50}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Primer Apellido <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={primerApellido}
                  onChange={(e) => setPrimerApellido(e.target.value)}
                  maxLength={50}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                <input
                  type="tel"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Correo</label>
                <input
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Categoría Docente</label>
                <select
                  value={categoriaDocente}
                  onChange={(e) => setCategoriaDocente(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 bg-white"
                  required
                >
                  <option value="">Seleccionar</option>
                  {CATEGORIAS_DOCENTE.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Programa Académico</label>
                {codigoPrograma && (
                  <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
                    <p>Código actual: {codigoPrograma}</p>
                    {programas.length > 0 ? (
                      <>
                        {programas.find(p => String(p.codigo_programa) === String(codigoPrograma)) ?
                          <p className="text-green-700">✓ {programas.find(p => String(p.codigo_programa) === String(codigoPrograma)).nombre_programa || 'Programa encontrado'}</p>
                          : (
                            <>
                              {loadingPrograma ? (
                                <p className="text-yellow-700">⏳ Buscando programa...</p>
                              ) : programaEspecifico ? (
                                <p className="text-green-700">✓ {programaEspecifico.nombre_programa || programaEspecifico.nombre || 'Programa encontrado'}</p>
                              ) : (
                                <>
                                  <p className="text-red-700">⚠️ No encontrado en la lista</p>
                                  <p className="text-xs mt-2">Códigos disponibles: {programas.map(p => p.codigo_programa).join(', ')}</p>
                                </>
                              )}
                            </>
                          )
                        }
                      </>
                    ) : (
                      <p>Cargando programas...</p>
                    )}
                  </div>
                )}
                <select
                  value={String(codigoPrograma)}
                  onChange={(e) => setCodigoPrograma(e.target.value)}
                  disabled={loadingProgramas || programas.length === 0}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 bg-white disabled:bg-gray-100"
                  required
                >
                  <option value="">
                    {loadingProgramas ? 'Cargando programas...' : programas.length === 0 ? 'No hay programas disponibles' : 'Seleccionar programa'}
                  </option>
                  {programas.map((prog, idx) => (
                    <option key={`${prog.codigo_programa || idx}`} value={String(prog.codigo_programa)}>
                      {prog.nombre_programa || prog.nombre || 'Sin nombre'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition"
            >
              💾 Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
