export default function EventLogForm({
  form, setForm, formErrors, fileInputRef, yearOptions, loading,
  handleInputChange, handleFileChange, handleSubmit, setShowForm, setFormErrors,
}) {
  const fieldClass = (err) => `w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none ${err ? "border-red-400" : "border-gray-300"}`;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
          <i className="pi pi-plus-circle text-teal-600 text-xl"></i>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Nuevo Registro de Evento</h3>
          <p className="text-sm text-gray-500">Complete los datos y suba el documento PDF</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Año del Evento <span className="text-red-500">*</span>
            </label>
            <select name="year" value={form.year} onChange={handleInputChange} className={fieldClass(formErrors.year)}>
              {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
            {formErrors.year && <p className="text-xs text-red-500 mt-1">{formErrors.year}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título del Evento <span className="text-red-500">*</span>
            </label>
            <input type="text" name="title" value={form.title} onChange={handleInputChange}
              placeholder="Ej: Expo-software 2025" className={fieldClass(formErrors.title)}
            />
            {formErrors.title && <p className="text-xs text-red-500 mt-1">{formErrors.title}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción <span className="text-red-500">*</span>
          </label>
          <textarea name="description" value={form.description} onChange={handleInputChange} rows={3}
            placeholder="Describa el evento y los datos registrados..."
            className={`${fieldClass(formErrors.description)} resize-none`}
          />
          {formErrors.description && <p className="text-xs text-red-500 mt-1">{formErrors.description}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Documento PDF <span className="text-red-500">*</span>
          </label>
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-teal-400 hover:bg-teal-50 transition-colors ${formErrors.pdfFile ? "border-red-400 bg-red-50" : "border-gray-300 bg-gray-50"}`}
            onClick={() => fileInputRef.current?.click()}
          >
            {form.pdfFile ? (
              <div className="flex items-center justify-center gap-3">
                <i className="pi pi-file-pdf text-red-500 text-3xl"></i>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">{form.pdfFile.name}</p>
                  <p className="text-xs text-gray-500">{(form.pdfFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
                <button type="button" onClick={(e) => { e.stopPropagation(); setForm((prev) => ({ ...prev, pdfFile: null })); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                  className="p-1 text-gray-400 hover:text-red-500"
                ><i className="pi pi-times"></i></button>
              </div>
            ) : (
              <>
                <i className="pi pi-cloud-upload text-gray-400 text-3xl mb-2"></i>
                <p className="text-sm text-gray-600">Haga clic para seleccionar un archivo PDF</p>
                <p className="text-xs text-gray-400 mt-1">Máximo 10MB</p>
              </>
            )}
            <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
          </div>
          {formErrors.pdfFile && <p className="text-xs text-red-500 mt-1">{formErrors.pdfFile}</p>}
        </div>

        <div className="flex justify-end gap-3">
          <button type="button"
            onClick={() => { setShowForm(false); setForm({ year: new Date().getFullYear(), title: "", description: "", pdfFile: null }); setFormErrors({}); }}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >Cancelar</button>
          <button type="submit" disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Guardando...</>
            ) : (
              <><i className="pi pi-save"></i>Guardar Registro</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
