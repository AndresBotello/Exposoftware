import React from "react";

export default function ProfileForm({ profileData }) {
  return (
    <>
      {/* Información Personal */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200 flex items-center gap-2">
          <span>👤</span> Información Personal
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Identificación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Identificación
            </label>
            <input
              type="text"
              value={profileData.identificacion || ""}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 text-gray-700 cursor-not-allowed"
              disabled
            />
          </div>

          {/* Primer Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Primer Nombre
            </label>
            <input
              type="text"
              value={profileData.p_nombre || ""}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 text-gray-700 cursor-not-allowed"
              disabled
            />
          </div>

          {/* Segundo Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Segundo Nombre
            </label>
            <input
              type="text"
              value={profileData.s_nombre || ""}
              placeholder={profileData.s_nombre ? "" : "—"}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 text-gray-700 cursor-not-allowed"
              disabled
            />
          </div>

          {/* Primer Apellido */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Primer Apellido
            </label>
            <input
              type="text"
              value={profileData.p_apellido || ""}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 text-gray-700 cursor-not-allowed"
              disabled
            />
          </div>

          {/* Segundo Apellido */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Segundo Apellido
            </label>
            <input
              type="text"
              value={profileData.s_apellido || ""}
              placeholder={profileData.s_apellido ? "" : "—"}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 text-gray-700 cursor-not-allowed"
              disabled
            />
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono
            </label>
            <input
              type="tel"
              value={profileData.telefono || ""}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 text-gray-700 cursor-not-allowed"
              disabled
            />
          </div>
        </div>
      </div>

      {/* Información de Contacto */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200 flex items-center gap-2">
          <span>📧</span> Información de Contacto
        </h3>

        <div className="grid grid-cols-1 gap-4">
          {/* Correo Electrónico */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              value={profileData.correo || ""}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 text-gray-700 cursor-not-allowed"
              disabled
            />
          </div>
        </div>
      </div>

      {/* Información Institucional */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200 flex items-center gap-2">
          <span>🏛️</span> Información Institucional
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Categoría Docente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoría Docente
            </label>
            <input
              type="text"
              value={profileData.categoria_docente || ""}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 text-gray-700 cursor-not-allowed"
              disabled
            />
          </div>

          {/* Código Programa */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Código Programa
            </label>
            <input
              type="text"
              value={profileData.codigo_programa || ""}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 text-gray-700 cursor-not-allowed"
              disabled
            />
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <div className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                profileData.activo
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {profileData.activo ? '✓ Activo' : '✗ Inactivo'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
