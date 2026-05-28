import { AlertCircle, Eye, EyeOff } from "lucide-react";

const CredentialsSection = ({
  formData,
  errors,
  handleChange,
  getInputClassName,
  cargando,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
}) => {
  return (
    <>
      <div className="lg:col-span-2 border-l-4 border-green-600 pl-2 mt-4 mb-2">
        <h2 className="text-lg font-semibold text-gray-700">
          🔐 Credenciales de Acceso
        </h2>
        <p className="text-sm text-gray-500 mt-1">Crea una contraseña segura para tu cuenta</p>
      </div>

      <div className="relative">
        <label className="block font-medium text-gray-700 mb-1">
          Contraseña *
        </label>
        <div className="relative">
          <input
            name="contraseña"
            type={showPassword ? "text" : "password"}
            maxLength="128"
            minLength="8"
            placeholder="Entre 8 y 128 caracteres"
            value={formData.contraseña}
            onChange={handleChange}
            disabled={cargando}
            className={getInputClassName("contraseña")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            disabled={cargando}
            className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-green-600 transition-colors"
          >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {errors.contraseña && (
          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
            <AlertCircle size={14} />
            {errors.contraseña}
          </p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          Entre 8 y 128 caracteres, con mayúscula, minúscula, número y carácter especial (@$!%?&#).
        </p>
      </div>

      <div className="relative">
        <label className="block font-medium text-gray-700 mb-1">
          Confirmar Contraseña *
        </label>
        <div className="relative">
          <input
            name="confirmarcontraseña"
            type={showConfirmPassword ? "text" : "password"}
            maxLength="128"
            minLength="8"
            placeholder="Repite tu contraseña"
            value={formData.confirmarcontraseña}
            onChange={handleChange}
            disabled={cargando}
            className={getInputClassName("confirmarcontraseña")}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            disabled={cargando}
            className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-green-600 transition-colors"
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {errors.confirmarcontraseña && (
          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
            <AlertCircle size={14} />
            {errors.confirmarcontraseña}
          </p>
        )}
      </div>
    </>
  );
};

export default CredentialsSection;
