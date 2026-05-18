export default function ResearchLinesTabs({
  activeTab,
  // Lines
  codigoLinea, setCodigoLinea,
  nombreLinea, setNombreLinea,
  lineas, lineasFiltradas,
  searchTermLinea, setSearchTermLinea,
  handleSubmitLinea, handleEditLinea, handleDeleteLinea,
  // Sublines
  idLineaParaSublinea, setIdLineaParaSublinea,
  nombreSublinea, setNombreSublinea,
  sublineasFiltradas,
  searchTermSublinea, setSearchTermSublinea,
  handleSubmitSublinea, handleEditSublinea, handleDeleteSublinea,
  getLineaNombre,
  // Areas
  nombreArea, setNombreArea,
  idSublineaParaArea, setIdSublineaParaArea,
  areasFiltradas,
  searchTermArea, setSearchTermArea,
  handleSubmitArea, handleEditArea, handleDeleteArea,
  getSublineaNombre,
  sublineasPorLinea,
}) {
  return (
    <>
      {activeTab === "lineas" && (
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Crear Línea de Investigación</h2>
            <p className="text-sm text-gray-600">Las líneas son áreas principales de investigación. Las sublíneas y áreas dependerán de estas.</p>
          </div>

          <form onSubmit={handleSubmitLinea} className="space-y-6 max-w-2xl">
            <div>
              <label htmlFor="codigoLinea" className="block text-sm font-medium text-gray-700 mb-2">
                Código de la Línea <span className="text-red-500">*</span>
              </label>
              <input
                type="number" id="codigoLinea" value={codigoLinea}
                onChange={(e) => setCodigoLinea(e.target.value)}
                placeholder="Ej: 1"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                required min="1"
              />
              <p className="mt-1 text-xs text-gray-500">Ingresa un código numérico único para la línea</p>
            </div>
            <div>
              <label htmlFor="nombreLinea" className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la Línea de Investigación <span className="text-red-500">*</span>
              </label>
              <input
                type="text" id="nombreLinea" value={nombreLinea}
                onChange={(e) => setNombreLinea(e.target.value)}
                placeholder="Ej: IA y Machine L" maxLength={15}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>
            <div className="pt-4">
              <button type="submit" className="w-full bg-teal-600 text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-teal-700 transition-all shadow-md">
                Crear Línea de Investigación
              </button>
            </div>
          </form>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Líneas Registradas</h3>
                <p className="text-sm text-gray-500 mt-1">{lineasFiltradas.length} {lineasFiltradas.length === 1 ? 'línea' : 'líneas'} encontradas</p>
              </div>
              <div className="relative w-64">
                <input type="text" placeholder="Buscar líneas..." value={searchTermLinea}
                  onChange={(e) => setSearchTermLinea(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                />
                <i className="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {["Código", "Nombre", "Fecha Creación", "Acciones"].map(col => (
                      <th key={col} className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${col === "Acciones" ? "text-center" : "text-left"}`}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {lineasFiltradas.length === 0 ? (
                    <tr><td colSpan="4" className="px-6 py-12 text-center">
                      <i className="pi pi-inbox text-4xl mb-3 text-gray-400 block"></i>
                      <p className="text-sm text-gray-500">{lineas.length === 0 ? "No hay líneas registradas aún" : "No se encontraron líneas"}</p>
                    </td></tr>
                  ) : lineasFiltradas.map((linea, idx) => (
                    <tr key={`linea-${linea.codigo_linea || idx}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-teal-100 text-teal-800">{linea.codigo_linea}</span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{linea.nombre_linea}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{linea.fechaCreacion || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleEditLinea(linea)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Editar"><i className="pi pi-pencil"></i></button>
                          <button onClick={() => handleDeleteLinea(linea.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Eliminar"><i className="pi pi-trash"></i></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "sublineas" && (
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Crear Sublínea</h2>
            <p className="text-sm text-gray-600">Las sublíneas son divisiones específicas de una línea de investigación.</p>
          </div>

          <form onSubmit={handleSubmitSublinea} className="space-y-6 max-w-2xl">
            <div>
              <label htmlFor="idLineaParaSublinea" className="block text-sm font-medium text-gray-700 mb-2">
                Línea de Investigación (Principal) <span className="text-red-500">*</span>
              </label>
              <select id="idLineaParaSublinea" value={idLineaParaSublinea}
                onChange={(e) => setIdLineaParaSublinea(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                required
              >
                <option value="">Selecciona una línea</option>
                {lineas.map((linea, idx) => (
                  <option key={`linea-${linea.codigo_linea || idx}`} value={String(linea.codigo_linea)}>
                    {linea.codigo_linea} - {linea.nombre_linea}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="nombreSublinea" className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la Sublínea <span className="text-red-500">*</span>
              </label>
              <input type="text" id="nombreSublinea" value={nombreSublinea}
                onChange={(e) => setNombreSublinea(e.target.value)}
                placeholder="Ej: Deep Learning"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
              <p className="mt-1 text-xs text-gray-500">El código se generará automáticamente</p>
            </div>
            <div className="pt-4">
              <button type="submit" className="w-full bg-teal-600 text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-teal-700 transition-all shadow-md">
                Crear Sublínea
              </button>
            </div>
          </form>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Sublíneas Registradas</h3>
                <p className="text-sm text-gray-500 mt-1">{sublineasFiltradas.length} {sublineasFiltradas.length === 1 ? 'sublínea' : 'sublíneas'} encontradas</p>
              </div>
              <div className="relative w-64">
                <input type="text" placeholder="Buscar sublíneas..." value={searchTermSublinea}
                  onChange={(e) => setSearchTermSublinea(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                />
                <i className="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {["Código", "Sublínea", "Línea Principal", "Fecha Creación", "Acciones"].map(col => (
                      <th key={col} className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${col === "Acciones" ? "text-center" : "text-left"}`}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sublineasFiltradas.length === 0 ? (
                    <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      <i className="pi pi-inbox text-4xl mb-3 block"></i>
                      <p className="text-sm">No se encontraron sublíneas</p>
                    </td></tr>
                  ) : sublineasFiltradas.map((sublinea) => (
                    <tr key={`sublinea-${sublinea.codigo_linea}-${sublinea.codigo_sublinea}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800">{sublinea.codigo_sublinea}</span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{sublinea.nombre_sublinea}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">{getLineaNombre(sublinea.codigo_linea)}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{sublinea.fechaCreacion || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleEditSublinea(sublinea)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Editar"><i className="pi pi-pencil"></i></button>
                          <button onClick={() => handleDeleteSublinea(sublinea.codigo_sublinea)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Eliminar"><i className="pi pi-trash"></i></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "areas" && (
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Crear Área Temática</h2>
            <p className="text-sm text-gray-600">Las áreas temáticas son temas específicos dentro de una sublínea de investigación.</p>
          </div>

          <form onSubmit={handleSubmitArea} className="space-y-6 max-w-2xl">
            <div>
              <label htmlFor="lineaParaArea" className="block text-sm font-medium text-gray-700 mb-2">
                Línea de Investigación (Paso 1) <span className="text-red-500">*</span>
              </label>
              <select id="lineaParaArea" value={idLineaParaSublinea}
                onChange={(e) => setIdLineaParaSublinea(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                required
              >
                <option value="">Selecciona una línea</option>
                {lineas.map((linea, idx) => (
                  <option key={`linea-${linea.codigo_linea || idx}`} value={String(linea.codigo_linea)}>
                    {linea.codigo_linea} - {linea.nombre_linea}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">Primero selecciona una línea para cargar sus sublíneas</p>
            </div>
            <div>
              <label htmlFor="idSublineaParaArea" className="block text-sm font-medium text-gray-700 mb-2">
                Sublínea de Investigación (Paso 2) <span className="text-red-500">*</span>
              </label>
              <select id="idSublineaParaArea" value={idSublineaParaArea}
                onChange={(e) => setIdSublineaParaArea(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white disabled:bg-gray-100"
                required disabled={!idLineaParaSublinea}
              >
                <option value="">{idLineaParaSublinea ? (sublineasPorLinea.length > 0 ? 'Selecciona una sublínea' : 'Cargando sublíneas...') : 'Primero selecciona una línea'}</option>
                {sublineasPorLinea.map((sublinea, idx) => (
                  <option key={`sublinea-${sublinea.codigo_sublinea || idx}`} value={String(sublinea.codigo_sublinea)}>
                    {sublinea.codigo_sublinea} - {sublinea.nombre_sublinea}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="nombreArea" className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Área Temática <span className="text-red-500">*</span>
              </label>
              <input type="text" id="nombreArea" value={nombreArea}
                onChange={(e) => setNombreArea(e.target.value)}
                placeholder="Ej: Redes Neuronales"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
              <p className="mt-1 text-xs text-gray-500">El código se generará automáticamente</p>
            </div>
            <div className="pt-4">
              <button type="submit" disabled={!idSublineaParaArea}
                className="w-full bg-teal-600 text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-teal-700 transition-all shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Crear Área Temática
              </button>
            </div>
          </form>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Áreas Temáticas Registradas</h3>
                <p className="text-sm text-gray-500 mt-1">{areasFiltradas.length} {areasFiltradas.length === 1 ? 'área' : 'áreas'} encontradas</p>
              </div>
              <div className="relative w-64">
                <input type="text" placeholder="Buscar áreas..." value={searchTermArea}
                  onChange={(e) => setSearchTermArea(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                />
                <i className="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {["Código", "Área Temática", "Sublínea", "Fecha Creación", "Acciones"].map(col => (
                      <th key={col} className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${col === "Acciones" ? "text-center" : "text-left"}`}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {areasFiltradas.length === 0 ? (
                    <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      <i className="pi pi-inbox text-4xl mb-3 block"></i>
                      <p className="text-sm">No se encontraron áreas temáticas</p>
                    </td></tr>
                  ) : areasFiltradas.map((area) => (
                    <tr key={`area-${area.codigo_linea}-${area.codigo_sublinea}-${area.codigo_area}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-orange-100 text-orange-800">{area.codigo_area}</span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{area.nombre_area}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">{getSublineaNombre(area.codigo_sublinea)}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{area.fechaCreacion || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleEditArea(area)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Editar"><i className="pi pi-pencil"></i></button>
                          <button onClick={() => handleDeleteArea(area.codigo_area)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Eliminar"><i className="pi pi-trash"></i></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
