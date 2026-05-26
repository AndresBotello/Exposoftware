import { TIPOS_DOCUMENTO, GENEROS, IDENTIDADES_SEXUALES } from "./useTeacherManagement";
import EditTeacherFormSections from "./EditTeacherFormSections";

export default function EditTeacherModal({
  show, onSave, onCancel,
  municipios, opcionesPaises, departamentos = [], programas = [], loadingProgramas = false,
  tipoDocumento, setTipoDocumento,
  identificacion, setIdentificacion,
  primerNombre, setPrimerNombre,
  segundoNombre, setSegundoNombre,
  primerApellido, setPrimerApellido,
  segundoApellido, setSegundoApellido,
  genero, setGenero,
  identidadSexual, setIdentidadSexual,
  fechaNacimiento, setFechaNacimiento,
  nacionalidad, setNacionalidad,
  pais, setPais,
  departamento, setDepartamento,
  municipio, setMunicipio,
  ciudadResidencia, setCiudadResidencia,
  tipoVia, setTipoVia,
  numeroVia, setNumeroVia,
  numeroCruce, setNumeroCruce,
  numeroPlaca, setNumeroPlaca,
  complemento, setComplemento,
  direccionResidencia, setDireccionResidencia,
  telefono, setTelefono,
  correo, setCorreo,
  contraseña, setContraseña,
  categoriaDocente, setCategoriaDocente,
  codigoPrograma, setCodigoPrograma,
  activo, setActivo,
}) {
  if (!show) return null;

  const letterOnlyFilter = (value) => value.replace(/[^a-zA-ZÁÉÍÓÚáéíóúñÑ\s]/g, '');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 bg-teal-600">
          <h3 className="text-xl font-bold text-white">Editar Profesor</h3>
        </div>

        <form onSubmit={onSave} className="p-6 space-y-6">
          {/* Información Personal */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Información Personal</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Documento</label>
                <select value={tipoDocumento} onChange={(e) => setTipoDocumento(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 bg-white" required
                >
                  <option value="">Seleccionar</option>
                  {TIPOS_DOCUMENTO.map((tipo) => <option key={tipo} value={tipo}>{tipo}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Identificación</label>
                <input type="text" value={identificacion}
                  onChange={(e) => { const v = e.target.value.replace(/\D/g, ''); if (v.length <= 12) setIdentificacion(v); }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                  required maxLength={12}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Primer Nombre <span className="text-red-500">*</span></label>
                <input type="text" value={primerNombre} onChange={(e) => setPrimerNombre(letterOnlyFilter(e.target.value))}
                  maxLength={15} placeholder="Ej: María"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500" required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Segundo Nombre</label>
                <input type="text" value={segundoNombre} onChange={(e) => setSegundoNombre(letterOnlyFilter(e.target.value))}
                  maxLength={15} placeholder="Ej: José"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Primer Apellido <span className="text-red-500">*</span></label>
                <input type="text" value={primerApellido} onChange={(e) => setPrimerApellido(letterOnlyFilter(e.target.value))}
                  maxLength={15} placeholder="Ej: Pérez"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500" required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Segundo Apellido</label>
                <input type="text" value={segundoApellido} onChange={(e) => setSegundoApellido(letterOnlyFilter(e.target.value))}
                  maxLength={15} placeholder="Ej: García"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Género</label>
                <select value={genero} onChange={(e) => setGenero(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 bg-white" required
                >
                  <option value="">Seleccionar</option>
                  {GENEROS.map((gen) => <option key={gen} value={gen}>{gen}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Identidad Sexual</label>
                <select value={identidadSexual} onChange={(e) => setIdentidadSexual(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 bg-white"
                >
                  <option value="">Seleccionar</option>
                  {IDENTIDADES_SEXUALES.map((id) => <option key={id} value={id}>{id}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Nacimiento</label>
                <input type="date" value={fechaNacimiento} onChange={(e) => setFechaNacimiento(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                <input type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500" required
                />
              </div>
            </div>
          </div>

          <EditTeacherFormSections
            municipios={municipios} opcionesPaises={opcionesPaises}
            departamentos={departamentos}
            programas={programas} loadingProgramas={loadingProgramas}
            pais={pais} setPais={setPais}
            nacionalidad={nacionalidad} setNacionalidad={setNacionalidad}
            departamento={departamento} setDepartamento={setDepartamento}
            municipio={municipio} setMunicipio={setMunicipio}
            ciudadResidencia={ciudadResidencia} setCiudadResidencia={setCiudadResidencia}
            direccionResidencia={direccionResidencia} setDireccionResidencia={setDireccionResidencia}
            correo={correo} setCorreo={setCorreo}
            contraseña={contraseña} setContraseña={setContraseña}
            categoriaDocente={categoriaDocente} setCategoriaDocente={setCategoriaDocente}
            codigoPrograma={codigoPrograma} setCodigoPrograma={setCodigoPrograma}
            activo={activo} setActivo={setActivo}
          />

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onCancel}
              className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >Cancelar</button>
            <button type="submit"
              className="px-6 py-2.5 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition"
            >💾 Guardar Cambios</button>
          </div>
        </form>
      </div>
    </div>
  );
}
