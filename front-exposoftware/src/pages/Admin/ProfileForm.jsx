import Select from 'react-select';
import colombiaData from "../../data/colombia.json";

export default function ProfileForm({
  profileData,
  isEditing,
  handleInputChange,
  opcionesPaises,
  ciudadesResidencia,
  municipios,
  handleEdit,
  handleCancel,
  handleSave,
  handleOpenPasswordModal,
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 cursor-default">Configuración de Perfil</h2>
        {!isEditing && (
          <button
            onClick={handleEdit}
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
          >
            <i className="pi pi-pencil"></i>
            Editar Perfil
          </button>
        )}
      </div>

      {/* Información Personal */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
          Información Personal
        </h3>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Documento</label>
            <select
              value={profileData.tipoDocumento}
              onChange={(e) => handleInputChange('tipoDocumento', e.target.value)}
              className={`w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 ${isEditing ? 'focus:outline-none focus:ring-2 focus:ring-teal-500' : 'bg-gray-50'}`}
              disabled={!isEditing}
            >
              <option value="CC">Cédula de Ciudadanía</option>
              <option value="CE">Cédula de Extranjería</option>
              <option value="TI">Tarjeta de Identidad</option>
              <option value="PA">Pasaporte</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Identificación <span className="text-red-500 text-xs">(No editable)</span>
            </label>
            <input type="text" value={profileData.identificacion}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 text-gray-500 cursor-not-allowed"
              disabled
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombres <span className="text-red-500">*</span>
            </label>
            <input type="text" value={profileData.nombres}
              onChange={(e) => handleInputChange('nombres', e.target.value)}
              className={`w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 ${isEditing ? 'focus:outline-none focus:ring-2 focus:ring-teal-500' : 'bg-gray-50'}`}
              disabled={!isEditing}
              placeholder="Ej: Carlos Andrés"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Apellidos <span className="text-red-500">*</span>
            </label>
            <input type="text" value={profileData.apellidos}
              onChange={(e) => handleInputChange('apellidos', e.target.value)}
              className={`w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 ${isEditing ? 'focus:outline-none focus:ring-2 focus:ring-teal-500' : 'bg-gray-50'}`}
              disabled={!isEditing}
              placeholder="Ej: Mendoza Pérez"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Género</label>
            <select
              value={profileData.genero}
              onChange={(e) => handleInputChange('genero', e.target.value)}
              className={`w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 ${isEditing ? 'focus:outline-none focus:ring-2 focus:ring-teal-500' : 'bg-gray-50'}`}
              disabled={!isEditing}
            >
              <option value="">Seleccionar</option>
              <option value="Masculino">Masculino</option>
              <option value="Femenino">Femenino</option>
              <option value="Otro">Otro</option>
              <option value="Prefiero no decir">Prefiero no decir</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Identidad Sexual</label>
            <select
              value={profileData.identidadSexual}
              onChange={(e) => handleInputChange('identidadSexual', e.target.value)}
              className={`w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 ${isEditing ? 'focus:outline-none focus:ring-2 focus:ring-teal-500' : 'bg-gray-50'}`}
              disabled={!isEditing}
            >
              <option value="">Seleccionar</option>
              <option value="Masculino">Masculino</option>
              <option value="Femenino">Femenino</option>
              <option value="No binario">No binario</option>
              <option value="Otro">Otro</option>
              <option value="Prefiero no decir">Prefiero no decir</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento</label>
            <input type="date" value={profileData.fechaNacimiento}
              onChange={(e) => handleInputChange('fechaNacimiento', e.target.value)}
              className={`w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 ${isEditing ? 'focus:outline-none focus:ring-2 focus:ring-teal-500' : 'bg-gray-50'}`}
              disabled={!isEditing}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono <span className="text-red-500">*</span>
            </label>
            <input type="tel" value={profileData.telefono}
              onChange={(e) => handleInputChange('telefono', e.target.value)}
              className={`w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 ${isEditing ? 'focus:outline-none focus:ring-2 focus:ring-teal-500' : 'bg-gray-50'}`}
              disabled={!isEditing}
              placeholder="3001234567"
            />
          </div>
        </div>
      </div>

      {/* Ubicación y Residencia */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
          Ubicación y Residencia
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">País</label>
            {isEditing ? (
              <Select
                options={opcionesPaises}
                value={opcionesPaises.find(opt => opt.value === profileData.pais)}
                onChange={(option) => handleInputChange('pais', option ? option.value : '')}
                placeholder="Selecciona un país"
                className="text-sm"
                isSearchable
                styles={{ control: (base) => ({ ...base, borderColor: '#d1d5db', '&:hover': { borderColor: '#9ca3af' } }) }}
              />
            ) : (
              <input type="text"
                value={opcionesPaises.find(opt => opt.value === profileData.pais)?.label || profileData.pais}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 text-gray-900"
                disabled
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nacionalidad</label>
            {isEditing ? (
              <Select
                options={opcionesPaises}
                value={opcionesPaises.find(opt => opt.value === profileData.nacionalidad)}
                onChange={(option) => handleInputChange('nacionalidad', option ? option.value : '')}
                placeholder="Selecciona nacionalidad"
                className="text-sm"
                isSearchable
                styles={{ control: (base) => ({ ...base, borderColor: '#d1d5db', '&:hover': { borderColor: '#9ca3af' } }) }}
              />
            ) : (
              <input type="text"
                value={opcionesPaises.find(opt => opt.value === profileData.nacionalidad)?.label || profileData.nacionalidad}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 text-gray-900"
                disabled
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Departamento de Residencia</label>
            <select
              value={profileData.departamentoResidencia}
              onChange={(e) => { handleInputChange('departamentoResidencia', e.target.value); handleInputChange('ciudadResidencia', ''); }}
              className={`w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 ${isEditing ? 'focus:outline-none focus:ring-2 focus:ring-teal-500' : 'bg-gray-50'}`}
              disabled={!isEditing}
            >
              <option value="">Seleccionar departamento</option>
              {colombiaData.map((dept) => (
                <option key={dept.departamento} value={dept.departamento}>{dept.departamento}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad de Residencia</label>
            <select
              value={profileData.ciudadResidencia}
              onChange={(e) => handleInputChange('ciudadResidencia', e.target.value)}
              className={`w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 ${isEditing ? 'focus:outline-none focus:ring-2 focus:ring-teal-500' : 'bg-gray-50'}`}
              disabled={!isEditing || !profileData.departamentoResidencia}
            >
              <option value="">Seleccionar ciudad</option>
              {ciudadesResidencia.map((ciudad) => (
                <option key={ciudad} value={ciudad}>{ciudad}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Dirección de Residencia</label>
            <input type="text" value={profileData.direccionResidencia}
              onChange={(e) => handleInputChange('direccionResidencia', e.target.value)}
              className={`w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 ${isEditing ? 'focus:outline-none focus:ring-2 focus:ring-teal-500' : 'bg-gray-50'}`}
              disabled={!isEditing}
              placeholder="Ej: Calle 15 # 10-45"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Departamento (Trabajo)</label>
            <select
              value={profileData.departamento}
              onChange={(e) => { handleInputChange('departamento', e.target.value); handleInputChange('municipio', ''); }}
              className={`w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 ${isEditing ? 'focus:outline-none focus:ring-2 focus:ring-teal-500' : 'bg-gray-50'}`}
              disabled={!isEditing}
            >
              <option value="">Seleccionar departamento</option>
              {colombiaData.map((dept) => (
                <option key={dept.departamento} value={dept.departamento}>{dept.departamento}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Municipio</label>
            <select
              value={profileData.municipio}
              onChange={(e) => handleInputChange('municipio', e.target.value)}
              className={`w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 ${isEditing ? 'focus:outline-none focus:ring-2 focus:ring-teal-500' : 'bg-gray-50'}`}
              disabled={!isEditing || !profileData.departamento}
            >
              <option value="">Seleccionar municipio</option>
              {municipios.map((mun) => (
                <option key={mun} value={mun}>{mun}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad (Trabajo)</label>
            <input type="text" value={profileData.ciudad}
              onChange={(e) => handleInputChange('ciudad', e.target.value)}
              className={`w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 ${isEditing ? 'focus:outline-none focus:ring-2 focus:ring-teal-500' : 'bg-gray-50'}`}
              disabled={!isEditing}
              placeholder="Ej: Valledupar"
            />
          </div>
        </div>
      </div>

      {/* Información Institucional */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
          Información Institucional
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo Institucional <span className="text-red-500 text-xs">(No editable)</span>
            </label>
            <input type="email" value={profileData.correo}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 text-gray-500 cursor-not-allowed"
              disabled
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rol en el Sistema</label>
            <input type="text" value={profileData.rol}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 text-gray-700"
              disabled
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Programa <span className="text-red-500 text-xs">(No aplica)</span>
            </label>
            <input type="text" value={profileData.programa}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 text-gray-500 cursor-not-allowed"
              disabled
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Semestre <span className="text-red-500 text-xs">(No aplica)</span>
            </label>
            <input type="text" value={profileData.semestre}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 text-gray-500 cursor-not-allowed"
              disabled
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Ingreso <span className="text-red-500 text-xs">(No editable)</span>
            </label>
            <input type="date" value={profileData.fechaIngreso}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 text-gray-500 cursor-not-allowed"
              disabled
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Año de Ingreso</label>
            <input type="text" value={profileData.anioIngreso}
              onChange={(e) => handleInputChange('anioIngreso', e.target.value)}
              className={`w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 ${isEditing ? 'focus:outline-none focus:ring-2 focus:ring-teal-500' : 'bg-gray-50'}`}
              disabled={!isEditing}
              placeholder="2020"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Periodo</label>
            <input type="text" value={profileData.periodo}
              onChange={(e) => handleInputChange('periodo', e.target.value)}
              className={`w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 ${isEditing ? 'focus:outline-none focus:ring-2 focus:ring-teal-500' : 'bg-gray-50'}`}
              disabled={!isEditing}
              placeholder="2020-1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <div className="flex items-center h-[42px]">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${profileData.activo ? 'bg-teal-100 text-teal-800' : 'bg-red-100 text-red-800'}`}>
                {profileData.activo ? '✓ Activo' : '✗ Inactivo'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Seguridad */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
          Seguridad
        </h3>
        <div className="space-y-4 max-w-2xl">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input type="password" defaultValue="********" disabled
              className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 text-gray-500"
            />
          </div>
          <div>
            <button
              onClick={handleOpenPasswordModal}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors"
            >
              Cambiar Contraseña
            </button>
          </div>
        </div>
      </div>

      {isEditing && (
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
          <button
            onClick={handleCancel}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors"
          >
            Guardar Cambios
          </button>
        </div>
      )}
    </div>
  );
}
