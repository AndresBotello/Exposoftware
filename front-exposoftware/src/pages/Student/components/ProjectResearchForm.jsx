export default function ProjectResearchForm({
  form,
  setForm,
  lineas,
  sublineasFiltradas,
  areasFiltradas,
  materias
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Materia
        </label>
        {materias.length > 0 ? (
          <select
            value={form.codigo_materia}
            onChange={(e) => setForm(s => ({ ...s, codigo_materia: e.target.value }))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">Seleccionar materia</option>
            {materias.map((materia) => (
              <option key={materia.codigo} value={materia.codigo}>
                {materia.nombre}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            value={form.codigo_materia}
            onChange={(e) => setForm(s => ({ ...s, codigo_materia: e.target.value }))}
            placeholder="Código de materia (opcional)"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
          />
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Línea de Investigación <span className="text-red-500">*</span>
        </label>
        <select
          value={form.codigo_linea}
          onChange={(e) => setForm(s => ({ ...s, codigo_linea: e.target.value, codigo_sublinea: '', codigo_area: '' }))}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
          required
        >
          <option value="">Seleccionar línea</option>
          {lineas.map((linea) => (
            <option key={linea.codigo} value={linea.codigo}>
              {linea.nombre}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Sublínea <span className="text-red-500">*</span>
        </label>
        <select
          value={form.codigo_sublinea}
          onChange={(e) => setForm(s => ({ ...s, codigo_sublinea: e.target.value, codigo_area: '' }))}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
          disabled={!form.codigo_linea}
          required
        >
          <option value="">Seleccionar sublínea</option>
          {sublineasFiltradas.map((sublinea) => (
            <option key={sublinea.codigo} value={sublinea.codigo}>
              {sublinea.nombre}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Área Temática <span className="text-red-500">*</span>
        </label>
        <select
          value={form.codigo_area}
          onChange={(e) => setForm(s => ({ ...s, codigo_area: e.target.value }))}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
          disabled={!form.codigo_sublinea}
          required
        >
          <option value="">Seleccionar área</option>
          {areasFiltradas.map((area) => (
            <option key={area.codigo} value={area.codigo}>
              {area.nombre}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
