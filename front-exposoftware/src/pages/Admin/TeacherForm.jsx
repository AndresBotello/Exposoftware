import { useMemo } from 'react';
import Select from 'react-select';
import countryList from "react-select-country-list";
import { CATEGORIAS_DOCENTE } from "./useTeacherManagement";
import { validateField, filterInput } from "../../utils/teacherValidations";
import TeacherPersonalSection from "./TeacherPersonalSection";

export default function TeacherForm({
  
  tipoDocumento,
  setTipoDocumento,
  identificacion,
  setIdentificacion,
  primerNombre,
  setPrimerNombre,
  segundoNombre,
  setSegundoNombre,
  primerApellido,
  setPrimerApellido,
  segundoApellido,
  setSegundoApellido,
  genero,
  setGenero,
  identidadSexual,
  setIdentidadSexual,
  fechaNacimiento,
  setFechaNacimiento,
  nacionalidad,
  setNacionalidad,
  pais,
  setPais,
  departamento,
  setDepartamento,
  municipio,
  setMunicipio,
  ciudadResidencia,
  setCiudadResidencia,
  tipoVia,
  setTipoVia,
  numeroVia,
  setNumeroVia,
  numeroCruce,
  setNumeroCruce,
  numeroPlaca,
  setNumeroPlaca,
  complemento,
  setComplemento,
  direccionResidencia,
  setDireccionResidencia,
  telefono,
  setTelefono,
  correo,
  setCorreo,
  contraseña,
  setContraseña,
  // Estados del formulario - Docente
  categoriaDocente,
  setCategoriaDocente,
  codigoPrograma,
  setCodigoPrograma,
  activo,
  setActivo,
  // Datos de apoyo
  departamentos,
  programas,
  loadingProgramas,
  municipios,
  municipiosDisponibles,
  errors,
  loading,
  serverError,
  successMessage,
  isEditing,
  // Funciones
  onSubmit,
  onCancel,
}) {
  const options = useMemo(() => countryList().getData(), []);

  const handleInputChange = (fieldName, value, setter) => {
    const filteredValue = filterInput(fieldName, value);
    setter(filteredValue);

    const nombresCompletos = fieldName === 'primerNombre' || fieldName === 'segundoNombre'
      ? `${fieldName === 'primerNombre' ? value : primerNombre} ${fieldName === 'segundoNombre' ? value : segundoNombre}`.trim()
      : `${primerNombre} ${segundoNombre}`.trim();

    const apellidosCompletos = fieldName === 'primerApellido' || fieldName === 'segundoApellido'
      ? `${fieldName === 'primerApellido' ? value : primerApellido} ${fieldName === 'segundoApellido' ? value : segundoApellido}`.trim()
      : `${primerApellido} ${segundoApellido}`.trim();

    const formData = {
      nombres: nombresCompletos,
      apellidos: apellidosCompletos,
      identificacion,
      telefono,
      correo,
      fechaNacimiento,
      ciudadResidencia,
      municipio,
      codigoPrograma,
      categoriaDocente,
    };

    const error = validateField(fieldName, filteredValue, formData);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Registrar Nuevo Profesor
        </h2>
        <p className="text-sm text-gray-600">
          Complete los siguientes campos para registrar un nuevo docente en el sistema.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        {successMessage && (
          <div className="p-4 mb-4 rounded-lg bg-green-50 border border-green-200 text-green-700 flex items-start gap-3">
            <i className="pi pi-check-circle flex-shrink-0 mt-0.5 text-lg"></i>
            <div>
              <strong className="block font-medium">¡Éxito!</strong>
              <p className="text-sm">{successMessage}</p>
            </div>
          </div>
        )}
        {serverError && (
          <div className="p-3 mb-4 rounded bg-red-50 border border-red-200 text-red-700">
            <strong className="block font-medium">Error:</strong>
            <p className="text-sm">{serverError}</p>
          </div>
        )}

        <TeacherPersonalSection
          tipoDocumento={tipoDocumento} setTipoDocumento={setTipoDocumento}
          identificacion={identificacion} setIdentificacion={setIdentificacion}
          primerNombre={primerNombre} setPrimerNombre={setPrimerNombre}
          segundoNombre={segundoNombre} setSegundoNombre={setSegundoNombre}
          primerApellido={primerApellido} setPrimerApellido={setPrimerApellido}
          segundoApellido={segundoApellido} setSegundoApellido={setSegundoApellido}
          genero={genero} setGenero={setGenero}
          identidadSexual={identidadSexual} setIdentidadSexual={setIdentidadSexual}
          fechaNacimiento={fechaNacimiento} setFechaNacimiento={setFechaNacimiento}
          telefono={telefono} setTelefono={setTelefono}
          errors={errors}
          handleInputChange={handleInputChange}
        />

        {/* Información de Ubicación y Residencia */}
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de Ubicación y Residencia</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* País de Residencia */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                País de Residencia <span className="text-red-500">*</span>
              </label>
              <Select
                name="pais"
                options={options}
                placeholder="Selecciona País de Residencia"
                value={
                  pais
                    ? options.find((option) => option.value === pais)
                    : null
                }
                onChange={(option) => setPais(option ? option.value : "")}
                classNamePrefix="react-select"
                styles={{
                  control: (base) => ({
                    ...base,
                    borderColor: "#d1d5db",
                    borderRadius: "0.5rem",
                    padding: "2px",
                    "&:hover": { borderColor: "#14b8a6" },
                    boxShadow: "0 0 0 1px #d1d5db",
                  }),
                }}
              />
            </div>

            {/* Nacionalidad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nacionalidad (País de Nacimiento) <span className="text-red-500">*</span>
              </label>
              <Select
                name="nacionalidad"
                options={options}
                placeholder="Selecciona tu Nacionalidad"
                value={
                  nacionalidad
                    ? options.find((option) => option.value === nacionalidad)
                    : null
                }
                onChange={(option) => setNacionalidad(option ? option.value : "")}
                classNamePrefix="react-select"
                styles={{
                  control: (base) => ({
                    ...base,
                    borderColor: "#d1d5db",
                    borderRadius: "0.5rem",
                    padding: "2px",
                    "&:hover": { borderColor: "#14b8a6" },
                    boxShadow: "0 0 0 1px #d1d5db",
                  }),
                }}
              />
            </div>

            {/* Departamento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Departamento <span className="text-red-500">*</span>
              </label>
              <select
                value={departamento}
                onChange={(e) => setDepartamento(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                required
              >
                <option value="">Seleccionar departamento</option>
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

            {/* Municipio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Municipio <span className="text-red-500">*</span>
              </label>
              <select
                value={municipio}
                onChange={(e) => setMunicipio(e.target.value)}
                disabled={!departamento}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                required
              >
                <option value="">Seleccionar municipio</option>
                {Array.isArray(municipiosDisponibles) && municipiosDisponibles.map((mun, idx) => {
                  const municipioNombre = typeof mun === 'string' ? mun : (mun.nombre || mun.nombre_municipio || mun.municipio || '');
                  return municipioNombre ? (
                    <option key={`mun-${idx}-${municipioNombre}`} value={municipioNombre}>
                      {municipioNombre}
                    </option>
                  ) : null;
                })}
              </select>
              {!departamento && (
                <p className="text-xs text-gray-500 mt-1">Primero selecciona un departamento</p>
              )}
            </div>

            {/* Tipo de Vía */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Vía <span className="text-red-500">*</span>
              </label>
              <select
                value={tipoVia}
                onChange={(e) => setTipoVia(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                required
              >
                <option value="">Seleccionar tipo de vía</option>
                <option value="Calle">Calle</option>
                <option value="Carrera">Carrera</option>
                <option value="Diagonal">Diagonal</option>
                <option value="Transversal">Transversal</option>
                <option value="Avenida">Avenida</option>
              </select>
            </div>

            {/* Número de Vía */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Vía <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={numeroVia}
                onChange={(e) => setNumeroVia(e.target.value)}
                placeholder="Ej: 50"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>

            {/* Número de Cruce */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Cruce <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={numeroCruce}
                onChange={(e) => setNumeroCruce(e.target.value)}
                placeholder="Ej: 30"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>

            {/* Número de Placa */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Placa <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={numeroPlaca}
                onChange={(e) => setNumeroPlaca(e.target.value)}
                placeholder="Ej: 20"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>

            {/* Complemento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Complemento (Apartamento, Torre, etc.)
              </label>
              <input
                type="text"
                value={complemento}
                onChange={(e) => setComplemento(e.target.value)}
                placeholder="Ej: Apto 502 Torre A"
                maxLength={50}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
        </div>

        {/* Información del Docente */}
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Docente</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Correo Institucional */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correo Institucional <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="correo"
                value={correo}
                onChange={(e) => handleInputChange('correo', e.target.value, setCorreo)}
                placeholder="usuario@unicesar.edu.co"
                className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
                  errors?.correo
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-teal-500'
                }`}
                required
              />
              {errors?.correo && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <i className="pi pi-exclamation-circle"></i>
                  {errors.correo}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">Debe ser correo institucional (@unicesar.edu.co)</p>
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña {!isEditing && <span className="text-red-500">*</span>}
              </label>
              <input
                type="password"
                value={contraseña}
                onChange={(e) => setContraseña(e.target.value)}
                placeholder={isEditing ? "Dejar vacío para no cambiar" : "Contraseña"}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                required={!isEditing}
              />
            </div>

            {/* Categoría Docente */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría Docente <span className="text-red-500">*</span>
              </label>
              <select
                value={categoriaDocente}
                onChange={(e) => setCategoriaDocente(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                required
              >
                <option value="">Seleccionar categoría</option>
                {CATEGORIAS_DOCENTE.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Código del Programa - Solo para docentes Internos */}
            {categoriaDocente === "Interno" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código del Programa <span className="text-red-500">*</span>
                </label>
                {loadingProgramas ? (
                  <div className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-500">
                    Cargando programas...
                  </div>
                ) : (
                  <select
                    value={codigoPrograma}
                    onChange={(e) => setCodigoPrograma(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  >
                    <option value="">Seleccionar programa</option>
                    {programas.map((programa) => (
                      <option key={programa.codigo_programa} value={programa.codigo_programa}>
                        {programa.nombre_programa || programa.nombre || programa.codigo_programa}
                      </option>
                    ))}
                  </select>
                )}
                {programas.length === 0 && !loadingProgramas && (
                  <p className="text-xs text-gray-500 mt-1">No hay programas disponibles</p>
                )}
              </div>
            )}

            {/* Estado Activo */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="activo"
                checked={activo}
                onChange={(e) => setActivo(e.target.checked)}
                className="w-4 h-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
              />
              <label htmlFor="activo" className="ml-2 block text-sm text-gray-700">
                Docente Activo
              </label>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-all"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`flex-1 bg-teal-600 text-white px-6 py-3 rounded-lg text-sm font-semibold transition-all shadow-md hover:shadow-lg ${loading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-teal-700'}`}
          >
            {loading ? 'Registrando...' : 'Registrar Profesor'}
          </button>
        </div>
      </form>
    </div>
  );
}
