import { useState, useEffect } from "react";
import * as SubjectService from "../../Services/CreateSubject";

export default function MateriaAsignacionesModal({
  isOpen,
  codigoMateria,
  nombreMateria,
  profesores = [],
  onClose,
  onAsignacionCreada = () => {},
}) {
  const [asignaciones, setAsignaciones] = useState([]);
  const [gruposDisponibles, setGruposDisponibles] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [grupoSeleccionado, setGrupoSeleccionado] = useState(null);
  const [docenteSeleccionado, setDocenteSeleccionado] = useState(null);
  const [asignando, setAsignando] = useState(false);

  // Cargar asignaciones de la materia al abrir el modal
  useEffect(() => {
    if (isOpen && codigoMateria) {
      cargarAsignaciones();
    }
  }, [isOpen, codigoMateria]);

  const cargarAsignaciones = async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await SubjectService.obtenerAsignacionesMateria(codigoMateria);
      setAsignaciones(data);

      // Extraer grupos únicos disponibles
      const grupos = data.map(a => ({
        codigo_grupo: a.codigo_grupo || a.group_code,
        id_docente: a.id_docente || a.docente_id || null,
        docente_nombre: a.docente_nombre || a.docente?.usuario?.nombre_completo || 'Sin asignar'
      }));

      setGruposDisponibles(grupos);
      console.log('✅ Asignaciones cargadas:', grupos);
    } catch (err) {
      setError(err.message || 'Error al cargar las asignaciones');
      console.error('❌ Error:', err);
    } finally {
      setCargando(false);
    }
  };

  const handleAsignarDocente = async () => {
    if (!grupoSeleccionado || !docenteSeleccionado) {
      alert('Por favor selecciona un grupo y un docente');
      return;
    }

    setAsignando(true);
    try {
      console.log('📤 Asignando docente a grupo:', {
        codigo_grupo: grupoSeleccionado,
        codigo_materia: codigoMateria,
        id_docente: docenteSeleccionado
      });

      await SubjectService.crearAsignacionDocente({
        codigo_grupo: grupoSeleccionado,
        codigo_materia: codigoMateria,
        id_docente: docenteSeleccionado
      });

      alert('✅ Docente asignado exitosamente');

      // Recargar asignaciones
      await cargarAsignaciones();

      // Limpiar selección
      setGrupoSeleccionado(null);
      setDocenteSeleccionado(null);

      // Callback
      onAsignacionCreada();
    } catch (err) {
      alert('❌ Error al asignar docente: ' + err.message);
      console.error('❌ Error:', err);
    } finally {
      setAsignando(false);
    }
  };

  if (!isOpen) return null;

  // Obtener nombre del docente por su ID
  const getDocenteNombre = (docenteId) => {
    if (!docenteId) return 'Sin asignar';
    const profesor = profesores.find(p => {
      const docente = p?.docente || p;
      const idDocente = docente?.id_docente || docente?.id;
      return idDocente === docenteId;
    });

    if (profesor) {
      const usuario = profesor?.usuario || {};
      return usuario?.nombre_completo || usuario?.correo?.split('@')[0] || 'Docente asignado';
    }
    return `Docente ${docenteId?.substring?.(0, 8) || docenteId}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="bg-teal-600 px-6 py-4 rounded-t-lg flex items-center justify-between sticky top-0">
          <div>
            <h3 className="text-xl font-bold text-white">Asignaciones de Materia</h3>
            <p className="text-teal-100 text-sm mt-1">{codigoMateria} - {nombreMateria}</p>
          </div>
          <button onClick={onClose} className="text-white hover:text-gray-200 transition-colors">
            <i className="pi pi-times text-xl"></i>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {cargando ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <svg className="animate-spin h-12 w-12 text-teal-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-gray-600">Cargando asignaciones...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 text-sm"><strong>Error:</strong> {error}</p>
              <button
                onClick={cargarAsignaciones}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
              >
                Reintentar
              </button>
            </div>
          ) : (
            <>
              {/* Sección de Grupos Existentes */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Grupos Asignados a la Materia</h4>
                {gruposDisponibles.length === 0 ? (
                  <div className="bg-gray-50 rounded-lg p-6 text-center">
                    <i className="pi pi-inbox text-4xl text-gray-300 mb-3 block"></i>
                    <p className="text-gray-500 text-sm">No hay grupos asignados a esta materia</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Código Grupo
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Docente Asignado
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Estado
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {gruposDisponibles.map((grupo) => (
                          <tr key={grupo.codigo_grupo} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-teal-100 text-teal-800">
                                {grupo.codigo_grupo}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-gray-900">
                                {getDocenteNombre(grupo.id_docente)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              {grupo.id_docente ? (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  <i className="pi pi-check mr-1"></i>
                                  Asignado
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  <i className="pi pi-exclamation-circle mr-1"></i>
                                  Sin Asignar
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Sección de Asignación */}
              <div className="border-t pt-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Asignar Docente a Grupo</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Selector de Grupo */}
                  <div>
                    <label htmlFor="grupoSelect" className="block text-sm font-medium text-gray-700 mb-2">
                      Selecciona un Grupo <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="grupoSelect"
                      value={grupoSeleccionado || ''}
                      onChange={(e) => setGrupoSeleccionado(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                    >
                      <option value="">-- Selecciona un grupo --</option>
                      {gruposDisponibles.map((grupo) => (
                        <option key={grupo.codigo_grupo} value={grupo.codigo_grupo}>
                          {grupo.codigo_grupo}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Selector de Docente */}
                  <div>
                    <label htmlFor="docenteSelect" className="block text-sm font-medium text-gray-700 mb-2">
                      Selecciona un Docente <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="docenteSelect"
                      value={docenteSeleccionado || ''}
                      onChange={(e) => setDocenteSeleccionado(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                    >
                      <option value="">-- Selecciona un docente --</option>
                      {profesores.map((profesor) => {
                        const docente = profesor?.docente || profesor;
                        const idDocente = docente?.id_docente || docente?.id;
                        const usuario = profesor?.usuario || {};
                        const nombre = usuario?.nombre_completo || usuario?.correo?.split('@')[0] || 'Docente';

                        return (
                          <option key={idDocente} value={idDocente}>
                            {nombre}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                {/* Botón de Asignación */}
                <div className="mt-6">
                  <button
                    onClick={handleAsignarDocente}
                    disabled={asignando || !grupoSeleccionado || !docenteSeleccionado}
                    className={`w-full px-6 py-3 rounded-lg text-sm font-semibold text-white transition-all ${
                      asignando || !grupoSeleccionado || !docenteSeleccionado
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-teal-600 hover:bg-teal-700 shadow-md hover:shadow-lg'
                    }`}
                  >
                    {asignando ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Asignando...
                      </span>
                    ) : (
                      'Asignar Docente'
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 sticky bottom-0 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-all"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
