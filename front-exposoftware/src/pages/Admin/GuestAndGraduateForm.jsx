import Select from 'react-select';
import { TIPOS_DOCUMENTO, GENEROS, TIPOS_VIA } from "./useGuestAndGraduateManagement";

export default function GuestAndGraduateForm({
  userType = 'guest',
  successMessage,
  serverError,
  tipoDocumento, setTipoDocumento,
  identificacion, setIdentificacion,
  primerNombre, setPrimerNombre,
  segundoNombre, setSegundoNombre,
  primerApellido, setPrimerApellido,
  segundoApellido, setSegundoApellido,
  genero, setGenero,
  fechaNacimiento, setFechaNacimiento,
  nacionalidad, setNacionalidad,
  pais, setPais,
  departamento, setDepartamento,
  municipio, setMunicipio,
  municipiosDisponibles,
  ciudadResidencia, setCiudadResidencia,
  tipoVia, setTipoVia,
  numeroVia, setNumeroVia,
  numeroCruce, setNumeroCruce,
  numeroPlaca, setNumeroPlaca,
  telefono, setTelefono,
  correo, setCorreo,
  contraseña, setContraseña,
  // Guest específicos
  esProfesorExtranjero, setEsProfesorExtranjero,
  idSector, setIdSector,
  nombreEmpresa, setNombreEmpresa,
  sectores,
  // Graduate específicos
  anioFinalizacion, setAnioFinalizacion,
  codigoPrograma, setCodigoPrograma,
  titulado, setTitulado,
  programas,
  // Datos de apoyo
  errors,
  loading,
  onSubmit,
  onCancel,
  options,
  departamentos,
}) {
  const title = userType === 'guest' ? 'Crear Invitado' : 'Crear Egresado';
  const subtitle = userType === 'guest'
    ? 'Registra un nuevo usuario invitado en el sistema'
    : 'Registra un nuevo egresado en el sistema';

  const departamentoOptions = (departamentos || []).map(d => ({
    value: d.codigo_departamento || d.codigo,
    label: d.nombre_departamento || d.nombre
  }));

  const municipioOptions = (municipiosDisponibles || []).map(m => ({
    value: m.codigo_municipio || m.codigo,
    label: m.nombre_municipio || m.nombre
  }));

  const sectorOptions = (sectores || []).map(s => ({
    value: s.id,
    label: s.nombre || s.name
  }));

  const programaOptions = (programas || []).map(p => ({
    value: p.codigo_programa || p.codigo,
    label: `${p.nombre_programa || p.nombre} (${p.codigo_programa || p.codigo})`
  }));

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        <p className="text-gray-600 mt-2">{subtitle}</p>
      </div>

      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          ✓ {successMessage}
        </div>
      )}

      {serverError && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          ✗ {serverError}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        {/* DATOS PERSONALES */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Datos Personales</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Documento*
              </label>
              <Select
                options={TIPOS_DOCUMENTO}
                value={TIPOS_DOCUMENTO.find(t => t.value.toString() === tipoDocumento)}
                onChange={(option) => setTipoDocumento(option?.value?.toString() || "")}
                placeholder="Selecciona tipo..."
                className="text-sm"
              />
              {errors.tipoDocumento && <p className="text-red-500 text-sm mt-1">{errors.tipoDocumento}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Identificación*
              </label>
              <input
                type="text"
                value={identificacion}
                onChange={(e) => setIdentificacion(e.target.value)}
                placeholder="Ej: 1002431808"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.identificacion && <p className="text-red-500 text-sm mt-1">{errors.identificacion}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primer Nombre*
              </label>
              <input
                type="text"
                value={primerNombre}
                onChange={(e) => setPrimerNombre(e.target.value)}
                placeholder="Ej: David"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Segundo Nombre
              </label>
              <input
                type="text"
                value={segundoNombre}
                onChange={(e) => setSegundoNombre(e.target.value)}
                placeholder="Ej: José"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primer Apellido*
              </label>
              <input
                type="text"
                value={primerApellido}
                onChange={(e) => setPrimerApellido(e.target.value)}
                placeholder="Ej: Rodríguez"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Segundo Apellido
              </label>
              <input
                type="text"
                value={segundoApellido}
                onChange={(e) => setSegundoApellido(e.target.value)}
                placeholder="Ej: González"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Género*
              </label>
              <Select
                options={GENEROS}
                value={GENEROS.find(g => g.value.toString() === genero)}
                onChange={(option) => setGenero(option?.value?.toString() || "")}
                placeholder="Selecciona género..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Nacimiento*
              </label>
              <input
                type="date"
                value={fechaNacimiento}
                onChange={(e) => setFechaNacimiento(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* INFORMACIÓN DE CONTACTO */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Información de Contacto</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correo Electrónico*
              </label>
              <input
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="usuario@example.com"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.correo && <p className="text-red-500 text-sm mt-1">{errors.correo}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono*
              </label>
              <input
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="3001234567"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* DIRECCIÓN */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Dirección de Residencia</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Vía*
              </label>
              <Select
                options={TIPOS_VIA}
                value={TIPOS_VIA.find(t => t.value.toString() === tipoVia)}
                onChange={(option) => setTipoVia(option?.value?.toString() || "")}
                placeholder="Selecciona tipo..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Vía*
              </label>
              <input
                type="text"
                value={numeroVia}
                onChange={(e) => setNumeroVia(e.target.value)}
                placeholder="Ej: 10"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número Cruce*
              </label>
              <input
                type="text"
                value={numeroCruce}
                onChange={(e) => setNumeroCruce(e.target.value)}
                placeholder="Ej: 20"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Placa*
              </label>
              <input
                type="text"
                value={numeroPlaca}
                onChange={(e) => setNumeroPlaca(e.target.value)}
                placeholder="Ej: 30"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Departamento*
              </label>
              <Select
                options={departamentoOptions}
                value={departamentoOptions.find(d => d.value === departamento)}
                onChange={(option) => setDepartamento(option?.value || "")}
                placeholder="Selecciona departamento..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Municipio de Residencia*
              </label>
              <Select
                options={municipioOptions}
                value={municipioOptions.find(m => m.value === municipio)}
                onChange={(option) => setMunicipio(option?.value || "")}
                placeholder="Selecciona municipio..."
                isDisabled={!departamento}
              />
            </div>
          </div>
        </div>

        {/* INFORMACIÓN ESPECÍFICA POR TIPO */}
        {userType === 'guest' ? (
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Información del Invitado</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sector*
                </label>
                <Select
                  options={sectorOptions}
                  value={sectorOptions.find(s => s.value.toString() === idSector)}
                  onChange={(option) => setIdSector(option?.value?.toString() || "")}
                  placeholder="Selecciona sector..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de Empresa*
                </label>
                <input
                  type="text"
                  value={nombreEmpresa}
                  onChange={(e) => setNombreEmpresa(e.target.value)}
                  placeholder="Tech Solutions S.A.S"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={esProfesorExtranjero}
                    onChange={(e) => setEsProfesorExtranjero(e.target.checked)}
                    className="mr-2 w-4 h-4"
                  />
                  ¿Es profesor extranjero?
                </label>
              </div>
            </div>
          </div>
        ) : (
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Información del Egresado</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Programa*
                </label>
                <Select
                  options={programaOptions}
                  value={programaOptions.find(p => p.value === codigoPrograma)}
                  onChange={(option) => setCodigoPrograma(option?.value || "")}
                  placeholder="Selecciona programa..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Año de Finalización*
                </label>
                <input
                  type="number"
                  value={anioFinalizacion}
                  onChange={(e) => setAnioFinalizacion(e.target.value)}
                  placeholder="2023"
                  min="2000"
                  max={new Date().getFullYear()}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={titulado}
                    onChange={(e) => setTitulado(e.target.checked)}
                    className="mr-2 w-4 h-4"
                  />
                  ¿Está titulado?
                </label>
              </div>
            </div>
          </div>
        )}

        {/* CREDENCIALES */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Credenciales</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña*
              </label>
              <input
                type="password"
                value={contraseña}
                onChange={(e) => setContraseña(e.target.value)}
                placeholder="Contraseña segura"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.contraseña && <p className="text-red-500 text-sm mt-1">{errors.contraseña}</p>}
            </div>
          </div>
        </div>

        {/* BOTONES */}
        <div className="flex gap-4 pt-6 border-t">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg disabled:bg-blue-400"
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-lg"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
