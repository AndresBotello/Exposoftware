import Select from "react-select";
import countryList from "react-select-country-list";
import { useMemo } from "react";
import { TIPOS_DOCUMENTO, GENEROS, TIPOS_VIA } from "./useGuestAndGraduateManagement";

export default function GuestForm({
  successMessage,
  serverError,
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
  municipiosDisponibles,
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
  esProfesorExtranjero,
  setEsProfesorExtranjero,
  idSector,
  setIdSector,
  nombreEmpresa,
  setNombreEmpresa,
  onSubmit,
  onCancel,
  departamentos,
  paises,
  sectores,
}) {
  const countryOptions = useMemo(() => countryList().getData(), []);

  const municipiosDelDepto = municipiosDisponibles.filter(m =>
    m.codigo_departamento === departamento || m.departamento === departamento
  );

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {successMessage && (
        <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          ✅ {successMessage}
        </div>
      )}

      {serverError && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          ❌ {serverError}
        </div>
      )}

      <fieldset className="border border-gray-200 rounded-lg p-4">
        <legend className="text-lg font-semibold text-gray-800 px-2">Datos Personales</legend>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Documento</label>
            <select
              value={tipoDocumento}
              onChange={(e) => setTipoDocumento(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Seleccionar...</option>
              {TIPOS_DOCUMENTO.map(tipo => (
                <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Identificación</label>
            <input
              type="text"
              value={identificacion}
              onChange={(e) => setIdentificacion(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="123456789"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Primer Nombre</label>
            <input
              type="text"
              value={primerNombre}
              onChange={(e) => setPrimerNombre(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Juan"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Segundo Nombre</label>
            <input
              type="text"
              value={segundoNombre}
              onChange={(e) => setSegundoNombre(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Carlos"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Primer Apellido</label>
            <input
              type="text"
              value={primerApellido}
              onChange={(e) => setPrimerApellido(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Pérez"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Segundo Apellido</label>
            <input
              type="text"
              value={segundoApellido}
              onChange={(e) => setSegundoApellido(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="García"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Género</label>
            <select
              value={genero}
              onChange={(e) => setGenero(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Seleccionar...</option>
              {GENEROS.map(gen => (
                <option key={gen.value} value={gen.value}>{gen.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha de Nacimiento</label>
            <input
              type="date"
              value={fechaNacimiento}
              onChange={(e) => setFechaNacimiento(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="border border-gray-200 rounded-lg p-4">
        <legend className="text-lg font-semibold text-gray-800 px-2">Ubicación y Residencia</legend>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Nacionalidad</label>
            <input
              type="text"
              value={nacionalidad}
              onChange={(e) => setNacionalidad(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="CO"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">País</label>
            <Select
              options={countryOptions}
              value={countryOptions.find(c => c.value === pais)}
              onChange={(option) => setPais(option?.value || "")}
              className="block"
              isSearchable
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Departamento</label>
            <select
              value={departamento}
              onChange={(e) => setDepartamento(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Seleccionar...</option>
              {departamentos.map(dept => (
                <option key={dept.codigo} value={dept.codigo}>{dept.nombre}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Municipio</label>
            <select
              value={municipio}
              onChange={(e) => setMunicipio(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              disabled={!departamento}
            >
              <option value="">Seleccionar...</option>
              {municipiosDelDepto.map(mun => (
                <option key={mun.codigo} value={mun.codigo}>{mun.nombre}</option>
              ))}
            </select>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Ciudad de Residencia</label>
            <input
              type="text"
              value={ciudadResidencia}
              onChange={(e) => setCiudadResidencia(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Bogotá"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Dirección de Residencia</label>
            <input
              type="text"
              value={direccionResidencia}
              onChange={(e) => setDireccionResidencia(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Calle 123 #45-67"
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="border border-gray-200 rounded-lg p-4">
        <legend className="text-lg font-semibold text-gray-800 px-2">Información de Contacto</legend>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Teléfono</label>
            <input
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="3001234567"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Correo Electrónico</label>
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="correo@ejemplo.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Contraseña</label>
            <input
              type="password"
              value={contraseña}
              onChange={(e) => setContraseña(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="border border-gray-200 rounded-lg p-4">
        <legend className="text-lg font-semibold text-gray-800 px-2">Información del Invitado</legend>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <input
                type="checkbox"
                checked={esProfesorExtranjero}
                onChange={(e) => setEsProfesorExtranjero(e.target.checked)}
                className="mr-2"
              />
              Es profesor extranjero
            </label>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Sector</label>
            <select
              value={idSector}
              onChange={(e) => setIdSector(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Seleccionar...</option>
              {sectores.map(sector => (
                <option key={sector.id_sector} value={sector.id_sector}>{sector.nombre_sector}</option>
              ))}
            </select>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre de la Empresa</label>
            <input
              type="text"
              value={nombreEmpresa}
              onChange={(e) => setNombreEmpresa(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Nombre de la empresa"
            />
          </div>
        </div>
      </fieldset>

      <div className="flex gap-4">
        <button
          type="submit"
          className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-4 rounded-lg transition"
        >
          Crear Invitado
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg transition"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
