import { TIPOS_DOCUMENTO, GENEROS, IDENTIDADES_SEXUALES } from "./useTeacherManagement";

const fieldClass = (err) =>
  `w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 ${err ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'}`;

const FieldError = ({ msg }) =>
  msg ? <p className="mt-1 text-sm text-red-600 flex items-center gap-1"><i className="pi pi-exclamation-circle"></i>{msg}</p> : null;

export default function TeacherPersonalSection({
  tipoDocumento, setTipoDocumento,
  identificacion, setIdentificacion,
  primerNombre, setPrimerNombre,
  segundoNombre, setSegundoNombre,
  primerApellido, setPrimerApellido,
  segundoApellido, setSegundoApellido,
  genero, setGenero,
  identidadSexual, setIdentidadSexual,
  fechaNacimiento, setFechaNacimiento,
  telefono, setTelefono,
  errors,
  handleInputChange,
}) {
  return (
    <div className="border-b pb-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Personal</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Documento <span className="text-red-500">*</span></label>
          <select value={tipoDocumento} onChange={(e) => setTipoDocumento(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white" required
          >
            <option value="">Seleccionar tipo</option>
            {TIPOS_DOCUMENTO.map((tipo) => <option key={tipo} value={tipo}>{tipo}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Número de Identificación <span className="text-red-500">*</span></label>
          <input type="text" name="identificacion" value={identificacion}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, '');
              if (v.length <= 12) handleInputChange('identificacion', v, setIdentificacion);
            }}
            placeholder="Ej: 1023456789"
            className={fieldClass(errors?.identificacion)} required maxLength={12}
          />
          <FieldError msg={errors?.identificacion} />
        </div>

        {[
          { name: 'primerNombre', label: 'Primer Nombre', value: primerNombre, setter: setPrimerNombre, required: true, placeholder: 'Ej: María' },
          { name: 'segundoNombre', label: 'Segundo Nombre', value: segundoNombre, setter: setSegundoNombre, required: false, placeholder: 'Ej: José' },
          { name: 'primerApellido', label: 'Primer Apellido', value: primerApellido, setter: setPrimerApellido, required: true, placeholder: 'Ej: Pérez' },
          { name: 'segundoApellido', label: 'Segundo Apellido', value: segundoApellido, setter: setSegundoApellido, required: false, placeholder: 'Ej: García' },
        ].map(({ name, label, value, setter, required, placeholder }) => (
          <div key={name}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input type="text" name={name} value={value}
              onChange={(e) => {
                const v = e.target.value.replace(/[^a-zA-ZÁÉÍÓÚáéíóúñÑ\s]/g, '');
                handleInputChange(name, v, setter);
              }}
              placeholder={placeholder} maxLength={15}
              className={fieldClass(errors?.[name])}
              required={required}
            />
            <FieldError msg={errors?.[name]} />
          </div>
        ))}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Sexo <span className="text-red-500">*</span></label>
          <select value={genero} onChange={(e) => setGenero(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white" required
          >
            <option value="">Seleccionar sexo</option>
            {GENEROS.map((gen) => <option key={gen} value={gen}>{gen}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Identidad Sexual <span className="text-red-500">*</span></label>
          <select value={identidadSexual} onChange={(e) => setIdentidadSexual(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white" required
          >
            <option value="">Seleccionar</option>
            {IDENTIDADES_SEXUALES.map((id) => <option key={id} value={id}>{id}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Nacimiento <span className="text-red-500">*</span></label>
          <input type="date" value={fechaNacimiento} onChange={(e) => setFechaNacimiento(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono <span className="text-red-500">*</span></label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 font-medium">+57</span>
            <input type="tel" name="telefono" value={telefono}
              onChange={(e) => {
                let v = e.target.value.replace(/\D/g, '');
                if (!v || v.length === 0) v = '3';
                if (!v.startsWith('3')) v = '3' + v.replace(/^3*/, '');
                if (v.length > 10) v = v.slice(0, 10);
                handleInputChange('telefono', v, setTelefono);
              }}
              onFocus={(e) => { if (e.target.value === '') handleInputChange('telefono', '3', setTelefono); }}
              placeholder="3001234567"
              className={`w-full pl-14 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 ${errors?.telefono ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'}`}
              required maxLength={10}
            />
          </div>
          <FieldError msg={errors?.telefono} />
          <p className="mt-1 text-xs text-gray-500">Formato: +57 3XX XXX XXXX (10 dígitos, inicia con 3)</p>
        </div>

      </div>
    </div>
  );
}
