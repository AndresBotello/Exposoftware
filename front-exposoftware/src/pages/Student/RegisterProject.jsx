import { useState, useCallback, useRef } from "react";
import { useRegisterProject } from "../../hooks/Student/useRegisterProject";

// Función auxiliar para agregar estudiante con su información
const agregarEstudianteConInfo = (id, estudiante, setEstudiantesAgregados, addParticipant) => {
  setEstudiantesAgregados(prev => ({
    ...prev,
    [id]: estudiante
  }));
  addParticipant(id);
};

export default function RegisterProject() {
  const [estudiantesAgregados, setEstudiantesAgregados] = useState({});

  const hookProps = useRegisterProject();

  const {
    open,
    setOpen,
    form,
    setForm,
    tiposActividad,
    estudiantes,
    materias,
    grupos,
    lineas,
    sublineasFiltradas,
    eventos,
    areasFiltradas,
    docenteDelGrupo,
    loading,
    loadingData,
    error,
    addParticipant,
    removeParticipant,
    buscarEstudiantes,
    submit,
    currentUserEmail, 
    currentUserId     
  } = hookProps;

  // Estilo de Tailwind CSS común para modernizar los elementos <select> nativos
  const selectClassName = "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 bg-white pr-10 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 shadow-sm transition appearance-none bg-no-repeat bg-[right_0.75rem_center] bg-[length:1.25em_1.25em] disabled:bg-gray-50 disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed [background-image:url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')]";

  if (!open) return null;

  if (loadingData) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-xs">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            <p className="text-gray-700 font-medium text-sm">Cargando datos del formulario...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-xs">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md mx-4 border border-gray-100">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3">
              <span className="text-red-600 font-bold text-xl">!</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Error al cargar los datos</h3>
            <p className="text-gray-600 mb-6 text-sm leading-relaxed">{error}</p>
            <button
              onClick={() => setOpen(false)}
              className="w-full px-4 py-2.5 bg-gray-900 text-white font-medium text-sm rounded-lg hover:bg-gray-800 transition shadow-xs cursor-pointer"
            >
              Cerrar formulario
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black bg-opacity-50 overflow-auto py-12 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl p-6 mx-4 border border-gray-100 my-auto">
        <header className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Postular a la Convocatoria</h3>
            <p className="text-xs text-gray-500 mt-0.5">Completa los campos para registrar la propuesta de proyecto.</p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-100 rounded-lg transition text-lg leading-none cursor-pointer"
            disabled={loading}
          >
            ✕
          </button>
        </header>

        <form onSubmit={(e) => submit(e, estudiantesAgregados)} className="space-y-5 max-h-[65vh] overflow-auto pr-2">

          {/* Tipo de Actividad */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <p className="text-sm font-semibold text-gray-800 mb-3">
              Tipo de Actividad <span className="text-red-500">*</span>
            </p>
            <div className="flex flex-wrap gap-4">
              {tiposActividad.map((t) => (
                <label key={t.id} className="inline-flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="radio"
                    name="tipo_actividad"
                    value={t.id}
                    checked={form.tipo_actividad === t.id.toString()}
                    onChange={() => setForm((s) => ({ ...s, tipo_actividad: t.id.toString() }))}
                    className="text-teal-600 focus:ring-teal-500 w-4 h-4 border-gray-300 cursor-pointer"
                    required
                  />
                  <span className="text-sm text-gray-700 group-hover:text-gray-900 transition">{t.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Título del proyecto */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">
              Título del proyecto <span className="text-red-500">*</span>
            </label>
            <input
              value={form.titulo_proyecto}
              onChange={(e) => setForm((s) => ({ ...s, titulo_proyecto: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 placeholder-gray-400 shadow-sm"
              placeholder="Escribe el nombre definitivo de tu proyecto"
              maxLength={255}
              required
            />
            <div className="flex justify-end mt-1">
              <span className="text-xs text-gray-400">{form.titulo_proyecto.length} / 255 caracteres</span>
            </div>
          </div>

          {/* Participantes */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">
              Participantes (Estudiantes) <span className="text-red-500">*</span>
            </label>
            <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-xs">
              <div className="flex gap-2 flex-wrap mb-3">
                {form.id_estudiantes.map((idEst, index) => {
                  const est = estudiantesAgregados[idEst] || estudiantes.find((e) => e.id === idEst);
                  
                  const correoEstudiante = (est?.correo || "").toLowerCase().trim();
                  const correoActual = (currentUserEmail || "").toLowerCase().trim();

                  // SOLUCIÓN ESTRUCTURAL: Si es el primer elemento del array (index === 0) 
                  // o coincide con las credenciales de sesión, se marca obligatoriamente como el autor principal.
                  const esElUsuarioActual = 
                    index === 0 ||
                    (correoEstudiante !== "" && correoEstudiante === correoActual) || 
                    (idEst !== undefined && idEst !== null && String(idEst) === String(currentUserId));

                  return (
                    <span
                      key={idEst}
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-medium border transition-all ${
                        esElUsuarioActual 
                          ? "bg-gray-100 text-gray-700 border-gray-200 font-semibold" 
                          : "bg-teal-50 text-teal-800 border-teal-100"
                      }`}
                    >
                      {est?.correo || est?.nombreCompleto || `ID: ${idEst}`}
                      
                      {/* Si es el creador del proyecto (index 0) u otra coincidencia de sesión, ocultamos la X por completo */}
                      {!esElUsuarioActual ? (
                        <button
                          type="button"
                          onClick={() => removeParticipant(idEst)}
                          className="text-teal-600 hover:text-teal-900 font-bold text-sm ml-1 cursor-pointer"
                        >
                          ✕
                        </button>
                      ) : (
                        <span className="text-[10px] text-gray-500 font-normal italic ml-1 select-none bg-gray-200/80 px-1.5 py-0.5 rounded">(Tú)</span>
                      )}
                    </span>
                  );
                })}
                {form.id_estudiantes.length === 0 && (
                  <span className="text-sm text-gray-400 italic">No hay participantes agregados en esta postulación</span>
                )}
              </div>
              <ParticipantCombo
                students={estudiantes}
                selectedIds={form.id_estudiantes}
                onAdd={(id, estudiante) => agregarEstudianteConInfo(id, estudiante, setEstudiantesAgregados, addParticipant)}
                buscarEstudiantes={buscarEstudiantes}
                // Pasamos el correo del primer elemento si currentUserEmail viene en blanco para filtrar la lista desplegable
                currentUserEmail={currentUserEmail || (estudiantesAgregados[form.id_estudiantes[0]]?.correo || estudiantes.find((e) => e.id === form.id_estudiantes[0])?.correo || "")}
              />
            </div>
          </div>

          {/* Evento */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">
              Evento <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={form.id_evento}
                onChange={(e) => setForm((s) => ({ ...s, id_evento: e.target.value }))}
                className={selectClassName}
                required
              >
                <option value="">Seleccionar evento académico</option>
                {eventos.map((evento, index) => {
                  const fechaInicio = evento.fecha_inicio
                    ? new Date(evento.fecha_inicio).toLocaleDateString("es-CO", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "";
                  const fechaFin = evento.fecha_fin
                    ? new Date(evento.fecha_fin).toLocaleDateString("es-CO", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "";
                  const eventoValue = evento.id_evento || evento.id || evento._id || index.toString();
                  return (
                    <option key={eventoValue} value={eventoValue}>
                      {evento.nombre_evento}
                      {fechaInicio
                        ? ` (${fechaInicio}${fechaFin && fechaFin !== fechaInicio ? " - " + fechaFin : ""})`
                        : ""}
                    </option>
                  );
                })}
              </select>
            </div>
            {eventos.length === 0 && (
              <p className="text-xs text-amber-700 mt-1.5 font-medium bg-amber-50 px-2 py-1 rounded">No hay eventos activos o disponibles en este periodo de tiempo.</p>
            )}
            {form.id_evento && (() => {
              const eventoSel = eventos.find(
                (e) => (e.id_evento || e.id || e._id) === form.id_evento
              );
              return eventoSel ? (
                <div className="mt-2.5 p-3 bg-teal-50 rounded-lg text-xs text-teal-900 border border-teal-100">
                  <div className="font-semibold mb-0.5">Evento seleccionado:</div>
                  <div className="text-teal-700">{eventoSel.nombre_evento}</div>
                  {eventoSel.lugar && <div className="text-gray-500 mt-1">Ubicación: {eventoSel.lugar}</div>}
                </div>
              ) : null;
            })()}
          </div>

          {/* Materia y Grupo */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                Materia <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={form.codigo_materia}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, codigo_materia: e.target.value, id_grupo: "", id_docente: "" }))
                  }
                  className={selectClassName}
                  required
                >
                  <option value="">Selecciona una materia registrada</option>
                  {materias.map((mat) => (
                    <option key={mat.codigo} value={mat.codigo}>
                      {mat.codigo} - {mat.nombre}
                    </option>
                  ))}
                </select>
              </div>
              {materias.length === 0 && (
                <p className="text-xs text-amber-700 mt-1.5 font-medium">
                  Cargando asignaturas... Si experimentas demoras prolongadas, notifícalo a soporte.
                </p>
              )}
            </div>

            {/* Selector de Grupo con Docentes */}
            {form.codigo_materia && (
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Selecciona un Grupo <span className="text-red-500">*</span>
                </label>

                {grupos && grupos.length > 0 ? (
                  <div className="grid grid-cols-1 gap-2.5">
                    {grupos.map((grupo) => (
                      <button
                        key={grupo.id}
                        type="button"
                        onClick={() => setForm((s) => ({ ...s, id_grupo: grupo.id }))}
                        className={`p-3.5 rounded-xl border transition-all text-left cursor-pointer ${
                          form.id_grupo === grupo.id
                            ? "border-teal-600 bg-teal-50/50 ring-1 ring-teal-600"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="text-sm font-bold text-gray-900">
                              Grupo: <span className="text-teal-700">{grupo.nombre}</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              Docente responsable: <span className="font-semibold text-gray-700">{grupo.nombreDocente || "Sin asignar"}</span>
                            </div>
                          </div>
                          {form.id_grupo === grupo.id && (
                            <div className="text-teal-600 font-bold text-sm bg-teal-100/80 px-2 py-0.5 rounded-md">
                              Seleccionado
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-amber-800 text-xs font-medium">No se registran grupos abiertos para esta asignatura actual.</p>
                  </div>
                )}
              </div>
            )}

            {/* Docente (solo lectura, auto-asignado del grupo) */}
            {docenteDelGrupo && form.id_grupo && (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Docente asignado al proyecto
                </label>
                <div className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-800">
                  {docenteDelGrupo.nombreDocente || docenteDelGrupo.idDocente}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Establecido dinámicamente según las especificaciones del grupo asignado.
                </p>
              </div>
            )}
          </div>

          {/* Línea de Investigación */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">
              Línea de Investigación <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={form.codigo_linea}
                onChange={(e) =>
                  setForm((s) => ({
                    ...s,
                    codigo_linea: e.target.value,
                    codigo_sublinea: "",
                    codigo_area: "",
                  }))
                }
                className={selectClassName}
                required
              >
                <option value="">Seleccionar línea estratégica</option>
                {lineas.map((linea) => (
                  <option key={linea.codigo} value={linea.codigo}>
                    {linea.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sublínea de Investigación */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">
              Sublínea de Investigación <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={form.codigo_sublinea}
                onChange={(e) =>
                  setForm((s) => ({ ...s, codigo_sublinea: e.target.value, codigo_area: "" }))
                }
                className={selectClassName}
                disabled={!form.codigo_linea}
                required
              >
                <option value="">Seleccionar sublínea vinculada</option>
                {sublineasFiltradas.map((sublinea) => (
                  <option key={sublinea.codigo} value={sublinea.codigo}>
                    {sublinea.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Área Temática */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">
              Área Temática <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={form.codigo_area}
                onChange={(e) => setForm((s) => ({ ...s, codigo_area: e.target.value }))}
                className={selectClassName}
                disabled={!form.codigo_sublinea}
                required
              >
                <option value="">Seleccionar área de enfoque</option>
                {areasFiltradas.map((area) => (
                  <option key={area.codigo} value={area.codigo}>
                    {area.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Artículo en PDF */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">
              Artículo en PDF <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setForm((s) => ({ ...s, archivoPDF: e.target.files[0] }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white shadow-xs cursor-pointer file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 file:cursor-pointer"
              required
            />
            {form.archivoPDF && (
              <p className="text-xs text-teal-700 font-medium mt-1.5 px-1">
                Documento cargado: {form.archivoPDF.name} ({(form.archivoPDF.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>

          {/* Archivo extra si aplica */}
          {form.tipo_actividad &&
            tiposActividad.find((t) => t.id.toString() === form.tipo_actividad)?.archivos.length > 1 && (
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                  {tiposActividad.find((t) => t.id.toString() === form.tipo_actividad)?.archivos[1] ===
                  "poster_pdf"
                    ? "Póster en PDF"
                    : "Imagen (PNG/JPG)"}
                  <span className="text-red-500"> *</span>
                </label>
                <input
                  type="file"
                  accept={
                    tiposActividad.find((t) => t.id.toString() === form.tipo_actividad)
                      ?.archivos[1] === "poster_pdf"
                      ? ".pdf"
                      : ".png,.jpg,.jpeg"
                  }
                  onChange={(e) => setForm((s) => ({ ...s, archivoExtra: e.target.files[0] }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white shadow-xs cursor-pointer file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 file:cursor-pointer"
                  required
                />
                {form.archivoExtra && (
                  <p className="text-xs text-teal-700 font-medium mt-1.5 px-1">
                    Anexo cargado: {form.archivoExtra.name} ({(form.archivoExtra.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>
            )}

          {/* Botones */}
          <div className="flex items-center justify-end gap-3 pt-5 border-t border-gray-100 mt-6">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition cursor-pointer"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition shadow-xs cursor-pointer"
              disabled={loading}
            >
              {loading ? "Enviando..." : "Enviar postulación"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ParticipantCombo({ students, selectedIds, onAdd, buscarEstudiantes, currentUserEmail }) {
  const [q, setQ] = useState("");
  const [resultados, setResultados] = useState([]);
  const [cargando, setCargando] = useState(false);
  const useRefElement = useRef(null);

  const ejecutarBusquedaDebounced = useCallback((valor) => {
    if (useRefElement.current) {
      clearTimeout(useRefElement.current);
    }

    if (valor.length < 1) {
      setResultados([]);
      setCargando(false);
      return;
    }

    setCargando(true);

    useRefElement.current = setTimeout(async () => {
      try {
        const res = await buscarEstudiantes(valor);
        setResultados(res || []);
      } catch (err) {
        console.error("Error en el buscador asíncrono:", err);
        setResultados([]);
      } finally {
        setCargando(false);
      }
    }, 600); 
  }, [buscarEstudiantes]);

  const handleBusqueda = (valor) => {
    setQ(valor);
    ejecutarBusquedaDebounced(valor);
  };

  const baseStudents = q.length >= 3 ? resultados : students;

  const filtered = baseStudents.filter((s) => {
    const yaSeleccionado = selectedIds.includes(s.id);
    const esElUsuarioActual = s.correo?.toLowerCase().trim() === currentUserEmail?.toLowerCase().trim();
    return !yaSeleccionado && !esElUsuarioActual;
  });

  return (
    <div className="mt-2">
      <input
        value={q}
        onChange={(e) => handleBusqueda(e.target.value)}
        placeholder="Escribe el nombre o correo del participante..."
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-gray-50/50"
      />
      <div className="max-h-40 overflow-auto border-t border-gray-100 pt-2 mt-2 divide-y divide-gray-50">
        {cargando ? (
          <p className="text-xs font-medium text-gray-500 px-2 py-1.5 animate-pulse">Buscando coincidencias...</p>
        ) : filtered.length > 0 ? (
          filtered.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                onAdd(s.id, s);
                setQ("");
                setResultados([]);
                if (useRefElement.current) clearTimeout(useRefElement.current);
              }}
              className="w-full text-left py-2 px-2.5 text-sm hover:bg-gray-50 transition rounded-md flex justify-between items-center group cursor-pointer"
            >
              <span>
                <div className="font-semibold text-gray-900 group-hover:text-teal-700 transition">{s.nombreCompleto}</div>
                <div className="text-xs text-gray-500">{s.correo}</div>
                {s.codigoEstudiante && (
                  <div className="text-[11px] text-gray-400 mt-0.5">Matrícula / Código: {s.codigoEstudiante}</div>
                )}
              </span>
              <span className="text-teal-600 font-semibold text-xs border border-teal-200 bg-teal-50/30 px-2 py-1 rounded-md group-hover:bg-teal-600 group-hover:text-white group-hover:border-teal-600 transition">
                Agregar alumno
              </span>
            </button>
          ))
        ) : (
          <p className="text-xs text-gray-400 px-2 py-1 italic">
            {q.length >= 3 && !cargando ? "Ningún registro coincide con los criterios introducidos" : ""}
          </p>
        )}
      </div>
    </div>
  );
}