import { AlertCircle, CheckCircle } from "lucide-react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import Select from "react-select";

const PersonalInfoSection = ({
  formData,
  errors,
  successFields,
  handleChange,
  handleSelectChange,
  handlePhoneChange,
  handleDepartamentoChange,
  getInputClassName,
  cargando,
  paises,
  departamentos,
  municipios,
}) => {
  const esResidenteColombia = formData.nacionalidad === "COL";

  return (
    <>
      <div className="lg:col-span-2 border-l-4 border-green-600 pl-2 mb-2">
        <h2 className="text-lg font-semibold text-gray-700">
          Información Personal
        </h2>
      </div>

      <div className="relative">
        <label className="block font-medium text-gray-700 mb-1">
          Primer Nombre *
        </label>
        <div className="relative">
          <input
            name="primerNombre"
            type="text"
            maxLength="15"
            placeholder="Primer Nombre"
            value={formData.primerNombre}
            onChange={handleChange}
            disabled={cargando}
            className={getInputClassName("primerNombre")}
          />
          {successFields.primerNombre && !errors.primerNombre && (
            <CheckCircle className="absolute right-3 top-3 text-green-500" size={20} />
          )}
        </div>
        {errors.primerNombre && (
          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
            <AlertCircle size={14} />
            {errors.primerNombre}
          </p>
        )}
      </div>

      <div className="relative">
        <label className="block font-medium text-gray-700 mb-1">
          Segundo Nombre (opcional)
        </label>
        <div className="relative">
          <input
            name="segundoNombre"
            type="text"
            maxLength="15"
            placeholder="Segundo Nombre"
            value={formData.segundoNombre}
            onChange={handleChange}
            disabled={cargando}
            className={getInputClassName("segundoNombre")}
          />
          {successFields.segundoNombre && !errors.segundoNombre && (
            <CheckCircle className="absolute right-3 top-3 text-green-500" size={20} />
          )}
        </div>
        {errors.segundoNombre && (
          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
            <AlertCircle size={14} />
            {errors.segundoNombre}
          </p>
        )}
      </div>

      <div className="relative">
        <label className="block font-medium text-gray-700 mb-1">
          Primer Apellido *
        </label>
        <div className="relative">
          <input
            name="primerApellido"
            type="text"
            maxLength="15"
            placeholder="Primer Apellido"
            value={formData.primerApellido}
            onChange={handleChange}
            disabled={cargando}
            className={getInputClassName("primerApellido")}
          />
          {successFields.primerApellido && !errors.primerApellido && (
            <CheckCircle className="absolute right-3 top-3 text-green-500" size={20} />
          )}
        </div>
        {errors.primerApellido && (
          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
            <AlertCircle size={14} />
            {errors.primerApellido}
          </p>
        )}
      </div>

      <div className="relative">
        <label className="block font-medium text-gray-700 mb-1">
          Segundo Apellido *
        </label>
        <div className="relative">
          <input
            name="segundoApellido"
            type="text"
            maxLength="15"
            placeholder="Segundo Apellido"
            value={formData.segundoApellido}
            onChange={handleChange}
            disabled={cargando}
            className={getInputClassName("segundoApellido")}
          />
          {successFields.segundoApellido && !errors.segundoApellido && (
            <CheckCircle className="absolute right-3 top-3 text-green-500" size={20} />
          )}
        </div>
        {errors.segundoApellido && (
          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
            <AlertCircle size={14} />
            {errors.segundoApellido}
          </p>
        )}
      </div>

      <div>
        <label className="block font-medium text-gray-700 mb-1">
          Teléfono *
        </label>
        <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 bg-white relative">
          <PhoneInput
            country={"co"}
            enableSearch={true}
            disableDropdown={cargando}
            countryCodeEditable={false}
            value={formData.telefono}
            onChange={handlePhoneChange}
            disabled={cargando}
            inputClass="!border-none !outline-none !shadow-none !bg-transparent w-full !p-2 !pl-12"
            buttonClass="!border-none !bg-transparent hover:!bg-gray-100 !rounded-l-lg !absolute !left-0 !top-0 !h-full"
            dropdownClass="!shadow-lg !border !border-gray-200 !z-50"
            searchClass="!px-3 !py-2"
            containerClass="!static"
            placeholder="3001234567"
          />
        </div>
        {errors.telefono && (
          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
            <AlertCircle size={14} />
            {errors.telefono}
          </p>
        )}
      </div>

      <div>
        <label className="block font-medium text-gray-700 mb-1">
          Género *
        </label>
        <select
          name="genero"
          value={formData.genero}
          onChange={handleChange}
          disabled={cargando}
          className={getInputClassName("genero")}
        >
          <option value="">Selecciona Género</option>
          <option value="Hombre">Hombre</option>
          <option value="Mujer">Mujer</option>
          <option value="Otro">Otro</option>
        </select>
        {errors.genero && (
          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
            <AlertCircle size={14} />
            {errors.genero}
          </p>
        )}
      </div>

      <div>
        <label className="block font-medium text-gray-700 mb-1">
          Orientación Sexual *
        </label>
        <Select
          name="orientacionSexual"
          options={[
            { value: "Heterosexual", label: "Heterosexual" },
            { value: "Homosexual", label: "Homosexual" },
            { value: "Bisexual", label: "Bisexual" },
            { value: "Pansexual", label: "Pansexual" },
            { value: "Asexual", label: "Asexual" },
            { value: "Transexual", label: "Transexual" },
            { value: "No Binario", label: "No Binario" },
            { value: "Otro", label: "Otro" },
          ]}
          placeholder="Selecciona Orientación Sexual"
          value={
            formData.orientacionSexual
              ? { value: formData.orientacionSexual, label: formData.orientacionSexual }
              : null
          }
          onChange={(option) => handleSelectChange("orientacionSexual", option)}
          isDisabled={cargando}
          classNamePrefix="react-select"
          styles={{
            control: (base) => ({
              ...base,
              borderColor: errors.orientacionSexual
                ? "#ef4444"
                : successFields.orientacionSexual
                ? "#22c55e"
                : "#d1d5db",
              borderRadius: "0.5rem",
              padding: "2px",
              "&:hover": { borderColor: "#16a34a" },
              boxShadow: "none",
              backgroundColor: cargando ? "#f3f4f6" : "white",
            }),
          }}
        />
        {errors.orientacionSexual && (
          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
            <AlertCircle size={14} />
            {errors.orientacionSexual}
          </p>
        )}
      </div>

      <div>
        <label className="block font-medium text-gray-700 mb-1">
          Fecha de Nacimiento *
        </label>
        <input
          name="fechaNacimiento"
          type="date"
          value={formData.fechaNacimiento}
          onChange={handleChange}
          disabled={cargando}
          className={getInputClassName("fechaNacimiento")}
        />
        {errors.fechaNacimiento && (
          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
            <AlertCircle size={14} />
            {errors.fechaNacimiento}
          </p>
        )}
      </div>

      {/* País de Nacimiento */}
      <div className="lg:col-span-2">
        <label className="block font-medium text-gray-700 mb-1">
          País de Nacimiento *
        </label>
        <Select
          name="paisNacimiento"
          options={paises}
          placeholder={paises.length === 0 ? "Cargando países..." : "Selecciona País de Nacimiento"}
          value={paises.find((p) => p.value === formData.paisNacimiento) || null}
          onChange={(option) => handleSelectChange("paisNacimiento", option)}
          isDisabled={cargando || paises.length === 0}
          classNamePrefix="react-select"
          isSearchable
          styles={{
            control: (base) => ({
              ...base,
              borderColor: errors.paisNacimiento
                ? "#ef4444"
                : successFields.paisNacimiento
                ? "#22c55e"
                : "#d1d5db",
              borderRadius: "0.5rem",
              padding: "2px",
              "&:hover": { borderColor: "#16a34a" },
              backgroundColor: cargando ? "#f3f4f6" : "white",
            }),
          }}
        />
        {errors.paisNacimiento && (
          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
            <AlertCircle size={14} />
            {errors.paisNacimiento}
          </p>
        )}
      </div>

      {/* País de Residencia (Nacionalidad) */}
      <div className="lg:col-span-2">
        <label className="block font-medium text-gray-700 mb-1">
          País de Residencia *
        </label>
        <Select
          name="nacionalidad"
          options={paises}
          placeholder={paises.length === 0 ? "Cargando países..." : "Selecciona País de Residencia"}
          value={paises.find((p) => p.value === formData.nacionalidad) || null}
          onChange={(option) => handleSelectChange("nacionalidad", option)}
          isDisabled={cargando || paises.length === 0}
          classNamePrefix="react-select"
          isSearchable
          styles={{
            control: (base) => ({
              ...base,
              borderColor: errors.nacionalidad
                ? "#ef4444"
                : successFields.nacionalidad
                ? "#22c55e"
                : "#d1d5db",
              borderRadius: "0.5rem",
              padding: "2px",
              "&:hover": { borderColor: "#16a34a" },
              backgroundColor: cargando ? "#f3f4f6" : "white",
            }),
          }}
        />
        {errors.nacionalidad && (
          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
            <AlertCircle size={14} />
            {errors.nacionalidad}
          </p>
        )}
      </div>

      {/* Departamento de Residencia (solo Colombia) */}
      <div>
        <label className="block font-medium text-gray-700 mb-1">
          Departamento de Residencia{esResidenteColombia ? " *" : ""}
        </label>
        <select
          name="departamentoResidencia"
          value={formData.departamentoResidencia}
          onChange={handleDepartamentoChange}
          disabled={!esResidenteColombia || cargando}
          className={getInputClassName("departamentoResidencia")}
        >
          <option value="">
            {!esResidenteColombia ? "Solo para residentes en Colombia" : "Selecciona Departamento"}
          </option>
          {departamentos.map((d) => (
            <option key={d.codigo} value={d.codigo}>
              {d.nombre}
            </option>
          ))}
        </select>
        {errors.departamentoResidencia && (
          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
            <AlertCircle size={14} />
            {errors.departamentoResidencia}
          </p>
        )}
      </div>

      {/* Municipio de Residencia (solo Colombia) */}
      <div>
        <label className="block font-medium text-gray-700 mb-1">
          Municipio de Residencia{esResidenteColombia ? " *" : ""}
        </label>
        <select
          name="ciudadResidencia"
          value={formData.ciudadResidencia}
          onChange={handleChange}
          disabled={!formData.departamentoResidencia || !esResidenteColombia || cargando}
          className={getInputClassName("ciudadResidencia")}
        >
          <option value="">
            {!formData.departamentoResidencia ? "Selecciona un departamento primero" : "Selecciona Municipio"}
          </option>
          {municipios.map((m) => (
            <option key={m.codigo} value={m.codigo}>
              {m.nombre}
            </option>
          ))}
        </select>
        {errors.ciudadResidencia && (
          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
            <AlertCircle size={14} />
            {errors.ciudadResidencia}
          </p>
        )}
      </div>

      <div className="lg:col-span-2">
        <label className="block font-medium text-gray-700 mb-1">
          Dirección de Residencia *
        </label>
        <input
          name="direccionResidencia"
          type="text"
          maxLength="50"
          placeholder="Dirección de Residencia"
          value={formData.direccionResidencia}
          onChange={handleChange}
          disabled={cargando}
          className={getInputClassName("direccionResidencia")}
        />
        {errors.direccionResidencia && (
          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
            <AlertCircle size={14} />
            {errors.direccionResidencia}
          </p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          Debe incluir letras y números, mínimo 6 caracteres. Ejemplo:{" "}
          <span className="italic">Calle 10 #15-30</span> o{" "}
          <span className="italic">Vereda El Rosario Casa 12</span>.
        </p>
      </div>
    </>
  );
};

export default PersonalInfoSection;
