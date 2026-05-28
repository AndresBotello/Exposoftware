import React from "react";

export default function StudentProfileForm({
  profileData,
  isEditing,
  handleInputChange,
  loading = false
}) {
  return (
    <>
      {/* Información Personal */}
      <div className="mb-6 sm:mb-8">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6 pb-3 border-b border-gray-200 flex items-center gap-2">
          <span>👤</span> Información Personal
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Identificación - NO EDITABLE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Identificación
            </label>
            <input
              type="text"
              value={profileData.identificacion}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 text-gray-600"
              disabled
            />
          </div>

          {/* Primer nombre — solo lectura. El backend (UsuarioPerfilUpdate) NO permite
              que el estudiante modifique p_nombre desde mi-perfil. Solo un
              admin puede corregirlo desde el panel. */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Primer Nombre <span className="text-gray-400 text-xs">(no editable — contactá admin)</span>
            </label>
            <input
              type="text"
              value={profileData.p_nombre}
              readOnly
              disabled
              className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 text-gray-600 cursor-not-allowed"
              title="Este dato solo puede cambiarlo un administrador"
            />
          </div>

          {/* Segundo nombre — SI editable. UsuarioPerfilUpdate lo acepta. */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Segundo Nombre <span className="text-gray-400 text-xs">(opcional)</span>
            </label>
            <input
              type="text"
              value={profileData.s_nombre || ''}
              onChange={(e) => handleInputChange('s_nombre', e.target.value)}
              placeholder="Dejar vacío si no aplica"
              className={`w-full border border-gray-300 rounded-lg px-4 py-2 ${
                isEditing ? 'focus:outline-none focus:ring-2 focus:ring-teal-500' : 'bg-gray-50'
              }`}
              disabled={!isEditing || loading}
            />
          </div>

          {/* Primer apellido — solo lectura, mismo motivo que primer nombre. */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Primer Apellido <span className="text-gray-400 text-xs">(no editable — contactá admin)</span>
            </label>
            <input
              type="text"
              value={profileData.p_apellido}
              readOnly
              disabled
              className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 text-gray-600 cursor-not-allowed"
              title="Este dato solo puede cambiarlo un administrador"
            />
          </div>

          {/* Segundo apellido — SI editable. */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Segundo Apellido <span className="text-gray-400 text-xs">(opcional)</span>
            </label>
            <input
              type="text"
              value={profileData.s_apellido || ''}
              onChange={(e) => handleInputChange('s_apellido', e.target.value)}
              placeholder="Dejar vacío si no aplica"
              className={`w-full border border-gray-300 rounded-lg px-4 py-2 ${
                isEditing ? 'focus:outline-none focus:ring-2 focus:ring-teal-500' : 'bg-gray-50'
              }`}
              disabled={!isEditing || loading}
            />
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={profileData.telefono}
              onChange={(e) => handleInputChange('telefono', e.target.value)}
              className={`w-full border border-gray-300 rounded-lg px-4 py-2 ${
                isEditing ? 'focus:outline-none focus:ring-2 focus:ring-teal-500' : 'bg-gray-50'
              }`}
              disabled={!isEditing || loading}
            />
          </div>
        </div>
      </div>

      {/* Información Académica */}
      <div className="mb-6 sm:mb-8">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6 pb-3 border-b border-gray-200 flex items-center gap-2">
          <span>🎓</span> Información Académica
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Correo - NO EDITABLE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              value={profileData.correo}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 text-gray-600"
              disabled
            />
          </div>

          {/* Rol - NO EDITABLE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rol
            </label>
            <input
              type="text"
              value={profileData.rol}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 text-gray-600"
              disabled
            />
          </div>

          {/* Código Programa - NO EDITABLE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Código Programa
            </label>
            <input
              type="text"
              value={profileData.codigoPrograma}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 text-gray-600"
              disabled
            />
          </div>

          {/* Semestre - NO EDITABLE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Semestre
            </label>
            <input
              type="number"
              value={profileData.semestre}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 text-gray-600"
              disabled
            />
          </div>
        </div>
      </div>
    </>
  );
}
