export default function ProjectBasicInfoForm({
  form,
  setForm,
  tiposActividad,
  eventos,
  loading
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tipo de Actividad <span className="text-red-500">*</span>
        </label>
        <select
          value={form.tipo_actividad}
          onChange={(e) => setForm(s => ({ ...s, tipo_actividad: e.target.value }))}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
          required
        >
          <option value="">Seleccionar tipo de actividad</option>
          {tiposActividad.map((tipo) => (
            <option key={tipo.id} value={tipo.id}>
              {tipo.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Evento <span className="text-red-500">*</span>
        </label>
        <select
          value={form.id_evento}
          onChange={(e) => setForm(s => ({ ...s, id_evento: e.target.value }))}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
          required
        >
          <option value="">Seleccionar evento</option>
          {eventos.map((evento) => (
            <option key={evento.id_evento} value={evento.id_evento}>
              {evento.nombre_evento}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Título del Proyecto <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={form.titulo_proyecto}
          onChange={(e) => setForm(s => ({ ...s, titulo_proyecto: e.target.value }))}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
          placeholder="Ingresa el título del proyecto"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Artículo en PDF <span className="text-red-500">*</span>
        </label>
        <input
          type="file"
          accept=".pdf"
          onChange={(e) => setForm(s => ({ ...s, archivoPDF: e.target.files[0] }))}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
          required
        />
        {form.archivoPDF && (
          <p className="text-xs text-teal-600 mt-1">
            ✓ {form.archivoPDF.name} ({(form.archivoPDF.size / 1024 / 1024).toFixed(2)} MB)
          </p>
        )}
      </div>

      {form.tipo_actividad && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Archivo Adicional (Póster o Imagen)
          </label>
          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={(e) => setForm(s => ({ ...s, archivoExtra: e.target.files[0] }))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          {form.archivoExtra && (
            <p className="text-xs text-teal-600 mt-1">
              ✓ {form.archivoExtra.name} ({(form.archivoExtra.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>
      )}
    </div>
  );
}
