import React from "react";

export default function GraduateProfileForm({
  formData,
  isEditing,
  handleChange,
  nombrePrograma
}) {
  return (
    <>
      {/* Información Personal */}
      <div className="border-b pb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <i className="pi pi-user text-green-600"></i>
          Información Personal
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nombre Completo - Solo lectura */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre Completo
            </label>
            <input
              type="text"
              value={formData.nombre_completo}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-100 text-gray-500 cursor-not-allowed"
              disabled
              readOnly
            />
          </div>

          {/* Identificación - NO EDITABLE */}
          <div>
            <label className="block text-sm font-medium mb-1">
              <span className="text-red-600">Identificación (No editable)</span>
            </label>
            <input
              type="text"
              value={formData.identificacion}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-100 text-gray-500 cursor-not-allowed"
              disabled
            />
          </div>

          {/* Primer Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Primer Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="primer_nombre"
              value={formData.primer_nombre}
              onChange={handleChange}
              className={`w-full border border-gray-200 rounded-lg px-3 py-2 ${isEditing ? 'focus:outline-none focus:ring-2 focus:ring-green-500' : 'bg-gray-100'}`}
              disabled={!isEditing}
            />
          </div>

          {/* Primer Apellido */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Primer Apellido <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="primer_apellido"
              value={formData.primer_apellido}
              onChange={handleChange}
              className={`w-full border border-gray-200 rounded-lg px-3 py-2 ${isEditing ? 'focus:outline-none focus:ring-2 focus:ring-green-500' : 'bg-gray-100'}`}
              disabled={!isEditing}
            />
          </div>
        </div>
      </div>

      {/* Información de Contacto */}
      <div className="border-b pb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <i className="pi pi-phone text-green-600"></i>
          Información de Contacto
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Correo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo Electrónico <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="correo"
              value={formData.correo}
              onChange={handleChange}
              className={`w-full border border-gray-200 rounded-lg px-3 py-2 ${isEditing ? 'focus:outline-none focus:ring-2 focus:ring-green-500' : 'bg-gray-100'}`}
              disabled={!isEditing}
            />
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              className={`w-full border border-gray-200 rounded-lg px-3 py-2 ${isEditing ? 'focus:outline-none focus:ring-2 focus:ring-green-500' : 'bg-gray-100'}`}
              disabled={!isEditing}
            />
          </div>
        </div>
      </div>

      {/* Información Académica */}
      <div className="border-b pb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <i className="pi pi-graduation-cap text-green-600"></i>
          Información Académica
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nombre del Programa */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Programa Académico
            </label>
            <input
              type="text"
              value={nombrePrograma || formData.codigo_programa}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-100 text-gray-500 cursor-not-allowed"
              disabled
              readOnly
            />
          </div>

          {/* Año de Graduación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Año de Graduación <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="anio_graduacion"
              value={formData.anio_graduacion}
              onChange={handleChange}
              className={`w-full border border-gray-200 rounded-lg px-3 py-2 ${isEditing ? 'focus:outline-none focus:ring-2 focus:ring-green-500' : 'bg-gray-100'}`}
              disabled={!isEditing}
              min="1990"
              max={new Date().getFullYear()}
            />
          </div>

          {/* Titulado */}
          <div className="md:col-span-2">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="titulado"
                checked={formData.titulado}
                onChange={(e) => handleChange({
                  target: {
                    name: 'titulado',
                    value: e.target.checked
                  }
                })}
                className={`w-4 h-4 text-green-600 rounded ${isEditing ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                disabled={!isEditing}
              />
              <span className="text-sm font-medium text-gray-700">
                Titulado
              </span>
            </label>
          </div>
        </div>
      </div>
    </>
  );
}
