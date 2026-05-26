import { AlertCircle, CheckCircle } from "lucide-react";
import SECTORES from "../../../data/sectores";

function InformacionInvitado({
  formData,
  errors,
  handleChange,
  cargando,
  successFields,
  getInputClassName
}) {
  return (
    <>
      <div className="lg:col-span-2 border-l-4 border-green-600 pl-2 mt-4 mb-2">
        <h2 className="text-lg font-semibold text-gray-700">Información del Invitado</h2>
        <p className="text-sm text-gray-500 mt-1">Completa los datos de acceso y organización</p>
      </div>

      {/* Correo Personal - Campo Destacado */}
      <div className="lg:col-span-2 bg-green-50 p-4 rounded-lg border-2 border-green-200">
        <label className="block font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <span className="text-green-600">✉️</span>
          Correo Personal (será tu usuario de acceso) *
        </label>
        <div className="relative">
          <input
            name="correo"
            type="email"
            maxLength="50"
            placeholder="usuario@ejemplo.com"
            value={formData.correo}
            onChange={handleChange}
            disabled={cargando}
            className={getInputClassName("correo")}
          />
          {successFields.correo && !errors.correo && (
            <CheckCircle className="absolute right-3 top-3 text-green-500" size={20} />
          )}
        </div>
        {errors.correo && (
          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
            <AlertCircle size={14} /> {errors.correo}
          </p>
        )}
        <p className="text-xs text-gray-600 mt-2">
          📌 Este correo será usado para iniciar sesión en la plataforma
        </p>
      </div>

      <div>
        <label className="block font-medium text-gray-700 mb-1">
          Institución de Origen *
        </label>
        <div className="relative">
          <input
            name="intitucionOrigen"
            type="text"
            maxLength="40"
            placeholder="Nombre de la institución"
            value={formData.intitucionOrigen}
            onChange={handleChange}
            disabled={cargando}
            className={getInputClassName("intitucionOrigen")}
          />
          {successFields.intitucionOrigen && !errors.intitucionOrigen && (
            <CheckCircle className="absolute right-3 top-3 text-green-500" size={20} />
          )}
        </div>
        {errors.intitucionOrigen && (
          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
            <AlertCircle size={14} /> {errors.intitucionOrigen}
          </p>
        )}
      </div>

      <div>
        <label className="block font-medium text-gray-700 mb-1">Sector *</label>
        <select
          name="sector"
          value={formData.sector}
          onChange={handleChange}
          disabled={cargando}
          className={getInputClassName("sector")}
        >
          <option value="">Selecciona Sector</option>
          {SECTORES.map(sector => (
            <option key={sector.id} value={sector.id}>
              {sector.nombre}
            </option>
          ))}
        </select>
        {errors.sector && (
          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
            <AlertCircle size={14} /> {errors.sector}
          </p>
        )}
      </div>

      <div>
        <label className="block font-medium text-gray-700 mb-1">Nombre de la Empresa *</label>
        <div className="relative">
          <input
            name="nombreEmpresa"
            type="text"
            maxLength="40"
            placeholder="Nombre de la empresa"
            value={formData.nombreEmpresa}
            onChange={handleChange}
            disabled={cargando}
            className={getInputClassName("nombreEmpresa")}
          />
          {successFields.nombreEmpresa && !errors.nombreEmpresa && (
            <CheckCircle className="absolute right-3 top-3 text-green-500" size={20} />
          )}
        </div>
        {errors.nombreEmpresa && (
          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
            <AlertCircle size={14} /> {errors.nombreEmpresa}
          </p>
        )}
      </div>
    </>
  );
}

export default InformacionInvitado;
