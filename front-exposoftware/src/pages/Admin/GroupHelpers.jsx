export const extractDocenteData = (item) => ({
  docente: item?.docente || item,
  usuario: item?.usuario || {}
});

export const extractProfessorInfo = (item) => {
  const { docente, usuario } = extractDocenteData(item);
  const nombreCompleto = usuario?.nombre_completo || `${usuario?.p_nombre || ''} ${usuario?.p_apellido || ''}`.trim() || '';
  const correo = usuario?.correo || '';
  const nombre = nombreCompleto || correo?.split('@')[0] || `Profesor ${docente?.id_docente}`;
  const categoria = docente?.categoria_docente || '';
  const codigoPrograma = docente?.codigo_programa || '';

  let displayText = nombre;
  if (categoria) displayText += ` - ${categoria}`;
  if (codigoPrograma) displayText += ` (${codigoPrograma})`;

  return { profesorId: docente?.id_docente, nombre, displayText };
};

export function SelectProfesores({ value, onChange, profesores, loadingProfesores, disabled = false }) {
  return (
    <select
      value={value}
      onChange={(e) => { console.log('🔄 Profesor seleccionado - ID:', e.target.value); onChange(e); }}
      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all appearance-none bg-white cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"
      required
      disabled={loadingProfesores || disabled}
    >
      {loadingProfesores ? (
        <option value="">⏳ Cargando profesores...</option>
      ) : profesores.length === 0 ? (
        <option value="">❌ No hay profesores disponibles</option>
      ) : (
        <option value="">Selecciona un profesor</option>
      )}
      {!loadingProfesores && Array.isArray(profesores) && profesores.length > 0 ? (
        profesores.map((item, index) => {
          const { profesorId, displayText } = extractProfessorInfo(item);
          if (!profesorId) { console.warn('⚠️ Profesor sin id_docente:', item); return null; }
          return <option key={`prof_${index}_${profesorId}`} value={profesorId}>{displayText}</option>;
        })
      ) : (
        <option value="" disabled>No hay profesores disponibles</option>
      )}
    </select>
  );
}

function DocenteInfo({ grupo, profesores }) {
  if (!grupo?.id_docente) {
    return <div className="text-xs text-gray-400 mt-1 italic">Sin docentes asignados</div>;
  }

  const profesorInfo = profesores.find(item => {
    const { docente } = extractDocenteData(item);
    return docente?.id_docente === grupo.id_docente;
  });

  if (profesorInfo) {
    const { usuario } = extractDocenteData(profesorInfo);
    const nombreCompleto = usuario?.nombre_completo || `${usuario?.p_nombre || ''} ${usuario?.p_apellido || ''}`.trim() || grupo?.nombre_docente || 'Docente asignado';
    return (
      <div className="text-xs text-gray-500 mt-1">
        <span className="inline-flex items-center gap-1">
          <i className="pi pi-user text-teal-600"></i>
          {nombreCompleto}
        </span>
      </div>
    );
  }

  if (grupo?.nombre_docente) {
    return (
      <div className="text-xs text-gray-500 mt-1">
        <span className="inline-flex items-center gap-1">
          <i className="pi pi-user text-teal-600"></i>
          {grupo.nombre_docente}
        </span>
      </div>
    );
  }

  return (
    <div className="text-xs text-gray-500 mt-1">
      <span className="text-orange-600">
        <i className="pi pi-info-circle mr-1"></i>
        Docente: {grupo.id_docente.substring(0, 8)}...
      </span>
    </div>
  );
}

export function TablaGrupos({ gruposFiltrados, loadingGrupos, profesores, onEdit, onDelete }) {
  return (
    <div className="overflow-x-auto">
      {loadingGrupos ? (
        <div className="flex flex-col items-center justify-center py-12">
          <svg className="animate-spin h-12 w-12 text-teal-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600 font-medium">Cargando grupos...</p>
          <p className="text-gray-400 text-sm mt-1">Por favor espera un momento</p>
        </div>
      ) : (
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {["Grupo", "Fecha Creación", "Última Actualización", "Acciones"].map((col, i) => (
                <th key={col} className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${i === 3 ? "text-center" : "text-left"}`}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {gruposFiltrados.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                  <i className="pi pi-inbox text-4xl mb-3 block"></i>
                  <p className="text-sm">No se encontraron grupos</p>
                </td>
              </tr>
            ) : (
              gruposFiltrados.map((grupo) => (
                <tr key={grupo?.nombre_grupo || Math.random()} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-teal-100 text-teal-800 w-fit">
                        Grupo {grupo?.nombre_grupo || 'N/A'}
                      </span>
                      {grupo?.codigo_materia && (
                        <span className="text-xs text-gray-400 mt-1" title={`Materia: ${grupo.codigo_materia}`}>
                          Materia: {grupo.codigo_materia}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{grupo?.created_at ? new Date(grupo.created_at).toLocaleDateString() : 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{grupo?.updated_at ? new Date(grupo.updated_at).toLocaleDateString() : 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => onEdit(grupo)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Editar">
                        <i className="pi pi-pencil"></i>
                      </button>
                      <button onClick={() => onDelete(grupo?.nombre_grupo)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="Eliminar">
                        <i className="pi pi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
