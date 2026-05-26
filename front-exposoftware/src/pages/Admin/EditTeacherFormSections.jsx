import Select from 'react-select';
import { DEPARTAMENTOS_COLOMBIA, CATEGORIAS_DOCENTE } from "./useTeacherManagement";

const selectStyles = {
  control: (base) => ({
    ...base,
    borderColor: "#d1d5db",
    borderRadius: "0.5rem",
    padding: "2px",
    "&:hover": { borderColor: "#16a34a" },
    boxShadow: "0 0 0 1px #d1d5db",
  }),
};

export default function EditTeacherFormSections({
  municipios, opcionesPaises, departamentos = [], programas, loadingProgramas,
  pais, setPais, nacionalidad, setNacionalidad,
  departamento, setDepartamento, municipio, setMunicipio,
  ciudadResidencia, setCiudadResidencia, direccionResidencia, setDireccionResidencia,
  correo, setCorreo, contraseña, setContraseña,
  categoriaDocente, setCategoriaDocente, codigoPrograma, setCodigoPrograma, activo, setActivo,
}) {
  return (
    <>
      {/* Información de Ubicación y Residencia */}
      <div className="border-t pt-4">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Información de Ubicación y Residencia</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">País de Residencia</label>
            <Select name="pais" options={opcionesPaises} placeholder="Selecciona País de Residencia"
              value={pais ? opcionesPaises.find((option) => option.value === pais) : null}
              onChange={(option) => setPais(option ? option.value : "")}
              classNamePrefix="react-select" styles={selectStyles}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">País de Nacimiento</label>
            <Select name="nacionalidad" options={opcionesPaises} placeholder="Selecciona País de Nacimiento"
              value={nacionalidad ? opcionesPaises.find((option) => option.value === nacionalidad) : null}
              onChange={(option) => setNacionalidad(option ? option.value : "")}
              classNamePrefix="react-select" styles={selectStyles}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Departamento</label>
            <select value={departamento} onChange={(e) => setDepartamento(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 bg-white"
            >
              <option value="">Seleccionar</option>
              {Array.isArray(departamentos) && departamentos.map((d, idx) => {
                const deptName = d.nombre || d.departamento || d.nombre_departamento;
                return (
                  <option key={`dept-${idx}-${d.codigo || deptName}`} value={deptName}>
                    {deptName}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Municipio</label>
            <select value={municipio} onChange={(e) => setMunicipio(e.target.value)} disabled={!departamento}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 bg-white disabled:bg-gray-100"
            >
              <option value="">Seleccionar municipio</option>
              {Array.isArray(municipios) && municipios.map((mun, idx) => {
                const munNombre = typeof mun === 'string' ? mun : (mun.nombre_municipio || mun.municipio || '');
                return munNombre ? (
                  <option key={`mun-${idx}-${munNombre}`} value={munNombre}>
                    {munNombre}
                  </option>
                ) : null;
              })}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ciudad de Residencia</label>
            <input type="text" value={ciudadResidencia} onChange={(e) => setCiudadResidencia(e.target.value)}
              maxLength={50} placeholder="Nombre de la ciudad"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="md:col-span-2 lg:col-span-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Dirección de Residencia</label>
            <input type="text" value={direccionResidencia} onChange={(e) => setDireccionResidencia(e.target.value)}
              maxLength={50}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>
      </div>

      {/* Información del Docente */}
      <div className="border-t pt-4">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Información del Docente</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Correo</label>
            <input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500" required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nueva Contraseña (opcional)</label>
            <input type="password" value={contraseña} onChange={(e) => setContraseña(e.target.value)}
              placeholder="Dejar vacío para no cambiar"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
            <select value={categoriaDocente} onChange={(e) => setCategoriaDocente(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 bg-white" required
            >
              <option value="">Seleccionar</option>
              {CATEGORIAS_DOCENTE.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          {categoriaDocente === "Interno" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código del Programa <span className="text-red-500">*</span>
              </label>
              {loadingProgramas ? (
                <div className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-500">Cargando programas...</div>
              ) : (
                <select value={codigoPrograma} onChange={(e) => setCodigoPrograma(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500" required
                >
                  <option value="">Seleccionar programa</option>
                  {programas.map((programa) => (
                    <option key={programa.codigo_programa} value={programa.codigo_programa}>{programa.codigo_programa}</option>
                  ))}
                </select>
              )}
              {programas.length === 0 && !loadingProgramas && (
                <p className="text-xs text-gray-500 mt-1">No hay programas disponibles</p>
              )}
            </div>
          )}

          <div className="flex items-center">
            <input type="checkbox" id="activoModal" checked={activo} onChange={(e) => setActivo(e.target.checked)}
              className="w-4 h-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
            />
            <label htmlFor="activoModal" className="ml-2 block text-sm text-gray-700">Docente Activo</label>
          </div>
        </div>
      </div>
    </>
  );
}
