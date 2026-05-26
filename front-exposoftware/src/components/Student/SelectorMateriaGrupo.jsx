import { useState, useEffect } from "react";
import * as SubjectService from "../../Services/CreateSubject";

export default function SelectorMateriaGrupo({
  onSeleccionado = () => {},
  selectedMateria = null,
  selectedGrupo = null,
}) {
  const [materias, setMaterias] = useState([]);
  const [gruposActuales, setGruposActuales] = useState([]);
  const [cargandoMaterias, setCargandoMaterias] = useState(false);
  const [cargandoGrupos, setCargandoGrupos] = useState(false);
  const [error, setError] = useState(null);

  // Cargar materias al iniciar
  useEffect(() => {
    cargarMaterias();
  }, []);

  const cargarMaterias = async () => {
    setCargandoMaterias(true);
    setError(null);
    try {
      const data = await SubjectService.obtenerMaterias();
      setMaterias(data || []);
      console.log('✅ Materias cargadas:', data?.length);
    } catch (err) {
      setError('Error al cargar materias: ' + err.message);
      console.error('❌ Error:', err);
    } finally {
      setCargandoMaterias(false);
    }
  };

  // Cargar grupos cuando se selecciona una materia
  const handleSeleccionarMateria = async (codigoMateria) => {
    if (!codigoMateria) {
      setGruposActuales([]);
      onSeleccionado({ materia: null, grupo: null });
      return;
    }

    setCargandoGrupos(true);
    setError(null);
    try {
      console.log('📥 Cargando asignaciones de:', codigoMateria);
      const asignaciones = await SubjectService.obtenerAsignacionesMateria(codigoMateria);

      // Procesar asignaciones
      const grupos = asignaciones.map(a => ({
        codigo_grupo: a.codigo_grupo,
        id_docente: a.id_docente,
        docente_nombre: a.docente_nombre ||
                        a.docente?.usuario?.nombre_completo ||
                        a.usuario?.nombre_completo ||
                        'Sin asignar'
      }));

      setGruposActuales(grupos);
      console.log('✅ Grupos cargados:', grupos);

      // Callback con materia seleccionada
      const materiaSeleccionada = materias.find(m => m.codigo_materia === codigoMateria);
      onSeleccionado({
        materia: materiaSeleccionada,
        grupo: null,
        grupos: grupos
      });
    } catch (err) {
      setError('Error al cargar grupos: ' + err.message);
      console.error('❌ Error:', err);
      setGruposActuales([]);
    } finally {
      setCargandoGrupos(false);
    }
  };

  const handleSeleccionarGrupo = (grupo) => {
    const materia = materias.find(m => m.codigo_materia === selectedMateria);
    onSeleccionado({
      materia: materia,
      grupo: grupo
    });
    console.log('✅ Seleccionado:', { materia: materia?.codigo_materia, grupo: grupo.codigo_grupo });
  };

  return (
    <div className="space-y-6">
      {/* Selector de Materia */}
      <div>
        <label htmlFor="materiaSelect" className="block text-sm font-medium text-gray-700 mb-2">
          Selecciona una Materia <span className="text-red-500">*</span>
        </label>

        {cargandoMaterias ? (
          <div className="flex items-center justify-center py-8">
            <svg className="animate-spin h-6 w-6 text-teal-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="ml-2 text-gray-600">Cargando materias...</span>
          </div>
        ) : error && !selectedMateria ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 text-sm">{error}</p>
            <button
              onClick={cargarMaterias}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
            >
              Reintentar
            </button>
          </div>
        ) : (
          <select
            id="materiaSelect"
            onChange={(e) => handleSeleccionarMateria(e.target.value)}
            value={selectedMateria || ''}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
          >
            <option value="">-- Selecciona una materia --</option>
            {materias.map((materia) => (
              <option key={materia.codigo_materia} value={materia.codigo_materia}>
                {materia.codigo_materia} - {materia.nombre_materia}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Selector de Grupo */}
      {selectedMateria && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Selecciona un Grupo <span className="text-red-500">*</span>
          </label>

          {cargandoGrupos ? (
            <div className="flex items-center justify-center py-8">
              <svg className="animate-spin h-6 w-6 text-teal-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="ml-2 text-gray-600">Cargando grupos...</span>
            </div>
          ) : error && selectedMateria ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 text-sm">{error}</p>
              <button
                onClick={() => handleSeleccionarMateria(selectedMateria)}
                className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
              >
                Reintentar
              </button>
            </div>
          ) : gruposActuales.length === 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-700 text-sm">No hay grupos disponibles para esta materia</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {gruposActuales.map((grupo) => (
                <button
                  key={grupo.codigo_grupo}
                  onClick={() => handleSeleccionarGrupo(grupo)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    selectedGrupo?.codigo_grupo === grupo.codigo_grupo
                      ? 'border-teal-600 bg-teal-50'
                      : 'border-gray-200 bg-white hover:border-teal-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900">
                        Grupo: <span className="text-teal-600">{grupo.codigo_grupo}</span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        📚 Docente: <span className="font-medium text-gray-900">{grupo.docente_nombre}</span>
                      </div>
                    </div>
                    {selectedGrupo?.codigo_grupo === grupo.codigo_grupo && (
                      <div className="text-teal-600">
                        <i className="pi pi-check-circle text-2xl"></i>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
