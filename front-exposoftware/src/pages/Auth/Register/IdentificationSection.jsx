import { AlertCircle, CheckCircle } from "lucide-react";

const IdentificationSection = ({
  formData,
  errors,
  successFields,
  handleChange,
  getInputClassName,
  cargando,
}) => {
  return (
    <>
      <div className="lg:col-span-2 border-l-4 border-green-600 pl-2 mt-4 mb-2">
        <h2 className="text-lg font-semibold text-gray-700">
          Identificación
        </h2>
      </div>

      <div className="lg:col-span-2">
        <label className="block font-medium text-gray-700 mb-1">
          Selecciona Perfil *
        </label>
        <select
          name="rol"
          value={formData.rol}
          onChange={handleChange}
          disabled={cargando}
          className={getInputClassName("rol")}
        >
          <option value="">Selecciona Perfil</option>
          <option value="estudiante">Estudiante</option>
          <option value="invitado">Invitado</option>
          <option value="egresado">Egresado</option>
        </select>
        {errors.rol && (
          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
            <AlertCircle size={14} />
            {errors.rol}
          </p>
        )}
      </div>

      <div>
        <label className="block font-medium text-gray-700 mb-1">
          Tipo de Documento *
        </label>
        <select
          name="tipoDocumento"
          value={formData.tipoDocumento}
          onChange={handleChange}
          disabled={cargando}
          className={getInputClassName("tipoDocumento")}
        >
          <option value="">Tipo de Documento</option>
          <option value="CC">CC: Cédula de Ciudadanía</option>
          <option value="TI">TI: Tarjeta de Identidad</option>
          <option value="CE">CE: Cédula Extranjera</option>
          <option value="PTE">PTE: Permiso Temporal de Extranjero</option>
          <option value="PAS">PAS: Pasaporte</option>
        </select>
        {errors.tipoDocumento && (
          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
            <AlertCircle size={14} />
            {errors.tipoDocumento}
          </p>
        )}
      </div>

      <div>
        <label className="block font-medium text-gray-700 mb-1">
          Número de Documento *
        </label>
        <div className="relative">
          <input
            name="numeroDocumento"
            type="text"
            maxLength="20"
            placeholder="Número de Documento"
            value={formData.numeroDocumento}
            onChange={handleChange}
            disabled={cargando}
            className={getInputClassName("numeroDocumento")}
          />
          {successFields.numeroDocumento && !errors.numeroDocumento && (
            <CheckCircle className="absolute right-3 top-3 text-green-500" size={20} />
          )}
        </div>
        {errors.numeroDocumento && (
          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
            <AlertCircle size={14} />
            {errors.numeroDocumento}
          </p>
        )}
      </div>
    </>
  );
};

export default IdentificationSection;